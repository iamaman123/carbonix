import { motion } from "motion/react";

const testimonials = [
  {
    name: "Akshay Patel",
    role: "Renewable Energy Consultant",
    company: "Solar Power Solutions",
    content:
      "Sold 5,000 credits in the first month. The P2P model cuts out middlemen and I get paid instantly. Prices are fair.",
  },
  {
    name: "Neha Desai",
    role: "Operations Manager",
    company: "Manufacturing Firm",
    content:
      "Each listing gets multiple offers within hours. Good inventory management tool too — we track everything in one place.",
  },
  {
    name: "Rohan Sharma",
    role: "Freelance Trader",
    company: "Self-Employed",
    content:
      "Made this my side income. Credit prices are transparent and I can see project details before buying. No surprises.",
  },
  {
    name: "Priya Khanna",
    role: "ESG Manager",
    company: "Tech Company",
    content:
      "Good prices compared to traditional brokers. The receipts satisfy our auditors. We switched fully to Carbonix.",
  },
  {
    name: "Vikram Singh",
    role: "Wind Farm Owner",
    company: "Green Power Ltd",
    content:
      "Directly list our generated credits here. No agents, no delays. Settlement happens same day.",
  },
  {
    name: "Deepa Gupta",
    role: "Compliance Officer",
    company: "Carbon Consulting",
    content:
      "Every trade is documented. Audit trails are complete. Makes compliance reporting straightforward for our clients.",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="relative overflow-hidden border-t border-border/40 bg-background px-6 py-20">
      <div className="pointer-events-none absolute -left-14 top-14 h-52 w-52 rounded-full bg-brandMainColor/10 blur-3xl" />
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            What traders say
          </h2>
          <p className="mt-3 text-muted-foreground">
            Real feedback from people using the platform every day
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card/95 p-6 transition-all duration-300 hover:border-brandMainColor/30 hover:shadow-[0_18px_36px_-24px_rgba(92,179,56,0.58)]"
            >
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                &ldquo;{t.content}&rdquo;
              </p>
              <div className="border-t border-border/50 pt-4">
                <p className="text-sm font-semibold text-foreground">
                  {t.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t.role}, {t.company}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
