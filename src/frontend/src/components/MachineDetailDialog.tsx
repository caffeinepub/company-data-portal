import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  Clock,
  Timer,
} from "lucide-react";
import type { MachineRecord } from "./AddMachineDialog";

interface Props {
  machine: MachineRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDate(d: string) {
  if (!d) return "-";
  return new Date(`${d}T00:00:00`).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function daysLeft(dueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${dueDate}T00:00:00`);
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function MachineDetailDialog({
  machine,
  open,
  onOpenChange,
}: Props) {
  if (!machine) return null;

  const days = machine.dueDate ? daysLeft(machine.dueDate) : null;
  const cleanedParts = machine.parts.filter((p) => p.status === "cleaned");
  const pendingParts = machine.parts.filter((p) => p.status === "pending");

  let daysLabel = "";
  let daysBg = "";
  let daysText = "";
  if (days === null) {
    daysLabel = "\u2014";
    daysBg = "bg-muted";
    daysText = "text-muted-foreground";
  } else if (days < 0) {
    daysLabel = `${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""} overdue`;
    daysBg = "bg-destructive/10";
    daysText = "text-destructive";
  } else if (days === 0) {
    daysLabel = "Due Today";
    daysBg = "bg-amber-500/10";
    daysText = "text-amber-600 dark:text-amber-400";
  } else {
    daysLabel = `${days} day${days !== 1 ? "s" : ""} left`;
    daysBg = "bg-green-500/10";
    daysText = "text-green-700 dark:text-green-400";
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" data-ocid="machine_detail.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold">
            {machine.machineType}
            <span className="ml-2 text-muted-foreground font-normal text-base">
              #{machine.machineNo}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <CalendarCheck className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Last Cleaned</span>
            </div>
            <p className="text-sm font-semibold leading-tight">
              {formatDate(machine.doneDate)}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Due Date</span>
            </div>
            <p className="text-sm font-semibold leading-tight">
              {formatDate(machine.dueDate)}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-blue-500/5 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-xs font-medium">Next Clean</span>
            </div>
            <p className="text-sm font-semibold leading-tight text-blue-700 dark:text-blue-400">
              {formatDate(machine.nextCleanDate)}
            </p>
          </div>

          <div
            className={`rounded-lg border border-border p-3 space-y-1 ${daysBg}`}
          >
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Timer className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Countdown</span>
            </div>
            <p className={`text-sm font-bold leading-tight ${daysText}`}>
              {daysLabel}
            </p>
          </div>
        </div>

        {/* Parts section */}
        <div className="mt-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            Machine Parts
          </h3>

          {machine.parts.length === 0 ? (
            <p
              className="text-sm text-muted-foreground italic"
              data-ocid="machine_detail.parts.empty_state"
            >
              No parts recorded for this machine.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg border border-green-200 dark:border-green-900 bg-green-500/5 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                    Cleaned ({cleanedParts.length})
                  </span>
                </div>
                {cleanedParts.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">None</p>
                ) : (
                  <ul className="space-y-1">
                    {cleanedParts.map((p, i) => (
                      <li
                        key={`cleaned-${p.name}-${i}`}
                        className="text-sm text-green-800 dark:text-green-300 flex items-center gap-1.5"
                        data-ocid={`machine_detail.cleaned.item.${i + 1}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block flex-shrink-0" />
                        {p.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-500/5 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                    Pending ({pendingParts.length})
                  </span>
                </div>
                {pendingParts.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">None</p>
                ) : (
                  <ul className="space-y-1">
                    {pendingParts.map((p, i) => (
                      <li
                        key={`pending-${p.name}-${i}`}
                        className="text-sm text-amber-800 dark:text-amber-300 flex items-center gap-1.5"
                        data-ocid={`machine_detail.pending.item.${i + 1}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block flex-shrink-0" />
                        {p.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
