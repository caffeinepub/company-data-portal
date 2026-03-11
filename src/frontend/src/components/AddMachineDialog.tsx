import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export interface MachineRecord {
  id: string;
  machineType: string;
  machineNo: string;
  doneDate: string;
  dueDate: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (record: MachineRecord) => void;
}

const EMPTY = { machineType: "", machineNo: "", doneDate: "", dueDate: "" };

export default function AddMachineDialog({ open, onOpenChange, onAdd }: Props) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<typeof EMPTY>>({});
  const [saving, setSaving] = useState(false);

  const change = (field: keyof typeof EMPTY, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const validate = () => {
    const e: Partial<typeof EMPTY> = {};
    if (!form.machineType.trim()) e.machineType = "Required";
    if (!form.machineNo.trim()) e.machineNo = "Required";
    if (!form.doneDate) e.doneDate = "Required";
    if (!form.dueDate) e.dueDate = "Required";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    onAdd({ id: crypto.randomUUID(), ...form });
    toast.success("Machine added!", {
      description: `${form.machineType} #${form.machineNo} has been saved.`,
      icon: <CheckCircle2 className="h-4 w-4" />,
    });
    setForm(EMPTY);
    setErrors({});
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-ocid="add_machine.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold">
            Add Machine
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="mt-2">
          {/* 4-column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Col 1 – Machine Type */}
            <div className="space-y-1.5">
              <Label htmlFor="machine-type" className="text-sm font-medium">
                Machine Type <span className="text-destructive">*</span>
              </Label>
              <Input
                id="machine-type"
                data-ocid="add_machine.machine_type.input"
                placeholder="e.g. Pump"
                value={form.machineType}
                onChange={(e) => change("machineType", e.target.value)}
                className={errors.machineType ? "border-destructive" : ""}
              />
              {errors.machineType && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="add_machine.machine_type.error_state"
                >
                  {errors.machineType}
                </p>
              )}
            </div>

            {/* Col 2 – Machine No. */}
            <div className="space-y-1.5">
              <Label htmlFor="machine-no" className="text-sm font-medium">
                Machine No. <span className="text-destructive">*</span>
              </Label>
              <Input
                id="machine-no"
                data-ocid="add_machine.machine_no.input"
                placeholder="e.g. M-001"
                value={form.machineNo}
                onChange={(e) => change("machineNo", e.target.value)}
                className={errors.machineNo ? "border-destructive" : ""}
              />
              {errors.machineNo && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="add_machine.machine_no.error_state"
                >
                  {errors.machineNo}
                </p>
              )}
            </div>

            {/* Col 3 – Done Date */}
            <div className="space-y-1.5">
              <Label htmlFor="done-date" className="text-sm font-medium">
                Done Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="done-date"
                type="date"
                data-ocid="add_machine.done_date.input"
                value={form.doneDate}
                onChange={(e) => change("doneDate", e.target.value)}
                className={errors.doneDate ? "border-destructive" : ""}
              />
              {errors.doneDate && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="add_machine.done_date.error_state"
                >
                  {errors.doneDate}
                </p>
              )}
            </div>

            {/* Col 4 – Due Date */}
            <div className="space-y-1.5">
              <Label htmlFor="due-date" className="text-sm font-medium">
                Due Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="due-date"
                type="date"
                data-ocid="add_machine.due_date.input"
                value={form.dueDate}
                onChange={(e) => change("dueDate", e.target.value)}
                className={errors.dueDate ? "border-destructive" : ""}
              />
              {errors.dueDate && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="add_machine.due_date.error_state"
                >
                  {errors.dueDate}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              data-ocid="add_machine.cancel_button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="add_machine.submit_button"
              disabled={saving}
              className="min-w-24"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
