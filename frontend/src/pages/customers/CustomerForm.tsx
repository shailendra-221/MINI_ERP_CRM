import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createCustomer, fetchCustomer, updateCustomer } from "../../api/customers";
import { CustomerType, CustomerStatus } from "../../api/types";
import PageHeader from "../../components/PageHeader";
import { ErrorBanner, Spinner } from "../../components/Feedback";
import { apiErrorMessage } from "../../api/client";

interface FormState {
  name: string;
  mobile: string;
  email: string;
  businessName: string;
  gstNumber: string;
  customerType: CustomerType;
  address: string;
  status: CustomerStatus;
  followUpDate: string;
  notes: string;
}

const EMPTY: FormState = {
  name: "",
  mobile: "",
  email: "",
  businessName: "",
  gstNumber: "",
  customerType: "RETAIL",
  address: "",
  status: "LEAD",
  followUpDate: "",
  notes: "",
};

export default function CustomerForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const c = await fetchCustomer(id);
        setForm({
          name: c.name,
          mobile: c.mobile,
          email: c.email || "",
          businessName: c.businessName || "",
          gstNumber: c.gstNumber || "",
          customerType: c.customerType,
          address: c.address || "",
          status: c.status,
          followUpDate: c.followUpDate ? c.followUpDate.slice(0, 10) : "",
          notes: c.notes || "",
        });
      } catch (err) {
        setError(apiErrorMessage(err, "Could not load customer."));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        followUpDate: form.followUpDate ? new Date(form.followUpDate).toISOString() : undefined,
      };
      if (isEdit && id) {
        await updateCustomer(id, payload);
        navigate(`/customers/${id}`);
      } else {
        const created = await createCustomer(payload);
        navigate(`/customers/${created.id}`);
      }
    } catch (err) {
      setError(apiErrorMessage(err, "Could not save customer."));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="max-w-2xl">
      <PageHeader title={isEdit ? "Edit customer" : "Add customer"} subtitle="Keep contact and business details current for accurate follow-ups." />

      {error && (
        <div className="mb-4">
          <ErrorBanner message={error} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-5 lg:p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Customer name *</label>
            <input className="input" required value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div>
            <label className="label">Mobile number *</label>
            <input
              className="input"
              required
              placeholder="9876543210"
              value={form.mobile}
              onChange={(e) => set("mobile", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </div>
          <div>
            <label className="label">Business name</label>
            <input className="input" value={form.businessName} onChange={(e) => set("businessName", e.target.value)} />
          </div>
          <div>
            <label className="label">GST number</label>
            <input className="input code" value={form.gstNumber} onChange={(e) => set("gstNumber", e.target.value)} />
          </div>
          <div>
            <label className="label">Customer type</label>
            <select className="input" value={form.customerType} onChange={(e) => set("customerType", e.target.value as CustomerType)}>
              <option value="RETAIL">Retail</option>
              <option value="WHOLESALE">Wholesale</option>
              <option value="DISTRIBUTOR">Distributor</option>
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => set("status", e.target.value as CustomerStatus)}>
              <option value="LEAD">Lead</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <div>
            <label className="label">Follow-up date</label>
            <input type="date" className="input" value={form.followUpDate} onChange={(e) => set("followUpDate", e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">Address</label>
          <textarea className="input" rows={2} value={form.address} onChange={(e) => set("address", e.target.value)} />
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea className="input" rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add customer"}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
