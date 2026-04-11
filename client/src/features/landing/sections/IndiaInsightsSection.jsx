import { motion } from "motion/react";
import { ExternalLink } from "lucide-react";

const insights = [
  {
    tag: "Government of India",
    tagColor:
      "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800/40 dark:text-orange-400",
    headline: "India's Carbon Credit Trading Scheme (CCTS), 2023",
    body: "The Ministry of Power notified the CCTS on 28 June 2023 under the Energy Conservation (Amendment) Act, 2022. Managed by the Bureau of Energy Efficiency (BEE), it covers nine energy-intensive sectors and is set to launch compliance trading by 2025–26.",
    cite: "Ministry of Power, Gazette of India — IEA Policy Database",
    url: "https://www.iea.org/policies/25639-carbon-credit-trading-scheme-2023",
  },
  {
    tag: "UN Paris Agreement",
    tagColor:
      "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800/40 dark:text-blue-400",
    headline: "India's NDC: 45% carbon intensity cut by 2030",
    body: "Under the Paris Agreement, India committed to reducing the emissions intensity of its GDP by 45% from 2005 levels by 2030, achieving 500 GW of non-fossil energy capacity, and meeting 50% of energy needs from renewables.",
    cite: "Tribune India / Govt. of India NDC",
    url: "https://www.tribuneindia.com/news/haryana/india-targets-500-gw-renewable-energy-capacity-by-2030-vij/",
  },
  {
    tag: "Ministry of Power, PIB",
    tagColor:
      "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/40 dark:text-emerald-400",
    headline: "Renewables now 50% of India's installed power capacity",
    body: "India reached 262.74 GW of non-fossil power capacity in November 2025 — 51.5% of total installed capacity of 509.64 GW. India is now the world's 3rd largest solar energy producer, surpassing Japan.",
    cite: "Press Information Bureau, Ministry of Power — Nov 2025",
    url: "https://www.pib.gov.in/PressReleseDetailm.aspx?PRID=2209478",
  },
  {
    tag: "Net Zero 2070",
    tagColor:
      "text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800/40 dark:text-purple-400",
    headline: "India's net-zero commitment by 2070",
    body: "Announced at COP26 in Glasgow, India pledged to achieve net-zero carbon emissions by 2070. The voluntary carbon market is a critical mechanism to bridge the gap between current emissions and the net-zero target.",
    cite: "Govt. of India COP26 Pledge / Economic Times",
    url: "https://government.economictimes.indiatimes.com/news/governance/india-aims-for-500-gw-of-renewable-energy-by-2030-finance-minister-sitharaman/128374712",
  },
  {
    tag: "Invest India",
    tagColor:
      "text-teal-600 bg-teal-50 border-teal-200 dark:bg-teal-950/30 dark:border-teal-800/40 dark:text-teal-400",
    headline: "India: 2nd largest source of carbon offsets globally",
    body: "India is the world's second largest source of carbon offsets in the voluntary market, with over 1,300 registered projects across Verra, Gold Standard, CDM, and Universal Carbon Registry.",
    cite: "Invest India / CarbonHQ Developer Overview 2024",
    url: "https://www.investindia.gov.in/blogs/indias-carbon-market-revolution-balancing-economic-growth-climate-responsibility",
  },
  {
    tag: "Paris Agreement, Art. 6",
    tagColor:
      "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800/40 dark:text-blue-400",
    headline: "Article 6: International carbon market cooperation",
    body: "The Paris Agreement's Article 6 enables countries to cooperate through carbon markets to achieve their NDCs. India's CCTS is designed to align with Article 6 mechanisms, enabling cross-border credit trading.",
    cite: "UNFCCC Paris Agreement, Article 6",
    url: "https://www.un.org/climatechange/paris-agreement",
  },
];

function IndiaInsightsSection() {
  return (
    <section className="relative overflow-hidden border-t border-border/40 bg-background px-6 py-12 md:py-16">
      <div className="pointer-events-none absolute -left-16 top-24 h-56 w-56 rounded-full bg-brandMainColor/10 blur-3xl" />
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            India's climate mandate &amp; global alignment
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Carbonix is built to support India's national carbon market goals
            and the commitments made under the UN Paris Agreement. Every trade
            on our platform contributes to verified, measurable climate action.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {insights.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className="group flex flex-col gap-3 rounded-2xl border border-border bg-card/95 p-6 transition-all duration-300 hover:border-brandMainColor/30 hover:shadow-[0_18px_36px_-24px_rgba(92,179,56,0.6)]"
            >
              <span
                className={`self-start rounded-full border px-3 py-1 text-[11px] font-semibold ${item.tagColor}`}
              >
                {item.tag}
              </span>
              <h3 className="text-sm font-semibold text-foreground leading-snug">
                {item.headline}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                {item.body}
              </p>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground/50 hover:text-brandMainColor transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                {item.cite}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default IndiaInsightsSection;
