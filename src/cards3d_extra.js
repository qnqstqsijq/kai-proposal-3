
/* Extra card scenes for the Business overview's "Three clear next steps" (added by src/build.py, not on the homepage):
   same frosted glass, light and calm motion as the coin scenes. */
// glass solid from a flat outline: extruded, with a soft rounded edge
const glassShape = (shape, depth, bevel = 0.035) => {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 24 });
  g.translate(0, 0, -depth / 2); g.computeVertexNormals(); return g; };
const roundRect = (sh, x, y, w, h, r) => { sh.moveTo(x + r, y); sh.lineTo(x + w - r, y); sh.quadraticCurveTo(x + w, y, x + w, y + r);
  sh.lineTo(x + w, y + h - r); sh.quadraticCurveTo(x + w, y + h, x + w - r, y + h); sh.lineTo(x + r, y + h);
  sh.quadraticCurveTo(x, y + h, x, y + h - r); sh.lineTo(x, y + r); sh.quadraticCurveTo(x, y, x + r, y); };

// Onboarding · "Verify the business, then the account is yours": a glass key slides into a glass lock plate,
// turns a quarter to unlock, pauses, turns back and slides out — again and again
function verify() {
  const s = makeStage();
  frameCam(s, 8.4, 1.9, 1.45);
  const key = new THREE.Group(), turn = new THREE.Group(); turn.add(key); s.scene.add(turn);
  const bow = glassMesh(new THREE.TorusGeometry(0.46, 0.15, 40, 120), s.scene); s.scene.remove(bow); key.add(bow); bow.position.x = -0.95;
  const shaft = glassMesh(new RoundedBoxGeometry(1.75, 0.24, 0.24, 4, 0.07), s.scene); s.scene.remove(shaft); key.add(shaft); shaft.position.x = 0.38;
  [[0.85, 0.36], [1.12, 0.26]].forEach(([x, h]) => { const tth = glassMesh(new RoundedBoxGeometry(0.2, h, 0.22, 4, 0.05), s.scene); s.scene.remove(tth); key.add(tth); tth.position.set(x, -0.12 - h / 2, 0); });
  const plate = coin(s.scene); plate.scale.set(1.35, 1.1, 1.35); plate.rotation.z = Math.PI / 2;   // lock plate: a big coin standing on its edge
  const ease = x => { x = Math.min(1, Math.max(0, x)); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  s.update = t => {
    drift(s, t);
    const P = 6.4, l = t % P;
    const inn = ease(l / 1.2) * (1 - ease((l - 5.0) / 1.2));             // slide in … slide out
    const rot = ease((l - 1.4) / 1.0) * (1 - ease((l - 3.8) / 1.0));       // quarter turn … and back
    const y = 1.45 + Math.sin(t * 0.6) * 0.04;
    turn.position.set(-0.55 + inn * 0.42, y, 0);
    turn.rotation.set(0.08 + Math.sin(t * 0.4) * 0.03, -0.32 + Math.sin(t * 0.3) * 0.05, -0.04);
    key.rotation.x = rot * Math.PI / 2;
    plate.position.set(1.42, y, 0);
    plate.rotation.set(0.02, -0.32 + Math.sin(t * 0.3) * 0.05, Math.PI / 2);
  };
  return s;
}

// Pricing · "Silver, Gold and Platinum plans": three glass price tags, one per plan, rising in size like steps,
// each hanging from its hole and swinging gently, one after another
function tiers() {
  const s = makeStage();
  frameCam(s, 8.6, 1.95, 1.5);
  const tag = (w, h) => { const sh = new THREE.Shape(), r = 0.12, tip = h * 0.48;
    sh.moveTo(0, 0); sh.lineTo(tip, h / 2 - r * 0.4); sh.lineTo(w - r, h / 2); sh.quadraticCurveTo(w, h / 2, w, h / 2 - r);
    sh.lineTo(w, -h / 2 + r); sh.quadraticCurveTo(w, -h / 2, w - r, -h / 2); sh.lineTo(tip, -h / 2 + r * 0.4); sh.lineTo(0, 0);
    const hole = new THREE.Path(); hole.absarc(tip * 0.62, 0, h * 0.11, 0, Math.PI * 2, true); sh.holes.push(hole);
    return glassShape(sh, 0.12, 0.035); };
  const T3 = [0.78, 0.92, 1.06].map((k, i) => {
    const pivot = new THREE.Group(); s.scene.add(pivot);
    const m = glassMesh(tag(1.55 * k, 0.95 * k), s.scene); s.scene.remove(m); pivot.add(m);
    m.position.x = -0.48 * 0.95 * k * 0.62;                                  // pivot at the hole
    pivot.position.set(-1.05 + i * 1.0, 0.85 + i * 0.55, -i * 0.35);
    return { pivot, i };
  });
  s.update = t => {
    drift(s, t);
    T3.forEach(({ pivot, i }) => {
      pivot.rotation.set(0.05, -0.35 + Math.sin(t * 0.35 + i) * 0.05, -0.32 + Math.sin(t * 0.9 - i * 0.8) * 0.12);   // hanging, swinging in turn
      pivot.position.y = 0.85 + i * 0.55 + Math.sin(t * 0.6 + i * 1.3) * 0.04;
    });
  };
  return s;
}

// Talk to sales · "Tell us about your company": two glass speech bubbles answer each other — each leans forward
// and grows a little in turn, and three dots type in the front bubble
function talk() {
  const s = makeStage();
  frameCam(s, 8.4, 1.9, 1.5);
  const bubble = (w, h, flip) => { const sh = new THREE.Shape(), r = 0.32, x = -w / 2, y = -h / 2;
    sh.moveTo(x + r, y); if (!flip) { sh.lineTo(x + w * 0.22, y); sh.lineTo(x + w * 0.08, y - h * 0.34); sh.lineTo(x + w * 0.42, y); }
    else { sh.lineTo(x + w * 0.58, y); sh.lineTo(x + w * 0.92, y - h * 0.34); sh.lineTo(x + w * 0.78, y); }
    sh.lineTo(x + w - r, y); sh.quadraticCurveTo(x + w, y, x + w, y + r); sh.lineTo(x + w, y + h - r); sh.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    sh.lineTo(x + r, y + h); sh.quadraticCurveTo(x, y + h, x, y + h - r); sh.lineTo(x, y + r); sh.quadraticCurveTo(x, y, x + r, y);
    return glassShape(sh, 0.16, 0.04); };
  const A = glassMesh(bubble(1.75, 1.05, false), s.scene), B = glassMesh(bubble(1.5, 0.92, true), s.scene);
  const dots = [0, 1, 2].map(() => glassMesh(new THREE.SphereGeometry(0.1, 32, 20), s.scene));
  s.update = t => {
    drift(s, t);
    const a = 0.5 + 0.5 * Math.sin(t * 0.8), b = 1 - a;                     // the bubbles take turns
    A.position.set(-0.55, 1.15 + Math.sin(t * 0.6) * 0.04, 0.25 + a * 0.18); A.scale.setScalar(0.97 + a * 0.06);
    A.rotation.set(0.06, 0.28 + Math.sin(t * 0.33) * 0.05, 0.03);
    B.position.set(0.75, 1.95 + Math.sin(t * 0.6 + 1.4) * 0.04, -0.45 + b * 0.18); B.scale.setScalar(0.97 + b * 0.06);
    B.rotation.set(0.06, -0.3 + Math.sin(t * 0.29) * 0.05, -0.03);
    dots.forEach((d, i) => {                                                 // typing: each dot hops in turn
      const p = ((t * 1.6 - i * 0.28) % 1.6 + 1.6) % 1.6, hop = p < 0.5 ? Math.sin(p / 0.5 * Math.PI) : 0;
      d.position.set(A.position.x - 0.42 + i * 0.42, A.position.y + 0.02 + hop * 0.12, A.position.z + 0.16);
    });
  };
  return s;
}
