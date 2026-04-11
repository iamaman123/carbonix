import AccordionSection from "./sections/AccordionSection";
import FactSection from "./sections/FactSection";
import FeatureSection from "./sections/FeatureSection";
import GlobeSection from "./sections/GlobeSection";
import StatsSection from "./sections/StatsSection";
import HowItWorksSection from "./sections/HowItWorksSection";
import ImpactSection from "./sections/ImpactSection";
import IndiaInsightsSection from "./sections/IndiaInsightsSection";
import GeminiChatbot from "@/components/common/GeminiChatbot";

const LandingPage = () => {
  return (
    <main className="w-full overflow-x-hidden">
      <GlobeSection />
      <FactSection />
      <IndiaInsightsSection />
      <StatsSection />
      <FeatureSection />
      <HowItWorksSection />
      <ImpactSection />
      <AccordionSection />
      <GeminiChatbot />
    </main>
  );
};

export default LandingPage;
