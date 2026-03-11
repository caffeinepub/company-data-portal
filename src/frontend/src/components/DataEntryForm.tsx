import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAddRecord } from "../hooks/useQueries";

const CATEGORIES = [
  { value: "sales", label: "Sales" },
  { value: "hr", label: "HR" },
  { value: "finance", label: "Finance" },
  { value: "operations", label: "Operations" },
  { value: "other", label: "Other" },
];

interface FormState {
  name: string;
  category: string;
  department: string;
  date: string;
  value: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  category: "",
  department: "",
  date: "",
  value: "",
  notes: "",
};

interface Props {
  onSuccess?: () => void;
}

export default function DataEntryForm({ onSuccess }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const { mutateAsync: addRecord, isPending } = useAddRecord();

  const validate = () => {
    const errs: Partial<FormState> = {};
    if (!form.name.trim()) errs.name = "Record name is required";
    if (!form.category) errs.category = "Category is required";
    if (!form.department.trim()) errs.department = "Department is required";
    if (!form.date) errs.date = "Date is required";
    if (!form.value || Number.isNaN(Number(form.value)))
      errs.value = "Valid amount is required";
    return errs;
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    try {
      await addRecord({
        id: crypto.randomUUID(),
        name: form.name.trim(),
        categoryText: form.category,
        department: form.department.trim(),
        date: form.date,
        value: Number(form.value),
        notes: form.notes.trim(),
      });
      toast.success("Record added successfully!", {
        description: `"${form.name}" has been saved.`,
        icon: <CheckCircle2 className="h-4 w-4" />,
      });
      setForm(EMPTY_FORM);
      setErrors({});
      onSuccess?.();
    } catch {
      toast.error("Failed to add record", {
        description: "Please check your connection and try again.",
      });
    }
  };

  return (
    <Card className="shadow-card max-w-2xl">
      <CardHeader>
        <CardTitle className="font-display text-xl font-bold">
          New Record
        </CardTitle>
        <CardDescription>
          Fill in the details below to add a new company record.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Name + Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="record-name" className="text-sm font-medium">
                Record Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="record-name"
                data-ocid="form.record_name.input"
                placeholder="e.g. Q1 Revenue Report"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={
                  errors.name
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              />
              {errors.name && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="form.name.error_state"
                >
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-sm font-medium">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.category}
                onValueChange={(v) => handleChange("category", v)}
              >
                <SelectTrigger
                  id="category"
                  data-ocid="form.category.select"
                  className={errors.category ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="form.category.error_state"
                >
                  {errors.category}
                </p>
              )}
            </div>
          </div>

          {/* Department + Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="department" className="text-sm font-medium">
                Department <span className="text-destructive">*</span>
              </Label>
              <Input
                id="department"
                data-ocid="form.department.input"
                placeholder="e.g. Marketing"
                value={form.department}
                onChange={(e) => handleChange("department", e.target.value)}
                className={
                  errors.department
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              />
              {errors.department && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="form.department.error_state"
                >
                  {errors.department}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="date" className="text-sm font-medium">
                Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                data-ocid="form.date.input"
                value={form.date}
                onChange={(e) => handleChange("date", e.target.value)}
                className={
                  errors.date
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              />
              {errors.date && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="form.date.error_state"
                >
                  {errors.date}
                </p>
              )}
            </div>
          </div>

          {/* Value */}
          <div className="space-y-1.5">
            <Label htmlFor="value" className="text-sm font-medium">
              Value / Amount <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                $
              </span>
              <Input
                id="value"
                type="number"
                data-ocid="form.value.input"
                placeholder="0.00"
                value={form.value}
                onChange={(e) => handleChange("value", e.target.value)}
                className={`pl-7 ${errors.value ? "border-destructive focus-visible:ring-destructive" : ""}`}
                step="0.01"
              />
            </div>
            {errors.value && (
              <p
                className="text-xs text-destructive"
                data-ocid="form.value.error_state"
              >
                {errors.value}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes
              <span className="ml-1 text-xs text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              id="notes"
              data-ocid="form.notes.textarea"
              placeholder="Add any relevant notes or context…"
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">
              Fields marked with * are required
            </p>
            <Button
              type="submit"
              data-ocid="form.submit_button"
              disabled={isPending}
              className="min-w-32"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Record
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
