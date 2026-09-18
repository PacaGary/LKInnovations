(function () {
  'use strict';

  var MAX_STOPS = 6;
  var FALLOFF   = 1.75;
  var SKEW      = 0.75;
  var GRAIN     = 0.012;
  var DPR_CAP   = 1.75;
  var GLOSS     = 10;

  var COLORS    = ['#888888','#ababab','#c8c8c8','#dcdcdc','#f0f0f0','#ffffff']; // color ramp dark→light (6 stops)
  var REFRACTION = 0;   // chromatic aberration amount
  var FROST      = 0;   // frosted-glass blur (0 = clear, 10 = heavy)
  var VOID_SIZE  = 0;   // dark hole at pattern center (0 = none)
  var ANGLE      = -85; // rotation of the wave field in degrees
  var TWIST      = 7; // how much the field spirals outward (0 = straight, higher = more swirl)
  var STRETCH    = 12;  // elongates waves in one axis — higher = more ribbon-like
  var BANDS      = 2; // number of wave bands — lower = fewer, wider waves
  var RELIEF     = 2;   // wave height contrast — lower = smoother/flatter, higher = more dramatic
  var SCALE      = 8.5;   // zoom level — higher = more zoomed in, pattern appears larger
  var FLOW       = 4;   // animation speed of the wave flow
  var SHIMMER    = 10;  // hue oscillation intensity over time
  var SWEEP      = 10;  // specular highlight sweep speed and intensity

  var VERT = [
    'attribute vec2 aPos;',
    'varying vec2 vUv;',
    'void main() {',
    '  vUv = aPos * 0.5 + 0.5;',
    '  gl_Position = vec4(aPos, 0.0, 1.0);',
    '}'
  ].join('\n');

  var FRAG = [
    '#define MAX_STOPS ' + MAX_STOPS,
    '#define TAPS 5',
    '#define FALLOFF ' + FALLOFF,
    '#define SKEW ' + SKEW,
    '#define GRAIN ' + GRAIN,
    '',
    'varying vec2 vUv;',
    '',
    'uniform float uTime;',
    'uniform float uAspect;',
    'uniform vec3  uColors[MAX_STOPS];',
    'uniform int   uCount;',
    'uniform float uScale;',
    'uniform float uAngle;',
    'uniform float uPhase;',
    'uniform float uTwist;',
    'uniform float uStretch;',
    'uniform float uFreq;',
    'uniform float uRelief;',
    'uniform float uVoid;',
    'uniform float uVoidFade;',
    'uniform float uGloss;',
    'uniform float uRefract;',
    'uniform float uFrost;',
    'uniform float uHue;',
    'uniform float uSweep;',
    'uniform float uSweepPhase;',
    'uniform vec2  uCenterOffset;',
    '',
    'mat2 rot(float a) {',
    '  float s = sin(a), c = cos(a);',
    '  return mat2(c, -s, s, c);',
    '}',
    '',
    'float hash21(vec2 p) {',
    '  p = fract(p * vec2(123.34, 456.21));',
    '  p += dot(p, p + 45.32);',
    '  return fract(p.x * p.y);',
    '}',
    '',
    'float vnoise(vec2 p) {',
    '  vec2 i = floor(p), f = fract(p);',
    '  f = f * f * (3.0 - 2.0 * f);',
    '  float a = hash21(i);',
    '  float b = hash21(i + vec2(1.0, 0.0));',
    '  float c = hash21(i + vec2(0.0, 1.0));',
    '  float d = hash21(i + vec2(1.0, 1.0));',
    '  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);',
    '}',
    '',
    'vec3 ramp(float t) {',
    '  float span = float(uCount - 1);',
    '  if (span < 0.5) {',
    '    vec3 c = vec3(0.0);',
    '    for (int k = 0; k < MAX_STOPS; k++) { if (k == 0) c = uColors[k]; }',
    '    return c;',
    '  }',
    '  float u = min(clamp(t, 0.0, 1.0) * span, span - 1e-4);',
    '  float i = floor(u);',
    '  float fr = u - i;',
    '  fr = fr * fr * (3.0 - 2.0 * fr);',
    '  vec3 a = vec3(0.0), b = vec3(0.0);',
    '  for (int k = 0; k < MAX_STOPS; k++) {',
    '    if (float(k) == i)       a = uColors[k];',
    '    if (float(k) == i + 1.0) b = uColors[k];',
    '  }',
    '  return mix(a, b, fr);',
    '}',
    '',
    'float envT(vec2 dir) {',
    '  float directional = 0.5 + 0.5 * (dir.y * 1.3 + dir.x * 0.45);',
    '  float isotropic = clamp(length(dir) * 1.4, 0.0, 1.0);',
    '  return clamp(mix(directional, isotropic, 0.35), 0.0, 1.0);',
    '}',
    '',
    'vec3 chroma(vec2 dir, float disp) {',
    '  return vec3(',
    '    ramp(envT(dir * (1.0 + disp))).r,',
    '    ramp(envT(dir)).g,',
    '    ramp(envT(dir * (1.0 - disp))).b',
    '  );',
    '}',
    '',
    'float fold(float f) {',
    '  return sin(f + SKEW * sin(f));',
    '}',
    '',
    'vec2 fieldAt(vec2 p) {',
    '  p = rot(uAngle) * p;',
    '  float r = length(p);',
    '  p = rot(uTwist * r) * p;',
    '  p.x *= uStretch;',
    '  float d = length(p);',
    '  float h = fold(pow(max(d, 1e-4), FALLOFF) * uFreq - uPhase) * uRelief;',
    '  return vec2(h, d);',
    '}',
    '',
    'vec3 hueShift(vec3 c, float a) {',
    '  vec3 k = vec3(0.57735);',
    '  float ca = cos(a);',
    '  return c * ca + cross(k, c) * sin(a) + k * dot(k, c) * (1.0 - ca);',
    '}',
    '',
    'void main() {',
    '  vec2 uv = vUv * 2.0 - 1.0;',
    '  uv.x *= uAspect;',
    '  vec2 p = (uv - uCenterOffset) / max(uScale, 0.01);',
    '',
    '  float e = 0.0035 / max(uScale, 0.01);',
    '  vec2 f0 = fieldAt(p);',
    '  float hx = fieldAt(p + vec2(e, 0.0)).x;',
    '  float hy = fieldAt(p + vec2(0.0, e)).x;',
    '  float d = f0.y;',
    '  vec3 n = normalize(vec3(-(hx - f0.x) / e, -(hy - f0.x) / e, 1.0));',
    '',
    '  if (uFrost > 0.001) {',
    '    vec2 j = vec2(vnoise(p * 6.0), vnoise(p * 6.0 + 7.3)) - 0.5;',
    '    n = normalize(n + vec3(j * uFrost * 0.25, 0.0));',
    '  }',
    '',
    '  vec3 v = vec3(0.0, 0.0, 1.0);',
    '  vec3 r = reflect(-v, n);',
    '',
    '  vec3 col = chroma(r.xy, uRefract);',
    '  if (uFrost > 0.001) {',
    '    for (int t = 1; t < TAPS; t++) {',
    '      float a = float(t) * 2.399963;',
    '      vec2 off = vec2(cos(a), sin(a)) * uFrost * 0.5;',
    '      col += chroma(r.xy + off, uRefract);',
    '    }',
    '    col /= float(TAPS);',
    '  }',
    '',
    '  float la = 2.35619 + uSweepPhase;',
    '  vec3 l = normalize(vec3(cos(la), sin(la), 0.65));',
    '  vec3 hv = normalize(l + v);',
    '  float shine = mix(6.0, 200.0, uGloss) * (1.0 - 0.70 * uFrost);',
    '  float spec = pow(max(dot(n, hv), 0.0), max(shine, 2.0));',
    '  float beam = 1.0 + uSweep * 0.9 * sin(uSweepPhase * 1.3 + d * 3.0);',
    '  col += spec * uGloss * 0.55 * max(beam, 0.0);',
    '',
    '  float fres = pow(1.0 - clamp(n.z, 0.0, 1.0), 3.0);',
    '  col += fres * uGloss * 0.15 * ramp(1.0);',
    '',
    '  col = mix(col, col * 0.72 + 0.16, uFrost * 0.30);',
    '',
    '  if (abs(uHue) > 0.001) col = hueShift(col, uHue);',
    '',
    '  col *= smoothstep(uVoid, uVoid + uVoidFade, d);',
    '',
    '  col += (hash21(gl_FragCoord.xy + fract(uTime) * 137.0) - 0.5) * GRAIN;',
    '',
    '  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);',
    '}'
  ].join('\n');

  var parseCtx;

  function toRGB(css) {
    if (!css) return [0, 0, 0];
    var s = css.trim();
    var hex = /^#([0-9a-f]{3,8})$/i.exec(s);
    if (hex) {
      var h = hex[1];
      if (h.length === 3 || h.length === 4) {
        h = h.split('').map(function(c) { return c + c; }).join('');
      }
      var n = parseInt(h.slice(0, 6), 16);
      return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
    }
    var fn = /^rgba?\(([^)]+)\)$/i.exec(s);
    if (fn) {
      var parts = fn[1].split(/[\s,/]+/).filter(Boolean).slice(0, 3);
      var v = parts.map(function(x) {
        return x.indexOf('%') >= 0 ? parseFloat(x) * 2.55 : parseFloat(x);
      });
      return [(v[0] || 0) / 255, (v[1] || 0) / 255, (v[2] || 0) / 255];
    }
    if (parseCtx === undefined) {
      parseCtx = document.createElement('canvas').getContext('2d');
    }
    if (parseCtx) {
      parseCtx.fillStyle = '#000000';
      parseCtx.fillStyle = s;
      var out = parseCtx.fillStyle;
      if (typeof out === 'string' && out.charAt(0) === '#' && out !== s) {
        return toRGB(out);
      }
    }
    return [0, 0, 0];
  }

  function compile(gl, type, src) {
    var sh = gl.createShader(type);
    if (!sh) return null;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(sh));
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }

  function buildProgram(gl) {
    var hp = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
    var precision = (hp && hp.precision > 0) ? 'highp' : 'mediump';
    var vs = compile(gl, gl.VERTEX_SHADER, VERT);
    var fs = compile(gl, gl.FRAGMENT_SHADER, 'precision ' + precision + ' float;\n' + FRAG);
    if (!vs || !fs) return null;
    var prog = gl.createProgram();
    if (!prog) return null;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.bindAttribLocation(prog, 0, 'aPos');
    gl.linkProgram(prog);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(prog));
      return null;
    }
    return prog;
  }

  var canvas = document.getElementById('glass-canvas');
  if (!canvas) return;

  var gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'high-performance' })
         || canvas.getContext('experimental-webgl', { alpha: false, antialias: false });
  if (!gl) return;

  var program = null;
  var buffer  = null;
  var uni     = {};

  var UNI_NAMES = [
    'uTime','uAspect','uColors[0]','uCount','uScale','uAngle',
    'uPhase','uTwist','uStretch','uFreq','uRelief','uVoid','uVoidFade',
    'uGloss','uRefract','uFrost','uHue','uSweep','uSweepPhase','uCenterOffset'
  ];

  function init() {
    program = buildProgram(gl);
    if (!program) return false;
    gl.useProgram(program);

    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    uni = {};
    for (var i = 0; i < UNI_NAMES.length; i++) {
      uni[UNI_NAMES[i]] = gl.getUniformLocation(program, UNI_NAMES[i]);
    }
    return true;
  }

  var vw = 0, vh = 0;

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    var w = Math.max(1, Math.round(canvas.clientWidth  * dpr));
    var h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (w === vw && h === vh) return;
    vw = w; vh = h;
    canvas.width  = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
  }

  var colorBuf  = new Float32Array(MAX_STOPS * 3);
  var elapsed   = 0;
  var phase     = 0;
  var shimmerPh = 0;
  var sweepPh   = 0;
  var lastNow   = 0;
  var raf       = 0;
  var onScreen  = true;
  var pageVis   = true;
  var reduceMo  = false;

  function draw(dt) {
    if (!program) return;

    if (!reduceMo) {
      elapsed   += dt;
      phase     += dt * FLOW    * 0.12;
      shimmerPh += dt * 0.18;
      sweepPh   += dt * SWEEP   * 0.06;
    }

    var list = COLORS.slice(0, MAX_STOPS);
    colorBuf.fill(0);
    for (var i = 0; i < list.length; i++) {
      var c = toRGB(list[i]);
      colorBuf[i * 3]     = c[0];
      colorBuf[i * 3 + 1] = c[1];
      colorBuf[i * 3 + 2] = c[2];
    }

    var zoom   = Math.pow(2.4, (SCALE   - 5) / 2.5);
    var voidR  = VOID_SIZE * 0.06;
    var glossN = GLOSS / 10;

    gl.useProgram(program);
    gl.uniform1f(uni['uTime'],      elapsed);
    gl.uniform1f(uni['uAspect'],    vw / Math.max(1, vh));
    gl.uniform3fv(uni['uColors[0]'], colorBuf);
    gl.uniform1i(uni['uCount'],     Math.max(1, list.length));
    gl.uniform1f(uni['uScale'],     zoom);
    gl.uniform1f(uni['uAngle'],     (ANGLE * Math.PI) / 180);
    gl.uniform1f(uni['uPhase'],     phase);
    gl.uniform1f(uni['uTwist'],     TWIST   * 0.35);
    gl.uniform1f(uni['uStretch'],   Math.pow(2.2, (STRETCH - 5) / 2.5));
    gl.uniform1f(uni['uFreq'],      BANDS   * 0.45);
    gl.uniform1f(uni['uRelief'],    RELIEF  * 0.02);
    gl.uniform1f(uni['uVoid'],      voidR);
    gl.uniform1f(uni['uVoidFade'],  0.15 + VOID_SIZE * 0.04);
    gl.uniform1f(uni['uGloss'],     glossN);
    gl.uniform1f(uni['uRefract'],   REFRACTION * 0.022);
    gl.uniform1f(uni['uFrost'],     FROST / 10);
    gl.uniform1f(uni['uHue'],       Math.sin(shimmerPh) * SHIMMER * 0.05);
    gl.uniform1f(uni['uSweep'],     SWEEP   / 10);
    gl.uniform1f(uni['uSweepPhase'], sweepPh);
    gl.uniform2f(uni['uCenterOffset'], -0.7, 0.7);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function loop(now) {
    raf = requestAnimationFrame(loop);
    if (!onScreen || !pageVis) { lastNow = now; return; }
    var dt = lastNow ? Math.min((now - lastNow) / 1000, 0.05) : 0;
    lastNow = now;
    resize();
    draw(dt);
  }

  if (!init()) return;

  var ro = typeof ResizeObserver !== 'undefined'
    ? new ResizeObserver(function() { resize(); })
    : null;
  if (ro) ro.observe(canvas);

  var io = typeof IntersectionObserver !== 'undefined'
    ? new IntersectionObserver(function(entries) {
        onScreen = entries.some(function(e) { return e.isIntersecting; });
      }, { rootMargin: '128px' })
    : null;
  if (io) io.observe(canvas);

  function onVis() { pageVis = document.visibilityState !== 'hidden'; }
  document.addEventListener('visibilitychange', onVis);

  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  reduceMo = mq.matches;
  function onMQ(e) { reduceMo = e.matches; }
  if (mq.addEventListener) mq.addEventListener('change', onMQ);
  else mq.addListener(onMQ);

  canvas.addEventListener('webglcontextlost', function(e) {
    e.preventDefault();
    cancelAnimationFrame(raf);
  });
  canvas.addEventListener('webglcontextrestored', function() {
    lastNow = 0;
    if (init()) raf = requestAnimationFrame(loop);
  });

  resize();
  raf = requestAnimationFrame(loop);
})();
