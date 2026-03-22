import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Bell,
  Calendar,
  Download,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { MGCRecord, backendInterface } from "../backend.d";
import { useActor } from "../hooks/useActor";

const PASSWORD = "admin@1234";

const GEAR_TYPES = [
  "1st gear IS",
  "2nd gear IS",
  "3rd gear IS",
  "4th gear IS",
  "Ri Dears IS",
  "Gears, LS 78",
  "LS 65",
];

type WidgetFilter = "onSchedule" | "dueSoon" | "dueToday" | "overdue" | null;

interface MGCPageProps {
  onBack: () => void;
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

function addMonthsToDate(dateStr: string, months: number): string {
  if (!dateStr) return "";
  const d = new Date(`${dateStr}T00:00:00`);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
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

function StatusBadge({ status }: { status: string }) {
  if (status === "Calibrated")
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
        Calibrated
      </Badge>
    );
  if (status === "Pending")
    return (
      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100">
        Pending
      </Badge>
    );
  return (
    <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">
      Overdue
    </Badge>
  );
}

function MGCStatsWidgets({
  records,
  activeFilter,
  onFilterClick,
}: {
  records: MGCRecord[];
  activeFilter: WidgetFilter;
  onFilterClick: (f: WidgetFilter) => void;
}) {
  const total = records.length;
  const overdue = records.filter((r) => {
    const d = getDaysUntil(r.dueDate);
    return d !== null && d < 0;
  }).length;
  const dueSoon = records.filter((r) => {
    const d = getDaysUntil(r.dueDate);
    return d !== null && d >= 0 && d <= 7;
  }).length;
  const dueToday = records.filter((r) => getDaysUntil(r.dueDate) === 0).length;
  const onSchedule = records.filter((r) => {
    const d = getDaysUntil(r.dueDate);
    return d !== null && d > 7;
  }).length;

  const handle = (f: WidgetFilter) =>
    onFilterClick(activeFilter === f ? null : f);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Total Gears
        </p>
        <p className="text-3xl font-bold text-foreground">{total}</p>
      </div>

      <button
        type="button"
        onClick={() => handle("onSchedule")}
        className={`rounded-xl border p-4 flex flex-col gap-1 cursor-pointer transition-all text-left ${
          activeFilter === "onSchedule"
            ? "border-green-500 bg-green-50 ring-2 ring-green-400"
            : "border-border bg-card hover:border-green-400 hover:bg-green-50/50"
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

      <button
        type="button"
        onClick={() => handle("dueSoon")}
        className={`rounded-xl border p-4 flex flex-col gap-1 cursor-pointer transition-all text-left ${
          activeFilter === "dueSoon"
            ? "border-yellow-500 bg-yellow-50 ring-2 ring-yellow-400"
            : "border-border bg-card hover:border-yellow-400 hover:bg-yellow-50/50"
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

      <button
        type="button"
        onClick={() => handle("dueToday")}
        className={`rounded-xl border p-4 flex flex-col gap-1 cursor-pointer transition-all text-left ${
          activeFilter === "dueToday"
            ? "border-amber-500 bg-amber-100 ring-2 ring-amber-400"
            : dueToday > 0
              ? "bg-amber-50 border-amber-300 hover:border-amber-400"
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
            className={`text-3xl font-bold ${dueToday > 0 ? "text-amber-600" : "text-foreground"}`}
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

      <button
        type="button"
        onClick={() => handle("overdue")}
        className={`rounded-xl border p-4 flex flex-col gap-1 cursor-pointer transition-all text-left ${
          activeFilter === "overdue"
            ? "border-red-500 bg-red-50 ring-2 ring-red-400"
            : "border-border bg-card hover:border-red-400 hover:bg-red-50/50"
        }`}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Calibration Overdue
        </p>
        <p className="text-3xl font-bold text-red-600">{overdue}</p>
        {activeFilter === "overdue" && (
          <p className="text-[10px] text-red-600 font-medium">Filtered ✓</p>
        )}
      </button>
    </div>
  );
}

const FILTER_LABELS: Record<NonNullable<WidgetFilter>, string> = {
  onSchedule: "On Schedule",
  dueSoon: "Due Soon",
  dueToday: "Due Today",
  overdue: "Calibration Overdue",
};

function exportMGCToExcel(records: MGCRecord[]) {
  const headers = [
    "#",
    "Gear Name",
    "Gear No.",
    "Machine No.",
    "Gear Type",
    "Part Serial No.",
    "Calibration Date",
    "Due Date",
    "Status",
    "Remarks",
  ];
  const rows = records.map((r, i) => [
    i + 1,
    r.gearName,
    r.gearNo,
    r.machineNo || "-",
    r.gearType || "-",
    r.partSerialNo || "-",
    r.calibrationDate || "-",
    r.dueDate || "-",
    r.status,
    r.remarks || "-",
  ]);
  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\r\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mgc_records_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function MGCPage({ onBack }: MGCPageProps) {
  const { actor, isFetching } = useActor();
  const backend = actor as unknown as backendInterface | null;

  const [records, setRecords] = useState<MGCRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [widgetFilter, setWidgetFilter] = useState<WidgetFilter>(null);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  // Form state
  const [gearName, setGearName] = useState("");
  const [gearNo, setGearNo] = useState("");
  const [machineNo, setMachineNo] = useState("");
  const [gearType, setGearType] = useState("");
  const [partSerialNo, setPartSerialNo] = useState("");
  const [calibrationDate, setCalibrationDate] = useState("");
  const [monthType, setMonthType] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("Calibrated");
  const [remarks, setRemarks] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Reschedule state
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rescheduleCalibrationDate, setRescheduleCalibrationDate] =
    useState("");
  const [rescheduleDueDate, setRescheduleDueDate] = useState("");
  const [rescheduleMonthType, setRescheduleMonthType] = useState("");
  const [reschedulePassword, setReschedulePassword] = useState("");
  const [rescheduleError, setRescheduleError] = useState("");
  const [rescheduling, setRescheduling] = useState(false);

  const handleMonthTypeChange = (val: string) => {
    setMonthType(val);
    if (calibrationDate) {
      const months = val === "6month" ? 6 : 12;
      setDueDate(addMonthsToDate(calibrationDate, months));
    }
  };

  const handleCalibrationDateChange = (val: string) => {
    setCalibrationDate(val);
    if (monthType && val) {
      const months = monthType === "6month" ? 6 : 12;
      setDueDate(addMonthsToDate(val, months));
    }
  };

  const handleRescheduleCalibrationDateChange = (val: string) => {
    setRescheduleCalibrationDate(val);
    if (rescheduleMonthType && val) {
      const months = rescheduleMonthType === "6month" ? 6 : 12;
      setRescheduleDueDate(addMonthsToDate(val, months));
    }
  };

  const handleRescheduleMonthTypeChange = (val: string) => {
    setRescheduleMonthType(val);
    if (val && rescheduleCalibrationDate) {
      const months = val === "6month" ? 6 : 12;
      setRescheduleDueDate(addMonthsToDate(rescheduleCalibrationDate, months));
    }
  };

  useEffect(() => {
    if (!backend || isFetching) return;
    setLoading(true);
    backend
      .getAllMGCRecords()
      .then((data) => setRecords(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [backend, isFetching]);

  const handleAdd = async () => {
    setFormError("");
    if (!gearName || !gearNo || !calibrationDate || !dueDate) {
      setFormError("Please fill in all required fields.");
      return;
    }
    if (formPassword !== PASSWORD) {
      setFormError("Incorrect password.");
      return;
    }
    setSaving(true);
    const id = `mgc_${Date.now()}`;
    const newRecord: MGCRecord = {
      id,
      gearName,
      gearNo,
      gearType,
      partSerialNo,
      machineNo,
      calibrationDate,
      dueDate,
      status,
      remarks,
    };
    setRecords((prev) => [...prev, newRecord]);
    backend
      ?.addMGCRecord(
        id,
        gearName,
        gearNo,
        gearType,
        partSerialNo,
        machineNo,
        calibrationDate,
        dueDate,
        status,
        remarks,
      )
      .catch(() => {});
    setGearName("");
    setGearNo("");
    setMachineNo("");
    setGearType("");
    setPartSerialNo("");
    setCalibrationDate("");
    setMonthType("");
    setDueDate("");
    setStatus("Calibrated");
    setRemarks("");
    setFormPassword("");
    setSaving(false);
    setAddOpen(false);
  };

  const handleDelete = async () => {
    setDeleteError("");
    if (deletePassword !== PASSWORD) {
      setDeleteError("Incorrect password.");
      return;
    }
    if (!deleteId) return;
    setDeleting(true);
    setRecords((prev) => prev.filter((r) => r.id !== deleteId));
    backend?.deleteMGCRecord(deleteId).catch(() => {});
    setDeleteId(null);
    setDeletePassword("");
    setDeleting(false);
  };

  const handleReschedule = async () => {
    setRescheduleError("");
    if (!rescheduleCalibrationDate || !rescheduleDueDate) {
      setRescheduleError("Please fill in both dates.");
      return;
    }
    if (reschedulePassword !== PASSWORD) {
      setRescheduleError("Incorrect password.");
      return;
    }
    if (!rescheduleId) return;
    setRescheduling(true);
    const id = rescheduleId;
    const newCalDate = rescheduleCalibrationDate;
    const newDueDate = rescheduleDueDate;
    const rec = records.find((r) => r.id === id);
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, calibrationDate: newCalDate, dueDate: newDueDate }
          : r,
      ),
    );
    if (rec) {
      backend
        ?.updateMGCRecord(
          id,
          rec.gearName,
          rec.gearNo,
          rec.gearType || "",
          rec.partSerialNo || "",
          rec.machineNo || "",
          newCalDate,
          newDueDate,
          rec.status,
          rec.remarks,
        )
        .catch(() => {});
    }
    setRescheduleId(null);
    setRescheduleCalibrationDate("");
    setRescheduleDueDate("");
    setRescheduleMonthType("");
    setReschedulePassword("");
    setRescheduling(false);
  };

  const afterWidgetFilter = widgetFilter
    ? records.filter((r) => {
        const d = getDaysUntil(r.dueDate);
        if (widgetFilter === "onSchedule") return d !== null && d > 7;
        if (widgetFilter === "dueSoon") return d !== null && d >= 0 && d <= 7;
        if (widgetFilter === "dueToday") return d === 0;
        if (widgetFilter === "overdue") return d !== null && d < 0;
        return true;
      })
    : records;

  const filtered = search.trim()
    ? afterWidgetFilter.filter(
        (r) =>
          r.gearName.toLowerCase().includes(search.toLowerCase()) ||
          r.gearNo.toLowerCase().includes(search.toLowerCase()),
      )
    : afterWidgetFilter;

  return (
    <div className="min-h-screen bg-background">
      <header className="relative overflow-hidden border-b border-border bg-card">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url('/assets/generated/data-portal-bg.dim_1200x400.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative container mx-auto px-6 py-4 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                data-ocid="mgc.back.button"
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground mr-2"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Home
              </Button>
              <img
                src="/assets/uploads/Screenshot-2026-03-11-135111-1.png"
                alt="Logo"
                className="h-14 w-14 object-contain rounded-md"
              />
              <div>
                <h1 className="font-display text-xl font-bold text-foreground tracking-tight">
                  TA Hard Hygiene Work
                </h1>
                <p className="text-xs text-muted-foreground font-medium">
                  Master Gear Calibration
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-6xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">
                MGC Records
              </h2>
              <Button
                variant="outline"
                size="sm"
                data-ocid="mgc.export.button"
                onClick={() => exportMGCToExcel(records)}
                disabled={records.length === 0}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" /> Export Excel
              </Button>
            </div>

            {loading ? (
              <div
                className="flex items-center justify-center py-16 text-muted-foreground gap-2"
                data-ocid="mgc.loading_state"
              >
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading records...</span>
              </div>
            ) : (
              <>
                <MGCStatsWidgets
                  records={records}
                  activeFilter={widgetFilter}
                  onFilterClick={setWidgetFilter}
                />

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

                <div className="relative max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    data-ocid="mgc.search.input"
                    placeholder="Search gear name or no..."
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

                {records.length === 0 ? (
                  <div
                    data-ocid="mgc.empty_state"
                    className="flex flex-col items-center justify-center py-16 text-muted-foreground border border-dashed rounded-lg"
                  >
                    <p className="text-sm font-medium">No MGC records yet.</p>
                    <p className="text-xs mt-1">
                      Click "+ Add MGC" to get started.
                    </p>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border border-dashed rounded-lg">
                    <Search className="h-6 w-6 mb-2 opacity-50" />
                    <p className="text-sm font-medium">
                      No records match your search.
                    </p>
                  </div>
                ) : (
                  <div
                    className="rounded-lg border border-border overflow-hidden overflow-x-auto"
                    data-ocid="mgc.table"
                  >
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold">#</TableHead>
                          <TableHead className="font-semibold">
                            Gear Name
                          </TableHead>
                          <TableHead className="font-semibold">
                            Gear No.
                          </TableHead>
                          <TableHead className="font-semibold">
                            Machine No.
                          </TableHead>
                          <TableHead className="font-semibold">
                            Gear Type
                          </TableHead>
                          <TableHead className="font-semibold">
                            Part Serial No.
                          </TableHead>
                          <TableHead className="font-semibold">
                            Calibration Date
                          </TableHead>
                          <TableHead className="font-semibold">
                            Due Date
                          </TableHead>
                          <TableHead className="font-semibold">
                            Countdown
                          </TableHead>
                          <TableHead className="font-semibold">
                            Status
                          </TableHead>
                          <TableHead className="font-semibold">
                            Remarks
                          </TableHead>
                          <TableHead className="font-semibold w-24">
                            Reschedule
                          </TableHead>
                          <TableHead className="font-semibold w-20">
                            Delete
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.map((rec, idx) => (
                          <TableRow
                            key={rec.id}
                            data-ocid={`mgc.item.${idx + 1}`}
                          >
                            <TableCell className="text-muted-foreground text-sm">
                              {idx + 1}
                            </TableCell>
                            <TableCell className="font-medium">
                              {rec.gearName}
                            </TableCell>
                            <TableCell>{rec.gearNo}</TableCell>
                            <TableCell>{rec.machineNo || "-"}</TableCell>
                            <TableCell>{rec.gearType || "-"}</TableCell>
                            <TableCell>{rec.partSerialNo || "-"}</TableCell>
                            <TableCell>{rec.calibrationDate || "-"}</TableCell>
                            <TableCell>{rec.dueDate || "-"}</TableCell>
                            <TableCell>
                              <CountdownBadge
                                days={getDaysUntil(rec.dueDate)}
                              />
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={rec.status} />
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {rec.remarks || "-"}
                            </TableCell>

                            <TableCell>
                              {rescheduleId === rec.id ? (
                                <div className="flex flex-col gap-1 min-w-[200px]">
                                  <Input
                                    type="date"
                                    value={rescheduleCalibrationDate}
                                    onChange={(e) =>
                                      handleRescheduleCalibrationDateChange(
                                        e.target.value,
                                      )
                                    }
                                    data-ocid={`mgc.reschedule.input.${idx + 1}`}
                                    className="h-7 text-xs"
                                    title="Calibration Date"
                                  />
                                  {/* Month Type dropdown */}
                                  <select
                                    value={rescheduleMonthType}
                                    onChange={(e) =>
                                      handleRescheduleMonthTypeChange(
                                        e.target.value,
                                      )
                                    }
                                    className="h-7 w-full rounded-md border border-input bg-background px-2 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    title="Month Type"
                                  >
                                    <option value="">-- Month Type --</option>
                                    <option value="6month">6 Month</option>
                                    <option value="1year">1 Year</option>
                                  </select>
                                  <Input
                                    type="date"
                                    value={rescheduleDueDate}
                                    onChange={(e) =>
                                      setRescheduleDueDate(e.target.value)
                                    }
                                    className="h-7 text-xs"
                                    title="Due Date"
                                  />
                                  <Input
                                    type="password"
                                    placeholder="Password"
                                    value={reschedulePassword}
                                    onChange={(e) =>
                                      setReschedulePassword(e.target.value)
                                    }
                                    className="h-7 text-xs"
                                  />
                                  {rescheduleError && (
                                    <p
                                      className="text-xs text-red-600"
                                      data-ocid="mgc.reschedule.error_state"
                                    >
                                      {rescheduleError}
                                    </p>
                                  )}
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      onClick={handleReschedule}
                                      disabled={rescheduling}
                                      data-ocid={`mgc.reschedule.confirm_button.${idx + 1}`}
                                      className="h-7 text-xs px-2 bg-teal-600 hover:bg-teal-700 text-white"
                                    >
                                      {rescheduling ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : (
                                        "Confirm"
                                      )}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setRescheduleId(null);
                                        setRescheduleCalibrationDate("");
                                        setRescheduleDueDate("");
                                        setRescheduleMonthType("");
                                        setReschedulePassword("");
                                        setRescheduleError("");
                                      }}
                                      data-ocid="mgc.reschedule.cancel_button"
                                      className="h-7 text-xs px-2"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setRescheduleId(rec.id);
                                    setRescheduleCalibrationDate(
                                      rec.calibrationDate || "",
                                    );
                                    setRescheduleDueDate(rec.dueDate || "");
                                    setRescheduleMonthType("");
                                    setReschedulePassword("");
                                    setRescheduleError("");
                                    setDeleteId(null);
                                    setDeletePassword("");
                                    setDeleteError("");
                                  }}
                                  data-ocid={`mgc.reschedule.button.${idx + 1}`}
                                  className="text-teal-600 hover:text-teal-800 hover:bg-teal-50"
                                >
                                  <Calendar className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>

                            <TableCell>
                              {deleteId === rec.id ? (
                                <div className="flex flex-col gap-1 min-w-[160px]">
                                  <Input
                                    type="password"
                                    placeholder="Password"
                                    value={deletePassword}
                                    onChange={(e) =>
                                      setDeletePassword(e.target.value)
                                    }
                                    data-ocid="mgc.delete.input"
                                    className="h-7 text-xs"
                                  />
                                  {deleteError && (
                                    <p
                                      className="text-xs text-red-600"
                                      data-ocid="mgc.delete.error_state"
                                    >
                                      {deleteError}
                                    </p>
                                  )}
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={handleDelete}
                                      disabled={deleting}
                                      data-ocid={`mgc.delete_button.${idx + 1}`}
                                      className="h-7 text-xs px-2"
                                    >
                                      {deleting ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : (
                                        "Confirm"
                                      )}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setDeleteId(null);
                                        setDeletePassword("");
                                        setDeleteError("");
                                      }}
                                      data-ocid="mgc.delete.cancel_button"
                                      className="h-7 text-xs px-2"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setDeleteId(rec.id);
                                    setDeleteError("");
                                    setDeletePassword("");
                                    setRescheduleId(null);
                                    setRescheduleCalibrationDate("");
                                    setRescheduleDueDate("");
                                    setRescheduleMonthType("");
                                    setReschedulePassword("");
                                    setRescheduleError("");
                                  }}
                                  data-ocid={`mgc.delete_button.${idx + 1}`}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </main>

      <footer className="mt-16 border-t border-border">
        <div className="container mx-auto px-6 py-6 max-w-6xl">
          <Separator className="mb-4" />
          <p className="text-sm text-muted-foreground text-center">
            Inspire By " Hemant Mahamuni "<br />
            Made by Rahul Vishwakarma
          </p>
        </div>
      </footer>

      <motion.button
        data-ocid="fab.add_mgc.button"
        onClick={() => setAddOpen(true)}
        className="fixed bottom-8 right-8 z-50 flex items-center gap-2 rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Plus className="h-5 w-5" /> Add MGC
      </motion.button>

      <Dialog
        open={addOpen}
        onOpenChange={(o) => {
          setAddOpen(o);
          if (!o) {
            setFormError("");
            setFormPassword("");
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add MGC Record</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="gearName">Gear Name *</Label>
              <Input
                id="gearName"
                data-ocid="mgc.gearname.input"
                value={gearName}
                onChange={(e) => setGearName(e.target.value)}
                placeholder="e.g. Spur Gear"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="gearNo">Gear No. *</Label>
              <Input
                id="gearNo"
                data-ocid="mgc.gearno.input"
                value={gearNo}
                onChange={(e) => setGearNo(e.target.value)}
                placeholder="e.g. GR-001"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="mgcMachineNo">Machine No.</Label>
              <Input
                id="mgcMachineNo"
                data-ocid="mgc.machineno.input"
                value={machineNo}
                onChange={(e) => setMachineNo(e.target.value)}
                placeholder="e.g. MC-001"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="gearType">Gear Type</Label>
              <Select value={gearType} onValueChange={setGearType}>
                <SelectTrigger data-ocid="mgc.geartype.select" id="gearType">
                  <SelectValue placeholder="Select gear type" />
                </SelectTrigger>
                <SelectContent>
                  {GEAR_TYPES.map((gt) => (
                    <SelectItem key={gt} value={gt}>
                      {gt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="partSerialNo">Part Serial No.</Label>
              <Input
                id="partSerialNo"
                data-ocid="mgc.partserialno.input"
                value={partSerialNo}
                onChange={(e) => setPartSerialNo(e.target.value)}
                placeholder="e.g. SN-12345"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="calibrationDate">Calibration Date *</Label>
              <Input
                id="calibrationDate"
                data-ocid="mgc.calibrationdate.input"
                type="date"
                value={calibrationDate}
                onChange={(e) => handleCalibrationDateChange(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="monthType">Month Type</Label>
              <Select value={monthType} onValueChange={handleMonthTypeChange}>
                <SelectTrigger data-ocid="mgc.monthtype.select" id="monthType">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6month">6 Month</SelectItem>
                  <SelectItem value="1year">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                data-ocid="mgc.duedate.input"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="status">Status *</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger data-ocid="mgc.status.select" id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Calibrated">Calibrated</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Input
                id="remarks"
                data-ocid="mgc.remarks.input"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="formPassword">Password *</Label>
              <Input
                id="formPassword"
                data-ocid="mgc.form.input"
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                placeholder="Enter password to save"
              />
            </div>
          </div>
          {formError && (
            <p
              className="text-sm text-red-600"
              data-ocid="mgc.form.error_state"
            >
              {formError}
            </p>
          )}
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              data-ocid="mgc.add.primary_button"
              onClick={handleAdd}
              disabled={saving}
              className="flex items-center gap-2"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}{" "}
              Add Record
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
