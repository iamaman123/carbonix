import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Mail, MessageCircle } from "lucide-react";

const ContactUs = () => {
  return (
    <div className="bg-gradient-to-br from-background via-brandMainColor/5 to-emerald-500/5 dark:via-brandSubColor/5 dark:to-lime-400/5 min-h-screen relative font-sans pt-24 pb-16 flex flex-col overflow-hidden">
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] bg-[size:20px_20px]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brandMainColor/10 dark:bg-brandSubColor/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 dark:bg-lime-400/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 mx-auto w-full max-w-2xl flex-1 px-6 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-brandMainColor dark:text-brandSubColor mb-2">
            Contact
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Get in touch with Carbonix
          </h1>
          <p className="mt-4 text-muted-foreground text-base leading-relaxed">
            Questions about listings, purchases, or the marketplace? Use the Carbonix assistant on any
            page for instant help, or reach out through your account after you sign in.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-brandMainColor dark:text-brandSubColor" />
                Carbonix assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Open the chat bubble in the corner — it can explain carbon credits, how trading works,
              and how to use the platform.
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5 text-brandMainColor dark:text-brandSubColor" />
                Signed-in users
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              For order-specific or account issues, sign in with Google and use your dashboard and
              transaction history — that keeps support tied to your activity on Carbonix.
                    </CardContent>
                  </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactUs;
