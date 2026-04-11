import { Marquee } from "@/components/animations/marquee";
import { motion } from "motion/react";

// All data sourced from cited authoritative sources
const facts = [
  {
    stat: "$15.83B",
    label: "Global voluntary carbon market in 2025",
    sub: "Projected to reach $120B by 2030",
    cite: "Mordor Intelligence, 2025",
    citeUrl:
      "https://www.mordorintelligence.com/industry-reports/voluntary-carbon-credit-market",
  },
  {
    stat: "234 GW",
    label: "India's renewable energy capacity",
    sub: "50% of total installed power — ahead of 2030 target",
    cite: "Ministry of Power, PIB 2025",
    citeUrl:
      "https://www.pib.gov.in/PressNoteDetails.aspx?ModuleId=3&NoteId=155063",
  },
  {
    stat: "500 GW",
    label: "India's non-fossil energy target by 2030",
    sub: "Committed at COP26, aligned with Paris Agreement NDC",
    cite: "WRI India / Govt. of India",
    citeUrl:
      "https://wri-india.org/blogs/cop26-unpacking-indias-major-new-climate-targets",
  },
  {
    stat: "1,300+",
    label: "Carbon credit projects in India",
    sub: "India leads globally in voluntary carbon project count",
    cite: "CarbonHQ / Energy Institute, 2024",
    citeUrl:
      "https://carbonhq.earth/insights/voluntary-carbon-market-developer-overview-2024-2025",
  },
  {
    stat: "₹4.17B",
    label: "India carbon credit market in 2025",
    sub: "Expected to reach $48.24B by 2032 at 41% CAGR",
    cite: "Coherent Market Insights, 2025",
    citeUrl:
      "https://www.coherentmarketinsights.com/industry-reports/india-carbon-credit-market",
  },
  {
    stat: "45%",
    label: "India's carbon intensity reduction target by 2030",
    sub: "From 2005 levels — India's NDC under Paris Agreement",
    cite: "Govt. of India NDC / Tribune India",
    citeUrl:
      "https://www.tribuneindia.com/news/haryana/india-targets-500-gw-renewable-energy-capacity-by-2030-vij/",
  },
];

const FactCard = ({ stat, label, sub, cite, citeUrl }) => (
  <motion.div
    whileHover={{ y: -6, scale: 1.01 }}
    transition={{ type: "spring", stiffness: 260, damping: 20 }}
    className="mx-3 flex w-72 flex-col gap-2 rounded-2xl border border-border bg-card/95 px-6 py-5 shadow-sm transition-all duration-300 hover:border-brandMainColor/35 hover:shadow-[0_18px_40px_-26px_rgba(92,179,56,0.65)]"
  >
    <span className="text-2xl font-bold text-brandMainColor">{stat}</span>
    <span className="text-sm font-semibold text-foreground leading-snug">
      {label}
    </span>
    <span className="text-xs text-muted-foreground leading-relaxed">{sub}</span>
    <a
      href={citeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-1 text-[10px] text-muted-foreground/50 hover:text-brandMainColor transition-colors underline underline-offset-2"
    >
      Source: {cite}
    </a>
  </motion.div>
);

function FactSection() {
  return (
    <section className="relative overflow-hidden border-t border-border/40 bg-muted/30 py-12 md:py-16">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-brandMainColor/10 blur-3xl" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center px-6"
      >
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          The market opportunity
        </h2>
        <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
          Real data from government bodies, UN agencies, and market research
          firms
        </p>
      </motion.div>

      <div className="relative">
        <Marquee pauseOnHover className="[--duration:35s]">
          {facts.map((f, i) => (
            <FactCard key={i} {...f} />
          ))}
        </Marquee>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-background" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-background" />
      </div>
    </section>
  );
}

export default FactSection;
