import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  renderToBuffer,
} from "@react-pdf/renderer";
import React from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

// Register font
Font.register({
  family: "Helvetica",
  fonts: [],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#111827",
    padding: "40px 48px",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  companyName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
  },
  invoiceTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4F46E5",
    textAlign: "right",
  },
  invoiceNumber: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "right",
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  billingBlock: {
    flex: 1,
  },
  label: {
    fontSize: 9,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
    fontWeight: "bold",
  },
  value: {
    fontSize: 11,
    color: "#111827",
    lineHeight: 1.5,
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    padding: "8px 12px",
    borderRadius: 4,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    padding: "10px 12px",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  colDesc: { flex: 3 },
  colQty: { flex: 1, textAlign: "center" },
  colRate: { flex: 1, textAlign: "right" },
  colAmount: { flex: 1, textAlign: "right" },
  colHeader: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  totalsSection: {
    marginTop: 24,
    alignItems: "flex-end",
  },
  totalsTable: {
    width: 240,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  totalLabel: {
    color: "#6b7280",
    fontSize: 11,
  },
  totalValue: {
    fontSize: 11,
    textAlign: "right",
    minWidth: 80,
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTopWidth: 2,
    borderTopColor: "#4F46E5",
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#111827",
  },
  grandTotalValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#4F46E5",
    textAlign: "right",
    minWidth: 80,
  },
  notes: {
    marginTop: 40,
    padding: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: "#4F46E5",
  },
  notesLabel: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  notesText: {
    fontSize: 10,
    color: "#374151",
    lineHeight: 1.6,
  },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 12,
  },
  footerText: {
    fontSize: 9,
    color: "#9ca3af",
  },
  badge: {
    position: "absolute",
    top: 40,
    right: 48,
    backgroundColor: "#4F46E5",
    borderRadius: 100,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  badgeText: {
    color: "white",
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoicePDFData {
  number: string;
  issueDate: string | Date;
  dueDate: string | Date;
  currency: string;
  status: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountType: string | null;
  discountValue: number;
  discountAmount: number;
  total: number;
  notes?: string | null;
  paymentTerms?: string | null;
  user: {
    name?: string | null;
    companyName?: string | null;
    companyAddress?: string | null;
    companyCity?: string | null;
    companyCountry?: string | null;
    email: string;
    taxId?: string | null;
    vatNumber?: string | null;
    brandColor?: string;
  };
  client: {
    name: string;
    company?: string | null;
    email: string;
    address?: string | null;
    city?: string | null;
    country?: string | null;
  };
}

function InvoiceDocument({ data }: { data: InvoicePDFData }) {
  const primaryColor = data.user.brandColor || "#4F46E5";

  const companyDisplay =
    data.user.companyName || data.user.name || data.user.email;
  const companyAddr = [
    data.user.companyAddress,
    data.user.companyCity,
    data.user.companyCountry,
  ]
    .filter(Boolean)
    .join(", ");

  const clientAddr = [data.client.address, data.client.city, data.client.country]
    .filter(Boolean)
    .join(", ");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.companyName, { color: primaryColor }]}>
              {companyDisplay}
            </Text>
            {companyAddr ? (
              <Text style={{ fontSize: 10, color: "#6b7280", marginTop: 4 }}>
                {companyAddr}
              </Text>
            ) : null}
            {data.user.email ? (
              <Text style={{ fontSize: 10, color: "#6b7280" }}>
                {data.user.email}
              </Text>
            ) : null}
            {data.user.taxId ? (
              <Text style={{ fontSize: 9, color: "#9ca3af", marginTop: 4 }}>
                Tax ID: {data.user.taxId}
              </Text>
            ) : null}
          </View>
          <View>
            <Text style={[styles.invoiceTitle, { color: primaryColor }]}>
              INVOICE
            </Text>
            <Text style={styles.invoiceNumber}>#{data.number}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Bill To + Dates */}
        <View style={styles.row}>
          <View style={styles.billingBlock}>
            <Text style={styles.label}>Bill To</Text>
            <Text style={[styles.value, { fontWeight: "bold" }]}>
              {data.client.company || data.client.name}
            </Text>
            {data.client.company ? (
              <Text style={styles.value}>{data.client.name}</Text>
            ) : null}
            <Text style={styles.value}>{data.client.email}</Text>
            {clientAddr ? <Text style={styles.value}>{clientAddr}</Text> : null}
          </View>
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.label}>Issue Date</Text>
              <Text style={styles.value}>
                {formatDate(data.issueDate)}
              </Text>
            </View>
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.label}>Due Date</Text>
              <Text style={styles.value}>
                {formatDate(data.dueDate)}
              </Text>
            </View>
            {data.paymentTerms ? (
              <View>
                <Text style={styles.label}>Payment Terms</Text>
                <Text style={styles.value}>{data.paymentTerms}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Line Items Table */}
        <View style={styles.tableHeader}>
          <Text style={[styles.colHeader, styles.colDesc]}>Description</Text>
          <Text style={[styles.colHeader, styles.colQty]}>Qty</Text>
          <Text style={[styles.colHeader, styles.colRate]}>Rate</Text>
          <Text style={[styles.colHeader, styles.colAmount]}>Amount</Text>
        </View>

        {data.items.map((item, i) => (
          <View key={item.id || i} style={styles.tableRow}>
            <Text style={[styles.value, styles.colDesc]}>
              {item.description}
            </Text>
            <Text style={[styles.value, styles.colQty]}>
              {item.quantity}
            </Text>
            <Text style={[styles.value, styles.colRate]}>
              {formatCurrency(item.rate, data.currency)}
            </Text>
            <Text style={[styles.value, styles.colAmount]}>
              {formatCurrency(item.amount, data.currency)}
            </Text>
          </View>
        ))}

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsTable}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(data.subtotal, data.currency)}
              </Text>
            </View>
            {data.discountAmount > 0 ? (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  Discount{" "}
                  {data.discountType === "PERCENT"
                    ? `(${data.discountValue}%)`
                    : ""}
                </Text>
                <Text style={[styles.totalValue, { color: "#10b981" }]}>
                  -{formatCurrency(data.discountAmount, data.currency)}
                </Text>
              </View>
            ) : null}
            {data.taxAmount > 0 ? (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  Tax ({data.taxRate}%)
                </Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(data.taxAmount, data.currency)}
                </Text>
              </View>
            ) : null}
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total Due</Text>
              <Text style={[styles.grandTotalValue, { color: primaryColor }]}>
                {formatCurrency(data.total, data.currency)}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {data.notes ? (
          <View style={styles.notes}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>{data.notes}</Text>
          </View>
        ) : null}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated by FreelancePro
          </Text>
          <Text style={styles.footerText}>
            Invoice #{data.number}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generateInvoicePDF(data: InvoicePDFData): Promise<Buffer> {
  const buffer = await renderToBuffer(<InvoiceDocument data={data} />);
  return buffer as Buffer;
}
