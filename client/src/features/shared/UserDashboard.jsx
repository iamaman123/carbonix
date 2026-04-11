import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Package, User as UserIcon, Plus, Store } from "lucide-react";
import BuyerDashboard from "@/features/buyer/pages/BuyerDashboard";
import SellerDashboard from "@/features/seller/pages/SellerDashboard";

const UserDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("buy");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-muted/30 pt-24 lg:pt-28">
      <section className="border-b border-border/60 bg-card/40 px-8 py-10 backdrop-blur">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserIcon className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-semibold text-foreground">
                My Dashboard
              </h1>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline">
                <Link to="/marketplace">
                  <Store className="mr-2 h-4 w-4" />
                  Browse Marketplace
                </Link>
              </Button>
              <Button asChild>
                <Link to="/form">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Listing
                </Link>
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || user?.email}! Manage your carbon credit transactions.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="buy" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Buying
            </TabsTrigger>
            <TabsTrigger value="sell" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Selling
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buy" className="mt-0">
            <BuyerDashboard />
          </TabsContent>

          <TabsContent value="sell" className="mt-0">
            <SellerDashboard />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default UserDashboard;
