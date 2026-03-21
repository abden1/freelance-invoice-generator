"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Trash2, Info, Eye, EyeOff } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const CONTRACT_TEMPLATES = [
  {
    id: "freelance-services",
    label: "Freelance Services Agreement",
    description: "General freelance work contract",
    content: `FREELANCE SERVICES AGREEMENT

This Freelance Services Agreement ("Agreement") is entered into as of {{date}} between {{clientName}} ("Client") and {{freelancerName}} ("Freelancer").

1. SERVICES
Freelancer agrees to provide the following services: {{services}}

2. PAYMENT
Client agrees to pay Freelancer {{amount}} upon completion of services. Payment is due within {{paymentTerms}} days of invoice.

3. INTELLECTUAL PROPERTY
Upon receipt of full payment, Freelancer assigns all intellectual property rights to the Client.

4. CONFIDENTIALITY
Freelancer agrees to keep all Client information confidential.

5. TERMINATION
Either party may terminate this agreement with 14 days written notice.

6. GOVERNING LAW
This agreement shall be governed by the laws of {{jurisdiction}}.`,
  },
  {
    id: "web-design",
    label: "Web Design Contract",
    description: "Website design and development",
    content: `WEB DESIGN CONTRACT

This Web Design Contract ("Contract") is entered into as of {{date}} between {{clientName}} ("Client") and {{freelancerName}} ("Designer").

1. PROJECT SCOPE
Designer will create a website as described: {{projectDescription}}

2. DELIVERABLES
- Custom website design
- Responsive layout for mobile and desktop
- Up to {{revisions}} revision rounds

3. TIMELINE
Project will be completed by {{deadline}}.

4. PAYMENT SCHEDULE
- 50% deposit: {{depositAmount}}
- 50% on completion: {{balanceAmount}}

5. HOSTING & MAINTENANCE
Hosting and ongoing maintenance are not included unless separately agreed.

6. OWNERSHIP
Client owns the final design upon full payment.`,
  },
  {
    id: "consulting",
    label: "Consulting Agreement",
    description: "Professional consulting services",
    content: `CONSULTING AGREEMENT

This Consulting Agreement is made as of {{date}} between {{clientName}} ("Company") and {{freelancerName}} ("Consultant").

1. CONSULTING SERVICES
Consultant shall provide: {{services}}

2. COMPENSATION
Company shall pay Consultant at the rate of {{rate}} per {{rateUnit}}.

3. INDEPENDENT CONTRACTOR
Consultant is an independent contractor and not an employee of Company.

4. TERM
This Agreement begins on {{startDate}} and continues until {{endDate}}, unless earlier terminated.

5. EXPENSES
Company will reimburse pre-approved expenses within 30 days of submission.

6. NON-COMPETE
Consultant shall not engage in competing activities during the term.`,
  },
  {
    id: "retainer",
    label: "Monthly Retainer Agreement",
    description: "Ongoing monthly services",
    content: `MONTHLY RETAINER AGREEMENT

This Retainer Agreement is entered into as of {{date}} between {{clientName}} ("Client") and {{freelancerName}} ("Service Provider").

1. RETAINER SERVICES
Service Provider will be available for up to {{hours}} hours per month for: {{services}}

2. RETAINER FEE
Client will pay {{amount}} per month, due on the 1st of each month.

3. UNUSED HOURS
Unused hours do not roll over to the following month.

4. ADDITIONAL HOURS
Hours exceeding the retainer will be billed at {{overtimeRate}} per hour.

5. TERM & RENEWAL
This agreement renews monthly unless cancelled with 30 days written notice.`,
  },
];

const AVAILABLE_VARIABLES = [
  { name: "{{clientName}}", description: "Client full name" },
  { name: "{{freelancerName}}", description: "Your name" },
  { name: "{{date}}", description: "Today's date" },
  { name: "{{amount}}", description: "Contract amount" },
  { name: "{{services}}", description: "Services description" },
  { name: "{{paymentTerms}}", description: "Payment terms" },
  { name: "{{deadline}}", description: "Project deadline" },
  { name: "{{jurisdiction}}", description: "Legal jurisdiction" },
];

const contractSchema = z.object({
  title: z.string().min(1, "Title is required"),
  clientId: z.string().optional(),
  templateId: z.string().optional(),
  content: z.string().min(10, "Contract content is required"),
  signers: z
    .array(
      z.object({
        name: z.string().min(1, "Name required"),
        email: z.string().email("Valid email required"),
      })
    )
    .min(1, "At least one signer required"),
});

type ContractFormData = z.infer<typeof contractSchema>;

interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
}

export function ContractEditor() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      title: "",
      content: "",
      signers: [{ name: "", email: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "signers",
  });

  const contentValue = watch("content");

  useEffect(() => {
    async function fetchClients() {
      try {
        const res = await fetch("/api/clients");
        if (!res.ok) return;
        const data = await res.json();
        setClients(data.clients ?? []);
      } catch {
        // ignore
      }
    }
    fetchClients();
  }, []);

  const handleTemplateSelect = (templateId: string) => {
    const template = CONTRACT_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      setValue("content", template.content);
      if (!watch("title")) {
        setValue("title", template.label);
      }
    }
  };

  const insertVariable = (variable: string) => {
    const current = watch("content");
    setValue("content", current + variable);
  };

  const onSubmit = async (data: ContractFormData) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          status: "DRAFT",
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Failed to create contract");
      }

      const result = await res.json();
      toast.success("Contract created!");
      router.push(`/contracts/${result.contract?.id ?? ""}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create contract");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Template Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Choose a Template</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {CONTRACT_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleTemplateSelect(template.id)}
                    className={`text-left p-4 rounded-lg border-2 transition-all hover:border-primary/50 ${
                      selectedTemplateId === template.id
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <p className="font-medium text-sm">{template.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contract Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contract Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Contract Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Web Design Contract — Acme Corp"
                  {...register("title")}
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && (
                  <p className="text-xs text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Client (optional)</Label>
                <Controller
                  name="clientId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select client..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No client</SelectItem>
                        {clients.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}{c.company ? ` — ${c.company}` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Contract Content</CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview((p) => !p)}
                >
                  {showPreview ? (
                    <><EyeOff className="mr-1 h-3.5 w-3.5" /> Edit</>
                  ) : (
                    <><Eye className="mr-1 h-3.5 w-3.5" /> Preview</>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showPreview ? (
                <div className="rounded-lg border p-4 bg-muted/30 min-h-[400px] text-sm whitespace-pre-wrap font-mono">
                  {contentValue || "No content yet..."}
                </div>
              ) : (
                <Textarea
                  {...register("content")}
                  placeholder="Contract content..."
                  rows={18}
                  className={`font-mono text-sm resize-none ${errors.content ? "border-destructive" : ""}`}
                />
              )}
              {errors.content && (
                <p className="text-xs text-destructive mt-1">{errors.content.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Signers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Signers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-3">
                  <div className="flex-1 grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Input
                        {...register(`signers.${index}.name`)}
                        placeholder="Signer name"
                      />
                      {errors.signers?.[index]?.name && (
                        <p className="text-xs text-destructive">
                          {errors.signers[index]?.name?.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Input
                        {...register(`signers.${index}.email`)}
                        type="email"
                        placeholder="signer@email.com"
                      />
                      {errors.signers?.[index]?.email && (
                        <p className="text-xs text-destructive">
                          {errors.signers[index]?.email?.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 mt-0 text-muted-foreground hover:text-destructive"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              {errors.signers && typeof errors.signers === "object" && "message" in errors.signers && (
                <p className="text-xs text-destructive">{String(errors.signers.message)}</p>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => append({ name: "", email: "" })}
                className="text-muted-foreground"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add signer
              </Button>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Contract
            </Button>
          </div>
        </div>

        {/* Variable Helper Sidebar */}
        <div className="space-y-4">
          <Card className="sticky top-20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm">Available Variables</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                Click a variable to insert it into your contract content.
              </p>
              <div className="space-y-2">
                {AVAILABLE_VARIABLES.map((v) => (
                  <button
                    key={v.name}
                    type="button"
                    onClick={() => insertVariable(v.name)}
                    className="w-full text-left group"
                  >
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors">
                      <Badge variant="outline" className="font-mono text-xs shrink-0">
                        {v.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{v.description}</span>
                    </div>
                  </button>
                ))}
              </div>
              <Separator className="my-3" />
              <p className="text-xs text-muted-foreground">
                Variables will be replaced when you send the contract to your client.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
