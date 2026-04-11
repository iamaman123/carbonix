import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  FileText,
  ClipboardList,
  Tag,
  MapPin,
  CheckCircle,
  IndianRupee,
  Link as LinkIcon,
  Loader2,
  Leaf
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import FileUpload from "@/components/common/FileUpload";

const createInitialFormState = () => ({
  title: "",
  description: "",
  quantity: "",
  pricePerCredit: "",
  location: "",
  projectType: "",
  verification: {
    verifiedBy: "",
    certificateUrl: "",
  },
});

const FormComponent = ({ isOpen, setIsOpen }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState(createInitialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalPrice =
    Number(formData.quantity || 0) * Number(formData.pricePerCredit || 0);

  const handleOpenChange = (openState) => {
    if (!openState) {
      setFormData(createInitialFormState());
      setIsSubmitting(false);
    }
    setIsOpen(openState);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleVerificationChange = (name, value) => {
    setFormData((previous) => ({
      ...previous,
      verification: {
        ...previous.verification,
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!token) {
      toast({
        title: "You need to be signed in",
        description: "Log in again to create a new listing.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        quantity: Number(formData.quantity) || 0,
        pricePerCredit: Number(formData.pricePerCredit) || 0,
        verification: {
          verifiedBy: formData.verification.verifiedBy || "Others",
          certificateUrl: formData.verification.certificateUrl || "",
        },
      };

      const API_BASE_URL = import.meta.env.VITE_API_URL || "carbonix-me.vercel.app/api";
      await axios.post(`${API_BASE_URL}/credits/post`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast({
        title: "Listing submitted",
        description: "Sent to admin for review. It will go live after approval.",
      });

      setFormData(createInitialFormState());
      setIsOpen(false);
    } catch (error) {
      console.error("Error creating listing:", error);

      const apiData = error.response?.data || {};
      const reasons = Array.isArray(apiData.errors) ? apiData.errors : [];
      const flaggedFields = Array.isArray(apiData.errorFields) ? apiData.errorFields : [];

      const reasonText = reasons.length
        ? reasons.map((reason, index) => `${index + 1}. ${reason}`).join("\n")
        : null;

      const fieldText = flaggedFields.length
        ? `\nFields: ${flaggedFields.join(", ")}`
        : "";

      toast({
        title: "Unable to create listing",
        description:
          reasonText ||
          (apiData.message ? `${apiData.message}${fieldText}` : null) ||
          "Please review your details and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl overflow-hidden border border-border bg-background/95 p-0 shadow-2xl sm:rounded-3xl backdrop-blur-xl">
        <form
          onSubmit={handleSubmit}
          className="flex max-h-[85vh] flex-col gap-6"
        >
          {/* Beautiful Header */}
          <DialogHeader className="relative overflow-hidden border-b border-border bg-card/50 px-8 py-6">
            <div className="absolute right-[-4rem] top-[-4rem] h-32 w-32 rounded-full bg-brandMainColor/10 blur-3xl" />
            <div className="relative flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brandMainColor/10 border border-brandMainColor/20 shadow-inner">
                <Leaf className="h-6 w-6 text-brandMainColor" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
                  Create a marketplace listing
                </DialogTitle>
                <DialogDescription className="text-[15px] mt-1 text-muted-foreground/90">
                  Share project details, pricing, and verification so buyers can act with absolute confidence.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Form Body */}
          <div className="flex-1 overflow-y-auto px-8 custom-scrollbar">
            <div className="grid gap-7 pb-4">
              
              <div className="grid gap-3">
                <Label htmlFor="title" className="text-sm font-semibold text-foreground/90">Project title</Label>
                <div className="relative group">
                  <FileText className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-muted-foreground transition-colors group-focus-within:text-brandMainColor" />
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Mangrove restoration in Bali"
                    className="pl-11 h-12 rounded-xl transition-all border-border/80 bg-card focus-visible:border-brandMainColor focus-visible:ring-1 focus-visible:ring-brandMainColor"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="description" className="text-sm font-semibold text-foreground/90">Project Summary</Label>
                <div className="relative group">
                  <ClipboardList className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-muted-foreground transition-colors group-focus-within:text-brandMainColor" />
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Outline the climate impact, methodology, and project milestones."
                    className="min-h-[120px] resize-y pl-11 py-3 rounded-xl transition-all border-border/80 bg-card focus-visible:border-brandMainColor focus-visible:ring-1 focus-visible:ring-brandMainColor"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-3">
                  <Label htmlFor="quantity" className="text-sm font-semibold text-foreground/90">Available credits (tCO₂e)</Label>
                  <div className="relative group">
                    <Tag className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-muted-foreground transition-colors group-focus-within:text-brandMainColor" />
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={handleChange}
                      placeholder="e.g. 5,000"
                      className="pl-11 h-12 rounded-xl transition-all border-border/80 bg-card focus-visible:border-brandMainColor focus-visible:ring-1 focus-visible:ring-brandMainColor"
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="pricePerCredit" className="text-sm font-semibold text-foreground/90">Price per credit (₹)</Label>
                  <div className="relative group">
                    <IndianRupee className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-muted-foreground transition-colors group-focus-within:text-brandMainColor" />
                    <Input
                      id="pricePerCredit"
                      name="pricePerCredit"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.pricePerCredit}
                      onChange={handleChange}
                      placeholder="e.g. 12"
                      className="pl-11 h-12 rounded-xl transition-all border-border/80 bg-card focus-visible:border-brandMainColor focus-visible:ring-1 focus-visible:ring-brandMainColor"
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="totalPrice" className="text-sm font-semibold text-foreground/90">Estimated contract value (₹)</Label>
                  <div className="relative group">
                    <CheckCircle className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-brandMainColor" />
                    <Input
                      id="totalPrice"
                      name="totalPrice"
                      value={totalPrice ? totalPrice.toLocaleString() : "0"}
                      readOnly
                      className="pl-11 h-12 rounded-xl bg-brandMainColor/5 border-brandMainColor/20 font-bold text-brandMainColor focus-visible:ring-0"
                    />
                  </div>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="location" className="text-sm font-semibold text-foreground/90">Project location</Label>
                  <div className="relative group">
                    <MapPin className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-muted-foreground transition-colors group-focus-within:text-brandMainColor" />
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="City, Country"
                      className="pl-11 h-12 rounded-xl transition-all border-border/80 bg-card focus-visible:border-brandMainColor focus-visible:ring-1 focus-visible:ring-brandMainColor"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-3">
                  <Label htmlFor="projectType" className="text-sm font-semibold text-foreground/90">Project type</Label>
                  <Select
                    value={formData.projectType || undefined}
                    onValueChange={(value) =>
                      setFormData((previous) => ({
                        ...previous,
                        projectType: value,
                      }))
                    }
                  >
                    <SelectTrigger id="projectType" className="h-12 rounded-xl border-border/80 bg-card pl-4 focus:ring-1 focus:ring-brandMainColor">
                      <SelectValue placeholder="Select classification" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/80">
                      <SelectItem value="Reforestation">Reforestation</SelectItem>
                      <SelectItem value="Renewable Energy">Renewable Energy</SelectItem>
                      <SelectItem value="Waste Management">Waste Management</SelectItem>
                      <SelectItem value="Agriculture">Agriculture</SelectItem>
                      <SelectItem value="Blue Carbon">Blue Carbon</SelectItem>
                      <SelectItem value="Others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="status" className="text-sm font-semibold text-foreground/90">Listing status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData((previous) => ({
                        ...previous,
                        status: value,
                      }))
                    }
                  >
                    <SelectTrigger id="status" className="h-12 rounded-xl border-border/80 bg-card pl-4 focus:ring-1 focus:ring-brandMainColor">
                      <SelectValue placeholder="Select initial status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/80">
                      <SelectItem value="Available">Available (Live)</SelectItem>
                      <SelectItem value="Pending">Draft / Pending</SelectItem>
                      <SelectItem value="Sold">Sold (Archive)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-3">
                  <Label className="text-sm font-semibold text-foreground/90">Verified by</Label>
                  <Select
                    value={formData.verification.verifiedBy || undefined}
                    onValueChange={(value) =>
                      handleVerificationChange("verifiedBy", value)
                    }
                  >
                    <SelectTrigger className="h-12 rounded-xl border-border/80 bg-card pl-4 focus:ring-1 focus:ring-brandMainColor">
                      <SelectValue placeholder="Select registry standard" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/80">
                      <SelectItem value="VCS">Verified Carbon Standard (Verra)</SelectItem>
                      <SelectItem value="Gold Standard">Gold Standard</SelectItem>
                      <SelectItem value="CDM">Clean Development Mechanism</SelectItem>
                      <SelectItem value="ACR">American Carbon Registry</SelectItem>
                      <SelectItem value="Others">Other / Independent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="certificateUrl" className="text-sm font-semibold text-foreground/90">Public Certificate URL</Label>
                  <div className="relative group">
                    <LinkIcon className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-muted-foreground transition-colors group-focus-within:text-brandMainColor" />
                    <Input
                      id="certificateUrl"
                      name="certificateUrl"
                      type="url"
                      placeholder="https://registry..."
                      value={formData.verification.certificateUrl}
                      onChange={(event) =>
                        handleVerificationChange(
                          "certificateUrl",
                          event.target.value
                        )
                      }
                      className="pl-11 h-12 rounded-xl transition-all border-border/80 bg-card focus-visible:border-brandMainColor focus-visible:ring-1 focus-visible:ring-brandMainColor"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-2 rounded-xl border border-dashed border-brandMainColor/30 bg-brandMainColor/5 px-5 py-4 text-sm text-foreground/85 flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-brandMainColor shrink-0 mt-0.5" />
                <p>
                  <span className="font-semibold text-brandMainColor">Document Trust Protocol: </span> 
                  Attach supporting documentation such as MRV (Monitoring, Reporting, Validation) reports, methodologies, or imagery file to help buyers validate your claims.
                </p>
              </div>

              <FileUpload />
            </div>
          </div>

          <DialogFooter className="gap-3 border-t border-border bg-card/50 px-8 py-5 sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={isSubmitting} className="rounded-full px-6 transition-all hover:bg-muted font-semibold">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting} className="rounded-full bg-brandMainColor px-8 font-semibold text-white shadow-[0_8px_20px_-10px_rgba(92,179,56,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-brandMainColor/90 hover:shadow-[0_12px_25px_-10px_rgba(92,179,56,0.8)]">
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4.5 w-4.5 animate-spin" /> Enacting
                </span>
              ) : (
                "Publish Official Listing"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FormComponent;
