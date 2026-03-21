## 1. FREELANCER INVOICE & CONTRACT GENERATOR

### Detailed Specifications

**Core Features:**

- Invoice creation with line items, tax calculations, discounts
- Contract templates (freelance agreement, NDA, SOW, etc.)
- E-signature integration (DocuSign API or custom implementation)
- Multi-currency support with live exchange rates
- Payment tracking (paid, pending, overdue)
- Automated email reminders for overdue invoices
- Expense categorization and tracking
- Client management (contact info, project history)
- PDF generation for invoices/contracts
- Payment gateway integration (Stripe, PayPal)
- Dashboard with revenue analytics
- Recurring invoice automation

**Tech Stack:**

- Frontend: React + TypeScript + Tailwind CSS
- Backend: Node.js + Express or Next.js API routes
- Database: PostgreSQL or MongoDB
- PDF Generation: jsPDF or PDFKit
- Email: SendGrid or Resend
- Payments: Stripe API
- Auth: NextAuth.js or Clerk

**Monetization:**

- Free: 5 invoices/month, basic templates
- Pro ($15/mo): Unlimited invoices, all templates, payment tracking
- Business ($39/mo): Team accounts, API access, white-label, priority support

**MVP Scope (2-3 weeks):**

1. User auth + onboarding
2. Invoice builder with PDF export
3. Basic payment tracking
4. Email sending
5. Client management

---

### DEVELOPMENT PROMPT FOR INVOICE GENERATOR

```
Build a professional SaaS application for freelancers to manage invoices, contracts, and payments.

CORE REQUIREMENTS:

1. USER AUTHENTICATION & ONBOARDING
- Email/password and Google OAuth signup
- Multi-step onboarding: business details (name, logo, address, tax ID), payment preferences, currency selection
- User profile with branding customization (colors, logo placement)
- Email verification

2. INVOICE CREATION SYSTEM
- Dynamic invoice builder with:
  * Client selection/creation (name, email, address, company)
  * Invoice number auto-generation (customizable prefix)
  * Date issued and due date
  * Line items table: description, quantity, rate, amount (auto-calculated)
  * Subtotal, tax (customizable rate), discount (% or fixed), total
  * Payment terms and notes section
  * Currency selector with symbol display
- Save as draft or send immediately
- Duplicate existing invoices
- Invoice status: Draft, Sent, Paid, Overdue, Cancelled
- PDF generation with professional template (company branding, itemized breakdown)

3. CONTRACT & PROPOSAL TEMPLATES
- Pre-built templates: Freelance Service Agreement, NDA, Statement of Work, Project Proposal
- Template editor with variables: {client_name}, {project_name}, {amount}, {date}
- Custom template creation
- E-signature integration:
  * Send contract via email with signing link
  * Track signature status (pending, signed, declined)
  * Store signed PDFs securely
  * Support for multiple signers

4. PAYMENT TRACKING & REMINDERS
- Payment status dashboard showing: total invoiced, paid, pending, overdue
- Mark invoices as paid manually or via payment gateway webhook
- Automated reminder system:
  * 3 days before due date
  * On due date
  * 3, 7, 14 days after overdue
  * Customizable email templates
- Payment link generation (Stripe checkout or PayPal)
- Record partial payments

5. EXPENSE MANAGEMENT
- Add expenses with: date, category, amount, vendor, receipt upload
- Categorization: Office supplies, Travel, Equipment, Software, etc.
- Attach expenses to specific projects/clients
- Export expense reports (CSV, PDF)

6. CLIENT MANAGEMENT
- Client database with: company name, contact person, email, phone, address
- Project history per client (all invoices, contracts, payments)
- Client notes and tags
- Quick actions: send invoice, view outstanding balance

7. DASHBOARD & ANALYTICS
- Revenue overview: this month, last month, this year
- Charts: revenue over time, payment status breakdown, top clients
- Upcoming due dates calendar
- Recent activity feed

8. MULTI-CURRENCY SUPPORT
- Support for USD, EUR, GBP, EGP, AED, SAR
- Live exchange rate API (exchangerate-api.com or similar)
- Display currency symbol and code
- Option to set default currency per client

9. SETTINGS & CUSTOMIZATION
- Business settings: company name, logo, address, tax ID, VAT number
- Invoice settings: default payment terms, late fee policy, invoice numbering
- Email settings: custom email templates, sender name
- Notification preferences
- Billing and subscription management

10. FREEMIUM MODEL IMPLEMENTATION
- Free tier: 5 invoices/month, 2 contract templates, basic email reminders
- Pro tier ($15/mo): Unlimited invoices, all templates, payment gateway integration
- Business tier ($39/mo): Multi-user accounts, API access, white-label PDFs, priority support
- Usage tracking and upgrade prompts
- Stripe subscription integration

TECHNICAL IMPLEMENTATION:

Stack:
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui components
- PostgreSQL with Prisma ORM
- NextAuth.js for authentication
- Stripe for payments and subscriptions
- SendGrid/Resend for emails
- AWS S3 or Vercel Blob for file storage
- jsPDF or react-pdf for PDF generation

Database Schema:
- Users (id, email, name, company, logo, settings)
- Clients (id, userId, name, email, company, address)
- Invoices (id, userId, clientId, number, status, items[], subtotal, tax, total, dueDate, paidDate)
- Contracts (id, userId, clientId, templateId, content, status, signedAt)
- Expenses (id, userId, category, amount, date, receipt)
- Subscriptions (id, userId, plan, status, stripeCustomerId)

Key Features to Implement:
1. Invoice builder with real-time calculation
2. PDF generation with custom branding
3. Email automation with scheduling
4. Stripe webhook handling for payment confirmation
5. Currency conversion API integration
6. File upload for logos and receipts
7. Responsive design for mobile invoice viewing
8. Export functionality (PDF, CSV)

UI/UX Requirements:
- Clean, professional dashboard layout
- Invoice preview before sending
- Drag-and-drop line item reordering
- Keyboard shortcuts for power users
- Mobile-responsive for on-the-go invoice creation
- Dark mode support
- Loading states and error handling
- Toast notifications for actions

Security:
- Row-level security (users can only access their data)
- File upload validation and scanning
- Rate limiting on email sending
- Secure PDF storage with signed URLs
- CSRF protection
- Input sanitization

DELIVERABLES:
1. Fully functional web application
2. User authentication and authorization
3. Invoice and contract creation workflows
4. Payment tracking system
5. Email automation
6. Subscription billing integration
7. Responsive UI with modern design
8. Admin panel for managing templates
9. API endpoints for future integrations
10. Documentation for deployment

Build this as a production-ready SaaS with scalability, security, and user experience as priorities.
```
