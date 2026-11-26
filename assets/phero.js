
import * as THREE from 'three';

/* Kai header, particle direction: a dust landscape in the hero (interactive: cursor bounce, pan, edge-speed turn).
   Scrolling the header's first chapter (window.__PRE 0..1) lifts the dust into the Kai logotype inside an orb,
   merges it into one pulsating violet orb; as the page's own #bub appears (solid) and types, the dust settles back
   into the land behind it. The next scroll (the original header timeline, P) carries on into the UI card. */
const host = document.getElementById('heroArt'), cvs = document.getElementById('phero');
if (!host || !cvs) throw new Error('no particle hero');
let VW = Math.max(1, cvs.clientWidth), VH = Math.max(1, cvs.clientHeight);
const renderer = new THREE.WebGLRenderer({ canvas: cvs, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(VW, VH, false);
renderer.setClearColor(0x000000, 0);
const PX = renderer.getPixelRatio();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(46, VW / VH, 0.1, 1200);
const world = new THREE.Group();              // everything that belongs to the land turns together
scene.add(world);


/* ---------- the terrain model: built once on load, then fixed ----------
   A winding river valley runs through the middle (the viewer stands on its floor). Mountain ranges with
   branching ridges rise on both sides. Then thousands of simulated rain droplets erode the slopes, cutting
   gullies, sharpening ridgelines and laying sediment on the valley floors, which is what makes it read as real land. */
const T_SIZE = 560, T_N = 512;
const heights = (() => {
  // small, fast gradient noise
  const perm = new Uint8Array(512); { const p = [...Array(256).keys()]; let sd = 7;
    for (let i = 255; i > 0; i--) { sd = (sd * 16807) % 2147483647; const j = sd % (i + 1); [p[i], p[j]] = [p[j], p[i]]; }
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255]; }
  const fade = t => t * t * t * (t * (t * 6 - 15) + 10);
  const grad = (h, x, y) => { const a = h * 0.0245436926; return Math.cos(a) * x + Math.sin(a) * y; };
  const noise = (x, y) => { const X = Math.floor(x), Y = Math.floor(y), xf = x - X, yf = y - Y, xi = X & 255, yi = Y & 255;
    const u = fade(xf), v = fade(yf);
    const n00 = grad(perm[xi + perm[yi]], xf, yf), n10 = grad(perm[xi + 1 + perm[yi]], xf - 1, yf),
          n01 = grad(perm[xi + perm[yi + 1]], xf, yf - 1), n11 = grad(perm[xi + 1 + perm[yi + 1]], xf - 1, yf - 1);
    return ((n00 + u * (n10 - n00)) + v * ((n01 + u * (n11 - n01)) - (n00 + u * (n10 - n00)))) * 1.4; };
  const fbm = (x, y, o = 6) => { let s = 0, a = .5; for (let i = 0; i < o; i++) { s += noise(x, y) * a; x = x * 2.02 + 17.3; y = y * 2.02 - 9.1; a *= .5; } return s; };
  const ridged = (x, y) => { let s = 0, a = .5, w = 1; for (let i = 0; i < 6; i++) { let n = 1 - Math.abs(noise(x, y)); n = n * n * (3 - 2 * n); s += n * a * w; w = Math.min(1, n * 1.8); x = x * 2.03 + 5.7; y = y * 2.03 + 3.3; a *= .5; } return s; };

  const N = T_N, H = new Float32Array(N * N), cell = T_SIZE / (N - 1);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const x = (i / (N - 1) - .5) * T_SIZE, z = (j / (N - 1) - .5) * T_SIZE, r = Math.hypot(x, z);
    const qx = x * .0055, qz = z * .0055;
    const wx = qx + fbm(qx + 3.1, qz - 1.7, 4) * .7, wz = qz + fbm(qx - 6.2, qz + 4.4, 4) * .7;   // domain warp: ranges bend and branch
    const base = fbm(wx, wz) * .5 + .5, rid = ridged(wx * 1.25, wz * 1.25);
    let m = Math.pow(Math.max(0, base * .75 + rid * .4 - .15), 1.25);   // rounded shoulders, softer summits
    // the river valley: a meandering corridor through the middle, widening with distance
    const vz = z - 26 * Math.sin(x * .013) - 11 * Math.sin(x * .029 + 1.3);
    const vw = 16 + Math.abs(x) * .06;
    const away = Math.max(0, Math.abs(vz) - vw);
    const mask = Math.min(1, Math.pow(away / 80, 1.1)) * (.55 + .45 * Math.min(1, r / 130));
    H[j * N + i] = m * 120 * mask + (fbm(qx * 3, qz * 3, 3) * .5 + .5) * 4 * (1 - mask * .5) + r * r * .00015;
  }

  // hydraulic erosion (droplet model)
  const hAt = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), u = x - xi, v = y - yi, k = yi * N + xi;
    const a = H[k], b = H[k + 1], c = H[k + N], d = H[k + N + 1];
    return [a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v, (b - a) * (1 - v) + (d - c) * v, (c - a) * (1 - u) + (d - b) * u]; };
  let sd = 12345; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const DROPS = innerWidth < 760 ? 60000 : 110000;
  for (let n = 0; n < DROPS; n++) {
    let x = rnd() * (N - 3) + 1, y = rnd() * (N - 3) + 1, dx = 0, dy = 0, speed = 1, water = 1, sed = 0;
    for (let life = 0; life < 40; life++) {
      const xi = Math.floor(x), yi = Math.floor(y), u = x - xi, v = y - yi;
      const [h0, gx, gy] = hAt(x, y);
      dx = dx * .05 - gx * .95; dy = dy * .05 - gy * .95;
      const len = Math.hypot(dx, dy); if (len < 1e-6) break; dx /= len; dy /= len;
      x += dx; y += dy;
      if (x < 1 || y < 1 || x > N - 2 || y > N - 2) break;
      const dh = hAt(x, y)[0] - h0;
      const cap = Math.max(-dh * speed * water * 4, .01);
      const k = yi * N + xi, w = [(1 - u) * (1 - v), u * (1 - v), (1 - u) * v, u * v], ks = [k, k + 1, k + N, k + N + 1];
      if (sed > cap || dh > 0) {
        const amt = dh > 0 ? Math.min(dh, sed) : (sed - cap) * .3;
        sed -= amt; for (let q = 0; q < 4; q++) H[ks[q]] += amt * w[q];
      } else {
        const amt = Math.min((cap - sed) * .3, -dh);
        // erode with a small soft brush so gullies come out smooth rather than pitted
        for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
          const wt = (ox === 0 && oy === 0 ? .36 : (ox && oy ? .06 : .1));
          H[k + oy * N + ox] -= amt * wt;
        }
        sed += amt;
      }
      speed = Math.sqrt(Math.max(0, speed * speed + dh * 4)); water *= .97;
    }
  }
  // a light smoothing pass: rounds the summits and ridge crests without losing the gullies
  for (let pass = 0; pass < 2; pass++) {
    const C = H.slice();
    for (let j = 1; j < N - 1; j++) for (let i = 1; i < N - 1; i++) { const k = j * N + i;
      H[k] = C[k] * .4 + (C[k - 1] + C[k + 1] + C[k - N] + C[k + N]) * .12 + (C[k - N - 1] + C[k - N + 1] + C[k + N - 1] + C[k + N + 1]) * .03; }
  }
  return H;
})();
const EYE = heights[(T_N >> 1) * T_N + (T_N >> 1)] + 15;
const hTex = new THREE.DataTexture(heights, T_N, T_N, THREE.RedFormat, THREE.FloatType);
hTex.magFilter = hTex.minFilter = THREE.LinearFilter; hTex.wrapS = hTex.wrapT = THREE.ClampToEdgeWrapping; hTex.needsUpdate = true;

/* the whole world's height: the modelled valley near the viewer, blending into the distant ranges */
const hS = (x, z) => { const fx = Math.min(T_N - 1.001, Math.max(0, (x / T_SIZE + .5) * (T_N - 1))), fz = Math.min(T_N - 1.001, Math.max(0, (z / T_SIZE + .5) * (T_N - 1)));
  const i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j, k = j * T_N + i;
  return heights[k] * (1 - u) * (1 - v) + heights[k + 1] * u * (1 - v) + heights[k + T_N] * (1 - u) * v + heights[k + T_N + 1] * u * v; };
const R_FAR = 620;
const vn = (x, y) => { const X = Math.floor(x), Y = Math.floor(y), fx = x - X, fy = y - Y, h = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  return (h(X, Y) * (1 - u) + h(X + 1, Y) * u) * (1 - v) + (h(X, Y + 1) * (1 - u) + h(X + 1, Y + 1) * u) * v; };
const ridgeB = (x, y) => { let s = 0, a = .5; for (let i = 0; i < 5; i++) { let n = 1 - Math.abs(vn(x, y) * 2 - 1); n = n * n * (3 - 2 * n); s += n * a; x = x * 2.1 + 3.7; y = y * 2.1 - 1.3; a *= .5; } return s; };
// far ranges: rise beyond the modelled valley and stand on the horizon all the way round
const hFar = (x, z) => { const r = Math.hypot(x, z); return Math.pow(ridgeB(x * .0032 + 11, z * .0032 - 7), 1.9) * 170 * Math.min(1, Math.max(0, (r - 250) / 170)) + r * r * .00012; };
const hAll = (x, z) => { const r = Math.hypot(x, z), w = Math.min(1, Math.max(0, (r - 215) / 55)); return w <= 0 ? hS(x, z) : w >= 1 ? hFar(x, z) : hS(x, z) * (1 - w) + hFar(x, z) * w; };
// the same heights baked into a wide, coarser map, so the hidden ground matches the far ranges exactly
const FAR_N = 256, FAR_SIZE = R_FAR * 2;
const farH = new Float32Array(FAR_N * FAR_N);
for (let j = 0; j < FAR_N; j++) for (let i = 0; i < FAR_N; i++) farH[j * FAR_N + i] = hAll((i / (FAR_N - 1) - .5) * FAR_SIZE, (j / (FAR_N - 1) - .5) * FAR_SIZE);
const farTex = new THREE.DataTexture(farH, FAR_N, FAR_N, THREE.RedFormat, THREE.FloatType);
farTex.magFilter = farTex.minFilter = THREE.LinearFilter; farTex.wrapS = farTex.wrapT = THREE.ClampToEdgeWrapping; farTex.needsUpdate = true;

const TERRAIN = `
uniform float uT;
uniform sampler2D uHeight;
uniform sampler2D uFar;
float heightAt(vec2 p){
  float w=clamp((length(p)-215.)/55.,0.,1.);
  return mix(texture2D(uHeight, p/${T_SIZE.toFixed(1)}+.5).r, texture2D(uFar, p/${FAR_SIZE.toFixed(1)}+.5).r, w);
}
`;

/* ---------- land: one fine mesh of the valley, drawn twice ----------
   pass 1 writes depth only, so nearer hills hide everything behind them (only front outlines show);
   pass 2 draws the particles: dots scattered evenly over the real surface area, so steep mountain faces
   are as densely grained as the valley floor. Each dot is anchored to the land and wobbles gently in place. */
const R_MAX = 260, U = { uT: { value: 0 }, uRot: { value: 0 }, uPx: { value: PX }, uHeight: { value: hTex }, uFar: { value: farTex }, uHit: { value: new THREE.Vector3(0, -999, 0) }, uPush: { value: 0 }, uHitR: { value: 16 } };
const LITE = innerWidth < 760;
const RS = LITE ? 230 : 340, AS = LITE ? 700 : 1100, v = [], idx = [];
const rad = k => 2.5 * Math.pow(R_FAR / 2.5, k / (RS - 1));
for (let k = 0; k < RS; k++) for (let a = 0; a <= AS; a++) { const th = a / AS * Math.PI * 2, r = rad(k); v.push(Math.cos(th) * r, 0, Math.sin(th) * r); }
for (let k = 0; k < RS - 1; k++) for (let a = 0; a < AS; a++) { const i0 = k * (AS + 1) + a, i1 = i0 + AS + 1; idx.push(i0, i1, i0 + 1, i0 + 1, i1, i1 + 1); }
const landGeo = new THREE.BufferGeometry();
landGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(v), 3)); landGeo.setIndex(idx);
landGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 400);

const LAND_VS = TERRAIN + `
  uniform float uRot;
  varying vec3 vP; varying vec3 vN; varying float vCrest; varying vec3 vW; varying vec3 vNW;
  void main(){
    vec2 p=position.xz;
    float h=heightAt(p), e=1.2;
    float hx=heightAt(p+vec2(e,0.)), hz=heightAt(p+vec2(0.,e)), hx2=heightAt(p-vec2(e,0.)), hz2=heightAt(p-vec2(0.,e));
    vN=normalize(vec3(hx2-hx, 2.*e, hz2-hz));
    vCrest=clamp((4.*h-hx-hx2-hz-hz2)/(e*e)*.5-.12,0.,1.);
    vP=vec3(p.x,h,p.y);
    vW=(modelMatrix*vec4(vP,1.)).xyz; vNW=mat3(modelMatrix)*vN;
    gl_Position=projectionMatrix*modelViewMatrix*vec4(vP.x, vP.y-.35-length(vP.xz)*.004, vP.z, 1.);
  }`;

// pass 1: depth only
const depthMesh = new THREE.Mesh(landGeo, new THREE.ShaderMaterial({ uniforms: U, colorWrite: false, depthWrite: true, side: THREE.DoubleSide,
  vertexShader: LAND_VS, fragmentShader: `void main(){ gl_FragColor=vec4(0.); }` }));
depthMesh.renderOrder = 0;
world.add(depthMesh);

// pass 2: the particles. Real, individual grains: scattered evenly over the true surface area (steep faces
// get as many as flat ground), finer near the eye and sparser toward the horizon.
const KICKS = 14;
U.uKick = { value: Array.from({ length: KICKS }, () => new THREE.Vector4(0, -999, 0, -99)) };
const grains = (() => {
  const MAXD = LITE ? 9 : 17, pos = [], nor = [], cre = [], rn = [];
  let sd = 99; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const want = LITE ? 360000 : 700000;
  // distance bands: each band gets exactly its share of grains (finer near the eye, sparse on far ranges)
  const densAt = r => Math.min(1, Math.max(r > 320 ? .016 : .12, Math.exp(-(r - 12) / 30)));
  const bands = []; let tot = 0;
  for (let r0 = 0; r0 < R_FAR; r0 += 4) { const w = densAt(r0 + 2) * Math.PI * ((r0 + 4) ** 2 - r0 ** 2); bands.push([r0, w]); tot += w; }
  for (const [r0, w] of bands) {
    const n = Math.round(want * w / tot);
    for (let got = 0, tries = 0; got < n && tries < n * 12; tries++) {
    const r = Math.sqrt(r0 * r0 + rnd() * ((r0 + 4) ** 2 - r0 * r0)), a = rnd() * 6.2832, x = Math.cos(a) * r, z = Math.sin(a) * r;
    const e = r > 230 ? 3 : 1.2, H_ = hAll, h = H_(x, z), gx = (H_(x + e, z) - H_(x - e, z)) / (2 * e), gz = (H_(x, z + e) - H_(x, z - e)) / (2 * e);
    const area = Math.sqrt(1 + gx * gx + gz * gz);                               // true surface area per unit of ground
    if (rnd() > Math.min(area, 2.5) / 2.5) continue;
    got++;
    const nl = Math.hypot(-gx, 1, -gz);
    const lap = (4 * h - H_(x + e, z) - H_(x - e, z) - H_(x, z + e) - H_(x, z - e)) / (e * e);
    pos.push(x, h, z); nor.push(-gx / nl, 1 / nl, -gz / nl); cre.push(Math.min(1, Math.max(0, lap * .5 - .12))); rn.push(rnd());
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
  g.setAttribute('nrm', new THREE.BufferAttribute(new Float32Array(nor), 3));
  g.setAttribute('crest', new THREE.BufferAttribute(new Float32Array(cre), 1));
  g.setAttribute('rnd', new THREE.BufferAttribute(new Float32Array(rn), 1));
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 900);
  return g;
})();
const dotMat = new THREE.ShaderMaterial({
  uniforms: U, transparent: true, depthWrite: false, depthTest: true, blending: THREE.AdditiveBlending,
  vertexShader: `
    uniform float uT, uRot, uPx, uForm, uMerge, uOrbA, uLogoA, uBub, uBubUI, uPillA, uPillB, uIntro, uTxtIn, uTxtOut, uTanY, uAsp; uniform vec4 uTxt; uniform vec3 uPillC, uOrbC, uCamR, uCamU, uCamF; uniform vec4 uKick[${KICKS}];
    attribute vec3 nrm; attribute float crest, rnd; attribute vec3 tgt, tgt2, pq; attribute float tk; attribute vec2 tscr;
    varying float vA; varying vec3 vCol;
    void main(){
      vec3 p=position;
      // bounce: every recent cursor touch kicks the grains near it; each grain hops and bounces back to rest
      // like a little ball, with its own height and rhythm
      float hop=0., glow=0.;
      for(int i=0;i<${KICKS};i++){
        vec4 k=uKick[i]; float dt=uT-k.w;
        if(dt<0.||dt>2.6) continue;
        float R=2.6+length(k.xz)*.03;
        float fall=exp(-dot(p.xz-k.xz,p.xz-k.xz)/(R*R));
        if(fall<.01) continue;
        float w=8.+rnd*5., ph=dt*w;
        float b=abs(sin(ph))*exp(-dt*(2.2+rnd*.8));
        float sel=step(.4,fract(rnd*7.31));                            // only some grains jump, so they read as loose dust
        hop+=fall*b*(.3+fract(rnd*13.7)*1.2)*R*.5*sel;
        glow+=fall*exp(-dt*2.);
      }
      p.y+=hop;
      // shimmer: every grain drifts in its own tiny sideways loop (no up/down), so the surface glitters
      float wr=.035+.0022*length(p.xz);
      p.xz+=vec2(sin(uT*(.5+rnd*.9)+rnd*40.), cos(uT*(.45+fract(rnd*5.3)*.8)+rnd*31.))*wr;
      // scroll: the dust lifts off the land, circulates around a vortex and gathers into the Kai logotype
      // inside an orb (stage 1), then everything merges into one single orb (stage 2)
      vec3 land0=(modelMatrix*vec4(p,1.)).xyz, landW=land0;
      // on load the dust gathers out of a scattered cloud into the land
      float ie=clamp((uIntro-fract(rnd*3.71)*.45)/.55,0.,1.); ie=ie*ie*(3.-2.*ie);
      vec3 scat=cameraPosition+vec3((pq.x-.5)*320.,(pq.y-.3)*90.,-30.-pq.z*260.);
      landW=mix(scat,land0,ie);
      // on load a share of the dust first forms the headline (exactly over the real text), then flows away into the land
      float isT=0.;   // particle headline switched off: every grain settles straight into the land
      float tIn=clamp((uTxtIn-fract(rnd*5.3)*.3)/.7,0.,1.); tIn=tIn*tIn*(3.-2.*tIn);
      float tOut=clamp((uTxtOut-(tscr.x*.5+.5)*.35-fract(rnd*2.9)*.05)/.6,0.,1.); tOut=tOut*tOut*(3.-2.*tOut);   // sweeps left to right
      vec3 tdir=normalize(uCamF+uCamR*tscr.x*uTanY*uAsp+uCamU*tscr.y*uTanY);
      vec3 textW=cameraPosition+tdir*40.;
      float tf=isT*tIn*(1.-tOut);
      if(isT>.5) landW=mix(mix(scat,textW,tIn),land0,tOut)+sin(tOut*3.14159)*vec3(sin(land0.z*.05+uT),.0,cos(land0.x*.05+uT))*3.;
      // shifting sands: grains never vanish; they flow in waves from one shape into the next along gentle curving paths
      float del=clamp(length(landW-uOrbC)/420.,0.,1.)*.4+fract(rnd*17.31)*.06;   // the nearest sand moves first, a wave sweeps outward
      float e=clamp((uForm-del)/.54,0.,1.); e=e*e*(3.-2.*e);
      float a1=tk>.5?uLogoA:uOrbA, c1=cos(a1), s1=sin(a1), c2=cos(uOrbA), s2=sin(uOrbA);
      vec3 g1=vec3(tgt.x*c1+tgt.z*s1, tgt.y, -tgt.x*s1+tgt.z*c1);
      vec3 g2=vec3(tgt2.x*c2+tgt2.z*s2, tgt2.y, -tgt2.x*s2+tgt2.z*c2);
      g2*=1.+.055*sin(uT*2.3);                                          // the single orb breathes
      float me=clamp((uMerge-(1.-clamp(g1.y/30.+.5,0.,1.))*.25-fract(rnd*9.17)*.05)/.7,0.,1.); me=me*me*(3.-2.*me);   // sweeps top to bottom
      vec3 tl=mix(g1,g2,me);
      float swm=sin(me*3.14159);
      tl+=swm*vec3(sin(tl.y*.35+uT*.7+rnd*2.),sin(tl.x*.3+uT*.6)*.35,cos(tl.y*.33+uT*.65))*1.6;
      vec3 w=mix(landW,uOrbC+tl,e);
      float sw=sin(e*3.14159);
      vec3 rel=w-uOrbC; float ang=sw*(.45+rnd*.25), ca=cos(ang), sa=sin(ang);
      rel=vec3(rel.x*ca+rel.z*sa, rel.y, -rel.x*sa+rel.z*ca);
      rel+=sw*vec3(sin(rel.z*.04+uT*.6+rnd*2.),sin(rel.x*.03+uT*.5)*.35,cos(rel.x*.04+uT*.55))*5.;
      w=uOrbC+rel;
      // stage 3: the orb stretches into a pill-shaped chat bubble made of particles, facing the viewer
      vec2 q; float pa=uPillA*.97, pb=uPillB*.92, sx=pa-pb;          // just inside the bubble, so the solid bubble covers the sand
      {                                                           // a dispersed fill (no outline): the sand settles into the bubble's shape
        q=vec2((pq.x*2.-1.)*pa,(pq.y*2.-1.)*pb);
        float ex=max(abs(q.x)-sx,0.);
        if(ex*ex+q.y*q.y>pb*pb){ vec2 cc=vec2(sign(q.x)*sx,0.); q=cc+normalize(q-cc)*pb*sqrt(fract(pq.y*7.3)); }
      }
      vec3 pl=uPillC+uCamR*q.x+uCamU*q.y+uCamF*(pq.z-.5)*pb*.15;   // exactly where the bubble sits
      float be=clamp((uBub-(q.x/max(pa,.001)*.5+.5)*.25-fract(rnd*5.71)*.05)/.7,0.,1.); be=be*be*(3.-2.*be);   // pours in from one end to the other
      // one movement: a share of the orb's sand pours into the bubble while the rest flows back into the land
      bool toBub=fract(rnd*13.37)<.18;
      vec3 bw=toBub?mix(w,pl,be):mix(w,landW,be); bw+=sin(be*3.14159)*vec3(sin(q.y*.5+uT*.8+rnd*6.),cos(q.x*.2+uT*.7+rnd*4.)*.8,sin(rnd*9.+uT*.5))*(toBub?pb*1.6:1.2);   // dispersed while forming
      w=bw;
      if(!toBub){ e*=1.-be; be=0.; }
      vec4 mv=viewMatrix*vec4(w,1.);
      gl_Position=projectionMatrix*mv;
      float d=-mv.z;
      gl_PointSize=uPx*clamp(24./d,1.2,2.6)*(.8+rnd*.45);
      float c=cos(uRot), s=sin(uRot);
      vec3 nw=vec3(nrm.x*c+nrm.z*s, nrm.y, -nrm.x*s+nrm.z*c);
      float lit=clamp(dot(nw,normalize(vec3(-.45,.55,.7))),0.,1.);
      vec3 wpos=(modelMatrix*vec4(p,1.)).xyz;
      float sil=pow(1.-abs(dot(normalize(mat3(modelMatrix)*nrm),normalize(cameraPosition-wpos))),4.);
      float far=smoothstep(110.,252.,length(p.xz)), far2=smoothstep(260.,620.,length(p.xz));
      vec3 deep=vec3(.16,.42,.46), aqua=vec3(.5,.86,.9), foam=vec3(.88,1.,1.);
      vec3 col=mix(deep,aqua,smoothstep(.1,.85,lit));
      col=mix(col,foam,clamp(max(crest,sil*.5),0.,1.));
      col=mix(col,vec3(.3,.56,.6),far*.6);
      // sparkle: now and then a single grain flares, like light catching dust
      float sp=0.;                                                     // no sparkle flashes (steady dust)
      // drifting light: broad soft bands of brighter and dimmer land, like cloud shadows passing over
      float sweep=.5+.5*sin(p.x*.022+uT*.22+sin(p.z*.013-uT*.09)*2.)*sin(p.z*.019-uT*.15+sin(p.x*.011)*1.6);
      col=mix(col,foam,sp*.8);
      vCol=mix(col,foam,clamp(glow,0.,1.)*.6);
      float tw=(.86+.14*fract(rnd*7.9))*(.62+.62*sweep);                // steady: no twinkle, only the slow drifting light
      vA=(.35+.8*pow(lit,1.2)+crest*.9+sil*.5)*tw*(1.-far*.5)*(1.-far2*.55)*smoothstep(1.,3.,d)*(1.+clamp(glow,0.,1.));
      gl_PointSize*=(1.+far2*.5)*(1.+sp*.9);
      // formed look: logo grains bright, the orb a fine shell glowing at its rim; then one orb
      if(tf>0.){ vA=mix(vA,.42,tf); vCol=mix(vCol,vec3(.9,1.,1.),tf); gl_PointSize=mix(gl_PointSize,uPx*1.7,tf); }
      if(e>0.){
        vec3 vd=normalize(cameraPosition-w);
        float rim1=pow(1.-abs(dot(normalize(g1),vd)),2.5), rim2=pow(1.-abs(dot(normalize(g2),vd)),2.2);
        float front1=smoothstep(-.15,.25,dot(normalize(g1),vd));            // the far side of the globe stays faint
        float A1=tk>.5?(.2+sp*2.):(.06+rim1*.22+sp*.8)*mix(.22,1.,front1);
        float A2=.014+rim2*.38+sp*.6;
        vec3 C1=tk>.5?vec3(.42,.74,.76):mix(aqua,foam,rim1);   // the Kai icon in a soft teal
        vec3 vDeep=vec3(.36,.22,.72), vMid=vec3(.6,.45,.98), vPale=vec3(.88,.82,1.);
        float pulse=.82+.18*sin(uT*2.3);
        vec3 C2=mix(mix(vDeep,vMid,fract(rnd*3.3)),vPale,rim2);   // shades of violet
        float A2v=A2*pulse;
        vec3 C3=pq.z>.55?mix(vMid,vPale,.6):mix(vDeep,vMid,fract(rnd*5.1));
        float A3=(pq.z>.55?.5:.09)+sp*.4;                                // grains stay (the solid bubble sits over them)
        vA=mix(vA,mix(mix(A1,A2v,me),A3,be)*tw/(.72+.28*.5),e);
        vCol=mix(vCol,mix(mix(C1,C2,me),C3,be),e);
        gl_PointSize=mix(gl_PointSize,uPx*clamp(30./d,1.,2.2)*(.8+rnd*.45)*(1.+sp*.9),e);
      }
    }`,
  fragmentShader: `
    varying float vA; varying vec3 vCol;
    void main(){ vec2 q=gl_PointCoord-.5; float d=dot(q,q); if(d>.25) discard; gl_FragColor=vec4(vCol,clamp(vA*1.35,0.,1.)*(1.-smoothstep(.12,.25,d))); }`
});
const dotMesh = new THREE.Points(grains, dotMat);
dotMesh.renderOrder = 1;
world.add(dotMesh);

/* ---------- scroll targets: the Kai logotype inside an orb, then one orb ---------- */
const ORB_R = 15, NG = grains.attributes.position.count;
{ const a = new Float32Array(NG * 3); let sd = 777; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < NG * 3; i += 3) { a[i] = r(); a[i + 1] = r(); a[i + 2] = r() < .35 ? .56 + r() * .44 : r() * .55; }
  grains.setAttribute('pq', new THREE.BufferAttribute(a, 3)); }
grains.setAttribute('tscr', new THREE.BufferAttribute(new Float32Array(NG * 2).fill(-9), 2));
let textReady = false;
(async () => {
  try { await document.fonts.load('600 60px "Clash Display"'); await document.fonts.ready; } catch (e) {}
  const r = cvs.getBoundingClientRect(), W = Math.max(1, Math.round(r.width)), H = Math.max(1, Math.round(r.height));
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.fillStyle = '#fff'; g.textBaseline = 'alphabetic';
  // draw every word of the real headline exactly where it sits
  // measure each word by its wrapper (.hw): the word itself (.hwi) is still mid "rise" animation at load and sits lower
  document.querySelectorAll('#h1 .hwi, #h2 .hwi').forEach(w => { const b = (w.parentElement.classList.contains('hw') ? w.parentElement : w).getBoundingClientRect(), cs = getComputedStyle(w);
    g.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`; try { g.letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing; } catch (e) {}
    g.fillText(w.textContent, b.left - r.left, b.top - r.top + parseFloat(cs.fontSize) * .86); });
  if (!document.querySelector('#h1 .hwi')) ['h1', 'h2'].forEach(id => { const el = $(id); if (!el) return; const b = el.getBoundingClientRect(), cs = getComputedStyle(el);
    g.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`; g.fillText(el.textContent.trim(), b.left - r.left, b.top - r.top + parseFloat(cs.fontSize) * .86); });
  const px = g.getImageData(0, 0, W, H).data, pts = [];
  for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) if (px[(y * W + x) * 4 + 3] > 120) pts.push(x, y);
  if (!pts.length) return;
  const A = grains.attributes.tscr.array; let sd = 31; const rr = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < NG; i++) { const k = Math.floor(rr() * pts.length / 2) * 2; A[i * 2] = (pts[k] + rr() * 2) / W * 2 - 1; A[i * 2 + 1] = 1 - (pts[k + 1] + rr() * 2) / H * 2; }
  grains.attributes.tscr.needsUpdate = true; textReady = true;
})();
grains.setAttribute('tgt', new THREE.BufferAttribute(new Float32Array(NG * 3), 3));
grains.setAttribute('tgt2', new THREE.BufferAttribute(new Float32Array(NG * 3), 3));
grains.setAttribute('tk', new THREE.BufferAttribute(new Float32Array(NG), 1));
Object.assign(U, { uForm: { value: 0 }, uMerge: { value: 0 }, uOrbA: { value: 0 }, uLogoA: { value: 0 }, uOrbC: { value: new THREE.Vector3(0, EYE - 3, -60) }, uBub: { value: 0 }, uBubUI: { value: 0 }, uIntro: { value: 0 }, uTxtIn: { value: 0 }, uTxtOut: { value: 0 }, uTanY: { value: .42 }, uAsp: { value: 1.7 }, uTxt: { value: new THREE.Vector4(2, 2, 2, 2) }, uPillC: { value: new THREE.Vector3() }, uPillA: { value: 20 }, uPillB: { value: 3 }, uCamR: { value: new THREE.Vector3(1, 0, 0) }, uCamU: { value: new THREE.Vector3(0, 1, 0) }, uCamF: { value: new THREE.Vector3(0, 0, -1) } });
(async () => {
  const svg = `<svg width="600" height="600" viewBox="-.5 11.5 28.2 28.3" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.3138 12.0881H15.8727C16.0416 12.0881 16.126 12.1726 16.126 12.3414V21.417C16.126 21.5858 16.0416 21.666 15.8727 21.6576C14.2419 21.8737 12.6379 21.9014 11.0605 21.7408V12.3414C11.0605 12.1726 11.145 12.0881 11.3138 12.0881Z" fill="#ffffff"/><path d="M11.0606 18.5888L7.47258 15.1274L3.54688 18.9265C5.64453 20.5061 8.1491 21.4442 11.0606 21.7408L11.2294 21.7619V18.7577L11.0606 18.5888Z" fill="#ffffff"/><path d="M27.1855 23.401V27.9599C27.1855 28.1287 27.1011 28.2131 26.9323 28.2131H17.8567C17.6879 28.2131 17.6077 28.1287 17.6161 27.9599C17.4 26.3291 17.3723 24.725 17.5329 23.1477H26.9323C27.1011 23.1477 27.1855 23.2321 27.1855 23.401Z" fill="#ffffff"/><path d="M20.6851 23.1477L24.1465 19.5597L20.3474 15.634C18.7678 17.7316 17.8297 20.2362 17.5331 23.1477L17.512 23.3165H20.5163L20.6851 23.1477Z" fill="#ffffff"/><path d="M15.8727 39.2726H11.3138C11.145 39.2726 11.0605 39.1882 11.0605 39.0193V29.9437C11.0605 29.7749 11.145 29.6947 11.3138 29.7031C12.9446 29.487 14.5487 29.4593 16.126 29.62V39.0193C16.126 39.1882 16.0416 39.2726 15.8727 39.2726Z" fill="#ffffff"/><path d="M16.1259 32.7719L19.7139 36.2333L23.6396 32.4342C21.542 30.8547 19.0374 29.9166 16.1259 29.62L15.9571 29.5989V32.6031L16.1259 32.7719Z" fill="#ffffff"/><path d="M0.000976562 27.9598L0.000976562 23.4009C0.000976562 23.2321 0.0854004 23.1476 0.254248 23.1476H9.32982C9.49866 23.1476 9.57887 23.2321 9.57042 23.4009C9.78655 25.0317 9.81427 26.6358 9.65358 28.2131H0.254248C0.0854004 28.2131 0.000976562 28.1287 0.000976562 27.9598Z" fill="#ffffff"/><path d="M6.50142 28.2131L3.04004 31.8011L6.83911 35.7268C8.41868 33.6291 9.35677 31.1246 9.65338 28.2131L9.67449 28.0442H6.67027L6.50142 28.2131Z" fill="#ffffff"/><path fill-rule="evenodd" clip-rule="evenodd" d="M41.2312 39.1829C41.3012 39.1362 41.3789 39.0702 41.3983 39.0313C41.4217 38.9847 41.4372 37.0493 41.4372 33.5943V28.2273H41.6004C45.7938 28.2545 47.2084 28.34 48.0556 28.6198C49.2643 29.0201 49.7307 29.5214 50.7916 31.5501C51.0054 31.9582 51.2075 32.3429 51.2424 32.4051C51.2774 32.4673 51.4523 32.8171 51.635 33.1824C51.8137 33.5477 52.3656 34.6203 52.863 35.5725C53.3566 36.5246 53.9473 37.675 54.1727 38.1336C54.4292 38.6505 54.6391 39.0197 54.7246 39.109L54.8645 39.2567L56.4268 39.2839C57.2857 39.2995 58.506 39.2995 59.1395 39.2839C60.2821 39.2528 60.286 39.2528 60.387 39.1596C60.4842 39.0702 60.488 39.0469 60.4686 38.8253C60.4492 38.5688 60.3481 38.3551 59.0812 35.9222C58.234 34.2978 57.1419 32.168 56.7377 31.3558C56.353 30.5824 56.2636 30.4192 55.6573 29.3543C54.4992 27.3179 53.3177 26.1131 51.9226 25.5457C51.7982 25.4952 51.6971 25.4447 51.701 25.433C51.701 25.4214 51.872 25.3009 52.078 25.1649C52.7814 24.7102 53.7064 23.7969 54.3437 22.9341C54.849 22.2501 55.4164 21.2163 56.6639 18.7252C57.344 17.3572 58.0358 15.9931 58.1951 15.6938C58.3544 15.3946 58.7508 14.6096 59.0812 13.9489C59.7846 12.5343 59.804 12.4604 59.5631 12.2117L59.4154 12.0601H57.8959C57.0642 12.0601 55.9177 12.0718 55.3542 12.0873L54.3243 12.1106L54.1766 12.2467C54.095 12.3205 53.9784 12.4798 53.9201 12.6003C53.3177 13.7973 51.9575 16.4633 51.6583 17.0346C51.4523 17.431 50.9782 18.356 50.609 19.0905C49.342 21.6011 48.9262 22.2035 48.1373 22.6621C47.3211 23.1362 46.6255 23.2217 43.1783 23.2761L41.445 23.3033L41.4294 17.8857C41.4139 11.8619 41.4333 12.2389 41.1613 12.1378C41.0602 12.1029 40.454 12.0834 38.7362 12.0679L36.4394 12.0523L36.315 12.1573C36.0313 12.3982 36.0546 11.5588 36.043 20.8821C36.0391 25.4874 36.0469 31.4529 36.0663 34.1345C36.0974 39.3072 36.0896 39.1285 36.2684 39.214C36.4005 39.2723 37.3216 39.2956 39.1598 39.28C41.0369 39.2606 41.1069 39.2606 41.2312 39.1829Z" fill="#ffffff"/><path fill-rule="evenodd" clip-rule="evenodd" d="M81.0968 39.1595C82.5619 38.8137 83.312 38.1685 83.6773 36.9404C83.8755 36.2681 83.8755 36.307 83.8755 29.8362V23.7658L83.7745 23.2489C83.6462 22.5804 83.3237 21.6011 83.141 21.3096C83.1216 21.2785 83.0633 21.1697 83.0166 21.0686C82.7679 20.544 81.8002 19.4908 81.1667 19.0633C80.1952 18.4026 78.8155 17.979 77.3698 17.8857C76.6236 17.843 65.2949 17.7925 64.4671 17.8313L63.8492 17.8585L63.6899 18.0062L63.5305 18.1578V20.132C63.5305 21.2163 63.5422 22.149 63.5577 22.2073C63.5733 22.2617 63.651 22.3706 63.7287 22.4483L63.8725 22.5882L70.386 22.6037C76.8568 22.6154 76.9034 22.6154 77.2493 22.697C78.4152 22.9691 78.9748 23.6297 79.0565 24.819C79.0914 25.2892 79.107 26.2375 79.0875 26.2491C79.0798 26.253 76.577 26.2686 73.5184 26.2841C67.3391 26.3152 68.0076 26.288 66.6785 26.5756C65.909 26.7427 64.9141 27.1896 64.3816 27.6093C62.7649 28.8841 62.1353 30.6368 62.3024 33.3611C62.5123 36.6723 64.37 38.6388 67.8055 39.1829C68.575 39.3033 80.576 39.2839 81.0968 39.1595ZM69.088 34.4454C67.7589 34.3599 67.1293 33.6915 67.1254 32.3662C67.1254 31.3597 67.5024 30.7456 68.2719 30.5124C68.8781 30.3298 68.9364 30.3259 74.1713 30.3259H79.0992L79.0875 32.238C79.072 34.3599 79.0759 34.3288 78.8272 34.4143C78.6678 34.4649 69.8575 34.4959 69.088 34.4454Z" fill="#ffffff"/><path fill-rule="evenodd" clip-rule="evenodd" d="M93.3278 39.2684C93.6737 39.249 93.7126 39.2373 93.8214 39.1324L93.9419 39.0158V28.5771V18.1384L93.8019 18.0023L93.6659 17.8702L92.9975 17.8469C91.8082 17.8003 89.4881 17.808 89.3793 17.8547C89.3249 17.8819 89.2316 17.9713 89.1733 18.0568L89.0645 18.2122V28.5343C89.0645 39.5754 89.0567 39.0857 89.251 39.1946C89.4065 39.2839 92.3446 39.3345 93.3278 39.2684Z" fill="#ffffff"/><path fill-rule="evenodd" clip-rule="evenodd" d="M93.7783 15.5073C94.0076 15.2935 93.9998 15.4024 93.9998 12.8179C93.9998 10.218 94.0115 10.3462 93.7666 10.1169L93.6656 10.0198H91.5281H89.3906L89.239 10.1791C89.0408 10.3929 89.0369 10.4473 89.0525 13.0511C89.0641 15.3829 89.0641 15.3829 89.2934 15.5306C89.445 15.6317 89.4994 15.6317 91.6097 15.6122C93.6772 15.5928 93.6889 15.5889 93.7783 15.5073Z" fill="#ffffff"/></svg>`;
  const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  try { await img.decode(); } catch (e) { return; }
  const W = 600, H = 600, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d'); g.drawImage(img, 0, 0, W, H);
  const px = g.getImageData(0, 0, W, H).data, fill = [], edge = [];
  const on = (x, y) => x >= 0 && y >= 0 && x < W && y < H && px[(y * W + x) * 4 + 3] > 128;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (on(x, y)) { fill.push(x, y); if (!on(x - 1, y) || !on(x + 1, y) || !on(x, y - 1) || !on(x, y + 1)) edge.push(x, y); }
  if (!fill.length) return;
  const LW = ORB_R * .95, sc = LW / W, T = grains.attributes.tgt.array, T2 = grains.attributes.tgt2.array, K = grains.attributes.tk.array;
  let sd = 4242; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  // the Earth as particles: coastlines traced densely, land finely dotted, oceans almost empty, a few loose specks around
  const MASK = (() => { try { const t = ((document.getElementById('landBits') || {}).textContent || '').trim(); return t ? atob(t) : null; } catch (e) { return null; } })(), MW = 720, MH = 360;
  const landAt = (lon, lat) => { if (!MASK) return 0; lon = ((lon + 540) % 360) - 180; const c = Math.min(MW - 1, Math.max(0, Math.floor((lon + 180) / 360 * MW))), rr = Math.min(MH - 1, Math.max(0, Math.floor((90 - lat) / 180 * MH))), k = rr * MW + c; return (MASK.charCodeAt(k >> 3) >> (k & 7)) & 1; };
  // precomputed coast and land cells (area-weighted toward the equator), so building the globe is instant
  const coast = [], landC = [];
  if (MASK) for (let rr = 0; rr < MH; rr++) { const lat = 90 - (rr + .5) / MH * 180, w = Math.cos(lat / 57.2958);
    for (let c = 0; c < MW; c++) { const lon = (c + .5) / MW * 360 - 180; if (!landAt(lon, lat) || r() > w) continue;
      const edge = !landAt(lon + .6, lat) || !landAt(lon - .6, lat) || !landAt(lon, lat + .6) || !landAt(lon, lat - .6);
      (edge ? coast : landC).push(lon, lat); } }
  const put = (out, i, lon, lat, R) => { const la = lat / 57.2958, lo = lon / 57.2958; out[i] = Math.cos(la) * Math.sin(lo) * R; out[i + 1] = Math.sin(la) * R; out[i + 2] = Math.cos(la) * Math.cos(lo) * R; };
  const globePt = (out, i) => {
    const k = r();
    if (k < .06 || !MASK) { const R = ORB_R * (k < .06 ? 1.12 + r() * .7 : 1); const u = r() * 2 - 1, th = r() * 6.2832, q = Math.sqrt(1 - u * u); out[i] = Math.cos(th) * q * R; out[i + 1] = u * R; out[i + 2] = Math.sin(th) * q * R; return; }
    const R = ORB_R * (1 + (r() - .5) * .012);
    if (k < .1) { const u = r() * 2 - 1; put(out, i, r() * 360 - 180, Math.asin(u) * 57.2958, R); return; }   // a faint scatter over the oceans
    const L = k < .5 ? coast : landC, n = Math.floor(r() * L.length / 2) * 2;
    put(out, i, L[n] + (r() - .5) * .5, L[n + 1] + (r() - .5) * .5, R);
  };
  const sph = (rad, out, i) => { const u = r() * 2 - 1, th = r() * 6.2832, q = Math.sqrt(1 - u * u); out[i] = Math.cos(th) * q * rad; out[i + 1] = u * rad; out[i + 2] = Math.sin(th) * q * rad; };
  for (let i = 0; i < NG; i++) {
    if (r() < .2) {                                   // the Kai icon: solid with crisp edges, a little depth
      const L = r() < .4 ? edge : fill, k = Math.floor(r() * L.length / 2) * 2;
      T[i * 3] = (L[k] - W / 2 + r() - .5) * sc; T[i * 3 + 1] = -(L[k + 1] - H / 2 + r() - .5) * sc; T[i * 3 + 2] = (r() - .5) * LW * .2; K[i] = 1;
    } else { globePt(T, i * 3); K[i] = 0; }            // the Earth in particles
    sph(ORB_R * .8 * (r() < .88 ? 1 + (r() - .5) * .02 : Math.cbrt(r())), T2, i * 3);   // one orb: a glowing shell with a soft core
  }
  grains.attributes.tgt.needsUpdate = grains.attributes.tgt2.needsUpdate = grains.attributes.tk.needsUpdate = true;
})();

/* ---------- dust: fine specks hanging in the air, and soft out-of-focus grains close to the eye ---------- */
function specks(count, rMin, rMax, yMin, yMax, sizeFn, alpha) {
  const p = [], k = [];
  for (let i = 0; i < count; i++) {
    const r = rMin + Math.random() * (rMax - rMin), a = Math.random() * 6.283;
    p.push(Math.cos(a) * r, yMin + Math.random() * (yMax - yMin), Math.sin(a) * r); k.push(Math.random());
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(p), 3));
  g.setAttribute('k', new THREE.BufferAttribute(new Float32Array(k), 1));
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 400);
  return new THREE.Points(g, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: U,
    vertexShader: `
      uniform float uT, uPx; attribute float k; varying float vA; varying float vS;
      void main(){
        vec3 wp=position;
        vec4 mv=modelViewMatrix*vec4(wp,1.); gl_Position=projectionMatrix*mv;
        float d=-mv.z; ${sizeFn}
        vA=${alpha}*(.5+.5*sin(uT*.8+k*60.));
      }`,
    fragmentShader: `
      varying float vA; varying float vS;
      void main(){ vec2 q=gl_PointCoord-.5; float d=dot(q,q); if(d>.25) discard;
        gl_FragColor=vec4(.6,.9,.93,vA*(1.-smoothstep(vS,.25,d))); }`
  }));
}
world.add(specks(innerWidth < 760 ? 150 : 400, 8, 110, 0, 25, 'gl_PointSize=uPx*clamp(30./d,.8,2.2); vS=.0;', '.55*(1.-smoothstep(60.,110.,d))'));
world.add(specks(innerWidth < 760 ? 40 : 90, 2.5, 9, 0, 3.2, 'gl_PointSize=uPx*clamp(160./d,14.,70.); vS=.12;', '.07*smoothstep(1.,3.,d)'));
/* ---------- screen dust: fine specks always floating across the whole header, whatever shape the sand is in ---------- */
{ const N = innerWidth < 760 ? 4500 : 11000, p = new Float32Array(N * 3), k = new Float32Array(N);
  for (let i = 0; i < N; i++) { p[i * 3] = Math.random(); p[i * 3 + 1] = Math.random(); p[i * 3 + 2] = Math.random(); k[i] = Math.random(); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('k', new THREE.BufferAttribute(k, 1));
  const sd = new THREE.Points(g, new THREE.ShaderMaterial({ transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, uniforms: U,
    vertexShader: `
      uniform float uT, uPx; attribute float k; varying float vA;
      void main(){
        float z=position.z, sp=.004+.012*z;                       // nearer specks drift faster (a little depth)
        vec2 q=position.xy+vec2(uT*sp*(.6+.8*fract(k*7.3)), uT*sp*.35*(fract(k*3.1)-.5))
              +.012*vec2(sin(uT*.31+k*40.),cos(uT*.27+k*31.));     // slow wandering
        q=fract(q);
        gl_Position=vec4(q*2.-1.,0.,1.);
        gl_PointSize=uPx*(.5+.7*z*z);
        vA=(.12+.36*z)*(.55+.45*sin(uT*(.6+k)+k*60.));
      }`,
    fragmentShader: `
      varying float vA;
      void main(){ vec2 q=gl_PointCoord-.5; float d=dot(q,q); if(d>.25) discard; gl_FragColor=vec4(.62,.9,.93,vA*(1.-smoothstep(.02,.25,d))); }` }));
  sd.frustumCulled = false; sd.renderOrder = 5; scene.add(sd); }
/* ---------- circling dust: a cloud of specks orbiting behind and around the globe, then swirling behind the forming bubble ---------- */
{ const N = innerWidth < 760 ? 3500 : 9000, p = new Float32Array(N * 3), k = new Float32Array(N);
  for (let i = 0; i < N; i++) { p[i * 3] = Math.random(); p[i * 3 + 1] = Math.random(); p[i * 3 + 2] = Math.random(); k[i] = Math.random(); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('k', new THREE.BufferAttribute(k, 1));
  const od = new THREE.Points(g, new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: U,
    vertexShader: `
      uniform float uT, uPx, uForm, uMerge, uBub, uPillA, uPillB; uniform vec3 uOrbC, uPillC, uCamR, uCamU, uCamF;
      attribute float k; varying float vA; varying float vV;
      void main(){
        float R=15.;                                                   // ORB_R
        // orbit: each speck circles the globe on its own tilted ring, at its own radius and speed
        float rad=R*(1.04+.75*pow(position.x,2.2));                  // a halo hugging the globe, thinning outward
        float a=position.y*6.2832+uT*(.05+.22*fract(k*5.7))*(fract(k*9.1)<.5?1.:-1.)*(1.4-position.x*.6);
        float inc=(position.z-.5)*1.5, sv=fract(k*3.3)*6.2832;
        vec3 r1=vec3(cos(a),sin(a)*sin(inc),sin(a)*cos(inc))*rad;
        r1=vec3(r1.x*cos(sv)-r1.z*sin(sv),r1.y,r1.x*sin(sv)+r1.z*cos(sv));
        r1+=vec3(sin(uT*.4+k*40.),cos(uT*.35+k*31.),sin(uT*.3+k*17.))*R*.04;
        vec3 wg=uOrbC+uCamR*r1.x+uCamU*r1.y+uCamF*(abs(r1.z)+R*.15);   // always on the far side: behind the globe
        // bubble: the same specks swirl in a wide flat ellipse behind the bubble
        float ea=a*.8+k*3.;
        vec2 e2=vec2(cos(ea)*(uPillA*(1.05+1.1*position.x)), sin(ea)*(uPillB*(1.6+4.*position.x)));
        e2+=vec2(sin(uT*.5+k*23.),cos(uT*.45+k*19.))*uPillB*.25;
        vec3 wb=uPillC+uCamR*e2.x+uCamU*e2.y-uCamF*(uPillB*(1.+2.*position.z));
        float bt=smoothstep(.15,.85,uBub);
        vec3 w=mix(wg,wb,bt);
        vec4 mv=viewMatrix*vec4(w,1.); gl_Position=projectionMatrix*mv;
        float d=-mv.z;
        gl_PointSize=uPx*clamp(30./d,1.15,2.4)*(.7+.6*fract(k*13.1));
        vV=bt;
        float vis=smoothstep(.05,.6,uForm);
        vA=vis*(.4+.7*(1.-position.x))*(.55+.45*sin(uT*(.7+k)+k*60.))*(1.-.35*bt);
      }`,
    fragmentShader: `
      varying float vA; varying float vV;
      void main(){ vec2 q=gl_PointCoord-.5; float d=dot(q,q); if(d>.25) discard;
        vec3 c=mix(vec3(.6,.92,.95),vec3(.78,.68,1.),vV);
        gl_FragColor=vec4(c,vA*(1.-smoothstep(.03,.25,d))); }` }));
  od.frustumCulled = false; od.renderOrder = 0; scene.add(od); }

/* ---------- first person: standing in the valley, slowly turning on the spot to take in the panorama ---------- */
let mx = 0, my = 0, tx = 0, ty = 0;
addEventListener('resize', () => { if (bub) delete bub.dataset.fullW; });
addEventListener('pointermove', e => { const r = cvs.getBoundingClientRect(); tx = Math.max(-.5, Math.min(.5, (e.clientX - r.left) / r.width - .5)); ty = (e.clientY - r.top) / r.height - .5; }, { passive: true });
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clock = new THREE.Clock();
let t = 0, spinA = 0, spinV = .09;
/* where the pointer touches the land: march the view ray across the baked heightmap (in the land's own frame) */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), inv = new THREE.Matrix4(), o = new THREE.Vector3(), dir = new THREE.Vector3();
const hitP = new THREE.Vector3();
let pointerIn = false, moved = false, kickI = 0, lastKick = null, lastKickT = -9;
addEventListener('pointermove', e => { const r = cvs.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); pointerIn = e.clientY >= r.top && e.clientY <= r.bottom; moved = true; }, { passive: true });
document.addEventListener('pointerleave', () => { pointerIn = false; });
const landH = (x, z) => { const fx = (x / T_SIZE + .5) * (T_N - 1), fz = (z / T_SIZE + .5) * (T_N - 1);
  if (fx < 0 || fz < 0 || fx >= T_N - 1 || fz >= T_N - 1) return -1e9;
  const i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j, k = j * T_N + i;
  return heights[k] * (1 - u) * (1 - v) + heights[k + 1] * u * (1 - v) + heights[k + T_N] * (1 - u) * v + heights[k + T_N + 1] * u * v; };
function pointerOnLand() {
  let hit = false;
  if (pointerIn) {
    ray.setFromCamera(ndc, camera);
    world.updateMatrixWorld(); inv.copy(world.matrixWorld).invert();
    o.copy(ray.ray.origin).applyMatrix4(inv); dir.copy(ray.ray.direction).transformDirection(inv);
    let t = 1, prev = 0;
    for (let s = 0; s < 400 && t < 600; s++) {
      const x = o.x + dir.x * t, y = o.y + dir.y * t, z = o.z + dir.z * t;
      if (y <= landH(x, z)) {                       // crossed the surface: refine between the last two steps
        let a = prev, b = t; for (let r = 0; r < 8; r++) { const m = (a + b) / 2; (o.y + dir.y * m <= landH(o.x + dir.x * m, o.z + dir.z * m)) ? b = m : a = m; }
        hitP.set(o.x + dir.x * b, o.y + dir.y * b, o.z + dir.z * b); hit = true; break;
      }
      prev = t; t += Math.max(.5, t * .02);
    }
  }
  // each time the pointer has travelled a little way across the land, it kicks the grains there
  if (hit && moved && (!lastKick || lastKick.distanceTo(hitP) > 1.6 + hitP.length() * .02) && U.uT.value - lastKickT > .05) {
    const now = U.uT.value;
    U.uKick.value[kickI].set(hitP.x, hitP.y, hitP.z, now); kickI = (kickI + 1) % KICKS;
    lastKick = (lastKick || new THREE.Vector3()).copy(hitP); lastKickT = now; moved = false;
  }
  if (!hit) lastKick = null;
}
/* the page's chat bubble (solid): appears where #bub sits after the violet orb, then types */
const $ = id => document.getElementById(id);
const bub = $('bub'), bt = $('bt'), car = $('car'), BUB_TEXT = 'Hey Kailo, pay the Lisbon supplier and book Friday\u2019s flight';   // same conversation as the Terminal direction
const ss = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
const glow = document.createElement('div'); glow.className = 'pvglow'; host.appendChild(glow);
const hiBg = document.createElement('div'); hiBg.className = 'phibg'; host.insertBefore(hiBg, cvs);
const orbC = new THREE.Vector3(), tmp = new THREE.Vector3();
const atDepth = (sx, sy, D, out) => { tmp.set(sx * 2 - 1, -sy * 2 + 1, .5).unproject(camera).sub(camera.position).normalize(); return out.copy(camera.position).addScaledVector(tmp, D); };
let typedN = -1;
// runs right after the page's own header frame each tick (so it has the last word on #bub and the headline)
const stepsFrame = Pn => {
  // the Terminal dashboard's four steps: each slides in, the swap fills and counts up, then all tick off once approved
  const rows = document.querySelectorAll('#agent .kst-r'); if (!rows.length) return;
  [[56, 59], [60, 63], [64, 67], [68, 71]].forEach(([a, b], i) => { const v = Math.min(1, Math.max(0, (Pn - a) / (b - a))); rows[i].style.opacity = v; rows[i].style.transform = `translateY(${((1 - v) * 8).toFixed(1)}px)`; });
  const swap = Math.min(1, Math.max(0, (Pn - 62) / 12)), pg = $('pg'), usd = $('usd');
  if (pg) pg.style.width = (swap * 100) + '%';
  if (usd) usd.textContent = (4558.30 * swap).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' USDC';
  const done = [Pn > 61, Pn > 74, Pn >= 97, Pn >= 97];
  rows.forEach((r, i) => { r.classList.toggle('done', done[i]); r.classList.toggle('busy', !done[i] && +r.style.opacity > .99); });
};
window.__preHook = () => {
  const pre = window.__PRE || 0, Pn = typeof P !== 'undefined' ? P : 0;
  { const ts = window.__txtShow ?? 0; ['h1', 'h2'].forEach((id, j) => { const el = $(id); if (!el) return; const e = Math.max(0, Math.min(1, ts * 1.15 - j * .15));
      el.style.opacity = e < 1 ? e.toFixed(3) : ''; el.style.filter = e < 1 ? `blur(${((1 - e) * 8).toFixed(2)}px)` : ''; el.style.translate = e < 1 ? `0 ${((1 - e) * 14).toFixed(1)}px` : ''; }); }
  stepsFrame(Pn);
  // the Kailo panel is taller here so the whole Terminal conversation fits (the centring keeps it in the middle of the frame)
  { const ag = $('agent'); if (ag && Pn > 0 && innerWidth >= 760) { if (ag.dataset.pb !== ag.style.bottom) { const du = typeof DU === 'function' ? DU() : 1, b0 = parseFloat(ag.style.bottom) || 0; ag.style.bottom = (b0 - 200 * du) + 'px'; ag.dataset.pb = ag.style.bottom; } } }
  const cue = $('pcue'); if (cue) cue.style.opacity = (1 - ss(0, 4, Pn)).toFixed(3);   // scroll indicator stays through the whole particle chapter; fades as the page turns light
  if (!bub || !bt) return;
  if (pre < 1 && Pn <= 0) {
    // the violet orb becomes the bubble: a glowing violet circle at the bubble's spot stretches open into the pill
    const show = ss(.6, .63, pre) * (U.uBub.value > .97 ? 1 : 0), open = 1, typed = ss(.64, .86, pre), n = Math.round(BUB_TEXT.length * typed);
    bub.style.opacity = show.toFixed(3);
    if (!bub.dataset.fullW || show === 0) { bub.style.minWidth = bub.style.minHeight = ''; const keep = bt.textContent; bt.textContent = BUB_TEXT; bub.dataset.fullW = bub.offsetWidth; bub.dataset.fullH = bub.offsetHeight; bt.textContent = keep; }
    bub.style.minWidth = bub.dataset.fullW + 'px'; bub.style.minHeight = bub.dataset.fullH + 'px';   // full size from the start: the sand forms the finished bubble, never a thin line                     // the pill opens to its full size, then the words type in
    if (open < 1) { const bw = bub.offsetWidth, bh = bub.offsetHeight, side = (1 - open) * Math.max(0, bw / 2 - bh / 2);
      bub.style.clipPath = `inset(0 ${side.toFixed(1)}px round ${(bh / 2).toFixed(1)}px)`; }
    else bub.style.clipPath = '';
    if (n !== typedN) { typedN = n; bt.textContent = BUB_TEXT.slice(0, n); }
    if (car) car.style.display = n > 0 && n < BUB_TEXT.length ? '' : 'none';
  } else if (typedN !== BUB_TEXT.length) { typedN = BUB_TEXT.length; bt.textContent = BUB_TEXT; if (car) car.style.display = 'none'; bub.style.opacity = 1; bub.style.clipPath = ''; bub.style.minWidth = ''; bub.style.minHeight = ''; }
};
function frame() {
  const dt = Math.min(clock.getDelta(), .05);
  t += dt * (RM ? .15 : 1);
  mx += (tx - mx) * Math.min(1, dt * 2.6); my += (ty - my) * .03;
  // look-around speed: a slow drift in the middle; toward the left or right edge the panorama turns
  // faster that way, easing in and out
  const edge = Math.min(1, Math.max(0, (Math.abs(mx) - .12) / .38)), eS = edge * edge * (3 - 2 * edge);
  const target = (RM ? .015 : .09) * (1 - eS) + Math.sign(mx) * eS * (RM ? .06 : .6);   // ~70 s per full turn at rest
  spinV += (target - spinV) * Math.min(1, dt * 2.2);
  spinA += spinV * dt * (RM ? .15 : 1);
  const rot = spinA;
  world.rotation.y = rot;
  U.uRot.value = rot; U.uT.value = t;
  const pre = window.__PRE || 0, Pn = typeof P !== 'undefined' ? P : 0;
  let gScreen = null;
  {
    // the violet orb pours into the speech bubble's shape; the solid bubble absorbs it; then the dust drifts back to the land
    // the bubble and the landscape form in the same moment; on the next scroll everything settles into the land behind the card
    const back = ss(3, 30, Pn), k3 = Math.min(1, dt * 3);
    U.uForm.value += (ss(.02, .34, pre) * (1 - back) - U.uForm.value) * Math.min(1, dt * 2.2);   // land -> globe with the icon
    U.uMerge.value += (ss(.36, .58, pre) * (1 - back) - U.uMerge.value) * k3; // -> the violet orb, only passed through on the way
    U.uBub.value += (ss(.36, .58, pre) * (1 - back) - U.uBub.value) * k3;   // same moment as the merge: globe -> bubble in one single transition    // -> bubble + landscape together
    U.uBubUI.value = 0;
    if (window.__loaded && !window.__t0) window.__t0 = t;
    const tl = window.__t0 ? t - window.__t0 : -1;
    U.uTxtIn.value = 0; U.uTxtOut.value = 1;            // no particle headline: the real text simply fades in
    U.uIntro.value = ss(0, 3, tl);
    window.__txtShow = ss(.5, 2.1, tl);
    U.uTanY.value = Math.tan(camera.fov * Math.PI / 360); U.uAsp.value = camera.aspect;
    hiBg.style.opacity = (ss(.02, .3, pre) * (1 - ss(3, 30, Pn))).toFixed(3);
    U.uOrbA.value = t * .35; U.uLogoA.value = t * .7;   // the icon turns on its own axis, like the security turntable
    // the ground that hides the far side of the mountains sinks away gradually with the transition (no sudden see-through)
    depthMesh.visible = U.uForm.value < .99; depthMesh.position.y = -ss(0, .75, U.uForm.value) * 90;
    gScreen = { orb: U.uMerge.value * (1 - U.uBub.value), bubOn: ss(.5, .6, pre) * (1 - ss(2, 12, Pn)) };
  }
  const bob = 0;                              // no vertical motion
  camera.position.set(mx * 16, EYE, 0);                                  // pan: the camera glides sideways with the cursor                  // on a gentle rise above the valley floor
  camera.lookAt(mx * 110, EYE - 5, -160);                               // ...and looks toward that side
  camera.updateMatrixWorld();
  {
    // the globe sits underneath the headline (the text stays visible), centred where the bubble will appear
    // the globe with the turning icon forms big in the centre of the screen; as it becomes the smaller violet orb
    // it glides down to its place under the headline
    const r = cvs.getBoundingClientRect(), m = U.uMerge.value;
    const rSmall = Math.min(r.height * .17, r.width * .2), rBig = Math.min(r.height * .34, r.width * .3), rPx = rBig + (rSmall - rBig) * m;
    const D = ORB_R / (rPx / r.height * 2 * Math.tan(camera.fov * Math.PI / 360)), wpp = 2 * D * Math.tan(camera.fov * Math.PI / 360) / r.height;
    const h2 = $('h2'), hb = h2 ? h2.getBoundingClientRect().bottom - r.top : r.height * .45;
    const bb0 = bub ? bub.getBoundingClientRect() : null;
    const lowX = bb0 ? bb0.left + bb0.width / 2 - r.left : r.width / 2;
    const lowY = Math.min(r.height - rSmall * 1.05, Math.max(hb + rSmall * 1.15, bb0 ? bb0.top + bb0.height / 2 - r.top : 0));
    const ocx = r.width / 2 + (lowX - r.width / 2) * m, ocy = r.height / 2 + (lowY - r.height / 2) * m;
    // as the orb pours into the bubble, the shape centres on the bubble and takes its exact size
    const bcx = bb0 ? bb0.left + bb0.width / 2 - r.left : ocx, bcy = bb0 ? bb0.top + bb0.height / 2 - r.top : ocy, ub = U.uBub.value;
    { const a = $('h1'), b2 = $('h2');
      if (a && b2) { const A = a.getBoundingClientRect(), B = b2.getBoundingClientRect();
        const x0 = Math.min(A.left, B.left) - r.left, x1 = Math.max(A.right, B.right) - r.left, y0 = Math.min(A.top, B.top) - r.top, y1 = Math.max(A.bottom, B.bottom) - r.top;
        U.uTxt.value.set(x0 / r.width * 2 - 1, 1 - y1 / r.height * 2, x1 / r.width * 2 - 1, 1 - y0 / r.height * 2); } }
    U.uOrbC.value.copy(atDepth(ocx / r.width, ocy / r.height, D, orbC));
    atDepth(bcx / r.width, bcy / r.height, D, U.uPillC.value);
    if (bb0) { U.uPillA.value = bb0.width * .5 * wpp; U.uPillB.value = bb0.height * .5 * wpp; }
    // violet glow: blooms with the violet orb and pulses; then it sits behind the bubble
    const b = bub ? bub.getBoundingClientRect() : null, orbPx = ORB_R * .8 / wpp, pulse = 1 + .07 * Math.sin(t * 2.3);
    const bo = gScreen.bubOn, ox = ocx, oy = ocy;
    const bx = b ? b.left + b.width / 2 - r.left : ox, by = b ? b.top + b.height / 2 - r.top : oy;
    Object.assign(glow.style, { left: (ox + (bx - ox) * bo) + 'px', top: (oy + (by - oy) * bo) + 'px',
      width: (orbPx * 3.2 * (1 - bo) + (b ? b.width : 300) * 1.6 * bo) * pulse + 'px',
      height: (orbPx * 3.2 * (1 - bo) + (b ? b.height : 60) * 4 * bo) * pulse + 'px',
      opacity: (Math.max(gScreen.orb, bo) * (.75 + .25 * Math.sin(t * 2.3))).toFixed(3) });
  }
  if (window.__preHook) window.__preHook();
  if (Pn < 2) pointerOnLand();
  camera.updateMatrixWorld(); camera.matrixWorld.extractBasis(U.uCamR.value, U.uCamU.value, U.uCamF.value); U.uCamF.value.negate();
  const hr = host.getBoundingClientRect();
  if (hr.bottom > 0 && hr.top < innerHeight && !document.hidden) renderer.render(scene, camera);
  if (!window.__loaded) { window.__loaded = true; document.documentElement.classList.add('phero-ready'); }
  requestAnimationFrame(frame);
}
frame();
new ResizeObserver(() => {
  VW = Math.max(1, cvs.clientWidth); VH = Math.max(1, cvs.clientHeight);
  camera.aspect = VW / VH; camera.updateProjectionMatrix(); renderer.setSize(VW, VH, false);
}).observe(cvs);
