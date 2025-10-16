import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, CheckCircle2, ArrowRight, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * BAIA CONSEIL — One Page Website
 * Stack: React + Tailwind + Framer Motion + lucide-react
 * Notes:
 * - Drop this component into your React app. Tailwind should be configured globally.
 * - The design follows a modern one-page flow inspired by animated agency templates.
 * - Replace copy, images, and links with your real content.
 */

// ---------- Helpers ----------
const nav = [
  { label: "Accueil", href: "#home" },
  { label: "Cas d'usage", href: "#usecases" },
  { label: "Résultats", href: "#results" },
  { label: "Contact", href: "#contact" },
];

const Accent = ({ children }) => (
  <span className="bg-gradient-to-r from-rose-500 to-red-600 bg-clip-text text-transparent">
    {children}
  </span>
);

function useOnScreen(ref, rootMargin = "-100px") {
  const [isIntersecting, setIntersecting] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setIntersecting(entry.isIntersecting), {
      rootMargin,
      threshold: 0.2,
    });
    if (ref.current) observer.observe(ref.current);
    return () => ref.current && observer.unobserve(ref.current);
  }, [ref, rootMargin]);
  return isIntersecting;
}

const CountUp = ({ end = 100, duration = 1500, prefix = "", suffix = "" }) => {
  const ref = useRef(null);
  const [value, setValue] = useState(0);
  const visible = useOnScreen(ref);

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const startTime = performance.now();
    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = Math.floor(start + (end - start) * eased);
      setValue(current);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [visible, duration, end]);

  return (
    <div ref={ref} className="tabular-nums">
      {prefix}
      {value.toLocaleString("fr-FR")}
      {suffix}
    </div>
  );
};

// ---------- UI Primitives ----------
const Button = ({ children, as = "a", href = "#", target, rel, onClick, variant = "primary", className = "" }) => {
  const base = "inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-transform hover:scale-[1.02] active:scale-[0.99]";
  const styles = {
    primary: "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg shadow-red-500/20",
    ghost: "bg-white/10 text-white ring-1 ring-white/20 backdrop-blur",
    outline: "border border-neutral-200 text-neutral-800 hover:bg-neutral-50 dark:border-white/15 dark:text-white dark:hover:bg-white/5",
  };
  const Comp = as;
  return (
    <Comp href={href} target={target} rel={rel} onClick={onClick} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </Comp>
  );
};

const Section = ({ id, className = "", children, container = true }) => (
  <section id={id} className={`relative ${className}`}>
    <div className={`mx-auto max-w-7xl px-6 ${container ? "py-16 md:py-24 lg:py-28" : ""}`}>{children}</div>
  </section>
);

// ---------- Fancy Backgrounds ----------
const AnimatedBlob = ({ className = "", size = 520, duration = 12 }) => (
  <motion.div
    aria-hidden
    className={`pointer-events-none absolute blur-3xl ${className}`}
    initial={{ x: -80, y: -40, scale: 1 }}
    animate={{ x: [-80, 60, -40], y: [-40, 40, -20], scale: [1, 1.05, 0.98, 1] }}
    transition={{ duration, ease: "easeInOut", repeat: Infinity }}
    style={{
      width: size,
      height: size,
      background:
        "radial-gradient(50% 50% at 50% 50%, rgba(244,63,94,0.35) 0%, rgba(225,29,72,0.25) 35%, rgba(225,29,72,0.05) 70%, transparent 100%)",
      borderRadius: size,
    }}
  />
);

const GridPattern = () => (
  <div className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:22px_22px]" />
  </div>
);

// ---------- Device Preview (iPhone-style) ----------
const PhoneFrame = ({ children }) => (
  <div className="relative mx-auto aspect-[9/19.5] w-full max-w-[270px] overflow-hidden rounded-[2rem] border border-neutral-300 bg-neutral-900 shadow-xl shadow-black/30 dark:border-white/10">
    <div className="absolute inset-x-0 top-0 z-10 mx-auto mt-1 h-6 w-32 rounded-full bg-neutral-800/80" />
    <div className="h-full w-full overflow-hidden rounded-[2rem]">
      {children}
    </div>
  </div>
);

const PhoneScreen = ({ chat = [], canStart = true, onComplete = () => {} }) => {
  const ref = useRef(null);
  const visible = useOnScreen(ref, "-50px");
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  const maxCount = Math.min(chat.length, 6);

  // Advance messages only when visible AND allowed to start
  useEffect(() => {
    if (!visible || !canStart) return;
    if (count >= maxCount) return;
    const id = setTimeout(() => setCount((c) => Math.min(c + 1, maxCount)), 800);
    return () => clearTimeout(id);
  }, [visible, canStart, count, maxCount]);

  // IMPORTANT: Do NOT reset when out of view; persist progress
  // We simply pause when not visible, and resume when visible again.

  useEffect(() => {
    if (count === maxCount && !done) {
      setDone(true);
      onComplete();
    }
  }, [count, maxCount, done, onComplete]);

  const shown = chat.slice(0, Math.min(count, 6));

  return (
    <div ref={ref} className="flex h-full w-full flex-col justify-between bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-800 p-4 pt-8 text-white">
      <div className="flex-1 space-y-2">
        {shown.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28 }}
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed ring-1 ${
                m.role === 'user' ? 'bg-rose-600 text-white ring-rose-500' : 'bg-white/5 text-white/90 ring-white/10'
              }`}
            >
              {m.text}
            </motion.div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between rounded-xl bg-white/5 p-2 text-[11px] text-white/70 ring-1 ring-white/10">
        <span>Agent connecté</span>
        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-300">Online</span>
      </div>
    </div>
  );
};

// ---------- Main Component ----------
export default function BAIAOnePage() {
  useEffect(() => {
    const root = document.documentElement;
    const prev = root.style.scrollBehavior;
    root.style.scrollBehavior = "smooth";
    return () => { root.style.scrollBehavior = prev; };
  }, []);

  const [activeUsecase, setActiveUsecase] = useState(0);
  // Carousel state for use cases
  const usecases = [
    {
      title: "Conciergeries & Tourisme",
      subtitle: "Check‑in, infos pratiques, upsell activités.",
      chat: [
        { role: 'user', text: 'Hello 👋 vous avez de la dispo du 12 au 15/11 pour 2 adultes ?' },
        { role: 'agent', text: 'Oui, je regarde… Il reste une chambre vue mer à l’Hôtel Coral Bay.' },
        { role: 'user', text: 'Top ! Vous pouvez me la bloquer ?' },
        { role: 'agent', text: 'C’est fait ✅ au nom de M. Payet. Souhaitez-vous ajouter un transfert aéroport ?' },
        { role: 'user', text: 'Oui, prise à 10h30 stp.' },
        { role: 'agent', text: 'Parfait, navette réservée. Vous recevrez la confirmation par email.' }
      ],
    },
    {
      title: "Agents internes",
      subtitle: "FAQ RH, IT, procédures, knowledge base.",
      chat: [
        { role: 'user', text: 'Tu peux me rappeler comment lancer une admission HAD ? J’ai un doute.' },
        { role: 'agent', text: 'La procédure “Admission HAD v3” indique : 1) créer le dossier patient, 2) vérifier les critères d’éligibilité, 3) planifier la première visite.' },
        { role: 'agent', text: 'Je peux vous ouvrir le document complet si vous le souhaitez.' },
        { role: 'user', text: 'Oui, envoie‑moi le lien.' },
        { role: 'agent', text: 'Voici le lien. Le document est accessible ; vous avez les captures pas à pas dans la section 2.' }
      ],
    },
    {
      title: "SAV & Retail",
      subtitle: "Automatisation tickets & remboursements.",
      chat: [
        { role: 'user', text: 'Salut, mon colis n’est toujours pas arrivé 😕' },
        { role: 'agent', text: 'Je m’en occupe. Vous avez le n° de commande ?' },
        { role: 'user', text: 'CMD‑784231' },
        { role: 'agent', text: 'Merci. D’après le suivi, il est au centre de tri. Livraison prévue demain.' },
        { role: 'agent', text: 'Je vous envoie le lien de suivi et j’ouvre un suivi si pas livré d’ici 24h.' }
      ],
    },
  ];
  const [carouselIndex, setCarouselIndex] = useState(0);
  const prevSlide = () => setCarouselIndex((i) => (i - 1 + usecases.length) % usecases.length);
  const nextSlide = () => setCarouselIndex((i) => (i + 1) % usecases.length);

  // --- Carousel interactivity ---
  const [centerDone, setCenterDone] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const touchStartX = useRef(null);
  const wheelCooldown = useRef(false);

  // Autoplay: only when the center conversation is finished
  useEffect(() => {
    if (!centerDone || isHover) return;
    const id = setTimeout(() => {
      nextSlide();
      setCenterDone(false); // wait for next slide to complete
    }, 1600); // small pause to let user read
    return () => clearTimeout(id);
  }, [centerDone, isHover]);

  // Keyboard arrows
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Wheel (trackpad) horizontal
  const onWheel = (e) => {
    if (wheelCooldown.current) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 12) {
      if (e.deltaX > 0) nextSlide(); else prevSlide();
      wheelCooldown.current = true;
      setTimeout(() => (wheelCooldown.current = false), 500);
    }
  };

  // Touch (mobile) swipe
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      if (dx < 0) nextSlide(); else prevSlide();
    }
    touchStartX.current = null;
  };

  return (
    <div id="home" className="relative min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white">

      {/* NAVBAR */}
<header className="sticky top-0 z-50 border-b border-neutral-200/70 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-neutral-950/60">
  <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
    <a href="#home" className="flex items-center gap-3">
            <img src="/logo2.png" alt="BAIA CONSEIL" className="h-9 w-auto" />
            <span className="sr-only">BAIA CONSEIL</span>
          </a>
    <nav className="hidden gap-6 md:flex">
      {nav.map((n) => (
        <a key={n.href} href={n.href} className="text-sm text-neutral-700 hover:text-neutral-900 dark:text-white/70 dark:hover:text-white">
          {n.label}
        </a>
      ))}
    </nav>
    <div className="hidden md:block">
      <Button href="#contact">Demander une démo <ArrowRight className="h-4 w-4" /></Button>
    </div>
  </div>
</header>

{/* HERO */}
<Section id="home" className="overflow-hidden">
  <div className="relative isolate">
    {/* Keep only one blob on the left as requested */}
    <AnimatedBlob className="-left-12 -top-16" />
    <GridPattern />

    <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 md:gap-12 px-6 py-20 md:py-28 text-center">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl"
        >
          Transformez vos services avec <Accent>l'IA</Accent>.
        </motion.h1>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button href="#contact">Demander une démo <ArrowRight className="h-4 w-4" /></Button>
          <Button as="a" href="https://wa.me/262692508037" target="_blank" rel="noreferrer" variant="outline">
            <MessageCircle className="h-4 w-4" /> Discuter sur WhatsApp
          </Button>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-500 dark:text-white/50">
          <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500"/>RGPD/HDS ready</div>
          <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500"/>Hébergement cloud ou on‑premise</div>
          <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500"/>Support 24/7</div>
          <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500"/>Aussi en kréol 🇷🇪</div>
          <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500"/>Satisfaction client</div>
        </div>
      </div>
    </div>
  </div>
</Section>

      {/* USE CASES */}
      <Section id="usecases" className="bg-neutral-50 dark:bg-neutral-900/40">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Cas d'usage</h2>
          <p className="mx-auto mt-3 max-w-2xl text-neutral-600 dark:text-white/70">
            Des applications concrètes pour des gains immédiats : relation client, services à la personne et efficacité interne.
          </p>
        </div>

        <div className="mx-auto mt-10 md:mt-12 max-w-6xl">
          {/* Indicators only (buttons removed) */}
          <div className="mb-4 flex items-center justify-center gap-2">
            {usecases.map((_, i) => (
              <span key={i} className={`h-1.5 w-6 rounded-full transition-colors ${i === carouselIndex ? 'bg-rose-600' : 'bg-neutral-300 dark:bg-white/20'}`} />
            ))}
          </div>

          {/* Carousel Track */}
          <div className="relative h-[520px] md:h-[560px] select-none" onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)} onWheel={onWheel} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            {/* Visual arrows as affordance (not buttons) */}
            <button type="button" onClick={prevSlide} aria-label="Slide précédent" className="absolute left-2 top-1/2 -translate-y-1/2 hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow ring-1 ring-neutral-200 hover:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 dark:bg-neutral-900/70 dark:ring-white/15">
              <ChevronLeft className="h-5 w-5 text-rose-600" aria-hidden="true" />
            </button>
            <button type="button" onClick={nextSlide} aria-label="Slide suivant" className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow ring-1 ring-neutral-200 hover:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 dark:bg-neutral-900/70 dark:ring-white/15">
              <ChevronRight className="h-5 w-5 text-rose-600" aria-hidden="true" />
            </button>
            {usecases.map((c, i) => {
              const total = usecases.length;
              const rel = (i - carouselIndex + total) % total; // 0=center, total-1=left, 1=right
              const isCenter = rel === 0;
              const isLeft = rel === total - 1;
              const isRight = rel === 1;

              // Target transforms for smooth animated swipe
              const targetX = isCenter ? 0 : isLeft ? -260 : isRight ? 260 : (rel < total / 2 ? -600 : 600);
              const targetScale = isCenter ? 1 : 0.95;
              const targetOpacity = isCenter ? 1 : 0.85;
              const targetZ = isCenter ? 20 : 10;

              return (
                <motion.div
                  key={i}
                  className="absolute left-1/2 top-0 -translate-x-1/2 mx-auto flex w-full max-w-md items-start justify-center"
                  style={{ zIndex: targetZ }}
                  initial={{ opacity: 0, x: targetX, scale: targetScale }}
                  animate={{ opacity: targetOpacity, x: targetX, scale: targetScale }}
                  transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                >
                  <div className="w-full max-w-sm rounded-3xl bg-white p-5 md:p-6 ring-1 ring-neutral-200/70 shadow-sm dark:bg-neutral-950 dark:ring-white/10">
                    <h3 className="text-lg font-semibold text-center">{c.title}</h3>
                    <p className="mt-1 text-center text-sm text-neutral-600 dark:text-white/70">{c.subtitle}</p>
                    <div className="mt-5 flex justify-center">
                      <PhoneFrame>
                        <PhoneScreen chat={c.chat} canStart={i === carouselIndex} onComplete={() => setCenterDone(true)} />
                      </PhoneFrame>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* RESULTS / KPI */}
      <Section id="results">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Des résultats mesurables</h2>
          <p className="mx-auto mt-3 max-w-2xl text-neutral-600 dark:text-white/70">
            Accélérez votre croissance avec des indicateurs clairs dès les premières semaines.
          </p>
        </div>
        <div className="mx-auto mt-10 md:mt-12 grid max-w-5xl grid-cols-2 gap-5 md:gap-6 md:grid-cols-4">
          {[
            { label: "Satisfaction client", value: 98, suffix: "%", hint: "↑ CSAT/NPS" },
            { label: "Coûts de support", value: -20, suffix: "%", hint: "↓ tickets humains" },
            { label: "Disponibilité", value: 24, suffix: "/7", hint: "Service continu" },
            { label: "Scalabilité", value: 10, suffix: "x", hint: "Connexion aux systèmes" },
          ].map((kpi, i) => (
            <div key={i} className="rounded-3xl border border-neutral-200/70 p-6 text-center dark:border-white/10">
              <div className="text-4xl font-extrabold text-rose-600 dark:text-rose-400">
                <CountUp end={kpi.value} suffix={kpi.suffix} />
              </div>
              <div className="mt-2 text-sm font-medium">{kpi.label}</div>
              <div className="text-xs text-neutral-500 dark:text-white/50">{kpi.hint}</div>
            </div>
          ))}
        </div>
      </Section>

      

      

      {/* CONTACT */}
      <Section id="contact" className="bg-neutral-50 dark:bg-neutral-900/40">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Parlons de votre projet</h2>
            <p className="mt-3 text-neutral-600 dark:text-white/70">
              Dites‑nous ce que vous voulez automatiser. Nous revenons vers vous avec un plan d'action
              et une démo ciblée.
            </p>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center gap-3 text-neutral-700 dark:text-white/80"><Phone className="h-4 w-4"/> +262 6 92 50 80 37</div>
              <div className="flex items-center gap-3 text-neutral-700 dark:text-white/80"><Mail className="h-4 w-4"/> contact@baiaconseil.re</div>
              <div className="pt-2">
                <Button as="a" href="https://wa.me/262692508037" target="_blank" rel="noreferrer">
                  <MessageCircle className="h-4 w-4"/> Discuter sur WhatsApp
                </Button>
              </div>
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="rounded-3xl border border-neutral-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-neutral-950">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs text-neutral-500">Prénom</label>
                <input className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none ring-rose-500/0 focus:ring-2 dark:border-white/15 dark:bg-neutral-900" placeholder="Votre prénom" />
              </div>
              <div>
                <label className="text-xs text-neutral-500">Nom</label>
                <input className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none ring-rose-500/0 focus:ring-2 dark:border-white/15 dark:bg-neutral-900" placeholder="Votre nom" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-neutral-500">Email</label>
                <input type="email" className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none ring-rose-500/0 focus:ring-2 dark:border-white/15 dark:bg-neutral-900" placeholder="votre@email.com" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-neutral-500">Société</label>
                <input className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none ring-rose-500/0 focus:ring-2 dark:border-white/15 dark:bg-neutral-900" placeholder="Nom de l'entreprise" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-neutral-500">Votre besoin</label>
                <textarea rows={5} className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none ring-rose-500/0 focus:ring-2 dark:border-white/15 dark:bg-neutral-900" placeholder="Expliquez votre projet en quelques lignes..." />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-neutral-500">En soumettant, vous acceptez notre politique de confidentialité.</p>
              <Button as="button" onClick={() => alert("Merci ! Nous vous contactons rapidement.")}>Envoyer <ArrowRight className="h-4 w-4"/></Button>
            </div>
          </form>
        </div>
      </Section>

      {/* FOOTER */}
      <footer className="border-t border-neutral-200/70 py-8 md:py-10 dark:border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <p className="text-sm text-neutral-600 dark:text-white/60">© {new Date().getFullYear()} BAIA CONSEIL — Tous droits réservés.</p>
          <div className="flex items-center gap-6 text-sm">
            <a href="#home" className="text-neutral-600 hover:text-neutral-900 dark:text-white/70 dark:hover:text-white">Mentions légales</a>
            <a href="#home" className="text-neutral-600 hover:text-neutral-900 dark:text-white/70 dark:hover:text-white">Politique de confidentialité</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
