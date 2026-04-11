import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Download } from "lucide-react";

const ReceiptViewer = () => {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [receiptHTML, setReceiptHTML] = useState("");
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "carbonix-me-1.vercel.app/api";

  useEffect(() => {
    const fetchReceipt = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/credits/receipt/${transactionId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setReceiptHTML(response.data.receiptHTML);
      } catch (error) {
        console.error("Error fetching receipt:", error);
        toast({
          title: "Error",
          description: "Failed to load receipt",
          variant: "destructive",
        });
        navigate("/transaction-listing");
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
  }, [transactionId, token, navigate]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const blob = new Blob([receiptHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${transactionId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8 pt-24 lg:pt-28">
        <div className="mx-auto max-w-4xl space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 lg:pt-28">
      <div className="print:hidden sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
          <Button variant="ghost" onClick={() => navigate("/transaction-listing")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Transactions
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download HTML
            </Button>
            <Button onClick={handlePrint}>
              <Download className="mr-2 h-4 w-4" />
              Print / Save as PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-muted/20 p-4 sm:p-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-border/60 bg-background shadow-2xl print:border-0 print:shadow-none">
          <iframe
            title={`Receipt ${transactionId}`}
            srcDoc={receiptHTML}
            className="h-[calc(100vh-10rem)] w-full bg-white print:h-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default ReceiptViewer;
