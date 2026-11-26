/* Statement sections: a particle animation tied to each section's content, filling the whole banner (clipped to it).
   A field of particles across the banner moves all the time, each one circling its own point like a proton;
   the shape and the field turn with the cursor.
   The dust starts as one shape and becomes another as you scroll through the section (data-shape="from>to").
   Same dust look as the homepage hero (assets/phero.js): soft round specks, teal/aqua, brighter in front.
   Every shape fits inside a radius of 1, and the camera frames radius 1.15, so no corner is ever cut.
   One small WebGL canvas per section; it only renders while the section is on screen. */
import * as THREE from 'three';

const hosts = [...document.querySelectorAll('.pglobe')];
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
