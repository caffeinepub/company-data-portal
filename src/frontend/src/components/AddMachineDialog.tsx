import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Clock, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export interface MachinePart {
  name: string;
  status: "cleaned" | "pending";
}

export interface MachineRecord {
  id: string;
  machineType: string;
  machineNo: string;
  doneDate: string;
  dueDate: string;
  parts: MachinePart[];
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (record: MachineRecord) => void;
}

const EMPTY = {
  machineType: "",
  machineNo: "",
  doneDate: "",
  dueDate: "",
};

export default function AddMachineDialog({ open, onOpenChange, onAdd }: Props) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<typeof EMPTY>>({});
  const [saving, setSaving] = useState(false);

  const [parts, setParts] = useState<MachinePart[]>([]);
  const [partName, setPartName] = useState("");
  const [partStatus, setPartStatus] = useState<"cleaned" | "pending">(
    "cleaned",
  );

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

  const addPart = () => {
    if (!partName.trim()) return;
    setParts((p) => [...p, { name: partName.trim(), status: partStatus }]);
    setPartName("");
  };

  const removePart = (idx: number) => {
    setParts((p) => p.filter((_, i) => i !== idx));
  };

  const handlePartKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addPart();
    }
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
    onAdd({ id: crypto.randomUUID(), ...form, parts });
    toast.success("Machine added!", {
      description: `${form.machineType} #${form.machineNo} has been saved.`,
      icon: <CheckCircle2 className="h-4 w-4" />,
    });
    setForm(EMPTY);
    setErrors({});
    setParts([]);
    setPartName("");
    setPartStatus("cleaned");
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl" data-ocid="add_machine.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold">
            Add Machine
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="mt-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

          {/* Machine Parts Section */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Machine Parts</Label>

            <div className="flex gap-2 items-center">
              <Input
                data-ocid="add_machine.part_name.input"
                placeholder="Part name, e.g. Filter"
                value={partName}
                onChange={(e) => setPartName(e.target.value)}
                onKeyDown={handlePartKeyDown}
                className="flex-1"
              />
              <div className="flex rounded-md border border-border overflow-hidden text-sm">
                <button
                  type="button"
                  onClick={() => setPartStatus("cleaned")}
                  className={`px-3 py-2 flex items-center gap-1.5 transition-colors ${
                    partStatus === "cleaned"
                      ? "bg-green-500/10 text-green-700 dark:text-green-400 font-medium"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Cleaned
                </button>
                <div className="w-px bg-border" />
                <button
                  type="button"
                  onClick={() => setPartStatus("pending")}
                  className={`px-3 py-2 flex items-center gap-1.5 transition-colors ${
                    partStatus === "pending"
                      ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  Pending
                </button>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-ocid="add_machine.add_part.button"
                onClick={addPart}
                className="flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Add Part
              </Button>
            </div>

            {parts.length > 0 ? (
              <ul className="space-y-1.5">
                {parts.map((p, i) => (
                  <li
                    key={`${p.name}-${i}`}
                    className="flex items-center justify-between px-3 py-2 rounded-md bg-muted/50 border border-border text-sm"
                    data-ocid={`add_machine.part.item.${i + 1}`}
                  >
                    <span className="flex items-center gap-2">
                      {p.status === "cleaned" ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Clock className="h-3.5 w-3.5 text-amber-500" />
                      )}
                      <span className="font-medium">{p.name}</span>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-full ${
                          p.status === "cleaned"
                            ? "bg-green-500/10 text-green-700 dark:text-green-400"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                        }`}
                      >
                        {p.status}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => removePart(i)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      data-ocid={`add_machine.part.delete_button.${i + 1}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                No parts added yet. Parts are optional.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3">
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
