import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarClock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { MachineRecord } from "./AddMachineDialog";

const RESCHEDULE_PASSWORD = "admin@1234";

type MonthType = "" | "Weekly" | "6 Month" | "1 Year";

function calcDueDate(doneDate: string, monthType: MonthType): string {
  if (!doneDate || !monthType) return "";
  const base = new Date(doneDate);
  if (monthType === "Weekly") base.setDate(base.getDate() + 7);
  else if (monthType === "6 Month") base.setMonth(base.getMonth() + 6);
  else if (monthType === "1 Year") base.setFullYear(base.getFullYear() + 1);
  return base.toISOString().split("T")[0];
}

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
  const [monthType, setMonthType] = useState<MonthType>("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{
    doneDate?: string;
    dueDate?: string;
    password?: string;
  }>({});

  useEffect(() => {
    if (machine) {
      setDoneDate(machine.doneDate || "");
      setDueDate(machine.dueDate || "");
      setMonthType("");
      setPassword("");
      setErrors({});
    }
  }, [machine]);

  const handleDoneDateChange = (val: string) => {
    setDoneDate(val);
    setErrors((p) => ({ ...p, doneDate: undefined }));
    if (monthType && val) {
      const auto = calcDueDate(val, monthType);
      if (auto) setDueDate(auto);
    }
  };

  const handleMonthTypeChange = (val: MonthType) => {
    setMonthType(val);
    if (val && doneDate) {
      const auto = calcDueDate(doneDate, val);
      if (auto) {
        setDueDate(auto);
        setErrors((p) => ({ ...p, dueDate: undefined }));
      }
    }
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!doneDate) e.doneDate = "Required";
    if (!dueDate) e.dueDate = "Required";
    if (!password) e.password = "Password is required";
    else if (password !== RESCHEDULE_PASSWORD)
      e.password = "Incorrect password";
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
              onChange={(e) => handleDoneDateChange(e.target.value)}
              className={errors.doneDate ? "border-destructive" : ""}
            />
            {errors.doneDate && (
              <p className="text-xs text-destructive">{errors.doneDate}</p>
            )}
          </div>

          {/* Month Type */}
          <div className="space-y-1.5">
            <Label htmlFor="rs-month-type" className="text-sm font-medium">
              Month Type
            </Label>
            <select
              id="rs-month-type"
              value={monthType}
              onChange={(e) =>
                handleMonthTypeChange(e.target.value as MonthType)
              }
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">-- Select Month Type --</option>
              <option value="Weekly">Weekly</option>
              <option value="6 Month">6 Month</option>
              <option value="1 Year">1 Year</option>
            </select>
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
              <p className="text-xs text-destructive">{errors.dueDate}</p>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-1.5 pt-1">
            <Label htmlFor="rs-password" className="text-sm font-medium">
              Password <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="rs-password"
                type={showPw ? "text" : "password"}
                data-ocid="reschedule.password.input"
                placeholder="Enter password to confirm"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((p) => ({ ...p, password: undefined }));
                }}
                className={`pr-10 ${errors.password ? "border-destructive" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPw ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p
                className="text-xs text-destructive"
                data-ocid="reschedule.password.error_state"
              >
                {errors.password}
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
