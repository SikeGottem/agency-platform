"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Send, Save, Trash2, Eye, DollarSign, FileText, Clock, CheckCircle } from "lucide-react";
import type { Invoice, InvoiceLineItem, InvoiceStatus, INVOICE_STATUSES } from "@/types";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  client_email: string | null;
  client_name: string | null;
}

interface InvoiceDashboardProps {
  invoices: Invoice[];
  projects: Project[];
  designerId: string;
}

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
  draft: { label: "Draft", variant: "secondary" },
  sent: { label: "Sent", variant: "outline", className: "border-blue-300 text-blue-700 bg-blue-50" },
  paid: { label: "Paid", variant: "default", className: "bg-green-600 hover:bg-green-500" },
  overdue: { label: "Overdue", variant: "destructive" },
};

function formatCents(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}

export function InvoiceDashboard({ invoices: initialInvoices, projects, designerId }: InvoiceDashboardProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | InvoiceStatus>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [preview, setPreview] = useState<Invoice | null>(null);

  const filtered = filter === "all"
    ? initialInvoices
    : initialInvoices.filter((inv) => inv.status === filter);

  const totalRevenue = initialInvoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.amount_cents, 0);

  const totalOutstanding = initialInvoices
    .filter((inv) => inv.status === "sent" || inv.status === "overdue")
    .reduce((sum, inv) => sum + inv.amount_cents, 0);

  const totalDraft = initialInvoices
    .filter((inv) => inv.status === "draft")
    .reduce((sum, inv) => sum + inv.amount_cents, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Invoices</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage and track your invoices</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Invoice
        </Button>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-700">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Revenue (Paid)</p>
              <p className="text-xl font-bold">{formatCents(totalRevenue)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Outstanding</p>
              <p className="text-xl font-bold">{formatCents(totalOutstanding)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Drafts</p>
              <p className="text-xl font-bold">{formatCents(totalDraft)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "draft", "sent", "paid", "overdue"] as const).map((s) => (
          <Button
            key={s}
            variant={filter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(s)}
          >
            {s === "all" ? "All" : STATUS_CONFIG[s].label}
            <span className="ml-1.5 text-xs opacity-70">
              ({s === "all" ? initialInvoices.length : initialInvoices.filter((i) => i.status === s).length})
            </span>
          </Button>
        ))}
      </div>

      {/* Invoice List */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No invoices yet</p>
          <p className="text-sm mt-1">Create your first invoice to get started</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((inv) => (
            <Card key={inv.id} className="p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{inv.client_email}</p>
                    <StatusBadge status={inv.status} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {inv.line_items?.length ?? 0} item{(inv.line_items?.length ?? 0) !== 1 ? "s" : ""}
                    {inv.due_date && ` · Due ${new Date(inv.due_date).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold">{formatCents(inv.amount_cents, inv.currency)}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(inv.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setPreview(inv)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      {showCreate && (
        <CreateInvoiceDialog
          projects={projects}
          designerId={designerId}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            router.refresh();
          }}
        />
      )}

      {/* Preview Dialog */}
      {preview && (
        <InvoicePreviewDialog
          invoice={preview}
          onClose={() => setPreview(null)}
          onStatusChange={() => {
            setPreview(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

/* ─── Create Invoice Dialog ─── */

interface CreateDialogProps {
  projects: Project[];
  designerId: string;
  onClose: () => void;
  onCreated: () => void;
}

function CreateInvoiceDialog({ projects, designerId, onClose, onCreated }: CreateDialogProps) {
  const [projectId, setProjectId] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    { description: "", quantity: 1, amount_cents: 0 },
  ]);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<"edit" | "preview">("edit");

  const selectedProject = projects.find((p) => p.id === projectId);

  function handleProjectChange(id: string) {
    setProjectId(id);
    const proj = projects.find((p) => p.id === id);
    if (proj?.client_email) setClientEmail(proj.client_email);
  }

  function updateLineItem(index: number, field: keyof InvoiceLineItem, value: string | number) {
    setLineItems((prev) =>
      prev.map((li, i) => (i === index ? { ...li, [field]: value } : li))
    );
  }

  function addLineItem() {
    setLineItems((prev) => [...prev, { description: "", quantity: 1, amount_cents: 0 }]);
  }

  function removeLineItem(index: number) {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  }

  const totalCents = lineItems.reduce((sum, li) => sum + li.amount_cents * li.quantity, 0);

  async function handleSave(status: "draft" | "sent") {
    if (!projectId || !clientEmail) {
      toast.error("Please select a project and enter client email");
      return;
    }
    if (lineItems.some((li) => !li.description || li.amount_cents <= 0)) {
      toast.error("Please fill in all line items");
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("invoices").insert({
        project_id: projectId,
        designer_id: designerId,
        client_email: clientEmail,
        amount_cents: totalCents,
        currency,
        status,
        due_date: dueDate || null,
        line_items: lineItems,
      });
      if (error) throw error;
      toast.success(status === "draft" ? "Invoice saved as draft" : "Invoice sent to client");
      onCreated();
    } catch {
      toast.error("Failed to create invoice");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{step === "edit" ? "Create Invoice" : "Preview Invoice"}</DialogTitle>
        </DialogHeader>

        {step === "edit" ? (
          <div className="space-y-5">
            {/* Project Select */}
            <div className="space-y-2">
              <Label>Project</Label>
              <Select value={projectId} onValueChange={handleProjectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Client Email</Label>
                <Input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="client@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-3">
              <Label>Line Items</Label>
              {lineItems.map((li, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <div className="flex-1">
                    {i === 0 && <span className="text-xs text-muted-foreground">Description</span>}
                    <Input
                      value={li.description}
                      onChange={(e) => updateLineItem(i, "description", e.target.value)}
                      placeholder="Design work..."
                    />
                  </div>
                  <div className="w-20">
                    {i === 0 && <span className="text-xs text-muted-foreground">Qty</span>}
                    <Input
                      type="number"
                      min={1}
                      value={li.quantity}
                      onChange={(e) => updateLineItem(i, "quantity", parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="w-28">
                    {i === 0 && <span className="text-xs text-muted-foreground">Rate ($)</span>}
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={li.amount_cents / 100 || ""}
                      onChange={(e) => updateLineItem(i, "amount_cents", Math.round(parseFloat(e.target.value || "0") * 100))}
                      placeholder="0.00"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLineItem(i)}
                    disabled={lineItems.length === 1}
                    className="shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addLineItem}>
                <Plus className="mr-1 h-3 w-3" />
                Add Item
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <p className="text-lg font-bold">Total: {formatCents(totalCents, currency)}</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button variant="secondary" onClick={() => setStep("preview")} disabled={!projectId}>
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Preview Step */
          <div className="space-y-5">
            <Card className="p-6 space-y-4">
              <div className="flex justify-between">
                <div>
                  <p className="font-bold text-lg">Invoice</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedProject?.name}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p>To: {clientEmail}</p>
                  {dueDate && <p className="text-muted-foreground">Due: {new Date(dueDate).toLocaleDateString()}</p>}
                </div>
              </div>
              <Separator />
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b">
                    <th className="pb-2">Description</th>
                    <th className="pb-2 text-right">Qty</th>
                    <th className="pb-2 text-right">Rate</th>
                    <th className="pb-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((li, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2">{li.description}</td>
                      <td className="py-2 text-right">{li.quantity}</td>
                      <td className="py-2 text-right">{formatCents(li.amount_cents, currency)}</td>
                      <td className="py-2 text-right font-medium">{formatCents(li.amount_cents * li.quantity, currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Separator />
              <div className="text-right">
                <p className="text-lg font-bold">Total: {formatCents(totalCents, currency)}</p>
              </div>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("edit")}>
                ← Back to Edit
              </Button>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => handleSave("draft")} disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Draft
                </Button>
                <Button onClick={() => handleSave("sent")} disabled={saving}>
                  <Send className="mr-2 h-4 w-4" />
                  Send to Client
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ─── Preview / Status Management Dialog ─── */

interface PreviewDialogProps {
  invoice: Invoice;
  onClose: () => void;
  onStatusChange: () => void;
}

function InvoicePreviewDialog({ invoice, onClose, onStatusChange }: PreviewDialogProps) {
  const [updating, setUpdating] = useState(false);

  async function markAs(status: InvoiceStatus) {
    setUpdating(true);
    try {
      const supabase = createClient();
      const updates: Record<string, unknown> = { status };
      if (status === "paid") updates.paid_at = new Date().toISOString();
      const { error } = await supabase.from("invoices").update(updates).eq("id", invoice.id);
      if (error) throw error;
      toast.success(`Invoice marked as ${status}`);
      onStatusChange();
    } catch {
      toast.error("Failed to update invoice");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Invoice <StatusBadge status={invoice.status} />
          </DialogTitle>
        </DialogHeader>

        <Card className="p-6 space-y-4">
          <div className="flex justify-between text-sm">
            <div>
              <p className="font-medium">To: {invoice.client_email}</p>
              <p className="text-muted-foreground">Created: {new Date(invoice.created_at).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              {invoice.due_date && <p>Due: {new Date(invoice.due_date).toLocaleDateString()}</p>}
              {invoice.paid_at && <p className="text-green-600">Paid: {new Date(invoice.paid_at).toLocaleDateString()}</p>}
            </div>
          </div>
          <Separator />
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b">
                <th className="pb-2">Description</th>
                <th className="pb-2 text-right">Qty</th>
                <th className="pb-2 text-right">Rate</th>
                <th className="pb-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {(invoice.line_items ?? []).map((li, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2">{li.description}</td>
                  <td className="py-2 text-right">{li.quantity}</td>
                  <td className="py-2 text-right">{formatCents(li.amount_cents, invoice.currency)}</td>
                  <td className="py-2 text-right font-medium">{formatCents(li.amount_cents * li.quantity, invoice.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Separator />
          <div className="text-right">
            <p className="text-lg font-bold">Total: {formatCents(invoice.amount_cents, invoice.currency)}</p>
          </div>
        </Card>

        <div className="flex justify-between items-center">
          <Button variant="outline" size="sm" asChild>
            <a href={`/client/invoices/${invoice.id}`} target="_blank">
              Client View ↗
            </a>
          </Button>
          <div className="flex gap-2">
            {invoice.status === "draft" && (
              <Button size="sm" onClick={() => markAs("sent")} disabled={updating}>
                <Send className="mr-2 h-4 w-4" />
                Send
              </Button>
            )}
            {(invoice.status === "sent" || invoice.status === "overdue") && (
              <Button size="sm" onClick={() => markAs("paid")} disabled={updating}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark Paid
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
