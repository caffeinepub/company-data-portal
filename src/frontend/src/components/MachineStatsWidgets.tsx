import { Bell } from "lucide-react";
import type { MachineRecord } from "./AddMachineDialog";

export type WidgetFilter =
  | "onSchedule"
  | "dueSoon"
  | "dueToday"
  | "overdue"
  | null;

interface Props {
  machines: MachineRecord[];
  activeFilter?: WidgetFilter;
  onFilterClick?: (filter: WidgetFilter) => void;
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

export default function MachineStatsWidgets({
  machines,
  activeFilter,
  onFilterClick,
}: Props) {
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

  const handleClick = (filter: WidgetFilter) => {
    if (!onFilterClick) return;
    onFilterClick(activeFilter === filter ? null : filter);
  };

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
      <button
        type="button"
        onClick={() => handleClick("onSchedule")}
        className={`rounded-xl border p-4 flex flex-col gap-1 cursor-pointer transition-all text-left ${
          activeFilter === "onSchedule"
            ? "border-green-500 bg-green-50 dark:bg-green-950/30 ring-2 ring-green-400"
            : "border-border bg-card hover:border-green-400 hover:bg-green-50/50 dark:hover:bg-green-950/10"
        }`}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          On Schedule
        </p>
        <p className="text-3xl font-bold text-green-600">{onSchedule}</p>
        {activeFilter === "onSchedule" && (
          <p className="text-[10px] text-green-600 font-medium">Filtered ✓</p>
        )}
      </button>

      {/* Due Soon */}
      <button
        type="button"
        onClick={() => handleClick("dueSoon")}
        className={`rounded-xl border p-4 flex flex-col gap-1 cursor-pointer transition-all text-left ${
          activeFilter === "dueSoon"
            ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30 ring-2 ring-yellow-400"
            : "border-border bg-card hover:border-yellow-400 hover:bg-yellow-50/50 dark:hover:bg-yellow-950/10"
        }`}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Due Soon
        </p>
        <p className="text-3xl font-bold text-yellow-600">{dueSoon}</p>
        <p className="text-[10px] text-muted-foreground">Within 7 days</p>
        {activeFilter === "dueSoon" && (
          <p className="text-[10px] text-yellow-600 font-medium">Filtered ✓</p>
        )}
      </button>

      {/* Due Today */}
      <button
        type="button"
        onClick={() => handleClick("dueToday")}
        data-ocid="stats.due_today.card"
        className={`rounded-xl border p-4 flex flex-col gap-1 cursor-pointer transition-all text-left ${
          activeFilter === "dueToday"
            ? "border-amber-500 bg-amber-100 dark:bg-amber-950/40 ring-2 ring-amber-400"
            : dueToday > 0
              ? "bg-amber-50 border-amber-300 dark:bg-amber-950/30 dark:border-amber-700 hover:border-amber-400"
              : "border-border bg-card hover:border-amber-300"
        }`}
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
        {activeFilter === "dueToday" && (
          <p className="text-[10px] text-amber-600 font-medium">Filtered ✓</p>
        )}
      </button>

      {/* Cleaning Overdue */}
      <button
        type="button"
        onClick={() => handleClick("overdue")}
        className={`rounded-xl border p-4 flex flex-col gap-1 cursor-pointer transition-all text-left ${
          activeFilter === "overdue"
            ? "border-red-500 bg-red-50 dark:bg-red-950/30 ring-2 ring-red-400"
            : "border-border bg-card hover:border-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/10"
        }`}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Cleaning Overdue
        </p>
        <p className="text-3xl font-bold text-red-600">{overdue}</p>
        {activeFilter === "overdue" && (
          <p className="text-[10px] text-red-600 font-medium">Filtered ✓</p>
        )}
      </button>
    </div>
  );
}
