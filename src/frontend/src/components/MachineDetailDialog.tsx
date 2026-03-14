import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Calendar,
  CheckCircle2,
  Edit2,
  RefreshCw,
  Trash2,
  Wrench,
} from "lucide-react";
import type { MachineRecord } from "./AddMachineDialog";

interface Props {
  machine: MachineRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReschedule?: (machine: MachineRecord) => void;
  onDelete?: (id: string) => void;
  onMarkCleaned?: (id: string) => void;
}

function formatDate(d: string) {
  if (!d) return "-";
  return new Date(`${d}T00:00:00`).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function daysLeft(dueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${dueDate}T00:00:00`);
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function DueBadge({ dueDate }: { dueDate: string }) {
  if (!dueDate) return null;
  const days = daysLeft(dueDate);
  let label = "";
  let cls = "";
  if (days < 0) {
    label = `${Math.abs(days)} DAYS OVERDUE`;
    cls = "border-red-500 text-red-600";
  } else if (days === 0) {
    label = "DUE TODAY!";
    cls = "border-amber-500 text-amber-600";
  } else if (days <= 7) {
    label = `DUE IN ${days} DAYS`;
    cls = "border-yellow-500 text-yellow-700";
  } else {
    label = `DUE IN ${days} DAYS`;
    cls = "border-green-500 text-green-700";
  }
  return (
    <span
      className={`text-xs font-bold tracking-wide border rounded-full px-3 py-1 ${cls}`}
    >
      {label}
    </span>
  );
}

export default function MachineDetailDialog({
  machine,
  open,
  onOpenChange,
  onReschedule,
  onDelete,
  onMarkCleaned,
}: Props) {
  if (!machine) return null;

  const machineParts = machine.parts.map((p) => p.name).join(", ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md p-0 overflow-hidden rounded-2xl"
        data-ocid="machine_detail.dialog"
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-1.5 rounded-md bg-muted">
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-bold leading-tight text-foreground">
                  {machine.machineType}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  # {machine.machineNo}
                </p>
              </div>
            </div>
            <DueBadge dueDate={machine.dueDate} />
          </div>
        </div>

        <div className="h-px bg-border mx-5" />

        {/* Dates */}
        <div className="px-5 py-4 grid grid-cols-2 gap-4">
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Last Cleaned
              </p>
              <p className="text-sm font-bold text-foreground mt-0.5">
                {formatDate(machine.doneDate)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Next Due
              </p>
              <p className="text-sm font-bold text-foreground mt-0.5">
                {formatDate(machine.dueDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Machine cleaning info row */}
        {machineParts && (
          <div className="mx-5 mb-4 flex items-center gap-2 rounded-md bg-muted/60 px-3 py-2">
            <RefreshCw className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold uppercase tracking-wide">
                Machine Cleaning:
              </span>{" "}
              {machineParts}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="px-5 pb-5 space-y-2">
          {/* Row 1: Edit + Delete */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              data-ocid="machine_detail.edit_button"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
              data-ocid="machine_detail.delete_button"
              onClick={() => {
                onDelete?.(machine.id);
                onOpenChange(false);
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>

          {/* Row 2: Cleaning Done + Reschedule */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2 border-green-300 text-green-700 hover:bg-green-50 hover:text-green-800 hover:border-green-400"
              data-ocid="machine_detail.cleaning_done.button"
              onClick={() => {
                onMarkCleaned?.(machine.id);
                onOpenChange(false);
              }}
            >
              <CheckCircle2 className="h-4 w-4" />
              Cleaning Done
            </Button>
            <Button
              className="flex items-center gap-2 bg-yellow-400 text-yellow-900 hover:bg-yellow-500 border-0"
              data-ocid="machine_detail.reschedule.button"
              onClick={() => {
                onOpenChange(false);
                onReschedule?.(machine);
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Reschedule
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
