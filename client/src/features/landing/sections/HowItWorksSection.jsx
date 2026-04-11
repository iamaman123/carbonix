import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

const steps = [
  {
    number: "01",
    title: "Create an account",
    description:
      "Sign up in under 2 minutes. Complete KYC verification to unlock trading.",
  },
  {
    number: "02",
    title: "Browse the marketplace",
    description:
      "Filter listings by project type, certification standard, price, and location.",
  },
  {
    number: "03",
    title: "Buy or list credits",
    description:
      "Accept a listing price or make an offer. Sellers can list credits in minutes.",
  },
  {
    number: "04",
    title: "Track your portfolio",
    description:
      "View transaction history, certificates, and portfolio value in one dashboard.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="relative overflow-hidden border-t border-border/40 bg-muted/30 px-6 py-12 md:py-16">
      <div className="pointer-events-none absolute left-[-6rem] top-20 h-52 w-52 rounded-full bg-brandMainColor/10 blur-3xl" />
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              From sign-up to first trade
              <br />
              in four steps
            </h2>
            <p className="mt-4 text-muted-foreground max-w-md">
              No complex onboarding. No hidden steps. Just a straightforward
              path to trading verified carbon credits.
            </p>
            <Link
              to="/login"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-brandMainColor px-7 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_-16px_rgba(92,179,56,0.7)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-brandMainColor/90 hover:shadow-[0_16px_32px_-18px_rgba(92,179,56,0.8)]"
            >
              Get started free <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Right — steps */}
          <div className="flex flex-col gap-0">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                whileHover={{ x: 4 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex gap-6 group"
              >
                {/* Line + number */}
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-brandMainColor/25 bg-brandMainColor/5 text-sm font-bold text-brandMainColor group-hover:border-brandMainColor group-hover:bg-brandMainColor/10 transition-all">
                    {step.number}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="mt-1 w-px flex-1 bg-border min-h-[2.5rem]" />
                  )}
                </div>

                {/* Content */}
                <div className="pb-8">
                  <h3 className="font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
