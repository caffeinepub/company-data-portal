import { Bell } from "lucide-react";
import type { MachineRecord } from "./AddMachineDialog";

interface Props {
  machines: MachineRecord[];
}

function getDaysUntil(dateStr: string): number | null {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${dateStr}T00:00:00`);
  target.setHours(0, 0, 0, 0);
  return Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
}

export default function MachineStatsWidgets({ machines }: Props) {
  const total = machines.length;

  const overdue = machines.filter((m) => {
    const days = getDaysUntil(m.dueDate);
    return days !== null && days < 0;
  }).length;

  const dueSoon = machines.filter((m) => {
    const days = getDaysUntil(m.dueDate);
    return days !== null && days >= 0 && days <= 7;
  }).length;

  const dueToday = machines.filter((m) => {
    const days = getDaysUntil(m.dueDate);
    return days === 0;
  }).length;

  const onSchedule = machines.filter((m) => {
    const days = getDaysUntil(m.dueDate);
    return days !== null && days > 7;
  }).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {/* Total */}
      <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Total Machines
        </p>
        <p className="text-3xl font-bold text-foreground">{total}</p>
      </div>

      {/* On Schedule */}
      <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          On Schedule
        </p>
        <p className="text-3xl font-bold text-green-600">{onSchedule}</p>
      </div>

      {/* Due Soon */}
      <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Due Soon
        </p>
        <p className="text-3xl font-bold text-yellow-600">{dueSoon}</p>
        <p className="text-[10px] text-muted-foreground">Within 7 days</p>
      </div>

      {/* Due Today */}
      <div
        className={`rounded-xl border p-4 flex flex-col gap-1 transition-colors ${
          dueToday > 0
            ? "bg-amber-50 border-amber-300 dark:bg-amber-950/30 dark:border-amber-700"
            : "border-border bg-card"
        }`}
        data-ocid="stats.due_today.card"
      >
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Due Today
          </p>
          {dueToday > 0 && (
            <Bell
              className="h-3.5 w-3.5 text-amber-500 animate-pulse"
              fill="currentColor"
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          <p
            className={`text-3xl font-bold ${
              dueToday > 0 ? "text-amber-600" : "text-foreground"
            }`}
          >
            {dueToday}
          </p>
          {dueToday > 0 && (
            <span className="text-xs font-bold bg-amber-500 text-white rounded-full px-2 py-0.5 animate-pulse">
              NOW
            </span>
          )}
        </div>
      </div>

      {/* Cleaning Overdue */}
      <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Cleaning Overdue
        </p>
        <p className="text-3xl font-bold text-red-600">{overdue}</p>
      </div>
    </div>
  );
}
