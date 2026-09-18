(function () {
  'use strict';

  const BEVEL       = 0.025;
  const CORE_REFRACT = 1.0;
  const IOR         = 1.5;
  const THICKNESS   = 2.0;
  const IDLE_FLOAT  = 0.05;
  const TILT_RANGE  = 0.5;
  const TILT_RATE   = 5;
  const DRAG_GAIN   = 0.01;
  const SPIN_YAW    = 0.5;
  const SPIN_PITCH  = 0.2;
  const FOV         = (45 * Math.PI) / 180;
  const CAM_DIST    = 5;

  const VS = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

  const PLATE_FS = `
precision highp float;
uniform sampler2D uPlate;
uniform vec2 uPlateFit;
uniform vec2 uRes;
void main() {
  vec2 uv = (gl_FragCoord.xy / uRes - 0.5) * uPlateFit + 0.5;
  gl_FragColor = texture2D(uPlate, clamp(uv, 0.0, 1.0));
}`;

  const GLASS_FS = `
precision highp float;
uniform vec2  uRes;
uniform float uAspect;
uniform float uTanHalf;
uniform sampler2D uPlate;
uniform vec2  uPlateFit;
uniform float uHasPlate;
uniform sampler2D uEnv;
uniform mat3  uRot;
uniform mat3  uRotT;
uniform vec3  uCenter;
uniform float uScale;
uniform float uBoundR;
uniform float uShape;
uniform float uHalfDepth;
uniform float uBevel;
uniform float uTorusTube;
uniform float uDisp;
uniform float uFrost;
uniform vec3  uTint;
uniform float uTime;

const float PI = 3.14159265359;
const float IOR = 1.5000;
const float THICKNESS = 2.0000;
const float CORE_REFRACT = 1.0000;

vec2 r45(vec2 p) {
  const float c = 0.7071067811865476;
  return vec2((p.x+p.y)*c,(p.y-p.x)*c);
}

float sdCross(vec2 p, vec2 b) {
  p = abs(p);
  p = (p.y > p.x) ? p.yx : p.xy;
  vec2 q = p - b;
  float k = max(q.y, q.x);
  vec2 w = (k > 0.0) ? q : vec2(b.y - p.x, -k);
  return sign(k) * length(max(w, 0.0));
}

float extrudeRound(float d2, float pz, float hd, float r) {
  vec2 q = vec2(d2+r, abs(pz)-hd+r);
  return min(max(q.x,q.y),0.0) + length(max(q,0.0)) - r;
}

float map(vec3 p) {
  if (uShape < 0.5) {
    return extrudeRound(sdCross(r45(p.xy), vec2(1.3,0.35)), p.z, uHalfDepth, uBevel);
  } else if (uShape < 1.5) {
    vec2 q = vec2(length(p.xy)-0.8, p.z);
    return length(q) - uTorusTube;
  }
  float r = length(p);
  vec3 n = p / max(r, 0.001);
  float ripple =
    0.028 * sin(5.0*n.x + uTime*1.1) * sin(5.0*n.y + uTime*0.7) +
    0.018 * sin(8.0*n.z - uTime*1.4 + n.x*3.0) +
    0.012 * sin(11.0*n.y + uTime*0.9 + n.z*4.0);
  return r - 1.2 - ripple;
}

vec3 mapNormal(vec3 p) {
  const float e = 0.0015;
  vec2 k = vec2(1.0,-1.0);
  return normalize(
    k.xyy*map(p+k.xyy*e)+k.yyx*map(p+k.yyx*e)+
    k.yxy*map(p+k.yxy*e)+k.xxx*map(p+k.xxx*e)
  );
}

vec4 plate(vec2 uv) {
  if (uHasPlate < 0.5) return vec4(0.0);
  vec2 u2 = (uv - 0.5)*uPlateFit + 0.5;
  return texture2D(uPlate, clamp(u2, 0.0, 1.0));
}

float rand(vec2 co) {
  return fract(sin(dot(co, vec2(12.9898,78.233)))*43758.5453);
}

void main() {
  vec2 screenUv = gl_FragCoord.xy / uRes;
  vec2 ndc = screenUv * 2.0 - 1.0;
  vec3 D  = normalize(vec3(ndc.x*uTanHalf*uAspect, ndc.y*uTanHalf, -1.0));
  vec3 rd = normalize(uRotT * D);
  vec3 ro = (uRotT * -uCenter) / uScale;

  float bb = dot(ro,rd);
  float cc = dot(ro,ro) - uBoundR*uBoundR;
  float hh = bb*bb - cc;
  if (hh < 0.0) discard;
  hh = sqrt(hh);
  float t = max(-bb-hh, 0.0);
  float tMax = -bb+hh;

  bool hit = false;
  for (int i = 0; i < 80; i++) {
    if (t > tMax) break;
    float d = map(ro + rd*t);
    if (d < 0.0009) { hit = true; break; }
    t += d * 0.9;
  }
  if (!hit) discard;

  vec3 pObj = ro + rd*t;
  vec3 nObj = mapNormal(pObj);
  vec3 vP = uCenter + uScale*(uRot*pObj);
  vec3 normal = normalize(uRot*nObj);
  vec3 viewDir = normalize(-vP);

  float fresnel = pow(1.0 - max(dot(normal,viewDir),0.0), 4.0);
  float coreFactor = pow(max(dot(normal,viewDir),0.0), 2.0);
  vec2 lensOffset = (screenUv-0.5)*(CORE_REFRACT*0.15)*coreFactor;
  vec3 refractView = refract(-viewDir, normal, 1.0/IOR);
  vec2 offset = refractView.xy*(THICKNESS*0.1) - lensOffset;

  vec3 reflectDir = reflect(-viewDir, normal);
  vec2 eqUv = vec2(
    atan(reflectDir.z, reflectDir.x)/(2.0*PI)+0.5,
    asin(clamp(reflectDir.y,-1.0,1.0))/PI+0.5
  );
  vec3 reflection = texture2D(uEnv, eqUv).rgb * 2.5;

  vec3 transmission = vec3(0.0);
  float bgAlpha = 0.0;
  vec2 uvR = screenUv + offset*(1.0+uDisp);
  vec2 uvG = screenUv + offset;
  vec2 uvB = screenUv + offset*(1.0-uDisp);

  if (uFrost > 0.001) {
    float rnd = rand(screenUv)*6.2831853;
    const int SAMPLES = 24;
    const float GOLDEN_ANGLE = 2.39996323;
    float radius = 0.0;
    float radiusStep = 1.0/float(SAMPLES);
    for (int i = 0; i < SAMPLES; i++) {
      float theta = float(i)*GOLDEN_ANGLE + rnd;
      radius += radiusStep;
      vec2 bo = vec2(cos(theta),sin(theta))*radius*uFrost*0.025;
      transmission.r += plate(uvR+bo).r;
      vec4 g = plate(uvG+bo);
      transmission.g += g.g;
      bgAlpha += g.a;
      transmission.b += plate(uvB+bo).b;
    }
    transmission /= float(SAMPLES);
    bgAlpha /= float(SAMPLES);
  } else {
    transmission.r = plate(uvR).r;
    vec4 g = plate(uvG);
    transmission.g = g.g;
    bgAlpha = g.a;
    transmission.b = plate(uvB).b;
  }

  transmission *= uTint;
  vec3 clearGlassTint = mix(uTint, reflection, 0.5);
  transmission = mix(clearGlassTint, transmission, bgAlpha);
  vec3 finalColor = mix(transmission, reflection, fresnel*0.8);
  float baseAlpha = max(0.25, fresnel*0.85);
  float outAlpha = mix(baseAlpha, 1.0, bgAlpha);
  gl_FragColor = vec4(finalColor, outAlpha);
}`;

  function rotYX(yaw, pitch) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    const cx = Math.cos(pitch), sx = Math.sin(pitch);
    return new Float32Array([cy, 0, -sy, sy*sx, cx, cy*sx, sy*cx, -sx, cy*cx]);
  }
  function transpose3(m) {
    return new Float32Array([m[0],m[3],m[6],m[1],m[4],m[7],m[2],m[5],m[8]]);
  }
  function mul3(a, b) {
    const o = new Float32Array(9);
    for (let c = 0; c < 3; c++)
      for (let r = 0; r < 3; r++)
        o[c*3+r] = a[r]*b[c*3] + a[3+r]*b[c*3+1] + a[6+r]*b[c*3+2];
    return o;
  }
  function rotYXZ(yaw, pitch, roll) {
    const base = rotYX(yaw, pitch);
    if (roll === 0) return base;
    const c = Math.cos(roll), s = Math.sin(roll);
    return mul3(base, new Float32Array([c,s,0,-s,c,0,0,0,1]));
  }

  function buildEnvCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.fillStyle = '#111114';
    ctx.fillRect(0, 0, 1024, 512);
    const softbox = (x, y, w, h, intensity) => {
      const grd = ctx.createLinearGradient(x, y, x, y+h);
      grd.addColorStop(0, `rgba(255,255,255,${intensity})`);
      grd.addColorStop(1, `rgba(50,50,50,${intensity*0.2})`);
      ctx.fillStyle = grd;
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 80;
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.fill();
    };
    softbox(50, 100, 300, 312, 1);
    softbox(674, 100, 300, 312, 1);
    softbox(350, -50, 324, 150, 0.9);
    ctx.shadowBlur = 0;
    return canvas;
  }

  function buildBackdropCanvas(w, h, callback) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    if (!ctx) { callback(null); return; }
    const grad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w,h)*0.7);
    grad.addColorStop(0,   '#111118');
    grad.addColorStop(0.5, '#08080f');
    grad.addColorStop(1,   '#030305');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    const img = new Image();
    img.onload = () => {
      const logoFrac = canvas.clientWidth < 768 ? 0.55 : 0.32;
      const logoW = Math.round(w * logoFrac);
      const logoH = Math.round(logoW * (img.naturalHeight / Math.max(img.naturalWidth, 1)));
      const lx = (w - logoW) / 2;
      const ly = (h - logoH) / 2;
      ctx.globalAlpha = 0.88;
      ctx.drawImage(img, lx, ly, logoW, logoH);
      ctx.globalAlpha = 1;
      callback(c);
    };
    img.onerror = () => callback(c);
    img.src = '/assets/images/LKDH_stacked.svg';
  }

  function compile(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error('Shader compile:', gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }
  function linkProg(gl, vs, fs) {
    const v = compile(gl, gl.VERTEX_SHADER, vs);
    const f = compile(gl, gl.FRAGMENT_SHADER, fs);
    if (!v || !f) return null;
    const p = gl.createProgram();
    gl.attachShader(p, v);
    gl.attachShader(p, f);
    gl.linkProgram(p);
    gl.deleteShader(v);
    gl.deleteShader(f);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.error('Link:', gl.getProgramInfoLog(p));
      return null;
    }
    return p;
  }

  const canvas = document.getElementById('glass-canvas');
  if (!canvas) return;
  const opts = { antialias: false, alpha: true, premultipliedAlpha: true };
  const gl = canvas.getContext('webgl2', opts) || canvas.getContext('webgl', opts);
  if (!gl) return;

  const plateProg = linkProg(gl, VS, PLATE_FS);
  const glassProg = linkProg(gl, VS, GLASS_FS);
  if (!plateProg || !glassProg) return;

  const uPlatePass = {
    plate: gl.getUniformLocation(plateProg, 'uPlate'),
    fit:   gl.getUniformLocation(plateProg, 'uPlateFit'),
    res:   gl.getUniformLocation(plateProg, 'uRes'),
  };
  const u = {
    res:      gl.getUniformLocation(glassProg, 'uRes'),
    aspect:   gl.getUniformLocation(glassProg, 'uAspect'),
    tanHalf:  gl.getUniformLocation(glassProg, 'uTanHalf'),
    plate:    gl.getUniformLocation(glassProg, 'uPlate'),
    plateFit: gl.getUniformLocation(glassProg, 'uPlateFit'),
    hasPlate: gl.getUniformLocation(glassProg, 'uHasPlate'),
    env:      gl.getUniformLocation(glassProg, 'uEnv'),
    rot:      gl.getUniformLocation(glassProg, 'uRot'),
    rotT:     gl.getUniformLocation(glassProg, 'uRotT'),
    center:   gl.getUniformLocation(glassProg, 'uCenter'),
    scale:    gl.getUniformLocation(glassProg, 'uScale'),
    boundR:   gl.getUniformLocation(glassProg, 'uBoundR'),
    shape:    gl.getUniformLocation(glassProg, 'uShape'),
    halfDepth:gl.getUniformLocation(glassProg, 'uHalfDepth'),
    bevel:    gl.getUniformLocation(glassProg, 'uBevel'),
    torusTube:gl.getUniformLocation(glassProg, 'uTorusTube'),
    disp:     gl.getUniformLocation(glassProg, 'uDisp'),
    frost:    gl.getUniformLocation(glassProg, 'uFrost'),
    tint:     gl.getUniformLocation(glassProg, 'uTint'),
    time:     gl.getUniformLocation(glassProg, 'uTime'),
  };
  const aPlatePos = gl.getAttribLocation(plateProg, 'aPos');
  const aGlassPos = gl.getAttribLocation(glassProg, 'aPos');

  const quadBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW);

  function makeTex(wrap) {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0,0,0,0]));
    return t;
  }
  const plateTex = makeTex(gl.CLAMP_TO_EDGE);
  const envTex   = makeTex(gl.REPEAT);

  const envC = buildEnvCanvas();
  if (envC) {
    gl.bindTexture(gl.TEXTURE_2D, envTex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, envC);
  }

  let vw = 1, vh = 1;
  let plateAspect = 1, plateReady = false;

  function uploadBackdrop() {
    const w = vw, h = vh;
    buildBackdropCanvas(w, h, function(c) {
      if (!c || w !== vw || h !== vh) return;
      plateAspect = w / h;
      gl.bindTexture(gl.TEXTURE_2D, plateTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
      plateReady = true;
    });
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = canvas.clientWidth || 1;
    const ch = canvas.clientHeight || 1;
    const w = Math.max(1, Math.round(cw * dpr));
    const h = Math.max(1, Math.round(ch * dpr));
    if (w === vw && h === vh) return;
    vw = w; vh = h;
    canvas.width = w; canvas.height = h;
    uploadBackdrop();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  let baseYaw = 0, basePitch = 0;
  let tiltX = 0, tiltY = 0, tiltTX = 0, tiltTY = 0;
  let dragging = false, lastX = 0, lastY = 0;

  canvas.addEventListener('pointerdown', e => {
    dragging = true; lastX = e.clientX; lastY = e.clientY;
  });
  canvas.addEventListener('pointerleave', () => {
    if (!dragging) { tiltTX = 0; tiltTY = 0; }
  });
  window.addEventListener('pointermove', e => {
    if (dragging) {
      baseYaw   += (e.clientX - lastX) * DRAG_GAIN;
      basePitch += (e.clientY - lastY) * DRAG_GAIN;
      basePitch  = Math.max(-1.4, Math.min(1.4, basePitch));
      lastX = e.clientX; lastY = e.clientY;
      return;
    }
    const r = canvas.getBoundingClientRect();
    tiltTX = (((e.clientX - r.left) / Math.max(r.width, 1)) * 2 - 1) * TILT_RANGE;
    tiltTY = (-(((e.clientY - r.top) / Math.max(r.height, 1)) * 2 - 1)) * TILT_RANGE;
  });
  window.addEventListener('pointerup',     () => { dragging = false; });
  window.addEventListener('pointercancel', () => { dragging = false; });

  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  let prev = performance.now();
  let elapsed = 0;

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - prev) / 1000, 0.05);
    prev = now;
    elapsed += dt;

    const k = 1 - Math.exp(-TILT_RATE * dt);
    tiltX += (tiltTX - tiltX) * k;
    tiltY += (tiltTY - tiltY) * k;

    const spin = 0.8;
    baseYaw   += spin * SPIN_YAW   * dt;
    basePitch += spin * SPIN_PITCH * 0.3 * dt;

    const yaw   = baseYaw + tiltX;
    const pitch = basePitch - tiltY * 0.4;
    const rot   = rotYXZ(yaw, pitch, 0);
    const rotT  = transpose3(rot);

    const camDist    = CAM_DIST;
    const halfFrame  = camDist * Math.tan(FOV / 2);
    const sizeFrac   = canvas.clientWidth < 768 ? 0.5 : 0.6;
    const targetHalf = sizeFrac * halfFrame;
    const torusTube  = 0.32;
    const halfDepth  = 0.16;
    const refHalf    = 1.2;
    const boundR     = 1.3;
    const shapeId    = 2;
    const scale      = targetHalf / refHalf;
    const floatY     = Math.sin(elapsed * 2) * IDLE_FLOAT;

    const screenAspect = vw / vh;
    const fitX = screenAspect > plateAspect ? 1 : screenAspect / plateAspect;
    const fitY = screenAspect > plateAspect ? plateAspect / screenAspect : 1;
    const hasPlate = plateReady ? 1 : 0;

    gl.viewport(0, 0, vw, vh);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);

    if (hasPlate) {
      gl.useProgram(plateProg);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, plateTex);
      gl.uniform1i(uPlatePass.plate, 0);
      gl.uniform2f(uPlatePass.fit, fitX, fitY);
      gl.uniform2f(uPlatePass.res, vw, vh);
      gl.enableVertexAttribArray(aPlatePos);
      gl.vertexAttribPointer(aPlatePos, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    gl.useProgram(glassProg);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, plateTex);
    gl.uniform1i(u.plate, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, envTex);
    gl.uniform1i(u.env, 1);
    gl.uniform2f(u.res, vw, vh);
    gl.uniform1f(u.aspect, screenAspect);
    gl.uniform1f(u.tanHalf, Math.tan(FOV / 2));
    gl.uniform2f(u.plateFit, fitX, fitY);
    gl.uniform1f(u.hasPlate, hasPlate);
    gl.uniformMatrix3fv(u.rot, false, rot);
    gl.uniformMatrix3fv(u.rotT, false, rotT);
    gl.uniform3f(u.center, 0, floatY, -camDist);
    gl.uniform1f(u.scale, scale);
    gl.uniform1f(u.boundR, boundR);
    gl.uniform1f(u.shape, shapeId);
    gl.uniform1f(u.halfDepth, halfDepth);
    gl.uniform1f(u.bevel, BEVEL);
    gl.uniform1f(u.torusTube, torusTube);
    gl.uniform1f(u.disp, 0.025);
    const FROST_DURATION = 10.0;
    const frostT = Math.min(elapsed / FROST_DURATION, 1.0);
    const frostEase = frostT * frostT * (3.0 - 2.0 * frostT);
    gl.uniform1f(u.frost, 0.4 + 1.1 * (1.0 - frostEase));
    gl.uniform3f(u.tint, 1.0, 1.0, 1.0);
    gl.uniform1f(u.time, elapsed);
    gl.enableVertexAttribArray(aGlassPos);
    gl.vertexAttribPointer(aGlassPos, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  requestAnimationFrame(frame);
})();
