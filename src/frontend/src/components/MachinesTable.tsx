import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarClock, Eye, Search, X } from "lucide-react";
import { useState } from "react";
import type { MachineRecord } from "./AddMachineDialog";
import type { WidgetFilter } from "./MachineStatsWidgets";

interface Props {
  machines: MachineRecord[];
  onViewDetail: (machine: MachineRecord) => void;
  onReschedule: (machine: MachineRecord) => void;
  widgetFilter?: WidgetFilter;
}

function formatDate(d: string) {
  if (!d) return "-";
  return new Date(`${d}T00:00:00`).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function daysUntilDue(dueDate: string): number | null {
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${dueDate}T00:00:00`);
  target.setHours(0, 0, 0, 0);
  return Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
}

function CountdownBadge({ days }: { days: number | null }) {
  if (days === null)
    return <span className="text-muted-foreground text-xs">-</span>;
  if (days < 0)
    return (
      <Badge variant="destructive" className="text-xs font-semibold">
        {Math.abs(days)}d OVERDUE
      </Badge>
    );
  if (days === 0)
    return (
      <Badge className="bg-amber-500 text-white text-xs font-semibold hover:bg-amber-500">
        TODAY
      </Badge>
    );
  if (days <= 7)
    return (
      <Badge className="bg-yellow-500 text-white text-xs font-semibold hover:bg-yellow-500">
        DUE IN {days}d
      </Badge>
    );
  return (
    <Badge className="bg-green-600 text-white text-xs font-semibold hover:bg-green-600">
      DUE IN {days}d
    </Badge>
  );
}

function applyWidgetFilter(
  machines: MachineRecord[],
  filter: WidgetFilter,
): MachineRecord[] {
  if (!filter) return machines;
  return machines.filter((m) => {
    const days = daysUntilDue(m.dueDate);
    if (filter === "onSchedule") return days !== null && days > 7;
    if (filter === "dueSoon") return days !== null && days >= 0 && days <= 7;
    if (filter === "dueToday") return days === 0;
    if (filter === "overdue") return days !== null && days < 0;
    return true;
  });
}

const FILTER_LABELS: Record<NonNullable<WidgetFilter>, string> = {
  onSchedule: "On Schedule",
  dueSoon: "Due Soon",
  dueToday: "Due Today",
  overdue: "Cleaning Overdue",
};

export default function MachinesTable({
  machines,
  onViewDetail,
  onReschedule,
  widgetFilter,
}: Props) {
  const [search, setSearch] = useState("");

  const afterWidgetFilter = applyWidgetFilter(machines, widgetFilter ?? null);

  const filtered = search.trim()
    ? afterWidgetFilter.filter(
        (m) =>
          m.machineType.toLowerCase().includes(search.toLowerCase()) ||
          m.machineNo.toLowerCase().includes(search.toLowerCase()),
      )
    : afterWidgetFilter;

  return (
    <div className="space-y-3">
      {/* Active filter label */}
      {widgetFilter && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Showing:</span>
          <Badge variant="outline" className="font-semibold">
            {FILTER_LABELS[widgetFilter]}
          </Badge>
          <span className="text-muted-foreground text-xs">
            (click the widget again to clear)
          </span>
        </div>
      )}

      {/* Search bar */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          data-ocid="machines.search.input"
          placeholder="Search machine type or no..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-9"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {machines.length === 0 ? (
        <div
          data-ocid="machines.empty_state"
          className="flex flex-col items-center justify-center py-16 text-muted-foreground border border-dashed rounded-lg"
        >
          <p className="text-sm font-medium">No machines added yet.</p>
          <p className="text-xs mt-1">Click "Add Machine" to get started.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border border-dashed rounded-lg">
          <Search className="h-6 w-6 mb-2 opacity-50" />
          <p className="text-sm font-medium">No machines match your search.</p>
        </div>
      ) : (
        <div
          className="rounded-lg border border-border overflow-hidden"
          data-ocid="machines.table"
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">#</TableHead>
                <TableHead className="font-semibold">Machine Type</TableHead>
                <TableHead className="font-semibold">Machine No.</TableHead>
                <TableHead className="font-semibold">Done Date</TableHead>
                <TableHead className="font-semibold">Due Date</TableHead>
                <TableHead className="font-semibold">Countdown</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m, i) => {
                const isOverdue =
                  m.dueDate && new Date(`${m.dueDate}T00:00:00`) < new Date();
                const days = daysUntilDue(m.dueDate);
                return (
                  <TableRow key={m.id} data-ocid={`machines.row.${i + 1}`}>
                    <TableCell className="text-muted-foreground text-sm">
                      {i + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      {m.machineType}
                    </TableCell>
                    <TableCell>{m.machineNo}</TableCell>
                    <TableCell>{formatDate(m.doneDate)}</TableCell>
                    <TableCell>{formatDate(m.dueDate)}</TableCell>
                    <TableCell>
                      <CountdownBadge days={days} />
                    </TableCell>
                    <TableCell>
                      <Badge variant={isOverdue ? "destructive" : "secondary"}>
                        {isOverdue ? "Overdue" : "On Track"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          data-ocid={`machine_detail.open_modal_button.${i + 1}`}
                          onClick={() => onViewDetail(m)}
                          className="flex items-center gap-1.5 text-primary hover:text-primary"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          data-ocid={`reschedule.open_modal_button.${i + 1}`}
                          onClick={() => onReschedule(m)}
                          className="flex items-center gap-1.5 text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                        >
                          <CalendarClock className="h-4 w-4" />
                          Reschedule
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
