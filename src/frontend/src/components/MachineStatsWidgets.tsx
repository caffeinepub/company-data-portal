import { AlertCircle, Bell, CheckCircle2, Wrench, XCircle } from "lucide-react";
import type { MachineRecord } from "./AddMachineDialog";

interface Props {
  machines: MachineRecord[];
}

export default function MachineStatsWidgets({ machines }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const sevenDaysLater = new Date(today);
  sevenDaysLater.setDate(today.getDate() + 7);

  const total = machines.length;

  const overdue = machines.filter((m) => {
    if (!m.dueDate) return false;
    const due = new Date(m.dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  }).length;

  const dueToday = machines.filter((m) => {
    if (!m.dueDate) return false;
    const due = new Date(m.dueDate);
    due.setHours(0, 0, 0, 0);
    return due.getTime() === today.getTime();
  }).length;

  const dueSoon = machines.filter((m) => {
    if (!m.dueDate) return false;
    const due = new Date(m.dueDate);
    due.setHours(0, 0, 0, 0);
    return due > today && due <= sevenDaysLater;
  }).length;

  const onSchedule = machines.filter((m) => {
    if (!m.dueDate) return false;
    const due = new Date(m.dueDate);
    due.setHours(0, 0, 0, 0);
    return due > sevenDaysLater;
  }).length;

  const stats = [
    {
      label: "Total Machines",
      value: total,
      icon: Wrench,
      ocid: "machines.total.card",
      highlight: true,
    },
    {
      label: "On Schedule",
      value: onSchedule,
      icon: CheckCircle2,
      ocid: "machines.on_schedule.card",
    },
    {
      label: "Due Soon",
      value: dueSoon,
      icon: AlertCircle,
      ocid: "machines.due_soon.card",
    },
    {
      label: "Due Today",
      value: dueToday,
      icon: Bell,
      ocid: "machines.due_today.card",
    },
    {
      label: "Cleaning Overdue",
      value: overdue,
      icon: XCircle,
      ocid: "machines.overdue.card",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map(({ label, value, icon: Icon, ocid, highlight }) => (
        <div
          key={label}
          data-ocid={ocid}
          className={`flex items-start gap-3 rounded-xl border p-4 ${
            highlight ? "bg-muted/60" : "bg-card"
          }`}
        >
          <Icon className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
          <div>
            <p className="text-2xl font-bold leading-none">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
