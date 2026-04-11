import { motion } from "motion/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { ExternalLink } from "lucide-react";

// Source: IEA / Global Carbon Project — real published data
const emissionsData = [
  { year: "2015", gt: 36.3 },
  { year: "2016", gt: 36.4 },
  { year: "2017", gt: 36.8 },
  { year: "2018", gt: 37.1 },
  { year: "2019", gt: 37.0 },
  { year: "2020", gt: 34.8 },
  { year: "2021", gt: 36.7 },
  { year: "2022", gt: 37.5 },
  { year: "2023", gt: 37.4 },
  { year: "2024", gt: 37.8 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-lg text-sm">
        <p className="font-semibold text-foreground">{label}</p>
        <p className="text-brandMainColor">{payload[0].value} Gt CO₂</p>
      </div>
    );
  }
  return null;
};

const keyPoints = [
  {
    value: "37.8 Gt",
    label: "Global CO₂ in 2024",
    note: "Near all-time high — IEA, 2024",
    url: "https://www.iea.org/reports/co2-emissions-in-2024",
  },
  {
    value: "−5.4%",
    label: "2020 COVID dip",
    note: "Fully reversed by 2021",
    url: null,
  },
  {
    value: "$120B",
    label: "VCM projected by 2030",
    note: "Mordor Intelligence, 2025",
    url: "https://www.mordorintelligence.com/industry-reports/voluntary-carbon-credit-market",
  },
];

const StatsSection = () => {
  return (
    <section className="relative overflow-hidden border-t border-border/40 bg-muted/30 px-6 py-12 md:py-16">
      <div className="pointer-events-none absolute right-[-8rem] top-8 h-64 w-64 rounded-full bg-brandMainColor/10 blur-3xl" />
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Global CO₂ emissions, 2015–2024
          </h2>
          <p className="mt-2 text-muted-foreground max-w-xl">
            Emissions rebounded sharply after 2020 and remain near record highs
            — the urgency for verified carbon offsetting has never been greater.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:items-start">
          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55 }}
            className="lg:col-span-2"
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={emissionsData}
                  margin={{ top: 5, right: 16, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="currentColor"
                    className="opacity-[0.07]"
                  />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 12, fill: "currentColor" }}
                    className="text-muted-foreground"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "currentColor" }}
                    className="text-muted-foreground"
                    domain={[33, 39]}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}`}
                    width={32}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine
                    y={34.8}
                    stroke="#5CB338"
                    strokeDasharray="4 4"
                    strokeOpacity={0.4}
                    label={{
                      value: "2020 dip",
                      position: "insideTopLeft",
                      fontSize: 10,
                      fill: "#5CB338",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="gt"
                    stroke="#5CB338"
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: "#5CB338", strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "#5CB338" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-xs text-muted-foreground/60 text-center">
              Billion metric tons (Gt) CO₂ equivalent ·{" "}
              <a
                href="https://www.iea.org/reports/co2-emissions-in-2024"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-brandMainColor transition-colors"
              >
                Source: IEA CO₂ Emissions Report 2024
              </a>
            </p>
          </motion.div>

          {/* Key points */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="flex flex-col justify-start gap-6 pt-2"
          >
            {keyPoints.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: i * 0.07 }}
                whileHover={{ x: 4 }}
                className="border-l-2 border-brandMainColor/40 pl-4"
              >
                <p className="text-xl font-bold text-foreground">
                  {item.value}
                </p>
                <p className="text-sm font-medium text-foreground/80">
                  {item.label}
                </p>
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground/50 hover:text-brandMainColor transition-colors mt-0.5"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {item.note}
                  </a>
                ) : (
                  <p className="text-xs text-muted-foreground/50 mt-0.5">
                    {item.note}
                  </p>
                )}
              </motion.div>
            ))}

            <div className="mt-2 rounded-xl border border-brandMainColor/20 bg-brandMainColor/5 p-4">
              <p className="text-xs font-semibold text-brandMainColor mb-1">
                Paris Agreement Goal
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Limit warming to{" "}
                <span className="font-semibold text-foreground">1.5°C</span>{" "}
                above pre-industrial levels. Requires net-zero emissions by
                mid-century.
              </p>
              <a
                href="https://www.un.org/climatechange/paris-agreement"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-[11px] text-muted-foreground/50 hover:text-brandMainColor transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                UNFCCC — Paris Agreement
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
