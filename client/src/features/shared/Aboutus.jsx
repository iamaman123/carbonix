import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  Leaf,
  ShieldCheck,
  Users,
  BarChart3,
  Globe2,
  ArrowRight,
  Building2,
  SunMedium,
  Zap,
} from "lucide-react";

// Using framer-motion variants for cleaner, reusable animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Integrity first",
    body: "Every credit on Carbonix is verified by a third-party registry before it's listed. We don't allow unverified or expired credits — ever.",
  },
  {
    icon: Users,
    title: "Direct access",
    body: "We cut out brokers entirely. Producers set their own prices. Buyers see the full picture. No hidden margins, no opaque intermediaries.",
  },
  {
    icon: Globe2,
    title: "India-rooted, globally aligned",
    body: "Built around India's CCTS framework and aligned with the UN Paris Agreement, Verra, Gold Standard, and ACR standards.",
  },
  {
    icon: BarChart3,
    title: "Transparent by design",
    body: "Live pricing, audit-ready retirement certificates, and ESG reports that meet SASB and TCFD requirements — all in one place.",
  },
];

const AboutUs = () => {
  return (
    <div className="relative min-h-screen bg-background pt-24 lg:pt-32 pb-16 overflow-hidden">
      
      {/* ── Background Ambient Glowing Orbs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-brandMainColor/10 blur-[100px]" />
        <div className="absolute top-[40%] right-0 h-[600px] w-[600px] -translate-y-1/2 translate-x-1/3 rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 left-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        
        {/* ── Hero Section ── */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative text-center pb-24"
        >
          <motion.div variants={itemVariants} className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-brandMainColor/30 bg-brandMainColor/10 px-5 py-2 backdrop-blur-md">
              <Leaf className="h-4 w-4 text-brandMainColor animate-pulse" />
              <span className="text-sm font-semibold uppercase tracking-widest text-brandMainColor">
                About Carbonix
              </span>
            </div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]"
          >
            We built the carbon market <br className="hidden md:block" />
            <span className="text-brandMainColor">
              India actually needed.
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-8 mx-auto max-w-2xl text-lg md:text-xl leading-relaxed text-muted-foreground"
          >
            Carbonix is a direct marketplace for verified carbon credits —
            connecting renewable energy producers with buyers across India and
            beyond, with <span className="text-foreground font-medium">no brokers</span>, <span className="text-foreground font-medium">no markups</span>, and <span className="text-foreground font-medium">no greenwashing.</span>
          </motion.p>
        </motion.section>

        {/* ── Mission Glass Panel ── */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-24"
        >
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-card/40 backdrop-blur-3xl shadow-2xl p-8 md:p-14">
            <div className="absolute inset-0 bg-gradient-to-br from-brandMainColor/5 to-transparent pointer-events-none" />
            
            <div className="relative z-10 max-w-4xl mx-auto flex flex-col md:flex-row gap-10 items-center">
              <div className="flex-1 space-y-6">
                <p className="text-sm font-bold uppercase tracking-widest text-brandMainColor">
                  Our Mission
                </p>
                <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                  Make carbon offsetting honest, accessible, and effective.
                </h2>
              </div>
              <div className="flex-1 space-y-5 text-muted-foreground leading-relaxed">
                <p>
                  India has pledged net-zero by 2070. The Paris Agreement demands
                  action now. But for years, the carbon credit market was dominated
                  by brokers, opaque pricing, and untraceable climate outcomes.
                </p>
                <p>
                  We built Carbonix to give renewable energy producers a direct
                  channel to sell their verified credits at fair prices. Buyers get
                  a marketplace they can trust, backed by recognised registries and
                  audit-ready certificates.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── How It Works ── */}
        <section className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
              Two sides, one shared goal
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* The Buyer */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/30 backdrop-blur-xl p-8 hover:bg-card/50 hover:shadow-2xl transition-all duration-300"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Building2 className="h-40 w-40 text-blue-500" />
              </div>
              <div className="relative z-10">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20 shadow-inner">
                  <Building2 className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">The Buyer</h3>
                <p className="text-sm font-medium text-blue-400 mb-6 uppercase tracking-wider">
                  MNCs & Corporations
                </p>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  Companies purchase verified carbon credits on Carbonix to offset inevitable emissions from operations. Every credit retired is a tonne of CO₂ neutralised, moving them steadily toward a net-zero footprint.
                </p>
                <div className="rounded-2xl bg-blue-500/5 border border-blue-500/20 p-5 backdrop-blur-md">
                  <p className="text-sm text-blue-400 font-semibold mb-1">The Outcome:</p>
                  <p className="text-sm text-muted-foreground">Audit-ready retirement certificates and ESG reporting without waiting years to fully decarbonise.</p>
                </div>
              </div>
            </motion.div>

            {/* The Seller */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/30 backdrop-blur-xl p-8 hover:bg-card/50 hover:shadow-2xl transition-all duration-300"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <SunMedium className="h-40 w-40 text-brandMainColor" />
              </div>
              <div className="relative z-10">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brandMainColor/20 to-emerald-600/10 border border-brandMainColor/20 shadow-inner">
                  <SunMedium className="h-6 w-6 text-brandMainColor" />
                </div>
                <h3 className="text-xl font-bold mb-2">The Seller</h3>
                <p className="text-sm font-medium text-brandMainColor mb-6 uppercase tracking-wider">
                  Renewable Energy Owners
                </p>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  Solar, wind, or biomass projects displace fossil fuels. That displacement is certified as a credit. Selling directly unlocks crucial funding without middlemen taking massive margins.
                </p>
                <div className="rounded-2xl bg-brandMainColor/5 border border-brandMainColor/20 p-5 backdrop-blur-md">
                  <p className="text-sm text-brandMainColor font-semibold mb-1">The Outcome:</p>
                  <p className="text-sm text-muted-foreground">Fair, direct financial support to maintain, scale, and accelerate global clean energy infrastructure.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Values Grid ── */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What we stand for</h2>
            <p className="text-muted-foreground">The principles driving our marketplace architecture.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-6">
            {VALUES.map((val, idx) => (
              <motion.div
                key={val.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="group flex gap-5 rounded-3xl border border-white/5 bg-gradient-to-br from-card/40 to-muted/10 p-6 backdrop-blur-sm hover:bg-card/60 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
              >
                <div className="shrink-0 h-12 w-12 rounded-full bg-brandMainColor/10 flex items-center justify-center border border-brandMainColor/20 group-hover:scale-110 group-hover:bg-brandMainColor/20 transition-all">
                  <val.icon className="h-6 w-6 text-brandMainColor" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-brandMainColor transition-colors">
                    {val.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {val.body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Standards CTA ── */}
        <section className="relative overflow-hidden rounded-[3rem] border border-brandMainColor/20 bg-brandMainColor/5 backdrop-blur-2xl px-6 py-16 md:py-24 text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-brandMainColor/10 via-transparent to-brandMainColor/10 mix-blend-overlay" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative z-10 max-w-3xl mx-auto"
          >
            <Zap className="mx-auto h-12 w-12 text-brandMainColor mb-6 animate-pulse" />
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Aligned with global standards.
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Built natively for India's CCTS, and fully compliant with Verra, Gold Standard, UN Paris Agreement Article 6, and ACR frameworks. Ready for your next ESG audit.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-brandMainColor px-8 py-4 text-base font-bold text-white shadow-[0_0_30px_-5px_rgba(92,179,56,0.5)] hover:-translate-y-1 hover:shadow-[0_0_40px_-5px_rgba(92,179,56,0.7)] transition-all duration-300"
              >
                Create your account <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/marketplace"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border-2 border-brandMainColor/30 bg-background/50 backdrop-blur-md px-8 py-4 text-base font-bold text-foreground hover:border-brandMainColor hover:bg-brandMainColor/10 transition-all duration-300"
              >
                Explore Marketplace
              </Link>
            </div>
          </motion.div>
        </section>

      </div>
    </div>
  );
};

export default AboutUs;
