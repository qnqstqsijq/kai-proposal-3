/* Kai site behaviour for all pages except the homepage. */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement, body = doc.body;
  var level = +(body.getAttribute("data-level") || 4);
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || doc).querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* button hover origin, as on the homepage */
  doc.addEventListener("pointermove", function (e) {
    var b = e.target.closest && e.target.closest(".btn1,.btn2,.btn3");
    if (!b) return;
    var r = b.getBoundingClientRect();
    b.style.setProperty("--x", ((e.clientX - r.left) / r.width * 100) + "%");
    b.style.setProperty("--y", ((e.clientY - r.top) / r.height * 100) + "%");
  }, { passive: true });

  /* header: dropdowns, mobile menu, tone over dark sections */
  var nav = $(".knav");
  if (nav) {
    var items = $$(".has-dd", nav);
    var closeAll = function (except) {
      items.forEach(function (li) {
        if (li !== except) { li.classList.remove("is-open"); var b = $(".knav__top", li); b && b.setAttribute("aria-expanded", "false"); }
      });
    };
    items.forEach(function (li) {
      var b = $(".knav__top", li);
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        var o = li.classList.toggle("is-open");
        b.setAttribute("aria-expanded", String(o));
        closeAll(li);
      });
      /* only one menu open: hovering a menu closes the others and lets go of their focus */
      li.addEventListener("pointerenter", function () {
        closeAll(li);
        var a = doc.activeElement;
        if (a && a.closest && a.closest(".has-dd") && !li.contains(a)) a.blur();
      });
    });
    doc.addEventListener("click", function (e) { if (!e.target.closest(".has-dd")) closeAll(); });
    doc.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      closeAll();
      if (nav.classList.contains("is-open")) { nav.classList.remove("is-open"); tg && tg.setAttribute("aria-expanded", "false"); tg && tg.focus(); }
    });
    var tg = $(".knav__toggle", nav);
    tg && tg.addEventListener("click", function () {
      var o = nav.classList.toggle("is-open");
      tg.setAttribute("aria-expanded", String(o));
      root.style.overflow = o ? "hidden" : "";
    });
    window.matchMedia("(min-width: 1025px)").addEventListener("change", function (m) {
      if (m.matches) { nav.classList.remove("is-open"); root.style.overflow = ""; tg && tg.setAttribute("aria-expanded", "false"); }
    });
    /* as on the homepage: no frosted background over the hero until the page is scrolled */
    /* a pinned header (data-phero) still counts as the hero while it is pinned */
    var pins = $$("[data-phero]");
    var inPin = function () { for (var i = 0; i < pins.length; i++) { var r = pins[i].getBoundingClientRect(); if (r.top <= 1 && r.bottom > window.innerHeight + 1) return true; } return false; };
    var clear = function () { nav.classList.toggle("is-clear", (window.scrollY < 8 || inPin()) && !nav.classList.contains("is-open")); };
    clear(); window.addEventListener("scroll", clear, { passive: true });
    tg && tg.addEventListener("click", function () { setTimeout(clear, 0); });
    var dark = $$("[data-tone='dark']");
    var tone = function () {
      var y = nav.offsetHeight / 2, d = false;
      for (var i = 0; i < dark.length; i++) { var el = dark[i], r = el.getBoundingClientRect();
        if (el.classList.contains("phero__art") && +(el.getAttribute("data-k") || 0) > .12) continue;   /* the scene has drawn back from under the menu */
        if (r.top <= y && r.bottom >= y) { d = true; break; } }
      nav.classList.toggle("is-dark", d && !nav.classList.contains("is-open"));
    };
    if (dark.length) { tone(); window.addEventListener("scroll", tone, { passive: true }); window.addEventListener("resize", tone); }
  }

  /* smooth scroll and background drift on level 2 and 3 pages */
  if (level <= 3 && !reduce && window.Lenis) {
    var lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
    var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    window.kaiLenis = lenis;
  }
  var bg = $(".kbg i");
  var pars = $$("[data-par]");
  var scrubs = $$("[data-scrub]");
  if (!reduce && (bg && level <= 3 || pars.length || scrubs.length)) {
    var ticking = false;
    var frame = function () {
      ticking = false;
      var vh = window.innerHeight, sy = window.scrollY;
      if (bg && level <= 3) bg.style.setProperty("--bgy", (-sy * 0.25 % (vh * 1.6)) + "px");
      pars.forEach(function (el) {
        var r = el.parentElement.getBoundingClientRect();
        var p = (r.top + r.height / 2 - vh / 2) / vh;
        el.style.setProperty("--py", (p * -40) + "px");
      });
      scrubs.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (vh * 0.6)));
        el.style.setProperty("--p", p.toFixed(3));
        var fn = el.kaiScrub; fn && fn(p);
      });
    };
    var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    frame();
  }

  /* conversion panel: scroll moves the amount from crypto to euros */
  $$("[data-scrub='conv']").forEach(function (el) {
    var out = $("[data-conv-out]", el), inp = $("[data-conv-in]", el), bar = $(".ui__bar i", el);
    var to = +out.getAttribute("data-conv-out"), from = +inp.getAttribute("data-conv-in");
    var fmt = function (v, d) { return v.toLocaleString("en-GB", { minimumFractionDigits: d, maximumFractionDigits: d }); };
    el.kaiScrub = function (p) {
      var e = 1 - Math.pow(1 - p, 3);
      out.textContent = "€" + fmt(to * e, 2);
      inp.textContent = fmt(from * e, 6) + " BTC";
      if (bar) bar.style.width = Math.round(e * 100) + "%";
      el.style.setProperty("--rot", Math.round(e * 180) + "deg");
    };
    if (reduce) el.kaiScrub(1);
  });

  /* reveals, counters, interface panels, footer wordmark */
  var count = function (el) {
    var to = parseFloat(el.getAttribute("data-count")), dec = +(el.getAttribute("data-dec") || 0), pre = el.getAttribute("data-pre") || "";
    var fmt = function (v) { return pre + v.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec }); };
    if (reduce) { el.textContent = fmt(to); return; }
    var t0 = null, dur = 1600;
    var step = function (t) { t0 = t0 || t; var k = Math.min(1, (t - t0) / dur); k = 1 - Math.pow(1 - k, 4); el.textContent = fmt(to * k); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  var seen = $$("[data-r],.ui,[data-count]");
  /* footer wordmark: rises into its clipped frame once the frame is on screen (as on the homepage);
     watched through its frame because the wordmark itself starts hidden below the clip */
  var word = $(".of-word"), wordBox = word && word.parentElement;
  if (word && "IntersectionObserver" in window) {
    var wio = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) { word.classList.add("in"); wio.disconnect(); }
    }, { threshold: 0.05 });
    wio.observe(wordBox);
  } else if (word) { word.classList.add("in"); }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        el.classList.add("in");
        if (el.hasAttribute("data-count")) count(el);
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    seen.forEach(function (el) { io.observe(el); });
  } else {
    seen.forEach(function (el) { el.classList.add("in"); if (el.hasAttribute("data-count")) count(el); });
  }

  /* FAQ */
  /* same as the homepage: one item open at a time; opens on hover on desktop, click still works */
  $$("[data-faq]").forEach(function (list) {
    var items = $$(".faq__item", list);
    var set = function (it, o) { it.classList.toggle("is-open", o); $(".faq__q", it).setAttribute("aria-expanded", String(o)); };
    var hover = window.matchMedia && matchMedia("(hover: hover)").matches;
    items.forEach(function (it) {
      $(".faq__q", it).addEventListener("click", function () {
        var w = !it.classList.contains("is-open");
        items.forEach(function (x) { set(x, false); });
        set(it, w);
      });
      if (hover) it.addEventListener("pointerenter", function () {
        if (it.classList.contains("is-open")) return;
        items.forEach(function (x) { set(x, false); });
        set(it, true);
      });
    });
  });

  /* spread section: the homepage "Your money lives in too many places." scene, same maths as the homepage (scene1):
     tiles fly in from 1.9x the radius, orbit on an ellipse (Rx = min(36% width, 460), Ry = 20% height, centre at 56% height)
     with depth (back 80% size, 55% strength), then gather one after another into the Kai mark, which darkens from
     #bad6d8 to #0b2e30 while the total counts up. Below 760px: a static grid. */
  $$("[data-spread]").forEach(function (sec) {
    var stage = $(".spread__stage", sec), tiles = $$(".app", sec), tv = $(".spread__tv", sec), mark = $(".spread__mark", sec), tot = $(".spread__total", sec);
    var vals = tiles.map(function (t) { return +t.getAttribute("data-v"); }), total = vals.reduce(function (s, v) { return s + v; }, 0), n = tiles.length;
    var cl = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; }, seg = function (x, a, b) { return cl((x - a) / (b - a)); };
    var sine = function (x) { return -(Math.cos(Math.PI * x) - 1) / 2; };
    var mix = function (a, b, k) { return "rgb(" + a.map(function (v, i) { return Math.round(v + (b[i] - v) * k); }).join(",") + ")"; };
    var ang = 0, last = performance.now(), on = false, running = false;
    var frame = function (now) {
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (window.innerWidth <= 760) { tv.textContent = "$" + total.toLocaleString("en-US"); running = false; return; }
      var r = sec.getBoundingClientRect(), H = window.innerHeight, span = r.height - H, p = span > 0 ? cl(-r.top / span) : 1;
      var sr = stage.getBoundingClientRect(), w = sr.width, cx = w / 2;
      var pinTop = Math.min(Math.max(r.top, 0), r.top + span);       /* where the pinned frame's top is on screen */
      var cy = H * 0.56 - (sr.top - pinTop) + (pinTop > 0 ? 0 : 0);
      var q = sine(seg(p, 0, 0.22)), J = seg(p, 0.42, 0.85);
      if (!reduce) ang += dt * 0.3 * (1 - J * 0.6);
      var Rx = Math.min(w * 0.36, 460), Ry = H * 0.2, sum = 0;
      tiles.forEach(function (d, i) {
        var a = ang + i * 2 * Math.PI / n, k = sine(seg(J, i * 0.06, i * 0.06 + 0.55)), rf = (1.9 - 0.9 * q) * (1 - k);
        var x = cx + Math.cos(a) * Rx * rf, y = cy + Math.sin(a) * Ry * rf, dep = (Math.sin(a) + 1) / 2, s = (0.8 + 0.2 * dep) * (1 - 0.65 * k);
        d.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0) scale(" + s.toFixed(3) + ")";
        d.style.opacity = (q * (1 - seg(k, 0.55, 0.95)) * (0.55 + 0.45 * dep)).toFixed(3);
        d.style.filter = k > 0.02 && k < 0.98 ? "blur(" + (Math.sin(Math.PI * k) * 2.6).toFixed(2) + "px)" : "";
        d.style.zIndex = String(Math.round(dep * 10));
        sum += vals[i] * k;
      });
      mark.style.transform = "translate3d(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px,0) translate(-50%,-50%)";
      mark.style.color = mix([127, 169, 174], [11, 46, 48], J);
      tot.style.transform = "translate3d(0," + (cy + mark.offsetHeight / 2 + 14).toFixed(1) + "px,0)";
      tot.style.opacity = q.toFixed(3);
      tv.textContent = "$" + Math.round(sum).toLocaleString("en-US");
      if (on) requestAnimationFrame(frame); else running = false;
    };
    var kick = function () { if (running) return; running = true; last = performance.now(); requestAnimationFrame(frame); };
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { on = es[0].isIntersecting; if (on) kick(); }).observe(sec);
    else { on = true; kick(); }
    window.addEventListener("scroll", kick, { passive: true });
  });

  /* story sections (like the homepage Kai AI section): while the section is pinned, scroll moves through the steps;
     the active step lights up and the UI screen shows everything up to that step. Stacked layout: everything shown. */
  $$("[data-story]").forEach(function (sec) {
    var steps = $$(".kstory__step", sec), parts = $$("[data-at]", sec), n = steps.length, cur = 0;
    var show = function (k) {
      if (k === cur) return; cur = k;
      steps.forEach(function (li, i) { li.classList.toggle("on", i + 1 === k); });
      parts.forEach(function (p) { p.classList.toggle("is-shown", +p.getAttribute("data-at") <= k); });
    };
    var tick = function () {
      if (window.innerWidth <= 1100) { show(n); steps.forEach(function (li) { li.classList.remove("on"); }); return; }
      var r = sec.getBoundingClientRect(), span = r.height - window.innerHeight;
      var p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 1;
      show(Math.min(n, Math.floor(p * n * 0.999) + 1));
    };
    tick(); window.addEventListener("scroll", tick, { passive: true }); window.addEventListener("resize", function () { cur = 0; tick(); });
  });

  /* security section (same as the homepage P7): facts fly in once, the logo turns only while the section is on screen */
  $$(".security").forEach(function (sec) {
    var v = $(".p7-logo", sec), stage = $(".p7-stage", sec);
    if (!("IntersectionObserver" in window) || !stage) { sec.classList.add("is-in", "is-live"); return; }
    new IntersectionObserver(function (es) {
      var on = es[0].isIntersecting;
      sec.classList.toggle("is-live", on);
      if (on) sec.classList.add("is-in");
      if (v && !reduce) { if (on) { var pr = v.play(); pr && pr.catch && pr.catch(function () {}); } else v.pause(); }
    }, { threshold: 0.25 }).observe(stage);
  });

  /* grid overlay toggle (same as the homepage): 12 columns, gutters and centre line; button bottom-left or the G key */
  var gov = $("#gridov"), gbtn = $("#gridbtn");
  if (gov && gbtn) {
    var gc = $(".gcols", gov);
    for (var gi = 0; gi < 12; gi++) gc.appendChild(doc.createElement("i"));
    var gmid = doc.createElement("div"); gmid.className = "mid"; gov.appendChild(gmid);
    var gtog = function () { var on = !gov.classList.contains("on"); gov.classList.toggle("on", on); gbtn.setAttribute("aria-pressed", String(on)); gbtn.textContent = on ? "Hide grid" : "Show grid"; };
    gbtn.addEventListener("click", gtog);
    window.addEventListener("keydown", function (e) { if ((e.key === "g" || e.key === "G") && !e.metaKey && !e.ctrlKey && !/input|textarea|select/i.test(e.target.tagName)) gtog(); });
  }

  /* closing banner: the cube footage drifts slower than its frame, as on the homepage (.fanbg .cubev):
     the video is 24% taller than the frame and shifts by up to 11% of the frame height with scroll; off below 760px */
  var closingVids = $$(".o12-card > video, .band__vid");   /* pricing banners drift the same way */
  if (closingVids.length && !reduce) {
    var cl11 = function (x) { return x < -0.11 ? -0.11 : x > 0.11 ? 0.11 : x; };
    var closingPar = function () {
      var h = window.innerHeight, on = window.innerWidth >= 760;
      closingVids.forEach(function (v) {
        if (!on) { v.style.transform = ""; return; }
        var r = v.parentElement.getBoundingClientRect(); if (r.bottom < 0 || r.top > h) return;
        var c = (r.top + r.height / 2 - h / 2) / h;
        v.style.transform = "translate3d(0," + (cl11(c * 0.14) * r.height).toFixed(1) + "px,0)";
      });
    };
    closingPar(); window.addEventListener("scroll", closingPar, { passive: true }); window.addEventListener("resize", closingPar);
  }

  /* numbered steps: scroll-driven, each step rises into place after the one before it,
     and the line to the next number draws as that step arrives (stacked layout: each step by its own position) */
  var stepLists = $$("[data-steps]");
  if (stepLists.length && !reduce) {
    var clamp01 = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
    var easeOut = function (x) { return 1 - Math.pow(1 - x, 3); };
    var stepsTick = function () {
      var vh = window.innerHeight;
      stepLists.forEach(function (ol) {
        var st = $$(".step", ol), n = st.length; if (!n) return;
        var stacked = st[1] && st[1].offsetTop > st[0].offsetTop + 4;
        var ps = st.map(function (li, i) {
          if (stacked) return clamp01((vh * 0.92 - li.getBoundingClientRect().top) / (vh * 0.3));
          var t = clamp01((vh * 0.9 - ol.getBoundingClientRect().top) / (vh * 0.55));
          return clamp01(t * (n + 0.8) - i * 1.05);
        });
        st.forEach(function (li, i) {
          li.style.setProperty("--p", easeOut(ps[i]).toFixed(3));
          li.style.setProperty("--l", easeOut(i + 1 < n ? ps[i + 1] : 0).toFixed(3));
        });
      });
    };
    var stepsQueued = false;
    var stepsReq = function () { if (stepsQueued) return; stepsQueued = true; requestAnimationFrame(function () { stepsQueued = false; stepsTick(); }); };
    stepsTick();
    window.addEventListener("scroll", stepsReq, { passive: true });
    window.addEventListener("resize", stepsReq);
  }

  /* card and tile icons: icons come from two sets (homepage and generated) drawn at different sizes inside their box;
     re-frame each so its drawn shape takes the same share of the box (the homepage icons' size), line weight stays fixed in CSS */
  $$(".card__ico,.tile__ico").forEach(function (svg) {
    try {
      var b = svg.getBBox(); if (!b.width || !b.height) return;
      var side = Math.max(b.width, b.height) / 0.56, cx = b.x + b.width / 2, cy = b.y + b.height / 2;
      svg.setAttribute("viewBox", (cx - side / 2).toFixed(2) + " " + (cy - side / 2).toFixed(2) + " " + side.toFixed(2) + " " + side.toFixed(2));
      svg.classList.add("ico-fit");
    } catch (e) {}
  });

  /* cards and tiles: descriptions in one row share the tallest height, so every title in the row lines up */
  var evenRows = function () {
    $$(".cards,.tiles").forEach(function (g) {
      var ps = $$(":scope > * > p", g);
      ps.forEach(function (p) { p.style.minHeight = ""; });
      var rows = {};
      ps.forEach(function (p) { var k = Math.round(p.parentElement.offsetTop); (rows[k] = rows[k] || []).push(p); });
      Object.keys(rows).forEach(function (k) {
        var h = Math.max.apply(null, rows[k].map(function (p) { return p.offsetHeight; }));
        rows[k].forEach(function (p) { p.style.minHeight = h + "px"; });
      });
    });
  };
  evenRows(); window.addEventListener("resize", evenRows);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(evenRows);

  /* text page contents: highlight the section in view */
  var toc = $$(".doc__toc a");
  if (toc.length && "IntersectionObserver" in window) {
    var map = {};
    toc.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var tio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { toc.forEach(function (a) { a.classList.remove("is-on"); }); var a = map[e.target.id]; a && a.classList.add("is-on"); }
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    $$(".doc__sec[id]").forEach(function (s) { tio.observe(s); });
  }

  /* toast */
  var toast = function (msg) {
    var t = $(".ktoast");
    if (!t) { t = doc.createElement("div"); t.className = "ktoast"; t.setAttribute("role", "status"); body.appendChild(t); }
    t.textContent = msg; t.classList.add("on");
    clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove("on"); }, 3200);
  };

  /* waitlist (S-03, S-05) */
  var wl = $("#waitlist");
  var initForm = function (form) {
    var fields = $$(".fld", form);
    var msg = $(".form__msg", form);
    var check = function (f) {
      var c = $("input,select,textarea", f), err = $(".err", f), m = "";
      if (!c) return true;
      var v = c.type === "checkbox" ? (c.checked ? "on" : "") : (c.value || "").trim();
      if (c.required && !v) m = c.tagName === "SELECT" ? (f.getAttribute("data-msg-choose") || "Please fill in this field.") : "Please fill in this field.";
      else if (c.type === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) m = "Please enter a valid email address.";
      f.setAttribute("aria-invalid", m ? "true" : "false");
      if (err) err.textContent = m;
      return !m;
    };
    fields.forEach(function (f) {
      var c = $("input,select,textarea", f);
      c && c.addEventListener("input", function () { if (f.getAttribute("aria-invalid") === "true") check(f); });
      c && c.addEventListener("blur", function () { if (c.value) check(f); });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = fields.map(check).every(Boolean);
      if (!ok) { var bad = $(".fld[aria-invalid='true'] input,.fld[aria-invalid='true'] select,.fld[aria-invalid='true'] textarea", form); bad && bad.focus(); return; }
      if (msg) msg.textContent = "";
      var wrap = form.closest("[data-form]");
      var done = wrap && $(".done", wrap);
      if (done) { form.hidden = true; done.hidden = false; var h = $("h2,h3", done); h && h.focus(); }
    });
  };
  $$("form.form").forEach(initForm);
  var openWaitlist = function () {
    if (!wl || !wl.showModal) { location.href = "/waitlist/"; return; }
    var f = $("form", wl), d = $(".done", wl);
    if (f && f.hidden) { f.hidden = false; f.reset(); d.hidden = true; $$(".fld", f).forEach(function (x) { x.removeAttribute("aria-invalid"); var er = $(".err", x); if (er) er.textContent = ""; }); }
    wl.showModal();
  };
  doc.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("[data-waitlist]");
    if (t) { e.preventDefault(); openWaitlist(); }
    var x = e.target.closest && e.target.closest("[data-close]");
    if (x) { var dl = x.closest("dialog"); dl && dl.close(); }
  });
  $$("dialog.kdlg").forEach(function (dl) {
    dl.addEventListener("click", function (e) { if (e.target === dl) dl.close(); });
  });

  /* cookies (S-04) */
  var KEY = "kai-cookie-choices";
  var banner = $("#kcookie"), cset = $("#cookieset");
  var save = function (choice) {
    store.set(KEY, JSON.stringify(choice));
    if (banner) banner.hidden = true;
    toast("Your cookie choices are saved.");
  };
  var all = function (v) { var o = { necessary: true }; $$("[data-cat]", cset || doc).forEach(function (i) { o[i.getAttribute("data-cat")] = v; }); return o; };
  if (banner && !store.get(KEY)) banner.hidden = false;
  doc.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("[data-cookie]");
    if (!a) return;
    var k = a.getAttribute("data-cookie");
    if (k === "accept") { save(all(true)); cset && cset.open && cset.close(); }
    if (k === "reject") { save(all(false)); cset && cset.open && cset.close(); }
    if (k === "settings" && cset) {
      var cur = {}; try { cur = JSON.parse(store.get(KEY) || "{}"); } catch (er) {}
      $$("[data-cat]", cset).forEach(function (i) { i.checked = !!cur[i.getAttribute("data-cat")]; });
      cset.showModal();
    }
    if (k === "save" && cset) {
      var o = { necessary: true }; $$("[data-cat]", cset).forEach(function (i) { o[i.getAttribute("data-cat")] = i.checked; });
      save(o); cset.close();
    }
  });

  /* resources: category filter and pages (all posts are in the HTML; without JavaScript they all show) */
  var grid = $(".posts[data-pager]");
  if (grid) {
    var posts = $$(".post", grid), chips = $$(".chip[data-cat]"), empty = $(".empty"), pager = $(".pager");
    var per = +grid.getAttribute("data-pager") || 9, cat = "all", page = 1;
    var label = function (n, t) { return (grid.getAttribute("data-page") || "Page {n} of {total}").replace("{n}", n).replace("{total}", t); };
    var draw = function (scroll) {
      var list = posts.filter(function (p) { return cat === "all" || p.getAttribute("data-cat") === cat; });
      var total = Math.max(1, Math.ceil(list.length / per));
      page = Math.min(page, total);
      posts.forEach(function (p) { p.hidden = true; });
      list.slice((page - 1) * per, page * per).forEach(function (p) { p.hidden = false; });
      if (empty) empty.hidden = list.length > 0;
      if (pager) {
        pager.hidden = total < 2;
        pager.innerHTML = "";
        var mk = function (txt, on, to) {
          var el = doc.createElement(on ? "a" : "span");
          el.textContent = txt;
          if (on) { el.href = "#"; el.addEventListener("click", function (e) { e.preventDefault(); page = to; draw(true); }); }
          else el.className = "is-off";
          return el;
        };
        pager.appendChild(mk(grid.getAttribute("data-prev") || "Previous", page > 1, page - 1));
        var lab = doc.createElement("span"); lab.textContent = label(page, total); lab.setAttribute("aria-live", "polite"); pager.appendChild(lab);
        pager.appendChild(mk(grid.getAttribute("data-next") || "Next", page < total, page + 1));
      }
      if (scroll) { var y = grid.getBoundingClientRect().top + window.scrollY - 140; window.kaiLenis ? window.kaiLenis.scrollTo(y) : window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" }); }
    };
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        chips.forEach(function (x) { x.setAttribute("aria-pressed", x === c ? "true" : "false"); });
        cat = c.getAttribute("data-cat"); page = 1; draw(false);
      });
    });
    draw(false);
  }

  /* search icon: results page has no content yet */
  $$(".knav__search").forEach(function (b) { b.addEventListener("click", function () { toast("Search results page: (no-content)"); }); });
})();

/* custom cursor, the same as the homepage: a dot on the pointer and a ring that trails it; the ring grows over
   links and buttons; light over dark areas, deep teal on light ones */
(function () {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  var cur = document.createElement("div"); cur.className = "kcur"; cur.setAttribute("aria-hidden", "true");
  cur.innerHTML = '<span class="kcur__ring"><b></b></span><span class="kcur__dot"></span>';
  document.body.appendChild(cur);
  var dot = cur.querySelector(".kcur__dot"), ring = cur.querySelector(".kcur__ring");
  document.documentElement.classList.add("has-kcur");
  var mx = -100, my = -100, rx = -100, ry = -100, seen = false, overEl = null;
  addEventListener("pointermove", function (e) { mx = e.clientX; my = e.clientY; if (!seen) { seen = true; rx = mx; ry = my; cur.style.opacity = 1; } }, { passive: true });
  document.addEventListener("pointerover", function (e) {
    overEl = e.target;
    cur.classList.toggle("is-link", !!(e.target.closest && e.target.closest('a, button, input, select, textarea, [role="button"], [role="link"], .btn1, .btn2, .btn3, summary, label')));
  });
  document.addEventListener("pointerleave", function () { cur.style.opacity = 0; seen = false; });
  addEventListener("pointerdown", function () { cur.classList.add("is-down"); });
  addEventListener("pointerup", function () { cur.classList.remove("is-down"); });
  var tick = function () {
    requestAnimationFrame(tick);
    rx += (mx - rx) * .16; ry += (my - ry) * .16;
    dot.style.transform = "translate3d(" + mx + "px," + my + "px,0)";
    ring.style.transform = "translate3d(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px,0)";
    cur.classList.toggle("on-dark", !!(overEl && overEl.closest && overEl.closest('[data-tone="dark"],.dkpanel,.band,.o12-card,.o12-clip')));
  };
  requestAnimationFrame(tick);
})();

/* copy buttons (Press boilerplate): copy the target's text and confirm on the button */
document.querySelectorAll("[data-copy]").forEach(function (b) {
  b.addEventListener("click", function () {
    var el = document.querySelector(b.getAttribute("data-copy")), lab = b.querySelector(".bl") || b, was = lab.textContent;
    if (!el || !navigator.clipboard) return;
    navigator.clipboard.writeText(el.textContent.trim()).then(function () { lab.textContent = "Copied"; setTimeout(function () { lab.textContent = was; }, 1800); });
  });
});

/* main menu: items rise in one after another, and a soft highlight glides from item to item */
(function () {
  document.querySelectorAll(".knav__dd ul").forEach(function (ul) {
    Array.prototype.forEach.call(ul.children, function (li, i) { li.style.setProperty("--i", i); });
    var hl = document.createElement("span"); hl.className = "dd-hl"; hl.setAttribute("aria-hidden", "true"); ul.insertBefore(hl, ul.firstChild);
    var shown = false;
    var go = function (a) {
      if (!a || !ul.contains(a)) return;
      var r = a.getBoundingClientRect(), u = ul.getBoundingClientRect(), x = r.left - u.left - ul.clientLeft, y = r.top - u.top - ul.clientTop;
      hl.classList.toggle("no-move", !shown);   /* first item: appear in place, then glide */
      hl.style.transform = "translate(" + x + "px," + y + "px)"; hl.style.width = r.width + "px"; hl.style.height = r.height + "px";
      hl.style.opacity = 1; shown = true;
    };
    ul.addEventListener("pointerover", function (e) { go(e.target.closest && e.target.closest("a, .nc")); });
    ul.addEventListener("focusin", function (e) { go(e.target.closest && e.target.closest("a")); });
    var hide = function () { hl.style.opacity = 0; shown = false; };
    ul.addEventListener("pointerleave", hide);
    ul.addEventListener("focusout", function (e) { if (!ul.contains(e.relatedTarget)) hide(); });
  });
})();

/* steps slider: arrows step one card, the rail can be dragged with the mouse, arrows switch off at the ends */
document.querySelectorAll("[data-slider]").forEach(function (sl) {
  var rail = sl.querySelector(".sslide__rail"), prev = sl.querySelector("[data-prev]"), next = sl.querySelector("[data-next]");
  if (!rail) return;
  var step = function () { var c = rail.querySelector(".scard"); if (!c) return rail.clientWidth * .8; var g = parseFloat(getComputedStyle(rail.firstElementChild).columnGap || getComputedStyle(rail.firstElementChild).gap) || 0; return c.getBoundingClientRect().width + g; };
  var ends = function () { var max = rail.scrollWidth - rail.clientWidth - 2; prev && (prev.disabled = rail.scrollLeft <= 2); next && (next.disabled = rail.scrollLeft >= max); rail.classList.toggle("is-scrolled", rail.scrollLeft > 2); };
  prev && prev.addEventListener("click", function () { rail.scrollBy({ left: -step(), behavior: "smooth" }); });
  next && next.addEventListener("click", function () { rail.scrollBy({ left: step(), behavior: "smooth" }); });
  rail.addEventListener("scroll", ends, { passive: true }); addEventListener("resize", ends); ends();
  var down = false, x0 = 0, s0 = 0, moved = false;
  rail.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") return; down = true; moved = false; x0 = e.clientX; s0 = rail.scrollLeft; });
  addEventListener("pointermove", function (e) { if (!down) return; var dx = e.clientX - x0; if (Math.abs(dx) > 4) { moved = true; rail.classList.add("is-drag"); } rail.scrollLeft = s0 - dx; });
  addEventListener("pointerup", function () { if (!down) return; down = false; rail.classList.remove("is-drag");
    if (moved) { var st = step(), i = Math.round(rail.scrollLeft / st); rail.scrollTo({ left: i * st, behavior: "smooth" }); } });
  rail.addEventListener("keydown", function (e) { if (e.key === "ArrowRight") { e.preventDefault(); rail.scrollBy({ left: step(), behavior: "smooth" }); } if (e.key === "ArrowLeft") { e.preventDefault(); rail.scrollBy({ left: -step(), behavior: "smooth" }); } });
});

/* pinned header (Team): the dark scene draws back from the full screen into the frame on the right as you scroll;
   the text keeps its place and fades from light to dark as the scene leaves it; the UI panel comes in last */
(function () {
  var secs = document.querySelectorAll("[data-phero]"); if (!secs.length) return;
  var cl = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; }, ease = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var L = [244, 242, 240], D = [20, 20, 20];
  var mix = function (a, b, k) { return "rgb(" + a.map(function (v, i) { return Math.round(v + (b[i] - v) * k); }).join(",") + ")"; };
  var tick = function () {
    secs.forEach(function (sec) {
      if (innerWidth <= 900) { sec.querySelector(".phero__art").style.clipPath = ""; return; }
      var st = sec.querySelector(".phero__sticky"), art = sec.querySelector(".phero__art"), fr = sec.querySelector(".phero__frame"),
          txt = sec.querySelector(".phero__text"), ui = sec.querySelector(".phero__ui"), btn = txt.querySelector(".btn1");
      var r = sec.getBoundingClientRect(), span = r.height - innerHeight, p = span > 0 ? cl(-r.top / span) : 0;
      var k = ease(cl(p / .6));                                   /* the scene draws back over the first 60% */
      var s = st.getBoundingClientRect(), f = fr.getBoundingClientRect();
      var t = (f.top - s.top) * k, rt = (s.right - f.right) * k, bt = (s.bottom - f.bottom) * k, lt = (f.left - s.left) * k;
      var rad = 20 * (innerWidth / 1920) * k;
      art.setAttribute("data-k", k.toFixed(3));
      art.style.clipPath = "inset(" + t.toFixed(1) + "px " + rt.toFixed(1) + "px " + bt.toFixed(1) + "px " + lt.toFixed(1) + "px round " + rad.toFixed(1) + "px)";
      /* UI panel: rises into the bottom-right of the frame once the frame has settled */
      var u = ease(cl((p - .5) / .3));
      if (ui) { ui.style.opacity = u.toFixed(3); ui.style.transform = "translateY(" + ((1 - u) * 24).toFixed(1) + "px)";
        ui.style.right = (s.right - f.right + f.width * .055) + "px"; ui.style.bottom = (s.bottom - f.bottom + f.width * .055) + "px";
        ui.classList.toggle("in", u > .5); }                     /* its rows come in one after another */
    });
  };
  addEventListener("scroll", tick, { passive: true }); addEventListener("resize", tick); tick();
})();

/* Team header cards: the card nearest the cursor pulls up out of the row, its neighbours a little less;
   at rest the row breathes with a soft wave */
(function () {
  document.querySelectorAll("[data-tfan]").forEach(function (fan) {
    var cards = Array.prototype.slice.call(fan.querySelectorAll(".tfan__card")), zone = fan.closest("section") || fan;
    var lift = cards.map(function () { return 0; }), mx = null, my = null, t0 = performance.now();
    zone.addEventListener("pointermove", function (e) { mx = e.clientX; my = e.clientY; });
    zone.addEventListener("pointerleave", function () { mx = null; });
    var tick = function (now) {
      requestAnimationFrame(tick);
      var r = fan.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      var t = (now - t0) / 1000, inside = mx !== null && my > r.top && my < r.bottom && mx > r.left && mx < r.right;
      var step = cards.length > 1 ? Math.abs(cards[1].getBoundingClientRect().left - cards[0].getBoundingClientRect().left) || 40 : 40;
      cards.forEach(function (c, i) {
        var target = .035 * (1 + Math.sin(t * 1.1 - i * .45));                       /* soft wave at rest */
        if (inside) { var b = c.getBoundingClientRect(), cx = b.left + b.width * .35, d = Math.abs(mx - cx) / (step * 1.6);
          target = Math.max(target, Math.pow(Math.max(0, 1 - d), 1.6)); }
        lift[i] += (target - lift[i]) * .12;
        c.style.setProperty("--lift", lift[i].toFixed(3));
      });
    };
    requestAnimationFrame(tick);
  });
})();

/* pinned header: the visible button is a copy inside the dark scene; mirror the real button's hover (and the point the
   circle grows from) onto it, so the hover shows whichever copy is on screen */
document.querySelectorAll("[data-phero]").forEach(function (sec) {
  var real = sec.querySelectorAll(".phero__sticky > .phero__grid .btns a"), copy = sec.querySelectorAll(".phero__grid--light .btns a");
  Array.prototype.forEach.call(real, function (a, i) { var c = copy[i]; if (!c) return;
    a.addEventListener("pointermove", function (e) { var r = a.getBoundingClientRect(); c.style.setProperty("--x", (e.clientX - r.left) + "px"); c.style.setProperty("--y", (e.clientY - r.top) + "px"); });
    a.addEventListener("pointerenter", function () { c.classList.add("is-hover"); });
    a.addEventListener("pointerleave", function () { c.classList.remove("is-hover"); });
  });
});

/* pricing banners: a field of fine aqua specks (the homepage dust colour) that gathers and swirls around the cursor,
   then drifts back to rest when the cursor leaves */
(function () {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.querySelectorAll(".band:not([data-nodust])").forEach(function (band) {
    var cv = document.createElement("canvas"); cv.className = "band__dust"; cv.setAttribute("aria-hidden", "true");
    var vid = band.querySelector(".band__vid"); vid ? vid.after(cv) : band.prepend(cv);
    var cx = cv.getContext("2d"), dpr = Math.min(devicePixelRatio || 1, 2), W = 0, H = 0, P = [], mx = -1e4, my = -1e4, inside = false, run = false, on = false;
    var size = function () { var r = band.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(W * H / 420); P = [];
      for (var i = 0; i < n; i++) { var x = Math.random() * W, y = Math.random() * H; P.push({ hx: x, hy: y, x: x, y: y, vx: 0, vy: 0, r: .5 + Math.random() * 1.1, a: .18 + Math.random() * .4, k: Math.random() * 6.28 }); } };
    size(); new ResizeObserver(size).observe(band);
    band.addEventListener("pointermove", function (e) { var r = band.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; inside = true; kick(); });
    band.addEventListener("pointerleave", function () { inside = false; kick(); });
    new IntersectionObserver(function (es) { on = es[0].isIntersecting; if (on) kick(); }).observe(band);
    var t0 = performance.now();
    function frame(now) {
      var t = (now - t0) / 1000, moving = false; cx.clearRect(0, 0, W, H);
      for (var i = 0; i < P.length; i++) { var p = P[i], fx = (p.hx - p.x) * .012, fy = (p.hy - p.y) * .012;
        if (inside) { var dx = mx - p.x, dy = my - p.y, d = Math.sqrt(dx * dx + dy * dy) + .001, R = 230;
          if (d < R) { var f = (1 - d / R); fx += dx / d * f * .9 - dy / d * f * 1.4; fy += dy / d * f * .9 + dx / d * f * 1.4; } }   // pull in and swirl
        p.vx = (p.vx + fx) * .9; p.vy = (p.vy + fy) * .9; p.x += p.vx + Math.sin(t * 1.3 + p.k) * .08; p.y += p.vy + Math.cos(t * 1.1 + p.k) * .08;
        if (Math.abs(p.vx) + Math.abs(p.vy) > .02) moving = true;
        var near = inside ? Math.max(0, 1 - Math.hypot(mx - p.x, my - p.y) / 260) : 0;
        cx.globalAlpha = Math.min(1, p.a + near * .6); cx.fillStyle = near > .1 ? "rgb(220,250,252)" : "rgb(158,230,237)";
        cx.beginPath(); cx.arc(p.x, p.y, p.r * (1 + near * .7), 0, 6.283); cx.fill(); }
      if (on && (inside || moving)) requestAnimationFrame(frame); else { run = false; }
    }
    function kick() { if (run || !on) return; run = true; requestAnimationFrame(frame); }
    kick();
  });
})();
