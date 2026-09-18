import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export class ParticlesSwarm {
    constructor(container, count = 20000) {
        this.count = count;
        this.container = container;
        this.speedMult = 1;
        
        // SETUP
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.01);
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.camera.position.set(0, 0, 100);
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);

        // POST PROCESSING
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
        bloomPass.strength = 1.8; bloomPass.radius = 0.4; bloomPass.threshold = 0;
        this.composer.addPass(bloomPass);

        // OBJECTS
        this.dummy = new THREE.Object3D();
        this.color = new THREE.Color();
        this.target = new THREE.Vector3();
        this.pColor = new THREE.Color();
        
        this.geometry = new THREE.SphereGeometry(0.3, 16, 16);
        this.material = new THREE.ShaderMaterial({
    uniforms: {},
    vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vColor;
        void main() {
            vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
            vNormal = normalize(normalMatrix * normal);
            vViewPosition = -mvPosition.xyz;
            vColor = instanceColor;
            gl_Position = projectionMatrix * mvPosition;
        }
    `,
    fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vColor;
        void main() {
            float fresnel = dot(vNormal, normalize(vViewPosition));
            fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
            fresnel = pow(fresnel, 2.0);
            vec3 col = vColor * fresnel + vec3(0.1); 
            gl_FragColor = vec4(col, 0.3 + fresnel * 0.7);
        }
    `,
    transparent: true, blending: 2, depthWrite: false
});
        
        this.mesh = new THREE.InstancedMesh(this.geometry, this.material, this.count);
        this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.scene.add(this.mesh);
        
        this.positions = [];
        for(let i=0; i<this.count; i++) {
            this.positions.push(new THREE.Vector3((Math.random()-0.5)*100, (Math.random()-0.5)*100, (Math.random()-0.5)*100));
            this.mesh.setColorAt(i, this.color.setHex(0x00ff88));
        }
        
        this.clock = new THREE.Clock();
        this.animate = this.animate.bind(this);
        this.animate();
    }

    animate() {
        requestAnimationFrame(this.animate);
        const time = this.clock.getElapsedTime() * this.speedMult;
        
        if(this.material.uniforms && this.material.uniforms.uTime) {
            this.material.uniforms.uTime.value = time;
        }

        // API Stubs
        const PARAMS = {"radius":60,"flow":0.8,"turb":0.45,"shell":0.25,"hueShift":0.35};
        const addControl = (id, l, min, max, val) => {
             return PARAMS[id] !== undefined ? PARAMS[id] : val;
        };
        const setInfo = () => {};
        const annotate = () => {};
        let THREE_LIB = THREE;
        
        let THREE_LIB = THREE;
        const count = this.count; // Alias for user code
        
        for(let i=0; i<this.count; i++) {
            let target = this.target;
            let color = this.pColor;
            
            // INJECTED CODE
            const radius = addControl("radius", "Orb Radius", 20, 120, 60);
            const flow = addControl("flow", "Flow Speed", 0, 3, 0.8);
            const turb = addControl("turb", "Turbulence", 0, 1, 0.45);
            const shell = addControl("shell", "Glass Depth", 0, 1, 0.25);
            const hueShift = addControl("hueShift", "Hue Drift", 0, 1, 0.35);
            
            const t = time * flow;
            
            // Fibonacci sphere distribution for even coverage
            const golden = 2.399963229728653;
            const frac = (i + 0.5) / count;
            const y0 = 1.0 - 2.0 * frac;
            const r0 = Math.sqrt(Math.max(0.0, 1.0 - y0 * y0));
            const th = golden * i;
            
            let x = r0 * Math.cos(th);
            let y = y0;
            let z = r0 * Math.sin(th);
            
            // Layered sine "curl" turbulence — swirling energy ribbons inside the glass
            const w1 = Math.sin(3.0 * x + t * 1.7 + Math.cos(2.0 * z - t)) * Math.cos(2.0 * y - t * 1.3);
            const w2 = Math.sin(4.0 * z - t * 1.1 + Math.cos(3.0 * x + t * 0.7)) * Math.cos(3.0 * y + t);
            const w3 = Math.sin(2.0 * y + t * 2.1 + Math.cos(4.0 * x - t * 0.5)) * Math.cos(2.0 * z + t * 0.9);
            
            // Gentle breathing of the whole orb
            const breath = 1.0 + 0.06 * Math.sin(t * 1.2) + 0.03 * Math.sin(t * 2.7 + 1.3);
            
            // Two populations blended by pure math: outer glass shell + inner energy core
            const band = 0.5 + 0.5 * Math.sin(frac * 6.28318 * 3.0 + t * 0.6);
            const shellMix = band * shell;
            
            // Radial modulation: shell particles hug the surface, core particles swirl deeper
            const rMod = breath * (1.0 - shellMix * (0.55 + 0.35 * Math.sin(th * 0.5 + t)));
            const dist = turb * 0.22;
            
            // Slow global rotation for that idle Siri drift
            const rotA = t * 0.25;
            const cA = Math.cos(rotA);
            const sA = Math.sin(rotA);
            const xr = x * cA - z * sA;
            const zr = x * sA + z * cA;
            
            const px = (xr + w1 * dist) * radius * rMod;
            const py = (y + w2 * dist * 1.15) * radius * rMod;
            const pz = (zr + w3 * dist) * radius * rMod;
            
            target.set(px, py, pz);
            
            // Iridescent glass palette: cyan -> violet -> magenta flowing across the surface
            const swirl = 0.5 + 0.5 * Math.sin(y * 2.0 + xr * 1.5 + t * 1.4 + w1 * 2.0);
            const hue = 0.52 + hueShift * 0.28 * swirl + 0.05 * Math.sin(t * 0.5 + frac * 6.28318);
            const edge = Math.abs(y0);
            const light = 0.55 + 0.25 * w2 * turb + 0.12 * edge;
            const sat = 0.75 + 0.2 * swirl;
            
            color.setHSL(hue % 1.0, Math.min(1.0, Math.max(0.0, sat)), Math.min(0.92, Math.max(0.15, light)));
            
            if (i === 0) {
              setInfo("Glass Orb // Siri iOS 27", "Iridescent breathing sphere with internal curl-flow energy ribbons. Tune Glass Depth for shell layering, Turbulence for inner chaos.");
              annotate("core", new THREE.Vector3(0, 0, 0), "Neural Core");
            }
            
            // UPDATE
            this.positions[i].lerp(this.target, 0.1);
            this.dummy.position.copy(this.positions[i]);
            this.dummy.updateMatrix();
            this.mesh.setMatrixAt(i, this.dummy.matrix);
            this.mesh.setColorAt(i, this.pColor);
        }
        this.mesh.instanceMatrix.needsUpdate = true;
        this.mesh.instanceColor.needsUpdate = true;
        
        this.composer.render();
    }
    
    dispose() {
        this.geometry.dispose();
        this.material.dispose();
        this.scene.remove(this.mesh);
        this.renderer.dispose();
    }
}