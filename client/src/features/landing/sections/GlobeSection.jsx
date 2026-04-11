import { Globe } from "@/components/animations/globe";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "@/context/AuthContext";

// phi ≈ 1.35 rad puts India (~77°E) roughly centered on the right hemisphere
// theta tilts the view slightly north to frame the subcontinent nicely
const INDIA_GLOBE_CONFIG = {
  phi: 1.35,
  theta: 0.28,
  rotationSpeed: 0.004,
  dark: 0,
  diffuse: 0.45,
  mapSamples: 20000,
  mapBrightness: 1.3,
  baseColor: [0.88, 0.96, 0.88],
  markerColor: [92 / 255, 179 / 255, 56 / 255],
  glowColor: [0.88, 0.97, 0.88],
  markers: [
    // --- India: major renewable energy & carbon credit hubs ---
    { location: [28.6139, 77.209], size: 0.1 }, // New Delhi (policy hub)
    { location: [19.076, 72.8777], size: 0.11 }, // Mumbai (financial hub)
    { location: [12.9716, 77.5946], size: 0.095 }, // Bengaluru (tech/green startups)
    { location: [13.0827, 80.2707], size: 0.085 }, // Chennai (solar corridor)
    { location: [22.5726, 88.3639], size: 0.082 }, // Kolkata
    { location: [23.0225, 72.5714], size: 0.08 }, // Ahmedabad (solar/wind)
    { location: [26.9124, 75.7873], size: 0.075 }, // Jaipur (Rajasthan solar)
    { location: [17.385, 78.4867], size: 0.085 }, // Hyderabad
    { location: [18.5204, 73.8567], size: 0.072 }, // Pune
    { location: [8.5241, 76.9366], size: 0.065 }, // Thiruvananthapuram (wind/solar)
    { location: [21.1458, 79.0882], size: 0.065 }, // Nagpur (central India)
    { location: [25.5941, 85.1376], size: 0.06 }, // Patna
    // --- Global carbon credit registry & partner cities ---
    { location: [51.5074, -0.1278], size: 0.07 }, // London (Gold Standard HQ)
    { location: [47.3769, 8.5417], size: 0.065 }, // Zurich (Verra / Gold Standard)
    { location: [40.7128, -74.006], size: 0.075 }, // New York (ACR / voluntary markets)
    { location: [35.6762, 139.6503], size: 0.065 }, // Tokyo (Article 6 partner)
    { location: [1.3521, 103.8198], size: 0.06 }, // Singapore (Asia carbon exchange)
    { location: [25.2048, 55.2708], size: 0.06 }, // Dubai (COP28 host)
  ],
};

function GlobeSection() {
  const { user } = useAuth();

  const startTradingPath = !user
    ? "/login"
    : user.role === "PRODUCER"
      ? "/form"
      : user.role === "CONSUMER"
        ? "/marketplace"
        : user.role === "admin"
          ? "/admin"
          : "/profile";

  const ctaLabel = !user
    ? "Get Started"
    : user.role === "PRODUCER"
      ? "List Your Credits"
      : user.role === "CONSUMER"
        ? "Browse Carbon Credits"
        : "Go to Dashboard";

  return (
    <section className="relative flex min-h-screen flex-col justify-start overflow-hidden bg-background">
      {/* Radial fade at center so globe shows through */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_60%,transparent_40%,hsl(var(--background))_100%)]" />

      {/* Hero text */}
      <div className="relative z-20 mx-auto flex w-full max-w-6xl flex-col items-center px-6 pt-28 pb-0 text-center lg:items-start lg:pl-8 lg:text-left">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-brandMainColor/30 bg-brandMainColor/8 px-4 py-1.5"
        >
          <Leaf className="w-3.5 h-3.5 text-brandMainColor" />
          <span className="text-xs font-semibold uppercase tracking-widest text-brandMainColor">
            Carbon Credit Trading Platform
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-6xl lg:text-6xl xl:text-7xl"
        >
          Your Way to
          <br />
          <span className="whitespace-nowrap text-brandMainColor">
            Zero Net Carbon
          </span>
          <br />
          Emissions
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed"
        >
          Carbonix connects renewable energy producers with buyers directly —
          no brokers, no markups. Trade verified carbon credits aligned with
          India's 2070 net-zero goal and the UN Paris Agreement.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4 lg:justify-start"
        >
          <Link
            to={startTradingPath}
            className="group relative inline-flex items-center gap-2 rounded-full bg-brandMainColor px-8 py-3.5 text-sm font-semibold text-white shadow-[0_10px_28px_-12px_rgba(92,179,56,0.7)] ring-1 ring-brandMainColor/40 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brandMainColor/90 hover:shadow-[0_16px_34px_-14px_rgba(92,179,56,0.85)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandMainColor focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-0"
          >
            <span>{ctaLabel}</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link
            to="/about"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-8 py-3.5 text-sm font-semibold text-foreground backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brandMainColor/60 hover:bg-brandMainColor/10 hover:text-brandMainColor focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandMainColor/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-0"
          >
            Learn More
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-7 flex max-w-3xl flex-wrap items-center justify-center gap-2 lg:justify-start"
        >
          <span className="mr-1 rounded-full border border-brandMainColor/30 bg-brandMainColor/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-brandMainColor sm:text-xs">
            Aligned with
          </span>
          <span className="rounded-xl border border-brandMainColor/30 bg-gradient-to-b from-brandMainColor/16 to-background/90 px-3.5 py-1.5 text-[11px] font-medium tracking-wide text-foreground shadow-[0_10px_24px_-18px_rgba(92,179,56,0.65)] backdrop-blur-sm sm:text-xs">
            UN Paris Agreement
          </span>
          <span className="rounded-xl border border-border bg-background/85 px-3.5 py-1.5 text-[11px] font-medium tracking-wide text-foreground/85 shadow-[0_8px_18px_-16px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:text-xs">
            India CCTS 2023
          </span>
          <span className="rounded-xl border border-border bg-background/85 px-3.5 py-1.5 text-[11px] font-medium tracking-wide text-foreground/85 shadow-[0_8px_18px_-16px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:text-xs">
            Verra
          </span>
          <span className="rounded-xl border border-border bg-background/85 px-3.5 py-1.5 text-[11px] font-medium tracking-wide text-foreground/85 shadow-[0_8px_18px_-16px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:text-xs">
            Gold Standard
          </span>
          <span className="rounded-xl border border-border bg-background/85 px-3.5 py-1.5 text-[11px] font-medium tracking-wide text-foreground/85 shadow-[0_8px_18px_-16px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:text-xs">
            ACR
          </span>
        </motion.div>
      </div>

      {/* Globe — positioned to bleed below hero text */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="pointer-events-none absolute right-[-18%] top-[15%] z-10 w-[620px] max-w-none opacity-55 sm:right-[-13%] sm:w-[740px] lg:right-[-9%] lg:top-[10%] lg:w-[840px] xl:right-[-7%]"
      >
        <Globe
          className="max-w-[650px] opacity-90 sm:max-w-[780px] lg:max-w-[880px]"
          config={INDIA_GLOBE_CONFIG}
        />
      </motion.div>
    </section>
  );
}

export default GlobeSection;
