import { Github, Twitter, Linkedin, Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Logo from "./Logo";

export default function Footer() {
  const location = useLocation();
  
  // Hide the footer on web-app specific paths to maintain an immersive dashboard experience
  const hideFooterPaths = [
    "/dashboard",
    "/admin",
    "/marketplace",
    "/market",
    "/eco-marketplace",
    "/listings",
    "/form",
    "/payment",
    "/transaction",
    "/buyer-analytics",
    "/seller-analytics",
    "/market-insights",
    "/profile",
    "/receipt",
    "/login",
    "/register",
    "/verify-otp",
    "/forgot-password",
    "/reset-password"
  ];

  const shouldHideFooter = hideFooterPaths.some(path => location.pathname.startsWith(path));

  if (shouldHideFooter) return null;

  return (
    <footer className="relative mt-8 border-t border-border bg-muted/50 dark:bg-muted/20 pt-16 pb-8">
      {/* Subtle decorative glow to help separation */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-brandMainColor/30 to-transparent" />
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 gap-12 xl:grid-cols-4 lg:gap-8">
          
          {/* Column 1 - Brand & Mission */}
          <div className="flex flex-col gap-6 xl:col-span-2">
            <Link to="/" className="inline-flex flex-shrink-0 transition-transform hover:scale-[1.02] items-center">
              <Logo />
            </Link>
            <p className="max-w-md text-[15px] text-muted-foreground leading-relaxed">
              Carbonix makes trading voluntary carbon credits transparent, simple, and direct. Join us in funding verified renewable energy projects to drive the transition to a net-zero future.
            </p>
            <div className="flex space-x-5 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground/70 hover:text-foreground transition-all duration-300 hover:-translate-y-1"
              >
                <span className="sr-only">GitHub</span>
                <Github size={22} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground/70 hover:text-[#1DA1F2] transition-all duration-300 hover:-translate-y-1"
              >
                <span className="sr-only">Twitter</span>
                <Twitter size={22} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground/70 hover:text-[#0A66C2] transition-all duration-300 hover:-translate-y-1"
              >
                <span className="sr-only">LinkedIn</span>
                <Linkedin size={22} />
              </a>
            </div>
          </div>

          {/* Column 2 - Links */}
          <div className="flex flex-col gap-6">
            <h3 className="text-sm font-semibold tracking-wider text-foreground uppercase">Navigation</h3>
            <ul className="space-y-3.5">
              {[
                { name: "About Us", path: "/about" },
                { name: "Marketplace", path: "/marketplace" },
                { name: "Carbon Calculator", path: "/calculator" },
                { name: "Insights & Blog", path: "/blog" },
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="group inline-flex items-center text-[15px] font-medium text-muted-foreground hover:text-brandMainColor transition-colors"
                  >
                    <ArrowRight className="mr-2 h-3.5 w-3.5 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                    <span className="transition-transform group-hover:translate-x-1">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Contact */}
          <div className="flex flex-col gap-6">
            <h3 className="text-sm font-semibold tracking-wider text-foreground uppercase">Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex group items-start gap-3 text-muted-foreground transition-colors hover:text-foreground">
                <Mail className="mt-0.5 h-5 w-5 text-brandMainColor/70 group-hover:text-brandMainColor transition-colors" />
                <a href="mailto:support@example.com" className="text-[15px]">support@example.com</a>
              </li>
              <li className="flex group items-start gap-3 text-muted-foreground transition-colors hover:text-foreground">
                <Phone className="mt-0.5 h-5 w-5 text-brandMainColor/70 group-hover:text-brandMainColor transition-colors" />
                <span className="text-[15px]">+91 8938-2567-890</span>
              </li>
              <li className="flex group items-start gap-3 text-muted-foreground transition-colors hover:text-foreground">
                <MapPin className="mt-0.5 h-5 w-5 text-brandMainColor/70 group-hover:text-brandMainColor transition-colors" />
                <span className="text-[15px] leading-snug">Level 4, Greentech Park<br/>New Delhi, 110001</span>
              </li>
            </ul>
          </div>

        </div>
        
        {/* Copyright */}
        <div className="mt-16 flex flex-col items-center justify-between border-t border-border/50 pt-8 pb-4 sm:flex-row gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Carbonix. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/terms" className="hover:text-brandMainColor transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-brandMainColor transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
