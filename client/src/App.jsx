import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import {
  ProtectedRoute,
  PublicRoute,
  RoleBasedRoute,
} from "./components/layout";
import {
  Login,
  Profile,
  GoogleAuthSuccess,
} from "./features/auth";
import { AuthProvider } from "./context/AuthContext";
import {
  AboutUs,
  Calculator as CarbonEmissionCalculator,
  ContactUs,
  Blog,
  BlogDetail,
  ComingSoon,
  ReceiptViewer,
  TransactionPage,
  EcoMarketplace,
  MarketInsightsPage,
} from "./features/shared";
import UserDashboard from "./features/shared/UserDashboard";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import { LandingPage } from "./features/landing";
import {
  AllListings as ListingsPage,
  CreateListingPage,
} from "./features/seller";
import ProducerDashboard from "./features/seller/ProducerDashboard";
import { Marketplace, TransactionListing } from "./features/buyer";
import ConsumerDashboard from "./features/buyer/ConsumerDashboard";
import {
  AdminDashboard,
  AdminEcoProducts,
  AdminBlogs,
  AdminListings,
  AdminProducerRequests,
  AdminProducers,
} from "./features/admin";
import RequestProducer from "./features/producer/RequestProducer";
import BuyerAnalytics from "./features/buyer/pages/BuyerAnalytics";
import SellerAnalytics from "./features/seller/pages/SellerAnalytics";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        {/* Full-height container with column layout */}
        <div className="flex flex-col min-h-screen">
          {/* Navbar always at the top */}
          <Navbar />

          {/* Main content with flex-1 to push footer to bottom */}
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route element={<PublicRoute />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/register" element={<Navigate to="/login" replace />} />
                <Route path="/verify-otp" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<Navigate to="/login" replace />} />
                <Route path="/reset-password" element={<Navigate to="/login" replace />} />
                <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
                <Route path="/about" element={<AboutUs />} />
                <Route
                  path="/calculator"
                  element={<CarbonEmissionCalculator />}
                />
                <Route path="/coming" element={<ComingSoon />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogDetail />} />
              </Route>
              {/* Eco Marketplace - accessible to everyone, login needed only for purchase */}
              <Route path="/eco-marketplace" element={<EcoMarketplace />} />
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                {/* Producer Dashboard (approved sellers) */}
                <Route
                  path="/dashboard/producer"
                  element={
                    <RoleBasedRoute allowedRoles={["PRODUCER"]}>
                      <ProducerDashboard />
                    </RoleBasedRoute>
                  }
                />

                {/* Consumer Dashboard (default accounts) */}
                <Route
                  path="/dashboard/consumer"
                  element={
                    <RoleBasedRoute allowedRoles={["CONSUMER"]}>
                      <ConsumerDashboard />
                    </RoleBasedRoute>
                  }
                />

                {/* Request producer (seller) access — consumers only */}
                <Route
                  path="/request-producer"
                  element={
                    <RoleBasedRoute allowedRoles={["CONSUMER"]}>
                      <RequestProducer />
                    </RoleBasedRoute>
                  }
                />

                {/* Legacy User Dashboard - kept for backward compatibility */}
                <Route
                  path="/dashboard/legacy"
                  element={
                    <RoleBasedRoute allowedRoles={["user"]}>
                      <UserDashboard />
                    </RoleBasedRoute>
                  }
                />

                {/* Marketplace — buyers and approved producers can purchase */}
                <Route
                  path="/marketplace"
                  element={
                    <RoleBasedRoute allowedRoles={["CONSUMER", "PRODUCER"]}>
                      <Marketplace />
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/market"
                  element={
                    <RoleBasedRoute allowedRoles={["CONSUMER", "PRODUCER"]}>
                      <Marketplace />
                    </RoleBasedRoute>
                  }
                />

                {/* Listings — producers only */}
                <Route
                  path="/listings"
                  element={
                    <RoleBasedRoute allowedRoles={["PRODUCER"]}>
                      <ListingsPage />
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/form"
                  element={
                    <RoleBasedRoute allowedRoles={["PRODUCER"]}>
                      <CreateListingPage />
                    </RoleBasedRoute>
                  }
                />

                {/* Payment and Transactions */}
                <Route
                  path="/payment"
                  element={
                    <RoleBasedRoute allowedRoles={["PRODUCER", "CONSUMER"]}>
                      <TransactionPage />
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/transaction-listing"
                  element={
                    <RoleBasedRoute allowedRoles={["PRODUCER", "CONSUMER"]}>
                      <TransactionListing />
                    </RoleBasedRoute>
                  }
                />

                {/* Analytics */}
                <Route
                  path="/market-insights"
                  element={
                    <RoleBasedRoute allowedRoles={["PRODUCER", "CONSUMER"]}>
                      <MarketInsightsPage />
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/buyer-analytics"
                  element={
                    <RoleBasedRoute allowedRoles={["CONSUMER", "PRODUCER"]}>
                      <BuyerAnalytics />
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/seller-analytics"
                  element={
                    <RoleBasedRoute allowedRoles={["PRODUCER"]}>
                      <SellerAnalytics />
                    </RoleBasedRoute>
                  }
                />

                {/* Admin Routes - accessible by admin only */}
                <Route
                  path="/admin"
                  element={
                    <RoleBasedRoute allowedRoles={["admin"]}>
                      <AdminDashboard />
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/admin/eco-products"
                  element={
                    <RoleBasedRoute allowedRoles={["admin"]}>
                      <AdminEcoProducts />
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/admin/listings"
                  element={
                    <RoleBasedRoute allowedRoles={["admin"]}>
                      <AdminListings />
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/admin/blogs"
                  element={
                    <RoleBasedRoute allowedRoles={["admin"]}>
                      <AdminBlogs />
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/admin/producer-requests"
                  element={
                    <RoleBasedRoute allowedRoles={["admin"]}>
                      <AdminProducerRequests />
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/admin/producers"
                  element={
                    <RoleBasedRoute allowedRoles={["admin"]}>
                      <AdminProducers />
                    </RoleBasedRoute>
                  }
                />

                {/* Common Protected Routes */}
                <Route path="/profile" element={<Profile />} />
                <Route
                  path="/receipt/:transactionId"
                  element={<ReceiptViewer />}
                />
              </Route>

              {/* Default Route */}
              <Route path="*" element={<Login />} />
            </Routes>
          </main>

          {/* Footer always at the bottom */}
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
