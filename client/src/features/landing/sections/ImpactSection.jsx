import { NumberTicker } from "@/components/magicui/number-ticker";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

const stats = [
  {
    value: 500000,
    suffix: "+",
    label: "Credits traded",
    sub: "Tons CO₂ equivalent",
  },
  {
    value: 8500,
    suffix: "+",
    label: "Active traders",
    sub: "Buyers and sellers",
  },
  {
    value: 12,
    suffix: "+",
    label: "Projects listed",
    sub: "Verified renewable",
  },
  {
    value: 99,
    suffix: "%",
    label: "Verification rate",
    sub: "Independently certified",
  },
];

const ImpactSection = () => {
  return (
    <section className="relative overflow-hidden border-t border-border/40 bg-background px-6 py-12 md:py-16">
      <div className="pointer-events-none absolute right-[-6rem] top-10 h-52 w-52 rounded-full bg-brandMainColor/10 blur-3xl" />
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Platform at a glance
          </h2>
          <p className="mt-3 text-muted-foreground">
            Real numbers from active trading on Carbonix
          </p>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="rounded-xl p-2 transition-all duration-300 hover:bg-brandMainColor/5"
            >
              <div className="flex items-baseline gap-0.5">
                <NumberTicker
                  value={s.value}
                  className="text-4xl font-bold text-foreground"
                />
                <span className="text-3xl font-bold text-brandMainColor">
                  {s.suffix}
                </span>
              </div>
              <p className="text-sm font-medium text-foreground/80">
                {s.label}
              </p>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-16 flex flex-col items-start gap-4 rounded-2xl border border-brandMainColor/20 bg-gradient-to-r from-brandMainColor/10 via-brandMainColor/5 to-background p-8 shadow-[0_14px_32px_-24px_rgba(92,179,56,0.7)] sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Ready to start trading?
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Join thousands of traders already contributing to India's net-zero
              journey.
            </p>
          </div>
          <Link
            to="/login"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brandMainColor px-7 py-3 text-sm font-semibold text-white transition-all hover:bg-brandMainColor/90"
          >
            Create free account <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ImpactSection;
