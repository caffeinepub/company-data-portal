import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Building2, Download, PlusCircle } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import AddMachineDialog, {
  type MachineRecord,
} from "../components/AddMachineDialog";
import MachineDetailDialog from "../components/MachineDetailDialog";
import MachineStatsWidgets from "../components/MachineStatsWidgets";
import MachinesTable from "../components/MachinesTable";
import RescheduleDateDialog from "../components/RescheduleDateDialog";

function exportToExcel(machines: MachineRecord[]) {
  const headers = [
    "#",
    "Machine Type",
    "Machine No.",
    "Done Date",
    "Due Date",
    "Status",
    "Parts",
  ];
  const rows = machines.map((m, i) => {
    const isOverdue =
      m.dueDate && new Date(`${m.dueDate}T00:00:00`) < new Date();
    const parts = (m.parts || [])
      .map((p) => `${p.name}:${p.status}`)
      .join(" | ");
    return [
      i + 1,
      m.machineType,
      m.machineNo,
      m.doneDate || "-",
      m.dueDate || "-",
      isOverdue ? "Overdue" : "On Track",
      parts || "-",
    ];
  });

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\r\n");

  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `machines_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function DataPortal() {
  const [machineDialogOpen, setMachineDialogOpen] = useState(false);
  const [machines, setMachines] = useState<MachineRecord[]>([]);
  const [detailMachine, setDetailMachine] = useState<MachineRecord | null>(
    null,
  );
  const [rescheduleMachine, setRescheduleMachine] =
    useState<MachineRecord | null>(null);
  const currentYear = new Date().getFullYear();

  const handleAddMachine = (record: MachineRecord) => {
    setMachines((prev) => [...prev, record]);
  };

  const handleRescheduleSave = (
    id: string,
    doneDate: string,
    dueDate: string,
    nextCleanDate: string,
  ) => {
    setMachines((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, doneDate, dueDate, nextCleanDate } : m,
      ),
    );
  };

  const handleDelete = (id: string) => {
    setMachines((prev) => prev.filter((m) => m.id !== id));
  };

  const handleMarkCleaned = (id: string) => {
    const today = new Date().toISOString().slice(0, 10);
    setMachines((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              doneDate: today,
              parts: m.parts.map((p) => ({ ...p, status: "cleaned" as const })),
            }
          : m,
      ),
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
              <img
                src="/assets/uploads/image-1-1.png"
                alt="Logo"
                className="h-14 w-14 object-contain rounded-md"
              />
              <div>
                <h1 className="font-display text-xl font-bold text-foreground tracking-tight">
                  TA Hard Hygiene Work
                </h1>
                <p className="text-xs text-muted-foreground font-medium">
                  Machine Cleaning Management
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="default"
                size="sm"
                data-ocid="header.add_machine.open_modal_button"
                onClick={() => setMachineDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Add Machine
              </Button>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span className="text-sm font-medium hidden sm:block">
                  Enterprise Suite
                </span>
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
                Machine Records
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  data-ocid="machines.export.button"
                  onClick={() => exportToExcel(machines)}
                  disabled={machines.length === 0}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  data-ocid="machines.add_machine.open_modal_button"
                  onClick={() => setMachineDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Machine
                </Button>
              </div>
            </div>
            <MachineStatsWidgets machines={machines} />
            <MachinesTable
              machines={machines}
              onViewDetail={setDetailMachine}
              onReschedule={setRescheduleMachine}
            />
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-border">
        <div className="container mx-auto px-6 py-6 max-w-6xl">
          <Separator className="mb-4" />
          <p className="text-sm text-muted-foreground text-center">
            © {currentYear}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      <AddMachineDialog
        open={machineDialogOpen}
        onOpenChange={setMachineDialogOpen}
        onAdd={handleAddMachine}
      />

      <MachineDetailDialog
        open={!!detailMachine}
        onOpenChange={(o) => !o && setDetailMachine(null)}
        machine={detailMachine}
        onReschedule={(m) => {
          setDetailMachine(null);
          setRescheduleMachine(m);
        }}
        onDelete={handleDelete}
        onMarkCleaned={handleMarkCleaned}
      />

      <RescheduleDateDialog
        open={!!rescheduleMachine}
        onOpenChange={(o) => !o && setRescheduleMachine(null)}
        machine={rescheduleMachine}
        onSave={handleRescheduleSave}
      />
    </div>
  );
}
