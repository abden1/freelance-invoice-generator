import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const onboardingSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  companyAddress: z.string().optional(),
  companyCity: z.string().optional(),
  companyCountry: z.string().optional(),
  taxId: z.string().optional(),
  vatNumber: z.string().optional(),
  defaultCurrency: z.string().default("USD"),
  invoicePrefix: z.string().default("INV"),
  defaultPaymentTerms: z.number().default(30),
});

export const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  company: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  currency: z.string().optional(),
});

export const invoiceItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0.01, "Quantity must be positive"),
  rate: z.number().min(0, "Rate must be non-negative"),
  amount: z.number().optional(),
});

export const invoiceSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  number: z.string().optional(),
  issueDate: z.string(),
  dueDate: z.string(),
  currency: z.string().default("USD"),
  items: z.array(invoiceItemSchema).min(1, "At least one line item is required"),
  taxRate: z.number().min(0).max(100).default(0),
  discountType: z.enum(["PERCENT", "FIXED"]).nullable().default(null),
  discountValue: z.number().min(0).default(0),
  notes: z.string().optional(),
  paymentTerms: z.string().optional(),
  status: z.enum(["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED", "PARTIAL"]).optional(),
});

export const expenseSchema = z.object({
  category: z.string().min(1, "Category is required"),
  amount: z.number().min(0.01, "Amount must be positive"),
  currency: z.string().default("USD"),
  vendor: z.string().optional(),
  description: z.string().optional(),
  date: z.string(),
  clientId: z.string().optional(),
  receiptUrl: z.string().optional(),
});

export const contractSchema = z.object({
  clientId: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  templateType: z.enum(["FREELANCE_AGREEMENT", "NDA", "SOW", "PROJECT_PROPOSAL", "CUSTOM"]),
  content: z.string().min(1, "Content is required"),
  signers: z.array(
    z.object({
      name: z.string(),
      email: z.string().email(),
      status: z.enum(["PENDING", "SIGNED", "DECLINED"]).default("PENDING"),
      signedAt: z.string().nullable().default(null),
      signature: z.string().nullable().default(null),
    })
  ),
});

export const businessSettingsSchema = z.object({
  companyName: z.string().optional(),
  companyAddress: z.string().optional(),
  companyCity: z.string().optional(),
  companyCountry: z.string().optional(),
  taxId: z.string().optional(),
  vatNumber: z.string().optional(),
  logoUrl: z.string().optional(),
  brandColor: z.string().optional(),
  defaultCurrency: z.string().optional(),
  invoicePrefix: z.string().optional(),
  defaultPaymentTerms: z.number().optional(),
  lateFeeEnabled: z.boolean().optional(),
  lateFeePercentage: z.number().optional(),
  emailNotifications: z.boolean().optional(),
  reminderDaysBefore: z.number().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type ContractInput = z.infer<typeof contractSchema>;
export type BusinessSettingsInput = z.infer<typeof businessSettingsSchema>;
