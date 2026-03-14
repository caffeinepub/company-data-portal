import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarClock, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { MachineRecord } from "./AddMachineDialog";

interface Props {
  machine: MachineRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, doneDate: string, dueDate: string) => void;
}

export default function RescheduleDateDialog({
  machine,
  open,
  onOpenChange,
  onSave,
}: Props) {
  const [doneDate, setDoneDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ doneDate?: string; dueDate?: string }>(
    {},
  );

  useEffect(() => {
    if (machine) {
      setDoneDate(machine.doneDate || "");
      setDueDate(machine.dueDate || "");
      setErrors({});
    }
  }, [machine]);

  const validate = () => {
    const e: typeof errors = {};
    if (!doneDate) e.doneDate = "Required";
    if (!dueDate) e.dueDate = "Required";
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
    await new Promise((r) => setTimeout(r, 300));
    onSave(machine!.id, doneDate, dueDate);
    toast.success("Dates updated!", {
      description: `${machine!.machineType} #${machine!.machineNo} has been rescheduled.`,
      icon: <CalendarClock className="h-4 w-4" />,
    });
    setSaving(false);
    onOpenChange(false);
  };

  if (!machine) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-ocid="reschedule.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-bold flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            Reschedule Dates
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {machine.machineType}{" "}
            <span className="font-medium">#{machine.machineNo}</span>
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="mt-2 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="rs-done-date" className="text-sm font-medium">
              Done Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="rs-done-date"
              type="date"
              data-ocid="reschedule.done_date.input"
              value={doneDate}
              onChange={(e) => {
                setDoneDate(e.target.value);
                setErrors((p) => ({ ...p, doneDate: undefined }));
              }}
              className={errors.doneDate ? "border-destructive" : ""}
            />
            {errors.doneDate && (
              <p
                className="text-xs text-destructive"
                data-ocid="reschedule.done_date.error_state"
              >
                {errors.doneDate}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rs-due-date" className="text-sm font-medium">
              Due Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="rs-due-date"
              type="date"
              data-ocid="reschedule.due_date.input"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                setErrors((p) => ({ ...p, dueDate: undefined }));
              }}
              className={errors.dueDate ? "border-destructive" : ""}
            />
            {errors.dueDate && (
              <p
                className="text-xs text-destructive"
                data-ocid="reschedule.due_date.error_state"
              >
                {errors.dueDate}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              data-ocid="reschedule.cancel_button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="reschedule.submit_button"
              disabled={saving}
              className="min-w-28"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save Dates"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
