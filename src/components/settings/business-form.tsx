"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Upload, X } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CURRENCIES } from "@/lib/utils";
import { toast } from "sonner";

const businessSchema = z.object({
  companyName: z.string().optional(),
  companyAddress: z.string().optional(),
  companyCity: z.string().optional(),
  companyCountry: z.string().optional(),
  taxId: z.string().optional(),
  vatNumber: z.string().optional(),
  defaultCurrency: z.string().optional(),
  invoicePrefix: z.string().max(10).optional(),
  defaultPaymentTerms: z.coerce.number().min(0).max(365).optional(),
  brandColor: z.string().optional(),
  lateFeePct: z.coerce.number().min(0).max(100).optional(),
  lateFeeGraceDays: z.coerce.number().min(0).max(90).optional(),
});

type BusinessFormData = z.infer<typeof businessSchema>;

interface BusinessFormProps {
  defaultValues?: Partial<BusinessFormData & {
    logoUrl?: string | null;
  }>;
}

export function BusinessForm({ defaultValues }: BusinessFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(defaultValues?.logoUrl ?? null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      defaultCurrency: "USD",
      invoicePrefix: "INV",
      defaultPaymentTerms: 30,
      brandColor: "#3b82f6",
      lateFeePct: 0,
      lateFeeGraceDays: 7,
      ...defaultValues,
    },
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be under 2MB");
      return;
    }

    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setLogoUrl(data.url);
      toast.success("Logo uploaded!");
    } catch {
      toast.error("Failed to upload logo");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const onSubmit = async (data: BusinessFormData) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, logoUrl }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Failed to save settings");
      }

      toast.success("Settings saved!");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Company Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Business Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="companyName">Company / Business Name</Label>
              <Input
                id="companyName"
                placeholder="Your Business Name"
                {...register("companyName")}
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="companyAddress">Street Address</Label>
              <Input
                id="companyAddress"
                placeholder="123 Main Street"
                {...register("companyAddress")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyCity">City</Label>
              <Input
                id="companyCity"
                placeholder="New York"
                {...register("companyCity")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyCountry">Country</Label>
              <Input
                id="companyCountry"
                placeholder="United States"
                {...register("companyCountry")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID / EIN</Label>
              <Input
                id="taxId"
                placeholder="XX-XXXXXXX"
                {...register("taxId")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vatNumber">VAT Number</Label>
              <Input
                id="vatNumber"
                placeholder="GB123456789"
                {...register("vatNumber")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Branding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Logo */}
          <div className="space-y-2">
            <Label>Company Logo</Label>
            <div className="flex items-center gap-4">
              {logoUrl ? (
                <div className="relative">
                  <img
                    src={logoUrl}
                    alt="Company logo"
                    className="h-16 w-auto max-w-32 rounded-lg border object-contain bg-white p-1"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-5 w-5"
                    onClick={() => setLogoUrl(null)}
                  >
                    <X className="h-2.5 w-2.5" />
                  </Button>
                </div>
              ) : (
                <div className="h-16 w-32 rounded-lg border-2 border-dashed flex items-center justify-center text-muted-foreground">
                  <span className="text-xs">No logo</span>
                </div>
              )}
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingLogo}
                >
                  {isUploadingLogo ? (
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-3.5 w-3.5" />
                  )}
                  Upload Logo
                </Button>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </div>
            </div>
          </div>

          {/* Brand Color */}
          <div className="space-y-2">
            <Label htmlFor="brandColor">Brand Color</Label>
            <div className="flex items-center gap-3">
              <Controller
                name="brandColor"
                control={control}
                render={({ field }) => (
                  <>
                    <input
                      type="color"
                      value={field.value ?? "#3b82f6"}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="h-9 w-16 rounded-lg border cursor-pointer p-1"
                    />
                    <Input
                      value={field.value ?? "#3b82f6"}
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder="#3b82f6"
                      className="max-w-32 font-mono"
                    />
                  </>
                )}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Used in PDF invoices and contract headers.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoice Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Default Currency</Label>
              <Controller
                name="defaultCurrency"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value ?? "USD"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.symbol} {c.code} — {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
              <Input
                id="invoicePrefix"
                maxLength={10}
                placeholder="INV"
                {...register("invoicePrefix")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultPaymentTerms">Default Payment Terms (days)</Label>
              <Input
                id="defaultPaymentTerms"
                type="number"
                min={0}
                max={365}
                {...register("defaultPaymentTerms")}
              />
            </div>
          </div>

          <Separator />

          <div>
            <p className="font-medium text-sm mb-3">Late Fee Settings</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lateFeePct">Late Fee (%)</Label>
                <Input
                  id="lateFeePct"
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  placeholder="0"
                  {...register("lateFeePct")}
                />
                <p className="text-xs text-muted-foreground">
                  Percentage added to overdue invoices. Set to 0 to disable.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lateFeeGraceDays">Grace Period (days)</Label>
                <Input
                  id="lateFeeGraceDays"
                  type="number"
                  min={0}
                  max={90}
                  placeholder="7"
                  {...register("lateFeeGraceDays")}
                />
                <p className="text-xs text-muted-foreground">
                  Days after due date before late fee applies.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex gap-3">
        <Button type="submit" disabled={isLoading || !isDirty}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
}
