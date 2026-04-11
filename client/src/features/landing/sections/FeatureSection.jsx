import {
  ShieldCheck,
  Leaf,
  DollarSign,
  BarChart2,
  MapPin,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";

const features = [
  {
    icon: ShieldCheck,
    title: "Verified credits only",
    description:
      "We accept Verra (VCS), Gold Standard, and ACR certified projects. No unverified credits ever reach the marketplace.",
  },
  {
    icon: Leaf,
    title: "Aligned with India's CCTS",
    description:
      "Our platform supports India's Carbon Credit Trading Scheme (2023) and helps entities meet BEE-mandated emission intensity targets.",
  },
  {
    icon: DollarSign,
    title: "Direct P2P pricing",
    description:
      "Sellers set prices, buyers make offers. No broker in the middle means 20–40% better value for both sides.",
  },
  {
    icon: BarChart2,
    title: "Live market data",
    description:
      "Real-time price feeds by project type. Know exactly what the market is doing before you place an order.",
  },
  {
    icon: MapPin,
    title: "Project directory",
    description:
      "Browse renewable energy projects by type, location, and verified impact metrics before committing capital.",
  },
  {
    icon: Zap,
    title: "Same-day settlement",
    description:
      "UPI and crypto settle the same day. Bank transfers within 1–2 business days. No waiting weeks.",
  },
];

const FeatureSection = () => {
  return (
    <section className="relative overflow-hidden border-t border-border/40 bg-background px-6 py-12 md:py-16">
      <div className="pointer-events-none absolute right-[-7rem] top-16 h-56 w-56 rounded-full bg-brandMainColor/10 blur-3xl" />
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Built for serious traders
          </h2>
          <p className="mt-3 text-muted-foreground max-w-lg">
            Everything you need to trade carbon credits with confidence —
            nothing you don't.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-px bg-border/50 sm:grid-cols-2 lg:grid-cols-3 rounded-2xl overflow-hidden border border-border">
          {features.map(({ icon: Icon, title, description }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="group flex flex-col gap-4 bg-card/95 p-8 transition-all duration-300 hover:bg-brandMainColor/5 hover:shadow-[0_18px_36px_-24px_rgba(92,179,56,0.6)]"
            >
              <div className="w-10 h-10 rounded-xl bg-brandMainColor/10 flex items-center justify-center transition-colors group-hover:bg-brandMainColor/20">
                <Icon className="w-5 h-5 text-brandMainColor" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
