import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

export default function ComingSoon() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <Card className="p-6 text-center max-w-md shadow-xl border border-gray-700">
        <CardContent>
          <Clock className="w-12 h-12 mx-auto text-yellow-400" />
          <h1 className="text-3xl font-bold mt-4">Coming Soon</h1>
          <p className="text-gray-400 mt-2">
            We're launching something awesome!
          </p>
          <Button className="mt-6" variant="secondary">
            Notify Me
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
