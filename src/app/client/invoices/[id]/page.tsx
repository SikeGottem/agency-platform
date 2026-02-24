import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, FileText } from "lucide-react";
import type { Invoice, InvoiceStatus } from "@/types";

export const metadata = {
  title: "Invoice — Briefed",
};

function formatCents(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

const STATUS_DISPLAY: Record<InvoiceStatus, { label: string; className: string; icon: typeof CheckCircle }> = {
  draft: { label: "Draft", className: "border-gray-300 text-gray-600 bg-gray-50", icon: FileText },
  sent: { label: "Awaiting Payment", className: "border-blue-300 text-blue-700 bg-blue-50", icon: Clock },
  paid: { label: "Paid", className: "border-green-300 text-green-700 bg-green-50", icon: CheckCircle },
  overdue: { label: "Overdue", className: "border-red-300 text-red-700 bg-red-50", icon: Clock },
};

export default async function ClientInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .single();

  if (!invoice) notFound();

  const inv = invoice as unknown as Invoice;
  const statusInfo = STATUS_DISPLAY[inv.status];
  const StatusIcon = statusInfo.icon;

  // Fetch designer profile for branding
  const { data: designer } = await supabase
    .from("profiles")
    .select("full_name, business_name")
    .eq("id", inv.designer_id)
    .single();

  const businessName = designer?.business_name || designer?.full_name || "Designer";

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold font-display">{businessName}</h1>
          <p className="text-muted-foreground text-sm">Invoice</p>
        </div>

        {/* Status Banner */}
        <div className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border ${statusInfo.className}`}>
          <StatusIcon className="h-4 w-4" />
          <span className="font-medium text-sm">{statusInfo.label}</span>
        </div>

        {/* Invoice Card */}
        <Card className="p-6 md:p-8 space-y-6">
          <div className="flex justify-between text-sm">
            <div>
              <p className="text-muted-foreground">Billed to</p>
              <p className="font-medium">{inv.client_email}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Invoice date</p>
              <p className="font-medium">{new Date(inv.created_at).toLocaleDateString()}</p>
              {inv.due_date && (
                <>
                  <p className="text-muted-foreground mt-2">Due date</p>
                  <p className="font-medium">{new Date(inv.due_date).toLocaleDateString()}</p>
                </>
              )}
            </div>
          </div>

          <Separator />

          {/* Line Items */}
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b">
                <th className="pb-3 font-medium">Description</th>
                <th className="pb-3 font-medium text-right">Qty</th>
                <th className="pb-3 font-medium text-right">Rate</th>
                <th className="pb-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {(inv.line_items ?? []).map((li, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-3">{li.description}</td>
                  <td className="py-3 text-right">{li.quantity}</td>
                  <td className="py-3 text-right">{formatCents(li.amount_cents, inv.currency)}</td>
                  <td className="py-3 text-right font-medium">
                    {formatCents(li.amount_cents * li.quantity, inv.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Separator />

          <div className="flex justify-end">
            <div className="text-right">
              <p className="text-muted-foreground text-sm">Total Due</p>
              <p className="text-3xl font-bold">{formatCents(inv.amount_cents, inv.currency)}</p>
            </div>
          </div>
        </Card>

        {/* Pay Now Button (for sent/overdue invoices) */}
        {(inv.status === "sent" || inv.status === "overdue") && (
          <div className="text-center">
            <Button size="lg" className="w-full sm:w-auto px-12 py-6 text-base" asChild>
              <a
                href={inv.stripe_invoice_id || "#"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!inv.stripe_invoice_id) {
                    e.preventDefault();
                    alert("Payment link not yet configured. Please contact the designer.");
                  }
                }}
              >
                Pay Now — {formatCents(inv.amount_cents, inv.currency)}
              </a>
            </Button>
            <p className="text-xs text-muted-foreground mt-3">Secure payment via Stripe</p>
          </div>
        )}

        {inv.status === "paid" && inv.paid_at && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Paid on {new Date(inv.paid_at).toLocaleDateString()}</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4">
          <p>Powered by <span className="font-medium">Briefed</span></p>
        </div>
      </div>
    </div>
  );
}
