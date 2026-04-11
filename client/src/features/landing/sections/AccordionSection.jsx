import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { motion } from "motion/react";

const faqs = [
  {
    question: "What types of credits can I trade?",
    answer:
      "We accept Verra (VCS), Gold Standard, and ACR certified credits from renewable energy projects — solar, wind, hydro, methane avoidance, and energy efficiency. All credits are independently verified before listing.",
  },
  {
    question: "How is Carbonix aligned with India's CCTS?",
    answer:
      "India's Carbon Credit Trading Scheme (CCTS), notified by the Ministry of Power in June 2023, establishes a framework for trading carbon credit certificates. Carbonix operates as a voluntary market platform that complements the CCTS, enabling entities to trade verified credits ahead of the compliance mechanism's full launch in 2025–26.",
  },
  {
    question: "How does pricing work?",
    answer:
      "Pricing is peer-to-peer. Sellers set their own prices based on market demand. You can see live price history for each project type and make competitive offers as a buyer. No hidden commissions.",
  },
  {
    question: "How long does a trade take?",
    answer:
      "Most trades settle within 24–48 hours. You list credits, buyers make offers or take your asking price, and payment is processed through your chosen method. Certificates are issued immediately upon settlement.",
  },
  {
    question: "Can I sell credits from my own renewable energy project?",
    answer:
      "Yes. If you own or operate a renewable energy project with valid Verra, Gold Standard, or ACR certification, you can list credits directly. We verify your documentation before your first listing goes live.",
  },
  {
    question: "What payment methods are supported?",
    answer:
      "We support bank transfer, UPI, card, and crypto. UPI and crypto settle same-day; bank transfers take 1–2 business days.",
  },
  {
    question: "How does Carbonix support India's net-zero 2070 goal?",
    answer:
      "India committed to net-zero emissions by 2070 at COP26. The voluntary carbon market is a key mechanism to bridge the gap between current emissions and that target. Every trade on Carbonix funds verified renewable energy projects that directly reduce India's carbon intensity — aligned with the NDC target of a 45% reduction from 2005 levels by 2030.",
  },
];

const AccordionSection = () => {
  return (
    <section className="relative overflow-hidden border-t border-border/40 bg-muted/30 px-6 py-12 md:py-16">
      <div className="pointer-events-none absolute right-[-6rem] top-10 h-52 w-52 rounded-full bg-brandMainColor/10 blur-3xl" />
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Frequently asked questions
          </h2>
          <p className="mt-3 text-muted-foreground">
            Everything you need to know before your first trade
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="flex flex-col gap-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                whileHover={{ y: -2 }}
              >
                <AccordionItem
                  value={`item-${i}`}
                  className="overflow-hidden rounded-2xl border border-border bg-background/50 px-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-brandMainColor/30 hover:shadow-md data-[state=open]:border-brandMainColor/50 data-[state=open]:bg-brandMainColor/5 data-[state=open]:shadow-lg"
                >
                  <AccordionTrigger className="text-[15.5px] font-semibold tracking-tight text-foreground/90 hover:text-brandMainColor hover:no-underline py-5 text-left transition-colors data-[state=open]:text-brandMainColor">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-[15px] text-muted-foreground leading-relaxed pb-6 pt-1">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default AccordionSection;
