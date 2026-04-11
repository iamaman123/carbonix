import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  LogOut,
  Menu,
  Leaf,
  Home,
  Calculator,
  BookOpen,
  Info,
  Mail,
  Zap,
  Settings,
  ShieldCheck,
  ShoppingCart,
  UserPlus,
  ClipboardCheck,
  Users,
} from "lucide-react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "../ui/button";
import { useAuth } from "@/context/AuthContext";
import Logo from "./Logo";

const DesktopNavLink = ({
  to,
  children,
  isGreen = false,
  exact = false,
  hoveredPath,
  setHoveredPath,
}) => {
  const location = useLocation();
  const active = exact
    ? location.pathname === to
    : location.pathname.startsWith(to);
  const isHovered = hoveredPath === to;

  const baseActive = isGreen
    ? "text-green-600 dark:text-green-400"
    : "text-brandMainColor";
  const baseInactive = "text-foreground/80";

  return (
    <Link
      to={to}
      onMouseEnter={() => setHoveredPath(to)}
      className={`relative rounded-xl px-3 py-2 text-sm font-medium transition-colors ${active ? baseActive : baseInactive} hover:${isGreen ? "text-green-600 dark:text-green-400" : "text-foreground"}`}
    >
      {isHovered && (
        <motion.div
          layoutId="navbar-hover"
          className="absolute inset-0 z-0 rounded-lg bg-brandMainColor/15 dark:bg-brandMainColor/20 backdrop-blur-md shadow-sm border border-brandMainColor/20 dark:border-brandMainColor/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
        />
      )}
      <div className="relative z-10 flex items-center gap-1.5">{children}</div>
    </Link>
  );
};

const MobileNavLink = ({
  to,
  onClick,
  children,
  icon: Icon,
  isGreen = false,
  exact = false,
}) => {
  const location = useLocation();
  const active = exact
    ? location.pathname === to
    : location.pathname.startsWith(to);

  const baseColor = isGreen
    ? "text-green-600 dark:text-green-400"
    : "text-brandMainColor";
  const inactiveColor = "text-foreground/70";

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
        active
          ? `bg-muted shadow-sm ${baseColor}`
          : `hover:bg-muted/50 hover:${baseColor} ${inactiveColor}`
      }`}
    >
      {Icon && (
        <Icon className={`h-4 w-4 ${active ? "opacity-100" : "opacity-70"}`} />
      )}
      {children}
    </Link>
  );
};

const Navbar = () => {
  const { user, logoutUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState(null);

  const closeSheet = () => setIsOpen(false);

  return (
    <div className="fixed inset-x-0 top-0 z-50 p-2 sm:p-4 transition-all duration-300">
      <nav className="mx-auto flex h-16 sm:h-[4.5rem] w-full max-w-7xl items-center justify-between rounded-2xl border border-white/20 dark:border-white/10 bg-white/70 dark:bg-black/40 px-4 sm:px-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-bold text-foreground transition-transform hover:scale-[1.02] flex items-center"
        >
          <Logo />
        </Link>

        <div
          className="hidden lg:flex items-center gap-1"
          onMouseLeave={() => setHoveredPath(null)}
        >
          {user?.role === "admin" && (
            <DesktopNavLink
              to="/admin"
              exact
              hoveredPath={hoveredPath}
              setHoveredPath={setHoveredPath}
            >
              Admin Panel
            </DesktopNavLink>
          )}

          {user?.role === "admin" && (
            <>
              <DesktopNavLink
                to="/admin/eco-products"
                isGreen
                hoveredPath={hoveredPath}
                setHoveredPath={setHoveredPath}
              >
                Manage Eco Products
              </DesktopNavLink>
              <DesktopNavLink
                to="/admin/listings"
                hoveredPath={hoveredPath}
                setHoveredPath={setHoveredPath}
              >
                Approve Listings
              </DesktopNavLink>
              <DesktopNavLink
                to="/admin/blogs"
                hoveredPath={hoveredPath}
                setHoveredPath={setHoveredPath}
              >
                Manage Blogs
              </DesktopNavLink>
              <DesktopNavLink
                to="/admin/producer-requests"
                hoveredPath={hoveredPath}
                setHoveredPath={setHoveredPath}
              >
                Producer requests
              </DesktopNavLink>
              <DesktopNavLink
                to="/admin/producers"
                hoveredPath={hoveredPath}
                setHoveredPath={setHoveredPath}
              >
                Producers
              </DesktopNavLink>
            </>
          )}

          {user?.role === "PRODUCER" && (
            <DesktopNavLink
              to="/form"
              hoveredPath={hoveredPath}
              setHoveredPath={setHoveredPath}
            >
              Sell Energy
            </DesktopNavLink>
          )}

          {(user?.role === "CONSUMER" || user?.role === "PRODUCER") && (
            <DesktopNavLink
              to="/marketplace"
              hoveredPath={hoveredPath}
              setHoveredPath={setHoveredPath}
            >
              Buy Energy
            </DesktopNavLink>
          )}

          {user?.role === "CONSUMER" && (
            <DesktopNavLink
              to="/request-producer"
              hoveredPath={hoveredPath}
              setHoveredPath={setHoveredPath}
            >
              Become a producer
            </DesktopNavLink>
          )}

          {user &&
            (user.role === "PRODUCER" || user.role === "CONSUMER") && (
              <DesktopNavLink
                to={
                  user.role === "PRODUCER"
                    ? "/dashboard/producer"
                    : "/dashboard/consumer"
                }
                hoveredPath={hoveredPath}
                setHoveredPath={setHoveredPath}
              >
                Dashboard
              </DesktopNavLink>
            )}

          {user?.role !== "admin" && (
            <>
              <DesktopNavLink
                to="/eco-marketplace"
                isGreen
                hoveredPath={hoveredPath}
                setHoveredPath={setHoveredPath}
              >
                <Leaf className="h-3.5 w-3.5" /> Eco Shop
              </DesktopNavLink>

              <DesktopNavLink
                to="/calculator"
                hoveredPath={hoveredPath}
                setHoveredPath={setHoveredPath}
              >
                Calculator
              </DesktopNavLink>

              <DesktopNavLink
                to="/blog"
                hoveredPath={hoveredPath}
                setHoveredPath={setHoveredPath}
              >
                Blog
              </DesktopNavLink>

              <DesktopNavLink
                to="/about"
                hoveredPath={hoveredPath}
                setHoveredPath={setHoveredPath}
              >
                About Us
              </DesktopNavLink>

              <DesktopNavLink
                to="/contact"
                hoveredPath={hoveredPath}
                setHoveredPath={setHoveredPath}
              >
                Contact
              </DesktopNavLink>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 lg:gap-4">

          {/* Desktop Auth Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <Button
                onClick={logoutUser}
                className="rounded-full bg-brandMainColor px-6 text-white transition-all duration-300 hover:-translate-y-[1px] hover:bg-brandMainColor/90 hover:shadow-lg focus-visible:ring-brandMainColor"
              >
                Logout <LogOut size={16} className="ml-2" />
              </Button>
            ) : (
              <Link to="/login">
                <Button className="rounded-full bg-brandMainColor px-6 font-medium text-white shadow-md shadow-brandMainColor/20 transition-all duration-300 hover:-translate-y-[1px] hover:bg-brandMainColor/90 hover:shadow-lg hover:shadow-brandMainColor/30">
                  Sign in
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger className="lg:hidden rounded-md p-2 hover:bg-muted transition-colors">
              <Menu size={22} />
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col gap-1 p-6">
              <div className="mb-4">
                <Link
                  to="/"
                  onClick={closeSheet}
                  className="text-xl font-bold text-foreground flex items-center"
                >
                  <Logo />
                </Link>
              </div>

              {/* Role-based mobile navigation */}
              {user?.role === "admin" && (
                <MobileNavLink
                  to="/admin"
                  onClick={closeSheet}
                  icon={ShieldCheck}
                  exact
                >
                  Admin Panel
                </MobileNavLink>
              )}

              {user?.role === "admin" && (
                <>
                  <MobileNavLink
                    to="/admin/eco-products"
                    onClick={closeSheet}
                    icon={Settings}
                    isGreen
                  >
                    Manage Eco Products
                  </MobileNavLink>
                  <MobileNavLink
                    to="/admin/listings"
                    onClick={closeSheet}
                    icon={Settings}
                  >
                    Approve Listings
                  </MobileNavLink>
                  <MobileNavLink
                    to="/admin/blogs"
                    onClick={closeSheet}
                    icon={Settings}
                  >
                    Manage Blogs
                  </MobileNavLink>
                  <MobileNavLink
                    to="/admin/producer-requests"
                    onClick={closeSheet}
                    icon={ClipboardCheck}
                  >
                    Producer requests
                  </MobileNavLink>
                  <MobileNavLink
                    to="/admin/producers"
                    onClick={closeSheet}
                    icon={Users}
                  >
                    Producers
                  </MobileNavLink>
                </>
              )}

              {user?.role === "PRODUCER" && (
                <MobileNavLink to="/form" onClick={closeSheet} icon={Zap}>
                  Sell Energy
                </MobileNavLink>
              )}

              {(user?.role === "CONSUMER" || user?.role === "PRODUCER") && (
                <MobileNavLink
                  to="/marketplace"
                  onClick={closeSheet}
                  icon={ShoppingCart}
                >
                  Buy Energy
                </MobileNavLink>
              )}

              {user?.role === "CONSUMER" && (
                <MobileNavLink
                  to="/request-producer"
                  onClick={closeSheet}
                  icon={UserPlus}
                >
                  Become a producer
                </MobileNavLink>
              )}

              {user &&
                (user.role === "PRODUCER" || user.role === "CONSUMER") && (
                  <MobileNavLink
                    to={
                      user.role === "PRODUCER"
                        ? "/dashboard/producer"
                        : "/dashboard/consumer"
                    }
                    onClick={closeSheet}
                    icon={Home}
                  >
                    Dashboard
                  </MobileNavLink>
                )}

              {user?.role !== "admin" && (
                <>
                  <MobileNavLink
                    to="/eco-marketplace"
                    onClick={closeSheet}
                    icon={Leaf}
                    isGreen
                  >
                    Eco Shop
                  </MobileNavLink>

                  <MobileNavLink
                    to="/calculator"
                    onClick={closeSheet}
                    icon={Calculator}
                  >
                    Calculator
                  </MobileNavLink>

                  <MobileNavLink to="/blog" onClick={closeSheet} icon={BookOpen}>
                    Blog
                  </MobileNavLink>

                  <MobileNavLink to="/about" onClick={closeSheet} icon={Info}>
                    About Us
                  </MobileNavLink>

                  <MobileNavLink to="/contact" onClick={closeSheet} icon={Mail}>
                    Contact
                  </MobileNavLink>
                </>
              )}
              <div className="mt-2 border-t border-border pt-4">
                {user ? (
                  <Button
                    onClick={() => {
                      logoutUser();
                      closeSheet();
                    }}
                    className="w-full bg-brandMainColor text-white hover:bg-brandMainColor/90 focus-visible:ring-brandMainColor"
                  >
                    Logout <LogOut size={16} className="ml-2" />
                  </Button>
                ) : (
                  <Link to="/login" onClick={closeSheet}>
                    <Button className="w-full bg-brandMainColor text-white hover:bg-brandMainColor/90">
                      Sign in with Google
                    </Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
