/* Statement sections: a particle animation tied to each section's content, filling the whole banner (clipped to it).
   A field of particles across the banner moves all the time, each one circling its own point like a proton;
   the shape and the field turn with the cursor.
   The dust starts as one shape and becomes another as you scroll through the section (data-shape="from>to").
   Same dust look as the homepage hero (assets/phero.js): soft round specks, teal/aqua, brighter in front.
   Every shape fits inside a radius of 1, and the camera frames radius 1.15, so no corner is ever cut.
   One small WebGL canvas per section; it only renders while the section is on screen. */
import * as THREE from 'three';

const hosts = [...document.querySelectorAll('.pglobe')].filter(h => !['stacks', 'prism', 'scale', 'feering', 'tiers'].includes(h.getAttribute('data-shape')));   // 'stacks' has its own scene (below)
if (hosts.length) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mob = innerWidth < 760;
  const N = mob ? 3200 : 6500;
  const R = Math.random;

  // ---------- sampling helpers (each returns one point [x, y, z]) ----------
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const onSeg = (a, b) => lerp(a, b, R());
  const jit = (p, s) => [p[0] + (R() - .5) * s, p[1] + (R() - .5) * s, p[2] + (R() - .5) * s];
  const sphere = (c, r) => { const y = 1 - 2 * R(), a = R() * Math.PI * 2, s = Math.sqrt(1 - y * y); return [c[0] + r * s * Math.cos(a), c[1] + r * y, c[2] + r * s * Math.sin(a)]; };
  const globeP = (r) => { const t = R(); // meridians, parallels and dust, like the homepage globe
    if (t < .34) { const lon = Math.floor(R() * 12) / 12 * Math.PI * 2, lat = (R() - .5) * Math.PI; return [r * Math.cos(lat) * Math.cos(lon), r * Math.sin(lat), r * Math.cos(lat) * Math.sin(lon)]; }
    if (t < .62) { const lat = ((Math.floor(R() * 7) + 1) / 8 - .5) * Math.PI, lon = R() * Math.PI * 2; return [r * Math.cos(lat) * Math.cos(lon), r * Math.sin(lat), r * Math.cos(lat) * Math.sin(lon)]; }
    return sphere([0, 0, 0], r); };
  // box: 40% on the 12 edges (crisp outline), 60% on the faces
  const box = (c, h) => {
    if (R() < .4) { const ax = Math.floor(R() * 3), s1 = R() < .5 ? -1 : 1, s2 = R() < .5 ? -1 : 1, p = [0, 0, 0];
      p[ax] = (R() * 2 - 1) * h[ax]; p[(ax + 1) % 3] = s1 * h[(ax + 1) % 3]; p[(ax + 2) % 3] = s2 * h[(ax + 2) % 3]; return [c[0] + p[0], c[1] + p[1], c[2] + p[2]]; }
    const ax = Math.floor(R() * 3), p = [(R() * 2 - 1) * h[0], (R() * 2 - 1) * h[1], (R() * 2 - 1) * h[2]]; p[ax] = (R() < .5 ? -1 : 1) * h[ax];
    return [c[0] + p[0], c[1] + p[1], c[2] + p[2]]; };
  // disc / coin: rim rings and faces
  const disc = (c, r, th) => { const a = R() * Math.PI * 2, t = R();
    if (t < .45) { const y = (R() < .5 ? -1 : 1) * th; return [c[0] + r * Math.cos(a), c[1] + y, c[2] + r * Math.sin(a)]; }
    if (t < .7) return [c[0] + r * Math.cos(a), c[1] + (R() * 2 - 1) * th, c[2] + r * Math.sin(a)];
    const rr = r * Math.sqrt(R()); return [c[0] + rr * Math.cos(a), c[1] + (R() < .5 ? -1 : 1) * th, c[2] + rr * Math.sin(a)]; };
  // flat outline from a 2D polygon, extruded by depth d: edges on both faces plus a light fill
  const poly = (pts, d) => { const segs = pts.map((p, i) => [p, pts[(i + 1) % pts.length]]);
    const lens = segs.map(([a, b]) => Math.hypot(b[0] - a[0], b[1] - a[1])), tot = lens.reduce((s, v) => s + v, 0);
    return () => { let u = R() * tot, i = 0; while (u > lens[i]) { u -= lens[i]; i++; }
      const [a, b] = segs[i], t = u / lens[i], x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t;
      const z = R() < .7 ? (R() < .5 ? -d : d) : (R() * 2 - 1) * d; return [x, y, z]; }; };
  // tube along a polyline (for the check mark, arrow shaft, links)
  const tube = (pts, r) => { const segs = []; for (let i = 0; i < pts.length - 1; i++) segs.push([pts[i], pts[i + 1]]);
    const lens = segs.map(([a, b]) => Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2])), tot = lens.reduce((s, v) => s + v, 0);
    return () => { let u = R() * tot, i = 0; while (u > lens[i]) { u -= lens[i]; i++; } return jit(lerp(segs[i][0], segs[i][1], u / lens[i]), r * 2); }; };
  // weighted mix of samplers
  const mix = (...parts) => { const tot = parts.reduce((s, p) => s + p[0], 0);
    return () => { let u = R() * tot; for (const [w, f] of parts) { if ((u -= w) <= 0) return f(); } return parts[0][1](); }; };

  // glyph points: a symbol drawn on a small canvas, its filled pixels as points in -1…1 (y up)
  const glyph = (draw) => { const S = 160, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d');
    g.fillStyle = '#fff'; g.strokeStyle = '#fff'; draw(g, S); const d = g.getImageData(0, 0, S, S).data, pts = [];
    for (let y = 0; y < S; y += 2) for (let x = 0; x < S; x += 2) if (d[(y * S + x) * 4 + 3] > 120) pts.push([x / S * 2 - 1, 1 - y / S * 2]);
    return pts.length ? pts : [[0, 0]]; };
  const EURO = glyph((g, S) => { g.font = `600 ${S * .78}px "Helvetica Neue", Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('€', S / 2, S * .53); });
  const BTC = glyph((g, S) => { g.font = `700 ${S * .74}px "Helvetica Neue", Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('B', S / 2, S * .53);
    g.lineWidth = S * .07; [[.42], [.56]].forEach(([x]) => { g.beginPath(); g.moveTo(S * x, S * .1); g.lineTo(S * x, S * .22); g.moveTo(S * x, S * .84); g.lineTo(S * x, S * .96); g.stroke(); }); });
  const KAI = glyph((g, S) => { g.translate(S * .1, S * .1); g.scale(S * .8 / 104, S * .8 / 104);
    ['M43.2773 67.3906C49.2947 66.5932 55.2169 66.4682 61.0439 67.0117V66.9922L61.6895 67.0732C72.8282 68.208 82.4104 71.7968 90.4355 77.8398L75.417 92.374L61.6895 79.1318L61.6875 79.1289V103.032C61.6875 103.678 61.3647 104.002 60.7188 104.002H43.2773C42.6315 104.002 42.3086 103.678 42.3086 103.032V68.3115C42.3086 67.6657 42.6315 67.3584 43.2773 67.3906Z',
     'M35.6895 42.3115C36.3354 42.3115 36.6427 42.6343 36.6104 43.2803C37.4077 49.297 37.5326 55.2184 36.9893 61.0449H37.0078L36.9336 61.6279C36.9315 61.6487 36.9308 61.6697 36.9287 61.6904H36.9268C35.792 72.8291 32.2032 82.4114 26.1602 90.4365L11.626 75.417L24.8682 61.6904H0.96875C0.323023 61.6904 0.000106046 61.3674 0 60.7217V43.2803C0 42.6344 0.322917 42.3116 0.96875 42.3115H35.6895Z',
     'M92.374 28.584L79.1318 42.3115H103.031C103.677 42.3116 104 42.6344 104 43.2803V60.7217C104 61.3674 103.677 61.6904 103.031 61.6904H68.3105C67.6647 61.6904 67.3575 61.3674 67.3896 60.7217C66.5923 54.705 66.4675 48.7834 67.0107 42.957H66.9922L67.0654 42.3721C67.0675 42.3519 67.0692 42.3317 67.0713 42.3115H67.0732C68.208 31.1728 71.7968 21.5905 77.8398 13.5654L92.374 28.584Z',
     'M60.7227 0C61.3684 6.34367e-05 61.6913 0.323029 61.6914 0.96875V35.6904C61.6913 36.3361 61.3684 36.6426 60.7227 36.6104C54.7053 37.4078 48.7831 37.5318 42.9561 36.9883V37.0098L42.3105 36.9287C31.1718 35.794 21.5896 32.2052 13.5645 26.1621L28.583 11.6279L42.3105 24.8701L42.3125 24.8721V0.96875C42.3126 0.322966 42.6354 0 43.2812 0H60.7227Z'
    ].forEach(d => g.fill(new Path2D(d))); });
  // a coin standing up, facing you: rim, faces, a raised inner ring, and its symbol in relief on both faces
  const faceCoin = (cx, cy, r, th, G) => () => { const t = R(), a = R() * Math.PI * 2;
    if (t < .22) return [cx + r * Math.cos(a), cy + r * Math.sin(a), (R() * 2 - 1) * th];                       // rim
    if (t < .34) { const rr = r * .84; return [cx + rr * Math.cos(a), cy + rr * Math.sin(a), (R() < .5 ? -1 : 1) * (th + .025)]; }   // inner ring
    if (t < .46) { const rr = r * Math.sqrt(R()); return [cx + rr * Math.cos(a), cy + rr * Math.sin(a), (R() < .5 ? -1 : 1) * th]; } // faces
    const p = G[Math.floor(R() * G.length)], s = r * .6, z = (R() < .72 ? 1 : -1) * (th + .04);                  // the symbol
    return [cx + (p[0] + (R() - .5) * .02) * s, cy + (p[1] + (R() - .5) * .02) * s, z]; };

  // ---------- the shapes (all inside radius 1) ----------
  const SH = {
    dust: () => sphere([0, 0, 0], .35 + R() * .6),
    globe: () => globeP(.9),
    cube: () => box([0, 0, 0], [.55, .55, .55]),
    // four separate small cubes, apart from each other
    split: mix(...[[-.5, .38, 0], [.5, .38, 0], [-.5, -.38, 0], [.5, -.38, 0]].map(c => [1, () => box(c, [.2, .2, .2])])),
    // two stacks of coins side by side, and the same coins as one stack
    twostacks: mix(...[-.48, .48].map(x => [1, () => disc([x, -.55 + Math.floor(R() * 5) * .26, 0], .32, .05)])),
    onestack: () => disc([0, -.7 + Math.floor(R() * 7) * .23, 0], .42, .05),
    // two big coins apart — euros and bitcoin, each on its own — and one Kai coin, both in one place, with a ring of dust
    twocoins: mix([1, faceCoin(-.5, .02, .46, .07, EURO)], [1, faceCoin(.5, -.02, .46, .07, BTC)]),
    kaicoin: mix([5, faceCoin(0, 0, .76, .09, KAI)], [1, () => { const a = R() * Math.PI * 2, rr = .88 + (R() - .5) * .05; return [rr * Math.cos(a), rr * Math.sin(a), (R() - .5) * .08]; }]),
    // Swiss cross: two crossing bars
    cross: mix([1, () => box([0, 0, 0], [.72, .22, .16])], [1, () => box([0, 0, 0], [.22, .72, .16])]),
    // one node, then the same node linked to a second one
    node: () => globeP(.5),
    nodes2: mix([3, () => sphere([-.55, .1, 0], .34)], [2, () => sphere([.6, -.15, 0], .26)], [1, tube([[-.22, .03, 0], [.35, -.1, 0]], .03)]),
    nodes3: mix([1, () => sphere([0, .55, 0], .27)], [1, () => sphere([-.6, -.4, 0], .27)], [1, () => sphere([.6, -.4, 0], .27)],
                [.5, tube([[0, .3, 0], [-.45, -.25, 0], [.45, -.25, 0], [0, .3, 0]], .025)]),
    check: tube([[-.72, .02, 0], [-.22, -.48, 0], [.75, .55, 0]], .09),
    padlock: mix([3, () => box([0, -.28, 0], [.52, .42, .2])],
                 [1.4, () => { const a = R() * Math.PI, r = .34; return jit([Math.cos(a) * r, .16 + Math.sin(a) * r * 1.25, 0], .09); }]),
    shield: poly([[0, .9], [.68, .66], [.62, -.08], [0, -.9], [-.62, -.08], [-.68, .66]], .14),
    // a key split into three pieces, apart
    keyparts: mix([2, () => disc([-.62, 0, 0], .3, .06)], [1, () => box([.02, 0, 0], [.22, .06, .06])], [1, () => box([.6, 0, 0], [.22, .06, .06])],
                  [.6, () => box([.7, -.16, 0], [.06, .12, .06])]),
    coin: () => disc([0, 0, 0], .62, .1),
    arrow: mix([2, () => box([-.2, 0, 0], [.5, .1, .1])], [2, poly([[.3, .45], [.85, 0], [.3, -.45]], .1)]),
    ring: mix([2, () => globeP(.38)], [3, () => { const a = R() * Math.PI * 2; return jit([Math.cos(a) * .88, (R() - .5) * .06, Math.sin(a) * .88], .05); }]),
    envelope: mix([3, poly([[-.8, .5], [.8, .5], [.8, -.5], [-.8, -.5]], .05)], [1.5, tube([[-.8, .5, .05], [0, -.05, .05], [.8, .5, .05]], .02)]),
  };

  const fill = (name) => { const f = SH[name] || SH.globe, a = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { const p = f(); a[i * 3] = p[0]; a[i * 3 + 1] = p[1]; a[i * 3 + 2] = p[2]; } return a; };
  const cache = {}; const shape = n => cache[n] || (cache[n] = fill(n));
  const rnd = new Float32Array(N); for (let i = 0; i < N; i++) rnd[i] = R();

  const VS = `
    attribute vec3 b; attribute float rnd;
    uniform float uT, uTime, uPx; uniform vec3 uC1, uC2;
    varying vec3 vCol; varying float vA;
    void main(){
      float e = clamp((uT - rnd * .3) / .7, 0., 1.); e = e * e * (3. - 2. * e);           // each speck leaves a little after the last
      vec3 p = mix(position, b, e);
      float sw = sin(3.14159 * e);                                                          // swirl while travelling, like the homepage dust
      p += sw * .28 * vec3(sin(rnd * 40. + uTime * .7 + position.y * 3.), sin(rnd * 31. + uTime * .6 + position.z * 3.), cos(rnd * 23. + uTime * .5 + position.x * 3.));
      // always moving: every speck circles its own point, quick and small, like a proton
      float w = 2.2 + rnd * 2.6;
      p += .022 * vec3(sin(uTime * w + rnd * 91.), cos(uTime * w * 1.13 + rnd * 57.), sin(uTime * w * .87 + rnd * 33.));
      vec4 mv = modelViewMatrix * vec4(p, 1.);
      gl_Position = projectionMatrix * mv;
      float d = -mv.z;
      gl_PointSize = uPx * (1.5 + rnd * 1.3) * (3.4 / d);
      float cd = length(cameraPosition);
      vA = mix(.22, 1., smoothstep(cd + 1., cd - 1., d));                                   // brighter in front
      vCol = mix(uC1, uC2, fract(rnd * 3.7));
    }`;
  const FS = `
    uniform float uAlpha; varying vec3 vCol; varying float vA;
    void main(){ vec2 q = gl_PointCoord - .5; float d = dot(q, q); if (d > .25) discard;
      gl_FragColor = vec4(vCol, vA * uAlpha * (1. - smoothstep(.1, .25, d))); }`;

  // the field across the whole banner: each particle orbits its own point (fast, small, tilted orbits) and the
  // whole field drifts slowly sideways, wrapping around, so it never stands still
  const NF = mob ? 2600 : 7000;
  const fBase = new Float32Array(NF * 3), fRnd = new Float32Array(NF);
  for (let i = 0; i < NF; i++) { fBase[i * 3] = R() * 2 - 1; fBase[i * 3 + 1] = R() * 2 - 1; fBase[i * 3 + 2] = R() * 2 - 1; fRnd[i] = R(); }
  const FVS = `
    attribute float rnd; uniform float uTime, uPx; uniform vec3 uExt, uC1, uC2;
    varying vec3 vCol; varying float vA;
    void main(){
      vec3 q = position;
      q.x = mod(q.x + uTime * (.006 + rnd * .014) + 1., 2.) - 1.;                          // slow drift, wrapping
      vec3 p = q * uExt;
      float w = 1.6 + rnd * 3.4, r = .03 + rnd * .09;                                        // proton-like orbit
      float a = uTime * w + rnd * 80.;
      p += r * vec3(cos(a), sin(a * 1.07) * .8, sin(a) * .6);
      vec4 mv = modelViewMatrix * vec4(p, 1.);
      gl_Position = projectionMatrix * mv;
      float d = -mv.z;
      gl_PointSize = uPx * (.7 + rnd * 1.1) * (3.4 / d);
      vA = (.25 + .55 * fract(rnd * 7.3)) * (.75 + .25 * sin(uTime * (1. + rnd * 2.) + rnd * 40.)); // soft twinkle
      vCol = mix(uC1, uC2, fract(rnd * 5.1));
    }`;

  const FIT = 1.15, FOV = 35, TAN = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
  const items = hosts.map(host => {
    const dark = !!host.closest('.dk,[data-tone="dark"]');
    const zone = host.closest('.dkpanel') || host.closest('.stmt') || host.closest('.phero') || host;               // the banner the cursor moves over
    const [from, to] = (host.getAttribute('data-shape') || 'globe>cube').split('>');
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(FOV, 1, .1, 40);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(shape(from), 3));
    g.setAttribute('b', new THREE.BufferAttribute(shape(to), 3));
    g.setAttribute('rnd', new THREE.BufferAttribute(rnd, 1));
    const C1 = dark ? new THREE.Color(.42, .74, .76) : new THREE.Color(.09, .24, .26), C2 = dark ? new THREE.Color(.75, .95, .96) : new THREE.Color(.33, .51, .53);
    const U = { uT: { value: 0 }, uTime: { value: 0 }, uPx: { value: 1 }, uC1: { value: C1 }, uC2: { value: C2 }, uAlpha: { value: dark ? .9 : .75 } };
    const blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
    const mat = new THREE.ShaderMaterial({ uniforms: U, vertexShader: VS, fragmentShader: FS, transparent: true, depthWrite: false, blending });
    const grp = new THREE.Group(); grp.add(new THREE.Points(g, mat)); grp.rotation.x = .3;
    const holder = new THREE.Group(); holder.add(grp); scene.add(holder);
    const SC = +(host.getAttribute('data-scale') || 1); holder.scale.setScalar(SC);                    // some shapes are drawn larger                  // holder: where the shape sits; grp: how it turns
    // field
    const fg = new THREE.BufferGeometry();
    fg.setAttribute('position', new THREE.BufferAttribute(fBase, 3));
    fg.setAttribute('rnd', new THREE.BufferAttribute(fRnd, 1));
    const FU = { uTime: U.uTime, uPx: { value: 1 }, uExt: { value: new THREE.Vector3(3, 1.5, 1.4) }, uC1: { value: C1 }, uC2: { value: C2 }, uAlpha: { value: dark ? .8 : .55 } };
    const fmat = new THREE.ShaderMaterial({ uniforms: FU, vertexShader: FVS, fragmentShader: FS, transparent: true, depthWrite: false, blending });
    const field = new THREE.Group(); field.add(new THREE.Points(fg, fmat)); scene.add(field);
    const flat = ['cross', 'check', 'shield', 'arrow', 'envelope', 'nodes3', 'padlock', 'keyparts', 'kaicoin'].includes(to);   // signs that read best facing you
    const it = { host, zone, renderer, scene, camera, grp, holder, field, U, FU, t: 0, on: false, w: 0, h: 0, flat, mx: 0, my: 0, sx: 0, sy: 0 };
    const size = () => { const r = renderer.domElement.getBoundingClientRect(); const w = Math.max(1, r.width), h = Math.max(1, r.height);
      if (w === it.w && h === it.h) return; it.w = w; it.h = h; renderer.setSize(w, h, false); camera.aspect = w / h;
      const D = FIT / (TAN * Math.min(1, w / h)) + 1.2;
      camera.position.set(0, 0, D); camera.lookAt(0, 0, 0); camera.updateProjectionMatrix();
      const halfH = D * TAN, halfW = halfH * camera.aspect;
      // wide banner: the shape sits in the right part, beside the text; narrow: centred
      holder.position.x = w / h > 1.4 ? -Math.min(halfW - 1.25 * SC, halfW * .5) : 0;   // the shape sits on the left, the text on the right
      FU.uExt.value.set(halfW * 1.12, halfH * 1.12, 1.4);
      const px = Math.min(devicePixelRatio, 2) * (mob ? 1.1 : 1.35) * Math.min(1.25, Math.max(.75, Math.min(w, h) / 420));
      U.uPx.value = px; FU.uPx.value = px; };
    size(); new ResizeObserver(size).observe(host);
    new IntersectionObserver(es => { it.on = es[0].isIntersecting; if (it.on) kick(); }, { rootMargin: '120px 0px' }).observe(host);
    // cursor: where it is over the banner, from -1 to 1 each way
    zone.addEventListener('pointermove', e => { const r = zone.getBoundingClientRect();
      it.mx = ((e.clientX - r.left) / r.width) * 2 - 1; it.my = ((e.clientY - r.top) / r.height) * 2 - 1; kick(); });
    zone.addEventListener('pointerleave', () => { it.mx = 0; it.my = 0; });
    return it;
  });

  // scroll progress through the section: first shape while it enters, second shape by the time it reaches the upper third
  const target = it => { const r = it.host.closest('section').getBoundingClientRect(), vh = innerHeight;
    return Math.min(1, Math.max(0, (vh * .9 - r.top) / (vh * .7))); };

  let running = false, last = performance.now(), time = 0;
  const frame = now => {
    const dt = Math.min(.05, (now - last) / 1000); last = now; if (!reduce) time += dt;
    let any = false;
    for (const it of items) {
      if (!it.on) continue; any = true;
      const tg = target(it); it.t += reduce ? (tg - it.t) : (tg - it.t) * Math.min(1, dt * 4);
      it.U.uT.value = it.t; it.U.uTime.value = time;
      // cursor follow, eased
      const k = Math.min(1, dt * 3); it.sx += (it.mx - it.sx) * k; it.sy += (it.my - it.sy) * k;
      // turning shapes; flat signs ease to face the viewer as they form, with a gentle sway; the cursor turns them further
      const spin = time * .16 + it.t * 1.1, face = it.flat ? it.t : 0;
      it.grp.rotation.y = spin * (1 - face) + Math.sin(time * .5) * .35 * face + it.sx * .9;
      it.grp.rotation.x = .3 * (1 - face) + Math.sin(time * .4) * .08 * face + it.sy * .55;
      it.field.rotation.y = it.sx * .18; it.field.rotation.x = it.sy * .12;                 // the field follows a little, for depth
      it.renderer.render(it.scene, it.camera);
    }
    if (any && !reduce) requestAnimationFrame(frame);
    else if (any && reduce && !items.every(it => Math.abs(target(it) - it.t) < 1e-3)) requestAnimationFrame(frame);
    else running = false;
  };
  function kick() { if (running) return; running = true; last = performance.now(); requestAnimationFrame(frame); }
  addEventListener('scroll', kick, { passive: true });
  kick();
}

/* Cards header: a long row of cards made of particles, packed densely so each card reads as a solid shape, in teal
   shades. Seen from slightly above, so the tops of the cards are in view; the row runs on past the edges of the
   screen. The cards gather from dust when the header first shows; the card nearest the cursor pulls up out of the row;
   the homepage hero's fine aqua dust floats across the whole header. */
{
  const hostsC = [...document.querySelectorAll('.pcards')];
  if (hostsC.length) {
    const reduceC = matchMedia('(prefers-reduced-motion: reduce)').matches, mobC = innerWidth < 760, Rc = Math.random;
    const NC = +(hostsC[0].getAttribute('data-cards') || 28), PER = mobC ? 1700 : 3600, TOT = NC * PER;
    const TEAL = [[.04,.18,.19],[.07,.24,.25],[.09,.24,.26],[.11,.29,.31],[.14,.35,.36],[.17,.41,.42],[.18,.44,.46],[.23,.49,.5],[.28,.53,.54],[.31,.54,.56],[.37,.6,.61],[.44,.65,.66],[.53,.72,.72],[.62,.78,.78],[.73,.84,.85]];
    // a row seen from above, like the reference video: each card stands upright, turned to show its face; the row runs
    // from far up on the left to near down on the right
    const CW = .56, CH = .9, TH = 32 * Math.PI / 180;   // cards stand across the row, like files in a drawer, each a little in front of the last
    // the row bends in a soft curve, each card turned with the curve so they stay evenly fanned
    const K = .0026, DX = .105, DZ = .085, DL = Math.hypot(DX, DZ), NX = -DZ / DL, NZ = DX / DL;
    const ctr = i => { const s = i - (NC - 1) / 2, b = K * s * s; return [s * DX + NX * b, Math.sin(s * .16) * .05, s * DZ + NZ * b]; };
    const turn = i => { const s = i - (NC - 1) / 2, tx = DX + NX * 2 * K * s, tz = DZ + NZ * 2 * K * s; return Math.atan2(tz, tx) - Math.atan2(DZ, DX); };
    const RC = .05;                                                         // corner radius, so the cards have softly rounded corners
    const pos = new Float32Array(TOT * 3), dust = new Float32Array(TOT * 3), col = new Float32Array(TOT * 3), cid = new Float32Array(TOT), rr = new Float32Array(TOT);
    for (let c = 0; c < NC; c++) {
      const [cx, cy, cz] = ctr(c), base = TEAL[Math.floor(Rc() * TEAL.length)], th = TH - turn(c);
      const litC = Math.max(0, (Math.sin(th) * -.45 + Math.cos(th) * .7) / Math.hypot(-.45, .55, .7));
      for (let j = 0; j < PER; j++) {
        const n = c * PER + j, t = Rc(); let u, v, k;
        const ru = RC / CW, rv = RC / CH;
        if (t < .07) { const s = Rc() * 4;                                       // edge, rounded at the corners (light touch)
          if (s < 1) { u = s - .5; v = .5; } else if (s < 2) { u = .5; v = .5 - (s - 1); } else if (s < 3) { u = .5 - (s - 2); v = -.5; } else { u = -.5; v = -.5 + (s - 3); }
          const cu = Math.abs(u) - (.5 - ru), cv = Math.abs(v) - (.5 - rv);
          if (cu > 0 && cv > 0) { const a = Math.atan2(cv / rv, cu / ru); u = Math.sign(u) * ((.5 - ru) + ru * Math.cos(a)); v = Math.sign(v) * ((.5 - rv) + rv * Math.sin(a)); }
          k = 1.12; }                                                       // edge just a touch lighter
        else { do { u = Rc() - .5; v = Rc() - .5; const cu = Math.abs(u) - (.5 - ru), cv = Math.abs(v) - (.5 - rv);
                 if (cu > 0 && cv > 0 && (cu / ru) ** 2 + (cv / rv) ** 2 > 1) continue;
                 // denser where the light hits: more specks towards the lit upper-left of each card, and on cards that face the light
                 const glow = Math.max(0, 1 - Math.hypot(u + .5, (v - .5) * .8) / 1.25);
                 if (Rc() < .6 + .4 * glow * (.5 + .5 * litC)) break; } while (true);
               k = 1; }                                                      // one even colour across the card
        const lx = u * CW, ly = v * CH, lz = (Rc() - .5) * .012;
        pos[n * 3] = cx + lx * Math.cos(th) + lz * Math.sin(th); pos[n * 3 + 1] = cy + ly; pos[n * 3 + 2] = cz - lx * Math.sin(th) + lz * Math.cos(th);
        const y = 1 - 2 * Rc(), a = Rc() * Math.PI * 2, rs = Math.sqrt(1 - y * y), rad = .8 + Rc() * 2.2;
        dust[n * 3] = rad * rs * Math.cos(a) * 1.8; dust[n * 3 + 1] = rad * y; dust[n * 3 + 2] = rad * rs * Math.sin(a);
        // the homepage sand's lighting: how this card faces the same soft light, its rim, and a little variety between cards
        const nx = Math.sin(th), nz = Math.cos(th), L = [-.45, .55, .7], ll = Math.hypot(...L), lit = Math.max(0, (nx * L[0] + nz * L[2]) / ll);
        col[n * 3] = Math.min(1, lit * (.7 + base[1] * .6)); col[n * 3 + 1] = k > 1.05 ? 1 : 0; col[n * 3 + 2] = .82 + base[1] * .35;
        cid[n] = c; rr[n] = Rc();
      }
    }
    const VSc = `
      attribute vec3 d; attribute vec3 col; attribute float cid; attribute float rnd;
      uniform float uT, uTime, uPx, uAsp, uLastC; uniform vec2 uFocus; uniform float uLift[${NC}];
      varying vec3 vCol; varying float vA;
      void main(){
        float e = clamp((uT - rnd * .35) / .65, 0., 1.); e = e * e * (3. - 2. * e);
        vec3 p = mix(d, position, e);
        p += sin(3.14159 * e) * .25 * vec3(sin(rnd * 40. + uTime * .7), sin(rnd * 31. + uTime * .6), cos(rnd * 23. + uTime * .5));
        float L = 0.; for (int i = 0; i < ${NC}; i++) { if (float(i) == cid) L = uLift[i]; }
        p.y += L * .34;                                                           // pulled straight up, staying in its own slot
        float w = 2.2 + rnd * 2.6;                                                // always moving a little
        p += .006 * vec3(sin(uTime * w + rnd * 91.), cos(uTime * w * 1.13 + rnd * 57.), sin(uTime * w * .87 + rnd * 33.));
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        gl_Position = projectionMatrix * mv;
        float dd = -mv.z;                                                         // the homepage sand: size by distance, 1.2 to 2.6
        gl_PointSize = uPx * clamp(2.6 - (dd - 3.6) * .9, 1.2, 2.6) * (.8 + rnd * .45);
        vec3 deep = vec3(.16, .42, .46), aqua = vec3(.5, .86, .9), foam = vec3(.88, 1., 1.);
        float lit = col.x, rim = col.y;
        vec3 c = mix(deep, aqua, .35 + .65 * smoothstep(.1, .85, lit)) * col.z;
        c = mix(c, foam, rim * .12 + L * .25);
        vCol = c;
        if (cid > uLastC + .5) { gl_PointSize = 0.; gl_Position = vec4(2., 2., 2., 1.); }   // cards past the right margin are left out
        float tw = .86 + .14 * fract(rnd * 7.9);
        // a soft focal glow: specks are strongest around the focus (the middle right of the screen), calmer towards the edges
        vec2 sp = gl_Position.xy / gl_Position.w; vec2 dv = (sp - uFocus) * vec2(uAsp, 1.);
        float fo = 1. - smoothstep(.3, 2.1, length(dv));
        gl_PointSize *= .92 + .2 * fo;
        vA = (.65 + .55 * pow(lit, 1.2) + rim * .1 + L * .4) * tw * (.25 + .75 * e) * (.75 + .45 * fo);
      }`;
    const FSc = `varying vec3 vCol; varying float vA; void main(){ vec2 q = gl_PointCoord - .5; float d = dot(q, q); if (d > .25) discard; gl_FragColor = vec4(vCol, clamp(vA * 1.35, 0., 1.) * (1. - smoothstep(.12, .25, d))); }`;   // the homepage sand's fragment
    // the homepage hero's screen dust (same shader as assets/phero.js)
    const NFc = mobC ? 4500 : 11000, fb = new Float32Array(NFc * 3), fr = new Float32Array(NFc);
    for (let i = 0; i < NFc; i++) { fb[i * 3] = Rc(); fb[i * 3 + 1] = Rc(); fb[i * 3 + 2] = Rc(); fr[i] = Rc(); }
    const FVSc = `
      uniform float uTime, uPx; attribute float rnd; varying float vA;
      void main(){
        float k = rnd, z = position.z, sp = .004 + .012 * z;
        vec2 q = position.xy + vec2(uTime * sp * (.6 + .8 * fract(k * 7.3)), uTime * sp * .35 * (fract(k * 3.1) - .5))
               + .012 * vec2(sin(uTime * .31 + k * 40.), cos(uTime * .27 + k * 31.));
        q = fract(q);
        gl_Position = vec4(q * 2. - 1., 0., 1.);
        gl_PointSize = uPx * (.5 + .7 * z * z);
        vA = (.12 + .36 * z) * (.55 + .45 * sin(uTime * (.6 + k) + k * 60.));
      }`;
    const FFSc = `varying float vA; void main(){ vec2 q = gl_PointCoord - .5; float d = dot(q, q); if (d > .25) discard; gl_FragColor = vec4(.62, .9, .93, vA * (1. - smoothstep(.02, .25, d))); }`;

    hostsC.forEach(host => {
      const zone = host.closest('section') || host;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setClearColor(0, 0); host.appendChild(renderer.domElement);
      const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(35, 1, .1, 40);
      const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.BufferAttribute(fb, 3)); fg.setAttribute('rnd', new THREE.BufferAttribute(fr, 1));
      const FU = { uTime: { value: 0 }, uPx: { value: 1 } };
      const field = new THREE.Points(fg, new THREE.ShaderMaterial({ uniforms: FU, vertexShader: FVSc, fragmentShader: FFSc, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending }));
      field.frustumCulled = false; field.renderOrder = -1; scene.add(field);
      const NB = mobC ? 1800 : 4200, bp = new Float32Array(NB * 3), br = new Float32Array(NB);
      for (let i = 0; i < NB; i++) { bp[i * 3] = (Rc() * 2 - 1) * 4.2; bp[i * 3 + 1] = (Rc() * 2 - 1) * 2.4; bp[i * 3 + 2] = -1.6 - Rc() * 2.6; br[i] = Rc(); }
      const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.BufferAttribute(bp, 3)); bg.setAttribute('rnd', new THREE.BufferAttribute(br, 1));
      const back = new THREE.Points(bg, new THREE.ShaderMaterial({ uniforms: FU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        vertexShader: `uniform float uTime, uPx; attribute float rnd; varying float vA;
          void main(){ vec3 p = position; p.x = mod(p.x + uTime * (.03 + rnd * .05) + 4.2, 8.4) - 4.2;
            float a = uTime * (1.2 + rnd * 2.4) + rnd * 80.; p += (.03 + rnd * .07) * vec3(cos(a), sin(a * 1.1) * .8, sin(a) * .5);
            vec4 mv = modelViewMatrix * vec4(p, 1.); gl_Position = projectionMatrix * mv;
            gl_PointSize = uPx * (1. + rnd * 1.4);
            vA = (.25 + .5 * fract(rnd * 7.3)) * (.6 + .4 * sin(uTime * (.8 + rnd * 1.5) + rnd * 40.)); }`,
        fragmentShader: `varying float vA; void main(){ vec2 q = gl_PointCoord - .5; float d = dot(q, q); if (d > .25) discard; gl_FragColor = vec4(.55, .87, .9, vA * (1. - smoothstep(.06, .25, d))); }` }));
      back.frustumCulled = false; scene.add(back);
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('d', new THREE.BufferAttribute(dust, 3));
      g.setAttribute('col', new THREE.BufferAttribute(col, 3)); g.setAttribute('cid', new THREE.BufferAttribute(cid, 1)); g.setAttribute('rnd', new THREE.BufferAttribute(rr, 1));
      const lift = new Array(NC).fill(0);
      const U = { uT: { value: 0 }, uTime: FU.uTime, uPx: { value: 1 }, uAsp: { value: 1.6 }, uLastC: { value: 999 }, uFocus: { value: new THREE.Vector2(.3, .02) }, uLift: { value: lift.slice() } };
      // dense, opaque specks with depth testing, so each card reads as a solid shape and hides the cards behind it
      const pts = new THREE.Points(g, new THREE.ShaderMaterial({ uniforms: U, vertexShader: VSc, fragmentShader: FSc, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));   // glowing, as on the homepage
      pts.frustumCulled = false;
      const row = new THREE.Group(); row.add(pts);
      const holder = new THREE.Group(); holder.add(row); scene.add(holder);
      let wide0 = true, W = 0, H = 0, mx = null, my = null, sx = 0, sy = 0, on = false, t = 0, start = null, last = performance.now(), A0 = { x: 0, y: 0, s: 1 }, A1 = { x: 0, y: 0, s: 1 }, zk = 0;
      const size = () => { const r = renderer.domElement.getBoundingClientRect(), w = Math.max(1, r.width), h = Math.max(1, r.height);
        if (w === W && h === H) return; W = w; H = h; renderer.setSize(w, h, false); camera.aspect = w / h;
        camera.position.set(-.4, 3.1, 4.3); camera.lookAt(0, -.15, 0); camera.updateProjectionMatrix();   // looking down onto the row
        const halfH = 4.25 * Math.tan(THREE.MathUtils.degToRad(17.5)), halfW = halfH * camera.aspect;
        // start: centred, so the row runs off both edges; end: moved into the frame on the right and zoomed up to fill it
        const wide = w / h > 1.3; wide0 = wide;
        A0 = { x: wide ? halfW * .2 : 0, y: -halfH * .04, s: wide ? 1.38 : Math.min(1.1, w / h) };
        A1 = { x: wide ? halfW * .5 : 0, y: wide ? -halfH * .08 : 0, s: wide ? 1.8 : Math.min(1.4, w / h * 1.2) };
        holder.position.set(A0.x, A0.y, wide ? .2 : 0); holder.scale.setScalar(A0.s); U.uAsp.value = w / h;
        const px = renderer.getPixelRatio(); U.uPx.value = px; FU.uPx.value = px; };
      size(); new ResizeObserver(size).observe(host);
      new IntersectionObserver(es => { on = es[0].isIntersecting; if (on) { if (start === null) start = performance.now(); last = performance.now(); requestAnimationFrame(frame); } }).observe(host);
      zone.addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; });
      zone.addEventListener('pointerleave', () => { mx = null; });
      const v = new THREE.Vector3();
      function frame(now) {
        if (!on) return; requestAnimationFrame(frame);
        const dt = Math.min(.05, (now - last) / 1000); last = now; if (!reduceC) t += dt;
        FU.uTime.value = t; U.uT.value = reduceC ? 1 : Math.min(1, (now - start) / 2600);
        const r = renderer.domElement.getBoundingClientRect();
        const inside = mx !== null && mx > r.left && mx < r.right && my > r.top && my < r.bottom;
        const nx = inside ? ((mx - r.left) / r.width) * 2 - 1 : 0, ny = inside ? ((my - r.top) / r.height) * 2 - 1 : 0;
        sx += (nx - sx) * Math.min(1, dt * 3); sy += (ny - sy) * Math.min(1, dt * 3);
        // scroll: as the scene draws back into the frame, the cards move into it and grow to become the UI's backdrop
        const sec = host.closest('section'); let zt = 0;
        if (sec) { const sr = sec.getBoundingClientRect(), span = sr.height - innerHeight; if (span > 0) zt = Math.min(1, Math.max(0, -sr.top / span / .6)); }
        zt = zt < .5 ? 4 * zt * zt * zt : 1 - Math.pow(-2 * zt + 2, 3) / 2;
        zk += (zt - zk) * Math.min(1, dt * 8);
        U.uFocus.value.set(wide0 ? .3 + .18 * zk : 0, .02 - .08 * zk);   // the glow follows the cards into the frame
        holder.position.x = A0.x + (A1.x - A0.x) * zk; holder.position.y = A0.y + (A1.y - A0.y) * zk; holder.scale.setScalar(A0.s + (A1.s - A0.s) * zk);
        row.rotation.y = sx * .18 * (1 - zk * .6); row.rotation.x = sy * .06;
        scene.updateMatrixWorld();
        const xs = []; for (let c = 0; c < NC; c++) { const p = ctr(c); v.set(p[0], p[1] + CH * .3 + lift[c] * .34, p[2]).applyMatrix4(row.matrixWorld).project(camera); xs.push((v.x * .5 + .5) * r.width + r.left); }
        const step = Math.abs(xs[1] - xs[0]) || 12;
        for (let c = 0; c < NC; c++) {
          let target = .02 * (1 + Math.sin(t * 1.1 - c * .35));
          if (inside) { const dd = Math.abs(mx - xs[c]) / (step * 2.2); target = Math.max(target, Math.pow(Math.max(0, 1 - dd), 1.8)); }
          lift[c] += (target - lift[c]) * Math.min(1, dt * 7); U.uLift.value[c] = lift[c];
        }
        renderer.render(scene, camera);
      }
    });
  }
}


/* "Two stacks" (Business overview): a scene of its own, larger and livelier than the statement shapes.
   Two tall stacks of particle coins, fiat on the left (a € coin standing on top) and crypto on the right (a ₿ coin),
   every coin turning on its own, the stacks swaying and rippling. Between them sparks shoot across the gap and
   die halfway: nothing connects the two. As you scroll, the coins break off one by one and fly in arcs into the
   middle, where they land as one stack; the € and ₿ coins fuse into one big Kai coin on top, and a ring of dust
   bursts out. The cursor turns the whole scene a little. */
{
  const host = document.querySelector('.pglobe[data-shape="stacks"]');
  if (host) {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, mob = innerWidth < 760;
    const R = Math.random, TAU = Math.PI * 2;
    const ease = x => { x = Math.min(1, Math.max(0, x)); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
    // ---------- symbols as point lists (-1…1, y up) ----------
    const glyph = draw => { const S = 180, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d');
      g.fillStyle = '#fff'; g.strokeStyle = '#fff'; draw(g, S); const d = g.getImageData(0, 0, S, S).data, pts = [];
      for (let y = 0; y < S; y += 2) for (let x = 0; x < S; x += 2) if (d[(y * S + x) * 4 + 3] > 120) pts.push([x / S * 2 - 1, 1 - y / S * 2]);
      return pts.length ? pts : [[0, 0]]; };
    const font = (g, S, k, w) => { g.font = `${w} ${S * k}px "Helvetica Neue", Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; };
    const EURO = glyph((g, S) => { font(g, S, .82, 600); g.fillText('€', S / 2, S * .54); });
    const BTC = glyph((g, S) => { font(g, S, .78, 700); g.fillText('B', S / 2, S * .54); g.lineWidth = S * .075;
      [.42, .57].forEach(x => { g.beginPath(); g.moveTo(S * x, S * .08); g.lineTo(S * x, S * .2); g.moveTo(S * x, S * .88); g.lineTo(S * x, S * 1); g.stroke(); }); });
    const KAI = glyph((g, S) => { g.translate(S * .08, S * .08); g.scale(S * .84 / 104, S * .84 / 104);
      ['M43.2773 67.3906C49.2947 66.5932 55.2169 66.4682 61.0439 67.0117V66.9922L61.6895 67.0732C72.8282 68.208 82.4104 71.7968 90.4355 77.8398L75.417 92.374L61.6895 79.1318L61.6875 79.1289V103.032C61.6875 103.678 61.3647 104.002 60.7188 104.002H43.2773C42.6315 104.002 42.3086 103.678 42.3086 103.032V68.3115C42.3086 67.6657 42.6315 67.3584 43.2773 67.3906Z',
       'M35.6895 42.3115C36.3354 42.3115 36.6427 42.6343 36.6104 43.2803C37.4077 49.297 37.5326 55.2184 36.9893 61.0449H37.0078L36.9336 61.6279C36.9315 61.6487 36.9308 61.6697 36.9287 61.6904H36.9268C35.792 72.8291 32.2032 82.4114 26.1602 90.4365L11.626 75.417L24.8682 61.6904H0.96875C0.323023 61.6904 0.000106046 61.3674 0 60.7217V43.2803C0 42.6344 0.322917 42.3116 0.96875 42.3115H35.6895Z',
       'M92.374 28.584L79.1318 42.3115H103.031C103.677 42.3116 104 42.6344 104 43.2803V60.7217C104 61.3674 103.677 61.6904 103.031 61.6904H68.3105C67.6647 61.6904 67.3575 61.3674 67.3896 60.7217C66.5923 54.705 66.4675 48.7834 67.0107 42.957H66.9922L67.0654 42.3721C67.0675 42.3519 67.0692 42.3317 67.0713 42.3115H67.0732C68.208 31.1728 71.7968 21.5905 77.8398 13.5654L92.374 28.584Z',
       'M60.7227 0C61.3684 6.34367e-05 61.6913 0.323029 61.6914 0.96875V35.6904C61.6913 36.3361 61.3684 36.6426 60.7227 36.6104C54.7053 37.4078 48.7831 37.5318 42.9561 36.9883V37.0098L42.3105 36.9287C31.1718 35.794 21.5896 32.2052 13.5645 26.1621L28.583 11.6279L42.3105 24.8701L42.3125 24.8721V0.96875C42.3126 0.322966 42.6354 0 43.2812 0H60.7227Z'
      ].forEach(d => g.fill(new Path2D(d))); });

    // ---------- the parts ----------
    const NC = 8, CR = .66, CT = .045;                   // coins per stack, coin radius, half thickness
    const PER = mob ? 150 : 300;                          // specks per stacked coin
    const NG = mob ? 700 : 1500;                          // specks per standing symbol coin
    const NS = mob ? 300 : 700, NRING = mob ? 400 : 900, NAMB = mob ? 900 : 2200;
    const coinPt = () => { const a = R() * TAU, t = R();                                             // flat coin, local frame
      if (t < .5) return [CR * Math.cos(a), CT, CR * Math.sin(a)];                                     // crisp top edge
      if (t < .6) return [CR * Math.cos(a), (R() * 2 - 1) * CT, CR * Math.sin(a)];                    // thin rim
      if (t < .75) { const r = CR * .78; return [r * Math.cos(a), CT, r * Math.sin(a)]; }            // inner ring on top
      const r = CR * Math.sqrt(R()); return [r * Math.cos(a), (R() < .7 ? 1 : -1) * CT, r * Math.sin(a)]; };
    const signPt = (G, r) => { const t = R(), a = R() * TAU;                                         // standing coin with a symbol, facing +z
      if (t < .25) return [r * Math.cos(a), r * Math.sin(a), (R() * 2 - 1) * .09];
      if (t < .38) { const rr = r * .84; return [rr * Math.cos(a), rr * Math.sin(a), (R() < .5 ? -1 : 1) * .11]; }
      if (t < .5) { const rr = r * Math.sqrt(R()); return [rr * Math.cos(a), rr * Math.sin(a), (R() < .5 ? -1 : 1) * .09]; }
      const p = G[Math.floor(R() * G.length)]; return [p[0] * r * .6, p[1] * r * .6, (R() < .75 ? 1 : -1) * .13]; };
    const N = 2 * NC * PER + 2 * NG + NS + NRING + NAMB;
    const loc = new Float32Array(N * 3), end = new Float32Array(N * 3), kind = new Uint8Array(N), idx = new Uint16Array(N), seed = new Float32Array(N);
    let k = 0;
    const put = (arr, i, p) => { arr[i * 3] = p[0]; arr[i * 3 + 1] = p[1]; arr[i * 3 + 2] = p[2]; };
    for (let s = 0; s < 2; s++) for (let c = 0; c < NC; c++) for (let j = 0; j < PER; j++, k++) { put(loc, k, coinPt()); kind[k] = 0; idx[k] = s * NC + c; seed[k] = R(); }
    for (let s = 0; s < 2; s++) for (let j = 0; j < NG; j++, k++) { put(loc, k, signPt(s ? BTC : EURO, .78)); put(end, k, signPt(KAI, 1.05)); kind[k] = 1; idx[k] = s; seed[k] = R(); }
    for (let j = 0; j < NS; j++, k++) { kind[k] = 2; idx[k] = j % 2; seed[k] = R(); }
    for (let j = 0; j < NRING; j++, k++) { kind[k] = 3; seed[k] = R(); }
    for (let j = 0; j < NAMB; j++, k++) { put(loc, k, [(R() * 2 - 1) * 5.5, (R() * 2 - 1) * 2.6, (R() * 2 - 1) * 1.5]); kind[k] = 4; seed[k] = R(); }

    // ---------- renderer ----------
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setClearColor(0, 0); host.appendChild(renderer.domElement);
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(32, 1, .1, 60);
    const pos = new Float32Array(N * 3), alp = new Float32Array(N), siz = new Float32Array(N);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aA', new THREE.BufferAttribute(alp, 1));
    g.setAttribute('aS', new THREE.BufferAttribute(siz, 1)); g.setAttribute('rnd', new THREE.BufferAttribute(seed, 1));
    const dark = !!host.closest('.dk,[data-tone="dark"]');
    const U = { uPx: { value: 1 }, uC1: { value: dark ? new THREE.Color(.42, .74, .76) : new THREE.Color(.04, .17, .19) },
                uC2: { value: dark ? new THREE.Color(.75, .95, .96) : new THREE.Color(.3, .5, .52) } };
    const mat = new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false,
      blending: dark ? THREE.AdditiveBlending : THREE.NormalBlending,
      vertexShader: `attribute float aA, aS, rnd; uniform float uPx; uniform vec3 uC1, uC2; varying vec3 vCol; varying float vA;
        void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.); gl_Position = projectionMatrix * mv;
          gl_PointSize = uPx * aS * (1.3 + rnd * 1.1) * (7. / -mv.z); vA = aA; vCol = mix(uC1, uC2, fract(rnd * 3.7)); }`,
      fragmentShader: `varying vec3 vCol; varying float vA; void main(){ vec2 q = gl_PointCoord - .5; float d = dot(q, q); if (d > .25) discard;
          gl_FragColor = vec4(vCol, vA * (1. - smoothstep(.08, .25, d))); }` });
    const pts = new THREE.Points(g, mat); pts.frustumCulled = false;
    const grp = new THREE.Group(); grp.add(pts); scene.add(grp);

    let W = 0, H = 0, X0 = 0, SCL = 1;
    const size = () => { const r = renderer.domElement.getBoundingClientRect(); const w = Math.max(1, r.width), h = Math.max(1, r.height);
      if (w === W && h === H) return; W = w; H = h; renderer.setSize(w, h, false); camera.aspect = w / h;
      camera.position.set(0, 3.4, 10); camera.lookAt(0, .3, 0); camera.updateProjectionMatrix();        // a little from above: the coin tops show as rings
      const halfH = 10.5 * Math.tan(THREE.MathUtils.degToRad(16)), halfW = halfH * camera.aspect;
      const wide = w / h > 1.3;
      SCL = wide ? Math.min(1.2, (halfH * 2 * .9) / 4.0) : Math.min(1, halfW * 2 * .9 / 5.2);   // the stacks fill the height (or the width, on narrow screens)
      X0 = wide ? -halfW * .42 : 0;                                                                  // in the open side, clear of the text
      grp.position.x = X0; grp.scale.setScalar(SCL);
      U.uPx.value = Math.min(devicePixelRatio, 2) * (mob ? 1.2 : 1.5) * Math.min(1.3, Math.max(.8, h / 560)); };
    size(); new ResizeObserver(size).observe(host);

    // ---------- motion ----------
    const zone = host.closest('section') || host; let mx = 0, my = 0, sx = 0, sy = 0;
    zone.addEventListener('pointermove', e => { const r = zone.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width * 2 - 1; my = (e.clientY - r.top) / r.height * 2 - 1; kick(); });
    zone.addEventListener('pointerleave', () => { mx = 0; my = 0; });
    // apart while the section comes in; the coins fly together as it moves up past the middle of the screen
    const target = () => { const r = zone.getBoundingClientRect(), vh = innerHeight; return Math.min(1, Math.max(0, (vh * .45 - r.top) / (vh * .5))); };
    const SX = 1.6, BASE = -1.85, GAPS = .36, GAPE = .125;           // stack x, floor height, coin spacing apart / together
    const cc = new Float32Array(2 * NC * 3), cy = new Float32Array(2 * NC), cs = new Float32Array(2 * NC);   // coin centre, spin, tilt
    let t = 0, p = 0, on = false, running = false, last = performance.now();
    const frame = now => {
      const dt = Math.min(.05, (now - last) / 1000); last = now; if (!reduce) t += dt;
      const tg = target(); p += reduce ? tg - p : (tg - p) * Math.min(1, dt * 3.2);
      sx += (mx - sx) * Math.min(1, dt * 3); sy += (my - sy) * Math.min(1, dt * 3);
      // coins: where each sits now (stacked apart → flying → one stack in the middle)
      for (let s = 0; s < 2; s++) for (let c = 0; c < NC; c++) {
        const i = s * NC + c, side = s ? 1 : -1;
        const ripple = Math.max(0, Math.sin(t * 2.2 - c * .55)) ** 6 * .09;                      // a lift running up the stack
        const ax = side * SX + Math.sin(t * .9 + c * .45 + s) * .035 * (c / NC) * 3, ay = BASE + c * GAPS + ripple;
        const slot = c * 2 + s, bx = Math.sin(t * .8 + slot * .3) * .02, by = BASE + slot * GAPE;
        const e = ease((p - .08 - (NC - 1 - c) * .045 - s * .02) / .4);                           // top coins leave first
        const arc = Math.sin(Math.PI * e) * (1.1 + c * .05);
        cc[i * 3] = ax + (bx - ax) * e; cc[i * 3 + 1] = ay + (by - ay) * e + arc; cc[i * 3 + 2] = Math.sin(Math.PI * e) * .6 * side;
        cy[i] = t * (.6 + ((i * 37) % 7) * .12) * (i % 2 ? -1 : 1) + e * TAU;                       // each coin turns on its own; a flip while flying
        cs[i] = Math.sin(Math.PI * e) * .9 * side + Math.sin(t * 1.3 + i * 1.7) * .09;           // each coin a little off level: they read as separate coins
      }
      const fuse = ease((p - .55) / .35), burst = Math.max(0, (p - .82) / .18);
      const topA = BASE + NC * GAPS + .95, topB = BASE + 2 * NC * GAPE + 1.05;
      for (let n = 0; n < N; n++) {
        const o = n * 3, kd = kind[n], r = seed[n];
        let x, y, z, a = 1, sz = 1;
        if (kd === 0) {                                                                           // stacked coins
          const i = idx[n], ca = Math.cos(cy[i]), sa = Math.sin(cy[i]), ct = Math.cos(cs[i]), st = Math.sin(cs[i]);
          let lx = loc[o] * ca - loc[o + 2] * sa, ly = loc[o + 1], lz = loc[o] * sa + loc[o + 2] * ca;
          const ty = ly * ct - lx * st; lx = lx * ct + ly * st; ly = ty;
          x = cc[i * 3] + lx; y = cc[i * 3 + 1] + ly; z = cc[i * 3 + 2] + lz; a = .85;
        } else if (kd === 1) {                                                                    // € / ₿ standing on top → one Kai coin
          const s = idx[n], side = s ? 1 : -1, sp = t * .7 + side * .4;
          const fx = side * SX, fy = topA + Math.sin(t * 1.1 + s * 2) * .06;
          const cxp = fx * (1 - fuse), cyp = fy + (topB - fy) * fuse + Math.sin(Math.PI * fuse) * .8;
          let lx = loc[o] + (end[o] - loc[o]) * fuse, ly = loc[o + 1] + (end[o + 1] - loc[o + 1]) * fuse, lz = loc[o + 2] + (end[o + 2] - loc[o + 2]) * fuse;
          const turn = (1 - fuse) * Math.sin(sp) * 1.2 + fuse * Math.sin(t * .5) * .35, ca = Math.cos(turn), sa = Math.sin(turn);
          const sw = Math.sin(Math.PI * fuse) * .45;                                              // swirl as they fuse
          x = cxp + lx * ca + lz * sa + Math.sin(r * 40 + t * 3) * sw; y = cyp + ly + Math.cos(r * 31 + t * 3) * sw; z = -lx * sa + lz * ca;
          a = .95; sz = 1.05;
        } else if (kd === 2) {                                                                    // sparks across the gap, dying halfway
          const side = idx[n] ? 1 : -1, u = ((t * (.35 + r * .25) + r * 7) % 1);
          const sxp = side * (SX - .55), ex = side * .15;
          x = sxp + (ex - sxp) * u + Math.sin(r * 50 + t * 6) * .05; y = BASE + .4 + r * 2 + Math.sin(u * Math.PI) * .35 + (R() - .5) * .02; z = (r - .5) * .6;
          a = Math.sin(u * Math.PI) * (1 - u) * 1.6 * (1 - ease(p / .35)); sz = .8;
        } else if (kd === 3) {                                                                    // the burst ring when they fuse
          const ang = r * TAU, rad = 1.1 + burst * 2.6 + Math.sin(r * 90) * .08;
          x = Math.cos(ang) * rad; y = topB + Math.sin(ang) * rad * .9; z = Math.sin(r * 17) * .2;
          a = burst > 0 ? Math.sin(Math.min(1, burst) * Math.PI) * .9 : 0; sz = .9;
          if (p >= .999) a = .25 + .15 * Math.sin(t * 2 + r * 20);                                  // a faint ring stays
        } else {                                                                                  // ambient dust over the whole banner
          const w = 1.6 + r * 3; x = loc[o] + Math.cos(t * w * .3 + r * 80) * .08 - X0 / SCL * .0; y = loc[o + 1] + Math.sin(t * w * .27 + r * 50) * .08; z = loc[o + 2];
          a = (.2 + .4 * r) * (.7 + .3 * Math.sin(t * (1 + r * 2) + r * 40)); sz = .65;
        }
        pos[o] = x; pos[o + 1] = y; pos[o + 2] = z; alp[n] = a; siz[n] = sz;
      }
      g.attributes.position.needsUpdate = true; g.attributes.aA.needsUpdate = true; g.attributes.aS.needsUpdate = true;
      grp.rotation.y = sx * .35 + Math.sin(t * .25) * .08; grp.rotation.x = sy * .12;
      renderer.render(scene, camera);
      if (on && !reduce) requestAnimationFrame(frame); else running = false;
    };
    function kick() { if (running || !on) return; running = true; last = performance.now(); requestAnimationFrame(frame); }
    new IntersectionObserver(es => { on = es[0].isIntersecting; if (on) kick(); }, { rootMargin: '120px 0px' }).observe(host);
    addEventListener('scroll', () => { if (reduce && on) { running = false; requestAnimationFrame(frame); } else kick(); }, { passive: true });
  }
}

/* Business accounts header: "one account for fiat, crypto and stocks". A vault made of light: a slowly turning dial
   ring around one bright coin carrying the Kai mark (the one balance). Three streams fly into it from the left and are
   absorbed: tumbling coins (fiat), small spinning blocks (crypto) and a rising chart line (stocks). It gathers from dust
   when the header first shows, follows the cursor a little, and moves into the frame on the right as the header draws
   back (the frame's progress is read from .phero__art data-k, like the Cards header). Same aqua light as the other
   dark scenes; the homepage's screen dust floats over everything. */
{
  const host = document.querySelector('.paccount');
  if (host) {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, mob = innerWidth < 760, R = Math.random, TAU = Math.PI * 2;
    const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    // Kai mark as points (-1…1)
    const markPts = (() => { const S = 200, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'); g.fillStyle = '#fff';
      g.translate(S * .08, S * .08); g.scale(S * .84 / 104, S * .84 / 104);
      ['M43.2773 67.3906C49.2947 66.5932 55.2169 66.4682 61.0439 67.0117V66.9922L61.6895 67.0732C72.8282 68.208 82.4104 71.7968 90.4355 77.8398L75.417 92.374L61.6895 79.1318L61.6875 79.1289V103.032C61.6875 103.678 61.3647 104.002 60.7188 104.002H43.2773C42.6315 104.002 42.3086 103.678 42.3086 103.032V68.3115C42.3086 67.6657 42.6315 67.3584 43.2773 67.3906Z',
       'M35.6895 42.3115C36.3354 42.3115 36.6427 42.6343 36.6104 43.2803C37.4077 49.297 37.5326 55.2184 36.9893 61.0449H37.0078L36.9336 61.6279C36.9315 61.6487 36.9308 61.6697 36.9287 61.6904H36.9268C35.792 72.8291 32.2032 82.4114 26.1602 90.4365L11.626 75.417L24.8682 61.6904H0.96875C0.323023 61.6904 0.000106046 61.3674 0 60.7217V43.2803C0 42.6344 0.322917 42.3116 0.96875 42.3115H35.6895Z',
       'M92.374 28.584L79.1318 42.3115H103.031C103.677 42.3116 104 42.6344 104 43.2803V60.7217C104 61.3674 103.677 61.6904 103.031 61.6904H68.3105C67.6647 61.6904 67.3575 61.3674 67.3896 60.7217C66.5923 54.705 66.4675 48.7834 67.0107 42.957H66.9922L67.0654 42.3721C67.0675 42.3519 67.0692 42.3317 67.0713 42.3115H67.0732C68.208 31.1728 71.7968 21.5905 77.8398 13.5654L92.374 28.584Z',
       'M60.7227 0C61.3684 6.34367e-05 61.6913 0.323029 61.6914 0.96875V35.6904C61.6913 36.3361 61.3684 36.6426 60.7227 36.6104C54.7053 37.4078 48.7831 37.5318 42.9561 36.9883V37.0098L42.3105 36.9287C31.1718 35.794 21.5896 32.2052 13.5645 26.1621L28.583 11.6279L42.3105 24.8701L42.3125 24.8721V0.96875C42.3126 0.322966 42.6354 0 43.2812 0H60.7227Z'
      ].forEach(d => g.fill(new Path2D(d)));
      const d = g.getImageData(0, 0, S, S).data, p = [];
      for (let y = 0; y < S; y += 2) for (let x = 0; x < S; x += 2) if (d[(y * S + x) * 4 + 3] > 120) p.push([x / S * 2 - 1, 1 - y / S * 2]);
      return p; })();

    const k = mob ? .45 : 1;
    const NR = Math.round(7000 * k), NT = Math.round(1600 * k), NCORE = Math.round(4200 * k);
    const NCO = 22, PCO = Math.round(46 * k), NCU = 22, PCU = Math.round(52 * k), NLN = Math.round(2400 * k);
    const N = NR + NT + NCORE + NCO * PCO + NCU * PCU + NLN;
    const base = new Float32Array(N * 3), dust = new Float32Array(N * 3), kind = new Uint8Array(N), obj = new Uint16Array(N), seed = new Float32Array(N);
    let n = 0;
    const put = (x, y, z, kd, o = 0) => { base[n * 3] = x; base[n * 3 + 1] = y; base[n * 3 + 2] = z; kind[n] = kd; obj[n] = o; seed[n] = R();
      const a = R() * TAU, yy = R() * 2 - 1, s = Math.sqrt(1 - yy * yy), rad = 2 + R() * 3.5; dust[n * 3] = rad * s * Math.cos(a) * 1.6; dust[n * 3 + 1] = rad * yy; dust[n * 3 + 2] = rad * s * Math.sin(a); n++; };
    // 0 dial ring (torus) · 1 tick ring · 2 core coin with the mark · 3 coins · 4 blocks · 5 chart line
    for (let i = 0; i < NR; i++) { const a = R() * TAU, b = R() * TAU, r = 1.18 + .055 * Math.cos(b); put(r * Math.cos(a), r * Math.sin(a), .055 * Math.sin(b), 0); }
    for (let i = 0; i < NT; i++) { const t = Math.floor(R() * 72), a = t / 72 * TAU + (R() - .5) * .004, r = 1.36 + R() * (t % 6 === 0 ? .14 : .06); put(r * Math.cos(a), r * Math.sin(a), 0, 1); }
    for (let i = 0; i < NCORE; i++) { const t = R(), a = R() * TAU;
      if (t < .25) put(.6 * Math.cos(a), .6 * Math.sin(a), (R() - .5) * .08, 2);                                  // rim
      else if (t < .45) { const r = .6 * Math.sqrt(R()); put(r * Math.cos(a), r * Math.sin(a), (R() < .5 ? -1 : 1) * .04, 2); }   // faces
      else { const p = markPts[Math.floor(R() * markPts.length)]; put(p[0] * .38, p[1] * .38, .06, 2); } }          // the Kai mark, raised
    for (let o = 0; o < NCO; o++) for (let i = 0; i < PCO; i++) { const a = R() * TAU, t = R();
      if (t < .6) put(.1 * Math.cos(a), .1 * Math.sin(a), (R() - .5) * .02, 3, o); else { const r = .1 * Math.sqrt(R()); put(r * Math.cos(a), r * Math.sin(a), (R() < .5 ? -1 : 1) * .01, 3, o); } }
    for (let o = 0; o < NCU; o++) for (let i = 0; i < PCU; i++) { const ax = Math.floor(R() * 3), p = [(R() < .5 ? -1 : 1), (R() < .5 ? -1 : 1), (R() < .5 ? -1 : 1)]; p[ax] = R() * 2 - 1;
      put(p[0] * .07, p[1] * .07, p[2] * .07, 4, o); }
    for (let i = 0; i < NLN; i++) put(0, 0, 0, 5, 0);
    // the paths into the vault (cubic Bézier from far left to the core), with a little spiral as they arrive
    const bez = (P, u) => { const v = 1 - u; return [0, 1, 2].map(j => v * v * v * P[0][j] + 3 * v * v * u * P[1][j] + 3 * v * u * u * P[2][j] + u * u * u * P[3][j]); };
    const PATH_CO = [[-5.6, 1.9, -.6], [-3.2, 2.2, .4], [-1.2, 1.1, .8], [0, 0, 0]];
    const PATH_CU = [[-5.6, -2.0, .8], [-3.0, -2.3, -.6], [-1.1, -1.2, .7], [0, 0, 0]];
    // the chart: a rising zig-zag, then a curve into the core
    const CH = [[-5.8, -.9], [-5.0, -.6], [-4.5, -.95], [-3.8, -.35], [-3.3, -.6], [-2.6, .05], [-2.1, -.2], [-1.5, .25], [-.75, .12], [0, 0]];
    const chLen = []; let tot = 0; for (let i = 1; i < CH.length; i++) { tot += Math.hypot(CH[i][0] - CH[i - 1][0], CH[i][1] - CH[i - 1][1]); chLen.push(tot); }
    const chartAt = u => { const d = u * tot; let i = 0; while (i < chLen.length - 1 && chLen[i] < d) i++;
      const d0 = i ? chLen[i - 1] : 0, f = (d - d0) / (chLen[i] - d0), a = CH[i], b = CH[i + 1]; return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, 0]; };

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setClearColor(0, 0); host.appendChild(renderer.domElement);
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(35, 1, .1, 60);
    const pos = new Float32Array(N * 3), alp = new Float32Array(N), siz = new Float32Array(N), tone = new Float32Array(N);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aA', new THREE.BufferAttribute(alp, 1));
    g.setAttribute('aS', new THREE.BufferAttribute(siz, 1)); g.setAttribute('aT', new THREE.BufferAttribute(tone, 1)); g.setAttribute('rnd', new THREE.BufferAttribute(seed, 1));
    const U = { uPx: { value: 1 } };
    const mat = new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute float aA, aS, aT, rnd; uniform float uPx; varying vec3 vC; varying float vA;
        void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.); gl_Position = projectionMatrix * mv;
          gl_PointSize = uPx * aS * (1.1 + rnd * 1.1) * (6.5 / -mv.z);
          vec3 deep = vec3(.16, .42, .46), aqua = vec3(.5, .86, .9), foam = vec3(.9, 1., 1.);
          vC = aT < .5 ? mix(deep, aqua, aT * 2.) : mix(aqua, foam, aT * 2. - 1.); vA = aA; }`,
      fragmentShader: `varying vec3 vC; varying float vA; void main(){ vec2 q = gl_PointCoord - .5; float d = dot(q, q); if (d > .25) discard;
        gl_FragColor = vec4(vC, vA * (1. - smoothstep(.06, .25, d))); }` });
    const pts = new THREE.Points(g, mat); pts.frustumCulled = false;
    const tilt = new THREE.Group(); tilt.add(pts); const holder = new THREE.Group(); holder.add(tilt); scene.add(holder);
    // the homepage screen dust, over everything
    const NF = mob ? 4000 : 9000, fb = new Float32Array(NF * 3), fr = new Float32Array(NF);
    for (let i = 0; i < NF; i++) { fb[i * 3] = R(); fb[i * 3 + 1] = R(); fb[i * 3 + 2] = R(); fr[i] = R(); }
    const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.BufferAttribute(fb, 3)); fg.setAttribute('rnd', new THREE.BufferAttribute(fr, 1));
    const FU = { uTime: { value: 0 }, uPx: { value: 1 } };
    const field = new THREE.Points(fg, new THREE.ShaderMaterial({ uniforms: FU, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
      vertexShader: `uniform float uTime, uPx; attribute float rnd; varying float vA;
        void main(){ float k = rnd, z = position.z, sp = .004 + .012 * z;
          vec2 q = position.xy + vec2(uTime * sp * (.6 + .8 * fract(k * 7.3)), uTime * sp * .35 * (fract(k * 3.1) - .5)) + .012 * vec2(sin(uTime * .31 + k * 40.), cos(uTime * .27 + k * 31.));
          q = fract(q); gl_Position = vec4(q * 2. - 1., 0., 1.); gl_PointSize = uPx * (.5 + .7 * z * z);
          vA = (.12 + .36 * z) * (.55 + .45 * sin(uTime * (.6 + k) + k * 60.)); }`,
      fragmentShader: `varying float vA; void main(){ vec2 q = gl_PointCoord - .5; float d = dot(q, q); if (d > .25) discard; gl_FragColor = vec4(.62, .9, .93, vA * (1. - smoothstep(.02, .25, d))); }` }));
    field.frustumCulled = false; field.renderOrder = -1; scene.add(field);

    const art = host.closest('.phero__art'), zone = host.closest('section') || host;
    let W = 0, H = 0, A0 = { x: 0, s: 1 }, A1 = { x: 0, s: 1 };
    const size = () => { const r = renderer.domElement.getBoundingClientRect(), w = Math.max(1, r.width), h = Math.max(1, r.height);
      if (w === W && h === H) return; W = w; H = h; renderer.setSize(w, h, false); camera.aspect = w / h;
      camera.position.set(0, .35, 7); camera.lookAt(0, 0, 0); camera.updateProjectionMatrix();
      const halfH = 7 * Math.tan(THREE.MathUtils.degToRad(17.5)), halfW = halfH * camera.aspect, wide = w / h > 1.3;
      A0 = { x: wide ? halfW * .3 : 0, s: wide ? 1.12 : Math.min(1, w / h) };            // full screen: right of the heading
      A1 = { x: wide ? halfW * .5 : 0, s: wide ? .92 : Math.min(1, w / h) };             // in the frame on the right
      const px = renderer.getPixelRatio(); U.uPx.value = px * (mob ? 1 : 1.15); FU.uPx.value = px; };
    size(); new ResizeObserver(size).observe(host);
    let mx = 0, my = 0, sx = 0, sy = 0, on = false, t = 0, last = performance.now(), born = null;
    zone.addEventListener('pointermove', e => { const r = zone.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width * 2 - 1; my = (e.clientY - r.top) / r.height * 2 - 1; });
    zone.addEventListener('pointerleave', () => { mx = 0; my = 0; });
    new IntersectionObserver(es => { on = es[0].isIntersecting; if (on) { if (born === null) born = performance.now(); last = performance.now(); requestAnimationFrame(frame); } }).observe(host);
    function frame(now) {
      if (!on) return; requestAnimationFrame(frame);
      const dt = Math.min(.05, (now - last) / 1000); last = now; if (!reduce) t += dt;
      const gather = reduce ? 1 : sm(0, 1.8, (now - born) / 1000);                       // gathers from dust when it first shows
      sx += (mx - sx) * Math.min(1, dt * 3); sy += (my - sy) * Math.min(1, dt * 3);
      const kk = art ? +(art.getAttribute('data-k') || 0) : 0;
      holder.position.x = A0.x + (A1.x - A0.x) * kk; const sc = A0.s + (A1.s - A0.s) * kk; holder.scale.setScalar(sc);
      tilt.rotation.y = -.32 + sx * .28 + Math.sin(t * .2) * .05; tilt.rotation.x = .1 + sy * .16;
      const rA = t * .12, rB = -t * .07, ca = Math.cos(rA), sa = Math.sin(rA), cb = Math.cos(rB), sb = Math.sin(rB);
      const pulse = 1 + .035 * Math.sin(t * 2.2);
      for (let i = 0; i < N; i++) {
        const o = i * 3, kd = kind[i], r = seed[i]; let x, y, z, a = 1, s = 1, tn = .5;
        const bx = base[o], by = base[o + 1], bz = base[o + 2];
        if (kd === 0) { x = bx * ca - by * sa; y = bx * sa + by * ca; z = bz; a = .55; tn = .45 + .2 * Math.sin(Math.atan2(y, x) * 3 + t); }
        else if (kd === 1) { x = bx * cb - by * sb; y = bx * sb + by * cb; z = bz; a = .7; tn = .7; s = .9; }
        else if (kd === 2) { const cz = Math.cos(t * .35), szz = Math.sin(t * .35);                      // the core coin turns slowly
          x = bx * cz * pulse; y = by * pulse; z = bx * szz + bz; a = Math.abs(bz - .06) < .001 ? 1 : .7; tn = a > .9 ? .95 : .6; s = a > .9 ? 1.1 : 1; }
        else if (kd === 3 || kd === 4) {                                                             // coins and blocks flying in
          const ob = obj[i], u = (t * .075 + ob / (kd === 3 ? NCO : NCU) + (kd === 4 ? .5 / NCU : 0)) % 1;
          const P = bez(kd === 3 ? PATH_CO : PATH_CU, u), sp = (1 - u) * .35, ph = u * 9 + ob;
          const spin = t * (1.6 + (ob % 5) * .3) + ob, cs = Math.cos(spin), sn = Math.sin(spin);
          const lx = bx * cs + bz * sn, lz = -bx * sn + bz * cs, ly = kd === 4 ? by * Math.cos(spin * .7) - lz * Math.sin(spin * .7) : by;
          const shrink = 1 - sm(.86, 1, u) * .9;
          x = P[0] + lx * shrink + Math.cos(ph) * sp * .4; y = P[1] + ly * shrink + Math.sin(ph) * sp * .4; z = P[2] + lz * shrink;
          a = sm(0, .08, u) * (1 - sm(.9, 1, u)) * .95; tn = kd === 3 ? .8 : .55; }
        else {                                                                                       // the chart line flowing in
          const u = (r + t * .045) % 1, P = chartAt(u);
          x = P[0] + (R() - .5) * .012; y = P[1] + (R() - .5) * .012; z = (r - .5) * .04;
          a = sm(0, .06, u) * (1 - sm(.93, 1, u)) * (.55 + .45 * Math.sin(u * 40 - t * 3)); tn = .85; s = .85; }
        if (gather < 1) { x = dust[o] + (x - dust[o]) * gather; y = dust[o + 1] + (y - dust[o + 1]) * gather; z = dust[o + 2] + (z - dust[o + 2]) * gather; a *= .3 + .7 * gather; }
        pos[o] = x; pos[o + 1] = y; pos[o + 2] = z; alp[i] = a; siz[i] = s; tone[i] = tn;
      }
      g.attributes.position.needsUpdate = true; g.attributes.aA.needsUpdate = true; g.attributes.aS.needsUpdate = true; g.attributes.aT.needsUpdate = true;
      FU.uTime.value = t; renderer.render(scene, camera);
    }
  }
}


/* Pricing header, "See the cost before you move": a large balance made of specks. On the left pan sits what you send,
   a stack of coins with a € coin standing on top; the right pan starts empty, so the beam leans left. One by one, coins
   drop into the right pan, a stack with a £ coin (what arrives), and last a small % coin (the fee). With the fee in,
   the beam swings level and settles: everything weighed and shown before you move; a soft ring pulses at the pivot.
   Then the right pan empties and it starts again (about 11 s). The beam swings on a spring, the cursor tilts the
   scene, and fine specks drift around it. Teal specks on the light page. */
{
  const host = document.querySelector('.pglobe[data-shape="scale"]');
  if (host) {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, mob = innerWidth < 760;
    const R = Math.random, TAU = Math.PI * 2;
    const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    const glyph = (ch, k = .8, w = 600) => { const S = 180, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d');
      g.fillStyle = '#fff'; g.font = `${w} ${S * k}px "Helvetica Neue", Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, S / 2, S * .54);
      const d = g.getImageData(0, 0, S, S).data, pts = []; for (let y = 0; y < S; y += 2) for (let x = 0; x < S; x += 2) if (d[(y * S + x) * 4 + 3] > 120) pts.push([x / S * 2 - 1, 1 - y / S * 2]);
      return pts; };
    const EUR = glyph('€'), GBP = glyph('£'), PCT = glyph('%', .62, 700);
    const k = mob ? .5 : 1;
    // geometry (y up): pivot, beam, pans hanging below its ends
    const PIV = [0, 1.55, 0], HALF = 2.35, DROP = 1.55, PANR = .95, CR = .5, CT = .045, GAP = .115;
    const NL = 6, NRC = 5;                                                     // coins: left stack; right stack (+ the fee coin)
    // parts as local point lists, with a part id; positions are worked out every frame
    const parts = [];                                                          // [kind, sub, x, y, z, weight]
    const add = (kind, sub, x, y, z, w = 1) => parts.push([kind, sub, x, y, z, w]);
    // 0 post and base (fixed)
    for (let i = 0; i < 1600 * k; i++) { const t = R();
      if (t < .55) add(0, 0, (R() - .5) * .08, -2.15 + R() * 3.7, (R() - .5) * .08);
      else { const a = R() * TAU, r = .9 * Math.sqrt(R()) * (t < .8 ? 1 : 0) + (t >= .8 ? .9 : 0); add(0, 0, r * Math.cos(a), -2.15 + (R() * .05), r * Math.sin(a) * .35); } }
    for (let i = 0; i < 500 * k; i++) { const a = R() * TAU, r = .13; add(0, 0, r * Math.cos(a), PIV[1] + r * Math.sin(a), 0); }   // the pivot ring
    // 1 beam (rotates about the pivot): a slim bar with tapered ends
    for (let i = 0; i < 2600 * k; i++) { const u = R() * 2 - 1, th = .07 * (1 - .5 * Math.abs(u)); add(1, 0, u * HALF, (R() - .5) * th * 2, (R() - .5) * .06); }
    // 2 chains (three per side; drawn between the beam end and the pan rim each frame)
    for (let s2 = 0; s2 < 2; s2++) for (let c = 0; c < 3; c++) for (let i = 0; i < 260 * k; i++) add(2, s2 * 3 + c, R(), 0, 0);
    // 3 pans: a shallow dish (hangs level below each beam end)
    for (let s2 = 0; s2 < 2; s2++) for (let i = 0; i < 2200 * k; i++) { const a = R() * TAU, t = R();
      if (t < .5) add(3, s2, PANR * Math.cos(a), 0, PANR * Math.sin(a));
      else { const r = PANR * Math.sqrt(R()); add(3, s2, r * Math.cos(a), -.16 * (1 - (r / PANR) ** 2), r * Math.sin(a)); } }
    // 4 coins in stacks: left NL coins, right NRC coins; each coin a flat disc
    const coinFlat = (kind, sub, slot) => { for (let i = 0; i < 230 * k; i++) { const a = R() * TAU, t = R();
      if (t < .5) add(kind, sub, CR * Math.cos(a), CT, CR * Math.sin(a), slot);
      else if (t < .65) add(kind, sub, CR * Math.cos(a), (R() * 2 - 1) * CT, CR * Math.sin(a), slot);
      else { const r = CR * Math.sqrt(R()); add(kind, sub, r * Math.cos(a), CT, r * Math.sin(a), slot); } } };
    for (let c = 0; c < NL; c++) coinFlat(4, 0, c);
    for (let c = 0; c < NRC; c++) coinFlat(4, 1, c);
    // 5 standing coins with a symbol: € on the left stack, £ on the right stack, % (the fee) beside it
    const coinUp = (G, r, sub) => { for (let i = 0; i < 1100 * k * (r > .3 ? 1 : .5); i++) { const t = R(), a = R() * TAU;
      if (t < .3) add(5, sub, r * Math.cos(a), r * Math.sin(a), (R() * 2 - 1) * .06);
      else if (t < .45) { const q = r * .84; add(5, sub, q * Math.cos(a), q * Math.sin(a), .07); }
      else { const p = G[Math.floor(R() * G.length)]; add(5, sub, p[0] * r * .62, p[1] * r * .62, .09); } } };
    coinUp(EUR, .46, 0); coinUp(GBP, .46, 1); coinUp(PCT, .27, 2);
    // 6 drifting specks
    for (let i = 0; i < 1400 * k; i++) add(6, 0, (R() * 2 - 1) * 4.4, (R() * 2 - 1) * 2.6, (R() * 2 - 1) * 1.2);
    // 7 the pulse ring at the pivot when it settles
    for (let i = 0; i < 700 * k; i++) add(7, 0, R(), 0, 0);
    const N = parts.length, seed = new Float32Array(N); for (let i = 0; i < N; i++) seed[i] = R();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setClearColor(0, 0); host.appendChild(renderer.domElement);
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, 1, .1, 60);
    const pos = new Float32Array(N * 3), alp = new Float32Array(N), siz = new Float32Array(N);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aA', new THREE.BufferAttribute(alp, 1));
    g.setAttribute('aS', new THREE.BufferAttribute(siz, 1)); g.setAttribute('rnd', new THREE.BufferAttribute(seed, 1));
    const U = { uPx: { value: 1 } };
    const mat = new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false, blending: THREE.NormalBlending,
      vertexShader: `attribute float aA, aS, rnd; uniform float uPx; varying vec3 vCol; varying float vA;
        void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.); gl_Position = projectionMatrix * mv;
          gl_PointSize = uPx * aS * (1.2 + rnd * 1.1) * (10. / -mv.z); vA = aA; vCol = mix(vec3(.04, .17, .19), vec3(.3, .5, .52), fract(rnd * 3.7)); }`,
      fragmentShader: `varying vec3 vCol; varying float vA; void main(){ vec2 q = gl_PointCoord - .5; float d = dot(q, q); if (d > .25) discard;
        gl_FragColor = vec4(vCol, vA * (1. - smoothstep(.08, .25, d))); }` });
    const pts = new THREE.Points(g, mat); pts.frustumCulled = false;
    const grp = new THREE.Group(); grp.add(pts); scene.add(grp);
    let W = 0, H = 0;
    const size = () => { const r = renderer.domElement.getBoundingClientRect(), w = Math.max(1, r.width), h = Math.max(1, r.height);
      if (w === W && h === H) return; W = w; H = h; renderer.setSize(w, h, false); camera.aspect = w / h;
      camera.position.set(0, .9, 11); camera.lookAt(0, -.15, 0); camera.updateProjectionMatrix();
      const halfH = 11 * Math.tan(THREE.MathUtils.degToRad(15)), halfW = halfH * camera.aspect;
      grp.scale.setScalar(Math.min(1.25, halfW * 2 * .94 / 6.6, halfH * 2 * .96 / 5.1));
      U.uPx.value = Math.min(devicePixelRatio, 2) * (mob ? 1.1 : 1.3); };
    size(); new ResizeObserver(size).observe(host);
    const zone = host.closest('section') || host; let mx = 0, my = 0, sx = 0, sy = 0;
    zone.addEventListener('pointermove', e => { const r = zone.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width * 2 - 1; my = (e.clientY - r.top) / r.height * 2 - 1; kick(); });
    zone.addEventListener('pointerleave', () => { mx = 0; my = 0; });
    // the story clock (s): coins drop at these times; the fee drops last
    const CYC = 11, DROPS = [1.0, 1.7, 2.4, 3.1, 3.8, 4.9];                  // five £ coins, then the % fee
    const FALL = .55;                                                         // seconds to fall into the pan
    let t = 0, ang = .2, vel = 0, on = false, running = false, last = performance.now(), t0 = null;
    const frame = now => {
      const dt = Math.min(.05, (now - last) / 1000); last = now; if (!reduce) t += dt;
      if (t0 === null) t0 = now;
      const c = reduce ? 7 : ((now - t0) / 1000) % CYC;
      const out = sm(9.6, 10.6, c);                                           // the right pan empties at the end
      const landed = DROPS.map(d => c > d + FALL ? 1 : 0);
      const wR = (landed.slice(0, 5).reduce((a, b) => a + b, 0) + landed[5]) * (1 - out), wL = NL;
      const goal = Math.max(-.22, Math.min(.22, (wL - wR) * .045));           // leans to the heavier side
      vel += ((goal - ang) * 26 - vel * 3.4) * dt; ang += vel * dt;            // on a spring, so it swings and settles
      if (reduce) ang = 0;
      sx += (mx - sx) * Math.min(1, dt * 3); sy += (my - sy) * Math.min(1, dt * 3);
      const ca = Math.cos(ang), sa = Math.sin(ang);
      const end = s2 => { const ex = (s2 ? 1 : -1) * HALF; return [PIV[0] + ex * ca, PIV[1] + ex * sa, 0]; };  // beam ends (left one lower when ang > 0)
      const E = [end(0), end(1)], P = E.map(e => [e[0], e[1] - DROP, 0]);
      const settled = Math.max(0, 1 - Math.abs(ang) * 20) * sm(5.5, 6.6, c) * (1 - sm(9.2, 9.8, c));
      const pulse = sm(5.8, 6.4, c) * (1 - sm(7.2, 8.4, c));
      for (let i = 0; i < N; i++) {
        const q = parts[i], kd = q[0], sub = q[1], o = i * 3, r = seed[i]; let x = q[2], y = q[3], z = q[4], a = .85, s = 1;
        if (kd === 0) { a = .55; }
        else if (kd === 1) { const lx = q[2], ly = q[3]; x = PIV[0] + lx * ca - ly * sa; y = PIV[1] + lx * sa + ly * ca; a = .9; }
        else if (kd === 2) { const side = sub < 3 ? 0 : 1, cc = sub % 3, aa = cc / 3 * TAU + .5;          // chains: beam end → pan rim
          const e = E[side], pr = [P[side][0] + PANR * .96 * Math.cos(aa), P[side][1], PANR * .96 * Math.sin(aa)], f = q[2];
          x = e[0] + (pr[0] - e[0]) * f; y = e[1] + (pr[1] - e[1]) * f; z = e[2] + (pr[2] - e[2]) * f; a = .45; s = .8; }
        else if (kd === 3) { x = P[sub][0] + q[2]; y = P[sub][1] + q[3]; z = q[4]; a = .7; }
        else if (kd === 4) {                                                   // stacked coins
          const slot = q[5], base = P[sub][1] + .04 + slot * GAP;
          if (sub === 0) { x = P[0][0] + q[2]; y = base + q[3]; z = q[4]; }
          else { const d0 = DROPS[slot], f = Math.min(1, Math.max(0, (c - d0) / FALL)), fall = 1 - f * f;   // falls in with gravity
            x = P[1][0] + q[2]; y = base + q[3] + fall * 3.2; z = q[4]; a = (c > d0 ? .85 : 0) * (1 - out); }
        }
        else if (kd === 5) {                                                   // the standing coins with € / £ / %
          const sway = Math.sin(t * .8 + sub * 2) * .35, cs = Math.cos(sway), sn = Math.sin(sway);
          const lx = q[2] * cs + q[4] * sn, lz = -q[2] * sn + q[4] * cs;
          if (sub === 0) { x = P[0][0] + lx; y = P[0][1] + .04 + NL * GAP + .46 + q[3]; z = lz; }
          else if (sub === 1) { const f = Math.min(1, Math.max(0, (c - DROPS[4]) / FALL)), fall = 1 - f * f;
            x = P[1][0] - .18 + lx; y = P[1][1] + .04 + NRC * GAP + .46 + q[3] + fall * 3.2; z = lz; a = (c > DROPS[4] ? .9 : 0) * (1 - out); }
          else { const f = Math.min(1, Math.max(0, (c - DROPS[5]) / FALL)), fall = 1 - f * f;
            x = P[1][0] + .6 + lx; y = P[1][1] + .04 + .27 + q[3] + fall * 3.2; z = lz + .25; a = (c > DROPS[5] ? .95 : 0) * (1 - out); s = 1.05; }
        }
        else if (kd === 6) { x += Math.sin(t * .3 + r * 50) * .1; y += Math.cos(t * .27 + r * 40) * .1; a = .1 + .2 * r; s = .7; }
        else { const aa = q[2] * TAU, rad = .25 + pulse * 1.6; x = PIV[0] + Math.cos(aa) * rad; y = PIV[1] + Math.sin(aa) * rad; z = 0;
          a = pulse > 0 ? Math.sin(Math.PI * Math.min(1, pulse)) * .6 * settled + .0 : 0; s = .85; }
        pos[o] = x; pos[o + 1] = y; pos[o + 2] = z; alp[i] = a; siz[i] = s;
      }
      g.attributes.position.needsUpdate = true; g.attributes.aA.needsUpdate = true; g.attributes.aS.needsUpdate = true;
      grp.rotation.y = -.18 + sx * .3 + Math.sin(t * .2) * .05; grp.rotation.x = .06 + sy * .1;
      renderer.render(scene, camera);
      if (on && !reduce) requestAnimationFrame(frame); else running = false;
    };
    function kick() { if (running || !on) return; running = true; last = performance.now(); requestAnimationFrame(frame); }
    new IntersectionObserver(es => { on = es[0].isIntersecting; if (on) kick(); }, { rootMargin: '120px 0px' }).observe(host);
  }
}


/* "The fee is part of the move." (Pricing): the move as a ring of light, turning slowly in space, with the money flowing
   round it. One slice of the ring is the fee. As the section comes up, the ring gathers from dust, then the fee slice
   lifts out of it, glows, and floats a little apart, still in its place in the circle, with a small % beside it: part
   of the same move, in plain view. In the middle, the € you send turns into the £ you get. The cursor tilts the ring. */
{
  const host = document.querySelector('.pglobe[data-shape="feering"]');
  if (host) {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, mob = innerWidth < 760;
    const R = Math.random, TAU = Math.PI * 2;
    const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    const glyph = (ch, k = .8, w = 600) => { const S = 180, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d');
      g.fillStyle = '#fff'; g.font = `${w} ${S * k}px "Helvetica Neue", Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, S / 2, S * .54);
      const d = g.getImageData(0, 0, S, S).data, pts = []; for (let y = 0; y < S; y += 2) for (let x = 0; x < S; x += 2) if (d[(y * S + x) * 4 + 3] > 120) pts.push([x / S * 2 - 1, 1 - y / S * 2]);
      return pts; };
    const EUR = glyph('€'), GBP = glyph('£'), PCT = glyph('%', .62, 700);
    const k = mob ? .5 : 1;
    const RR = 1.55, TUBE = .2, FEE0 = .06, FEE1 = .16;                       // ring radius, thickness, the fee slice (fraction of the turn)
    const NR = Math.round(12000 * k), NG = Math.round(1800 * k), NP = Math.round(600 * k), NF = Math.round(900 * k), ND = Math.round(1500 * k);
    const N = NR + NG + NP + NF + ND;
    const base = new Float32Array(N * 3), dust = new Float32Array(N * 3), kind = new Uint8Array(N), seed = new Float32Array(N), ga = new Float32Array(N * 2);
    let n = 0;
    const put = (kd, x, y, z) => { base[n * 3] = x; base[n * 3 + 1] = y; base[n * 3 + 2] = z; kind[n] = kd; seed[n] = R();
      const a = R() * TAU, yy = R() * 2 - 1, q = Math.sqrt(1 - yy * yy), rad = 2.5 + R() * 3; dust[n * 3] = rad * q * Math.cos(a) * 1.5; dust[n * 3 + 1] = rad * yy; dust[n * 3 + 2] = rad * q * Math.sin(a); n++; };
    // 0 the ring: u = position round the turn (0..1), stored in base.x; the cross-section in y/z
    for (let i = 0; i < NR; i++) { const u = R(), b = R() * TAU, rr = TUBE * (R() < .55 ? 1 : Math.sqrt(R())); put(0, u, rr * Math.cos(b), rr * Math.sin(b)); }
    // 1 the glyph in the middle: € points with matching £ points
    for (let i = 0; i < NG; i++) { const p = EUR[Math.floor(R() * EUR.length)], q = GBP[Math.floor(R() * GBP.length)]; put(1, p[0] * .62, p[1] * .62, 0); ga[n * 2 - 2] = q[0] * .62; ga[n * 2 - 1] = q[1] * .62; }
    // 2 the % beside the fee slice
    for (let i = 0; i < NP; i++) { const p = PCT[Math.floor(R() * PCT.length)]; put(2, p[0] * .28, p[1] * .28, 0); }
    // 3 the flow: bright specks running round the ring
    for (let i = 0; i < NF; i++) put(3, R(), (R() - .5) * TUBE, (R() - .5) * TUBE);
    // 4 drifting specks
    for (let i = 0; i < ND; i++) put(4, (R() * 2 - 1) * 4.2, (R() * 2 - 1) * 2.4, (R() * 2 - 1) * 1.4);
    const dark = !!host.closest('.dkpanel,[data-tone="dark"]');
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setClearColor(0, 0); host.appendChild(renderer.domElement);
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, 1, .1, 60);
    const pos = new Float32Array(N * 3), alp = new Float32Array(N), siz = new Float32Array(N), hi = new Float32Array(N);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aA', new THREE.BufferAttribute(alp, 1));
    g.setAttribute('aS', new THREE.BufferAttribute(siz, 1)); g.setAttribute('aH', new THREE.BufferAttribute(hi, 1)); g.setAttribute('rnd', new THREE.BufferAttribute(seed, 1));
    const U = { uPx: { value: 1 }, uDark: { value: dark ? 1 : 0 } };
    const mat = new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false, blending: dark ? THREE.AdditiveBlending : THREE.NormalBlending,
      vertexShader: `attribute float aA, aS, aH, rnd; uniform float uPx, uDark; varying vec3 vCol; varying float vA;
        void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.); gl_Position = projectionMatrix * mv;
          gl_PointSize = uPx * aS * (1.05 + rnd * 1.1) * (10. / -mv.z);
          vec3 lo = uDark > .5 ? vec3(.16, .42, .46) : vec3(.04, .17, .19), mid = uDark > .5 ? vec3(.5, .86, .9) : vec3(.3, .5, .52), top = uDark > .5 ? vec3(.95, 1., 1.) : vec3(.05, .32, .35);
          vCol = mix(mix(lo, mid, fract(rnd * 3.7)), top, aH); vA = aA; }`,
      fragmentShader: `varying vec3 vCol; varying float vA; void main(){ vec2 q = gl_PointCoord - .5; float d = dot(q, q); if (d > .25) discard;
        gl_FragColor = vec4(vCol, vA * (1. - smoothstep(.07, .25, d))); }` });
    const pts = new THREE.Points(g, mat); pts.frustumCulled = false;
    const ring = new THREE.Group(); ring.add(pts); scene.add(ring);
    let W = 0, H = 0;
    const size = () => { const r = renderer.domElement.getBoundingClientRect(), w = Math.max(1, r.width), h = Math.max(1, r.height);
      if (w === W && h === H) return; W = w; H = h; renderer.setSize(w, h, false); camera.aspect = w / h;
      camera.position.set(0, 0, 10); camera.lookAt(0, 0, 0); camera.updateProjectionMatrix();
      const halfH = 10 * Math.tan(THREE.MathUtils.degToRad(15)), halfW = halfH * camera.aspect;
      ring.scale.setScalar(Math.min(1.25, halfW * 2 * .8 / 5.2, halfH * 2 * .8 / 5.2));   // room for the fee and its % all the way round
      U.uPx.value = Math.min(devicePixelRatio, 2) * (mob ? 1.1 : 1.25); };
    size(); new ResizeObserver(size).observe(host);
    const zone = host.closest('section') || host; let mx = 0, my = 0, sx = 0, sy = 0;
    zone.addEventListener('pointermove', e => { const r = zone.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width * 2 - 1; my = (e.clientY - r.top) / r.height * 2 - 1; kick(); });
    zone.addEventListener('pointerleave', () => { mx = 0; my = 0; });
    const target = () => { const r = zone.getBoundingClientRect(), vh = innerHeight; return Math.min(1, Math.max(0, (vh * .95 - r.top) / (vh * .7))); };
    let t = 0, p = 0, on = false, running = false, last = performance.now();
    const frame = now => {
      const dt = Math.min(.05, (now - last) / 1000); last = now; if (!reduce) t += dt;
      const tg = target(); p += reduce ? tg - p : (tg - p) * Math.min(1, dt * 2.6);
      sx += (mx - sx) * Math.min(1, dt * 3); sy += (my - sy) * Math.min(1, dt * 3);
      const form = sm(0, .45, p), lift = sm(.45, .8, p), swap = sm(.6, .95, p);
      const spin = t * .12;                                                  // the ring turns slowly in its own plane
      const feeMid = (FEE0 + FEE1) / 2 * TAU + spin, out = lift * .38;           // the fee slice lifts out, along its middle
      for (let i = 0; i < N; i++) {
        const o = i * 3, kd = kind[i], r = seed[i]; let x, y, z, a = .8, s = 1, h = 0;
        if (kd === 0 || kd === 3) {
          let u = base[o]; if (kd === 3) u = (u + t * .06 + r * .03) % 1;    // the flow runs round the ring
          const isFee = u > FEE0 && u < FEE1, ang = u * TAU + spin;
          const cy = base[o + 1], cz = base[o + 2], rad = RR + cy;
          x = Math.cos(ang) * rad; y = Math.sin(ang) * rad; z = cz;
          if (isFee) { x += Math.cos(feeMid) * out; y += Math.sin(feeMid) * out; z += lift * .15; h = .35 + .55 * lift; a = .85 + .15 * lift; s = 1 + .2 * lift; }
          if (kd === 3) { a = isFee ? .95 : .7; h = Math.max(h, .5); s = .9; }
          else if (!isFee) a = .62; }
        else if (kd === 1) { const ax = base[o], ay = base[o + 1], bx = ga[i * 2], by = ga[i * 2 + 1];
          const tw = Math.sin(Math.PI * swap) * .25 * (r - .5);
          x = ax + (bx - ax) * swap + tw; y = ay + (by - ay) * swap + tw * .6; z = 0; a = .9; h = .45; }
        else if (kd === 2) { const d = RR + .38 + out + .28; x = Math.cos(feeMid) * d + base[o]; y = Math.sin(feeMid) * d + base[o + 1]; z = .1; a = .95 * lift; h = .7; s = 1.05; }
        else { x = base[o] + Math.sin(t * .3 + r * 50) * .1; y = base[o + 1] + Math.cos(t * .27 + r * 40) * .1; z = base[o + 2]; a = .08 + .18 * r; s = .7; }
        if (kd !== 4 && form < 1) { x = dust[o] + (x - dust[o]) * form; y = dust[o + 1] + (y - dust[o + 1]) * form; z = dust[o + 2] + (z - dust[o + 2]) * form; a *= .35 + .65 * form; }
        pos[o] = x; pos[o + 1] = y; pos[o + 2] = z; alp[i] = a; siz[i] = s; hi[i] = h;
      }
      g.attributes.position.needsUpdate = true; g.attributes.aA.needsUpdate = true; g.attributes.aS.needsUpdate = true; g.attributes.aH.needsUpdate = true;
      ring.rotation.x = -.35 + sy * .2 + Math.sin(t * .25) * .06; ring.rotation.y = .3 + sx * .35;
      renderer.render(scene, camera);
      if (on && !reduce) requestAnimationFrame(frame); else running = false;
    };
    function kick() { if (running || !on) return; running = true; last = performance.now(); requestAnimationFrame(frame); }
    new IntersectionObserver(es => { on = es[0].isIntersecting; if (on) kick(); }, { rootMargin: '120px 0px' }).observe(host);
    addEventListener('scroll', kick, { passive: true });
  }
}


/* Business pricing header: the three plans for Kai Business, Silver, Gold and Platinum, as three tall glass panels of
   specks standing in a row, each a step higher, with its letter (S, G, P) on the face. On top of each, the plan's
   yearly price as a stack of coins: one for Silver, two for Gold, four for Platinum, roughly in line with €95.88,
   €179.88 and €359.88. The panels rise from dust in turn when the header shows; coins drop onto their stacks; a soft
   line of light scans across all three, like the cost being shown; the panel nearest the cursor lifts a little. */
{
  const host = document.querySelector('.pglobe[data-shape="tiers"]');
  if (host) {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, mob = innerWidth < 760;
    const R = Math.random, TAU = Math.PI * 2;
    const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    const glyph = (ch, k = .78, w = 600) => { const S = 180, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d');
      g.fillStyle = '#fff'; g.font = `${w} ${S * k}px "Helvetica Neue", Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, S / 2, S * .54);
      const d = g.getImageData(0, 0, S, S).data, pts = []; for (let y = 0; y < S; y += 2) for (let x = 0; x < S; x += 2) if (d[(y * S + x) * 4 + 3] > 120) pts.push([x / S * 2 - 1, 1 - y / S * 2]);
      return pts; };
    const LET = [glyph('S'), glyph('G'), glyph('P')], EUR = glyph('€');
    const k = mob ? .5 : 1;
    const PW = 1.25, PH = [2.1, 2.75, 3.4], PX = [-1.75, 0, 1.75], FLOOR = -1.9, RC = .12, COINS = [1, 2, 4], CR = .36, CT = .05, GAP = .13;
    const parts = []; const add = (kd, i2, x, y, z, w = 0) => parts.push([kd, i2, x, y, z, w]);
    // 0 panels: rounded outline (dense), face (light), the letter (bright)
    for (let pi = 0; pi < 3; pi++) { const h = PH[pi];
      for (let i = 0; i < 2600 * k; i++) { const t = R(); let u, v;
        if (t < .38) { const s2 = R() * 4; if (s2 < 1) { u = s2 - .5; v = .5; } else if (s2 < 2) { u = .5; v = .5 - (s2 - 1); } else if (s2 < 3) { u = .5 - (s2 - 2); v = -.5; } else { u = -.5; v = -.5 + (s2 - 3); }
          const ru = RC / PW, rv = RC / h, cu = Math.abs(u) - (.5 - ru), cv = Math.abs(v) - (.5 - rv);
          if (cu > 0 && cv > 0) { const a = Math.atan2(cv / rv, cu / ru); u = Math.sign(u) * ((.5 - ru) + ru * Math.cos(a)); v = Math.sign(v) * ((.5 - rv) + rv * Math.sin(a)); }
          add(0, pi, u * PW, (v + .5) * h, (R() - .5) * .04, 1); }
        else if (t < .7) add(0, pi, (R() - .5) * PW * .96, R() * h, (R() - .5) * .02, 0);
        else { const p = LET[pi][Math.floor(R() * LET[pi].length)]; add(0, pi, p[0] * .42, h * .56 + p[1] * .42, .04, 2); } } }
    // 1 coins on top of each panel (flat discs), plus a standing € coin crowning each stack
    for (let pi = 0; pi < 3; pi++) for (let c = 0; c < COINS[pi]; c++) for (let i = 0; i < 260 * k; i++) { const a = R() * TAU, t = R();
      if (t < .55) add(1, pi * 10 + c, CR * Math.cos(a), CT, CR * Math.sin(a)); else if (t < .7) add(1, pi * 10 + c, CR * Math.cos(a), (R() * 2 - 1) * CT, CR * Math.sin(a));
      else { const r = CR * Math.sqrt(R()); add(1, pi * 10 + c, r * Math.cos(a), CT, r * Math.sin(a)); } }
    for (let pi = 0; pi < 3; pi++) for (let i = 0; i < 700 * k; i++) { const t = R(), a = R() * TAU, r = .3;
      if (t < .35) add(2, pi, r * Math.cos(a), r * Math.sin(a), (R() * 2 - 1) * .04); else { const p = EUR[Math.floor(R() * EUR.length)]; add(2, pi, p[0] * r * .62, p[1] * r * .62, .06); } }
    // 3 the floor: a soft line of specks; 4 drifting specks
    for (let i = 0; i < 1200 * k; i++) add(3, 0, (R() * 2 - 1) * 3.4, FLOOR + (R() - .5) * .03, (R() - .5) * 1.2);
    for (let i = 0; i < 1300 * k; i++) add(4, 0, (R() * 2 - 1) * 4.4, (R() * 2 - 1) * 2.8, (R() * 2 - 1) * 1.2);
    const N = parts.length, seed = new Float32Array(N), dust = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { seed[i] = R(); const a = R() * TAU, yy = R() * 2 - 1, q = Math.sqrt(1 - yy * yy), rad = 2.5 + R() * 3; dust[i * 3] = rad * q * Math.cos(a) * 1.5; dust[i * 3 + 1] = rad * yy; dust[i * 3 + 2] = rad * q * Math.sin(a); }
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setClearColor(0, 0); host.appendChild(renderer.domElement);
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, 1, .1, 60);
    const pos = new Float32Array(N * 3), alp = new Float32Array(N), siz = new Float32Array(N), hi = new Float32Array(N);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aA', new THREE.BufferAttribute(alp, 1));
    g.setAttribute('aS', new THREE.BufferAttribute(siz, 1)); g.setAttribute('aH', new THREE.BufferAttribute(hi, 1)); g.setAttribute('rnd', new THREE.BufferAttribute(seed, 1));
    const U = { uPx: { value: 1 } };
    const mat = new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false, blending: THREE.NormalBlending,
      vertexShader: `attribute float aA, aS, aH, rnd; uniform float uPx; varying vec3 vCol; varying float vA;
        void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.); gl_Position = projectionMatrix * mv;
          gl_PointSize = uPx * aS * (1.15 + rnd * 1.1) * (10. / -mv.z);
          vCol = mix(mix(vec3(.04, .17, .19), vec3(.3, .5, .52), fract(rnd * 3.7)), vec3(.05, .33, .36), aH); vA = aA; }`,
      fragmentShader: `varying vec3 vCol; varying float vA; void main(){ vec2 q = gl_PointCoord - .5; float d = dot(q, q); if (d > .25) discard;
        gl_FragColor = vec4(vCol, vA * (1. - smoothstep(.08, .25, d))); }` });
    const pts = new THREE.Points(g, mat); pts.frustumCulled = false;
    const grp = new THREE.Group(); grp.add(pts); scene.add(grp);
    let W = 0, H = 0;
    const size = () => { const r = renderer.domElement.getBoundingClientRect(), w = Math.max(1, r.width), h = Math.max(1, r.height);
      if (w === W && h === H) return; W = w; H = h; renderer.setSize(w, h, false); camera.aspect = w / h;
      camera.position.set(0, 1.1, 11); camera.lookAt(0, -.05, 0); camera.updateProjectionMatrix();
      const halfH = 11 * Math.tan(THREE.MathUtils.degToRad(15)), halfW = halfH * camera.aspect;
      grp.scale.setScalar(Math.min(1.3, halfW * 2 * .94 / 6.2, halfH * 2 * .94 / 6.2));
      U.uPx.value = Math.min(devicePixelRatio, 2) * (mob ? 1.1 : 1.3); };
    size(); new ResizeObserver(size).observe(host);
    const zone = host.closest('section') || host; let mx = 0, my = 0, sx = 0, sy = 0, inside = false;
    zone.addEventListener('pointermove', e => { const r = zone.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width * 2 - 1; my = (e.clientY - r.top) / r.height * 2 - 1; inside = true; kick(); });
    zone.addEventListener('pointerleave', () => { mx = 0; my = 0; inside = false; });
    const lift = [0, 0, 0], v3 = new THREE.Vector3();
    let t = 0, on = false, running = false, last = performance.now(), born = null;
    const frame = now => {
      const dt = Math.min(.05, (now - last) / 1000); last = now; if (!reduce) t += dt;
      if (born === null) born = now; const age = reduce ? 9 : (now - born) / 1000;
      sx += (mx - sx) * Math.min(1, dt * 3); sy += (my - sy) * Math.min(1, dt * 3);
      // which panel is nearest the cursor (in screen space)
      for (let pi = 0; pi < 3; pi++) { v3.set(PX[pi], FLOOR + PH[pi] * .5, 0).applyMatrix4(grp.matrixWorld).project(camera);
        const want = inside ? Math.max(0, 1 - Math.abs(v3.x - mx) * 2.4) : 0; lift[pi] += (want * .22 - lift[pi]) * Math.min(1, dt * 5); }
      const rise = [0, 1, 2].map(pi => sm(.2 + pi * .35, 1.4 + pi * .35, age));   // the panels rise in turn
      const scan = ((t * .18) % 1.4) - .2;                                      // the light line, left to right across all three
      const cyc = (age % 12);                                                    // coins drop in every 12 s, in turn
      for (let i = 0; i < N; i++) {
        const q = parts[i], kd = q[0], o = i * 3, r = seed[i]; let x, y, z, a = .85, s = 1, h = 0;
        if (kd === 0) { const pi = q[1], fl = Math.sin(t * .8 + pi * 1.3) * .04 + lift[pi];
          x = PX[pi] + q[2]; y = FLOOR + q[3] + fl; z = q[4];
          a = q[5] === 1 ? .8 : q[5] === 2 ? .9 : .16; s = q[5] === 2 ? 1.05 : q[5] === 0 ? .8 : .95; h = q[5] === 2 ? .7 : 0;
          const u = (x / 3.6 + .5); const d = Math.abs(u - scan); if (d < .05) { a = Math.max(a, .7); h = Math.max(h, 1 - d * 20); }
          const e = rise[pi]; x = dust[o] + (x - dust[o]) * e; y = dust[o + 1] + (y - dust[o + 1]) * e; z = dust[o + 2] + (z - dust[o + 2]) * e; a *= .3 + .7 * e; }
        else if (kd === 1) { const pi = Math.floor(q[1] / 10), c = q[1] % 10, fl = Math.sin(t * .8 + pi * 1.3) * .04 + lift[pi];
          const d0 = 2.2 + pi * .5 + c * .35, f = Math.min(1, Math.max(0, (age - d0) / .5)), fall = (1 - f * f) * 2.2;   // first drop, then rest
          x = PX[pi] + q[2]; y = FLOOR + PH[pi] + fl + .06 + c * GAP + q[3] + fall; z = q[4]; a = age > d0 ? .85 : 0; }
        else if (kd === 2) { const pi = q[1], fl = Math.sin(t * .8 + pi * 1.3) * .04 + lift[pi], sw = Math.sin(t * .7 + pi) * .4, cs = Math.cos(sw), sn = Math.sin(sw);
          const d0 = 2.2 + pi * .5 + COINS[pi] * .35, f = Math.min(1, Math.max(0, (age - d0) / .5)), fall = (1 - f * f) * 2.2;
          x = PX[pi] + q[2] * cs + q[4] * sn; y = FLOOR + PH[pi] + fl + .06 + COINS[pi] * GAP + .32 + q[3] + fall; z = -q[2] * sn + q[4] * cs; a = age > d0 ? .9 : 0; h = .4; }
        else if (kd === 3) { x = q[2]; y = q[3]; z = q[4]; a = .25 * sm(0, 1, age); s = .8; }
        else { x = q[2] + Math.sin(t * .3 + r * 50) * .1; y = q[3] + Math.cos(t * .27 + r * 40) * .1; z = q[4]; a = .1 + .2 * r; s = .7; }
        pos[o] = x; pos[o + 1] = y; pos[o + 2] = z; alp[i] = a; siz[i] = s; hi[i] = h;
      }
      g.attributes.position.needsUpdate = true; g.attributes.aA.needsUpdate = true; g.attributes.aS.needsUpdate = true; g.attributes.aH.needsUpdate = true;
      grp.rotation.y = -.32 + sx * .22 + Math.sin(t * .2) * .05; grp.rotation.x = .08 + sy * .08;
      renderer.render(scene, camera);
      if (on && !reduce) requestAnimationFrame(frame); else running = false;
    };
    function kick() { if (running || !on) return; running = true; last = performance.now(); requestAnimationFrame(frame); }
    new IntersectionObserver(es => { on = es[0].isIntersecting; if (on) kick(); }, { rootMargin: '120px 0px' }).observe(host);
  }
}
