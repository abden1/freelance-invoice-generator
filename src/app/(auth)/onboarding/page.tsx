"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Building2, Settings2, Rocket, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, CURRENCIES } from "@/lib/utils";
import { toast } from "sonner";

const step1Schema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  companyAddress: z.string().optional(),
  companyCity: z.string().optional(),
  companyCountry: z.string().optional(),
  taxId: z.string().optional(),
});

const step2Schema = z.object({
  defaultCurrency: z.string().min(1, "Please select a currency"),
  invoicePrefix: z.string().min(1, "Prefix is required").max(10),
  defaultPaymentTerms: z.coerce.number().min(0).max(365),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

const steps = [
  { id: 1, label: "Business", icon: Building2 },
  { id: 2, label: "Preferences", icon: Settings2 },
  { id: 3, label: "Ready!", icon: Rocket },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Step1Data & Step2Data>>({});

  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      companyName: "",
      companyAddress: "",
      companyCity: "",
      companyCountry: "",
      taxId: "",
    },
  });

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      defaultCurrency: "USD",
      invoicePrefix: "INV",
      defaultPaymentTerms: 30,
    },
  });

  const handleStep1Submit = (data: Step1Data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(2);
  };

  const handleStep2Submit = async (data: Step2Data) => {
    const allData = { ...formData, ...data };
    setFormData(allData);
    setIsLoading(true);

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(allData),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Failed to save settings");
      }

      setCurrentStep(3);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    router.push("/dashboard");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Set up your workspace</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Just a few details to personalize your experience
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-0">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all",
                    isCompleted
                      ? "bg-primary border-primary text-primary-foreground"
                      : isCurrent
                      ? "border-primary text-primary"
                      : "border-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium",
                    isCurrent ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-16 mx-2 mb-5 transition-colors",
                    currentStep > step.id ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step 1: Business Details */}
      {currentStep === 1 && (
        <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">
              Company / Business name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="companyName"
              placeholder="Acme Design Studio"
              {...step1Form.register("companyName")}
            />
            {step1Form.formState.errors.companyName && (
              <p className="text-xs text-destructive">
                {step1Form.formState.errors.companyName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyAddress">Street address</Label>
            <Input
              id="companyAddress"
              placeholder="123 Main St"
              {...step1Form.register("companyAddress")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyCity">City</Label>
              <Input
                id="companyCity"
                placeholder="New York"
                {...step1Form.register("companyCity")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyCountry">Country</Label>
              <Input
                id="companyCountry"
                placeholder="United States"
                {...step1Form.register("companyCountry")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxId">Tax ID / EIN (optional)</Label>
            <Input
              id="taxId"
              placeholder="XX-XXXXXXX"
              {...step1Form.register("taxId")}
            />
          </div>

          <Button type="submit" className="w-full">
            Continue
          </Button>
        </form>
      )}

      {/* Step 2: Preferences */}
      {currentStep === 2 && (
        <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Default currency</Label>
            <Select
              defaultValue={step2Form.getValues("defaultCurrency")}
              onValueChange={(v) => step2Form.setValue("defaultCurrency", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.symbol} — {c.name} ({c.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {step2Form.formState.errors.defaultCurrency && (
              <p className="text-xs text-destructive">
                {step2Form.formState.errors.defaultCurrency.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoicePrefix">Invoice number prefix</Label>
            <Input
              id="invoicePrefix"
              placeholder="INV"
              maxLength={10}
              {...step2Form.register("invoicePrefix")}
            />
            <p className="text-xs text-muted-foreground">
              Invoices will be numbered like: INV-0001
            </p>
            {step2Form.formState.errors.invoicePrefix && (
              <p className="text-xs text-destructive">
                {step2Form.formState.errors.invoicePrefix.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultPaymentTerms">Default payment terms (days)</Label>
            <Input
              id="defaultPaymentTerms"
              type="number"
              min={0}
              max={365}
              placeholder="30"
              {...step2Form.register("defaultPaymentTerms")}
            />
            <p className="text-xs text-muted-foreground">
              Number of days until invoice is due after issue date.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setCurrentStep(1)}
            >
              Back
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save & Continue
            </Button>
          </div>
        </form>
      )}

      {/* Step 3: Done */}
      {currentStep === 3 && (
        <div className="text-center space-y-6 py-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                <Rocket className="h-10 w-10 text-primary" />
              </div>
              <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold">You&apos;re all set!</h2>
            <p className="text-muted-foreground text-sm mt-2 max-w-xs mx-auto">
              Your workspace is ready. Create your first invoice and start getting paid faster.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-left">
            {[
              "Professional invoice builder",
              "Client management",
              "Contract templates",
              "Expense tracking",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <Button className="w-full" size="lg" onClick={handleComplete}>
            <Rocket className="mr-2 h-4 w-4" />
            Go to Dashboard
          </Button>
        </div>
      )}
    </div>
  );
}
