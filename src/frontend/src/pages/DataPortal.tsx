import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Building2, Download, Loader2, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { backendInterface } from "../backend.d";
import AddMachineDialog, {
  type MachineRecord,
} from "../components/AddMachineDialog";
import MachineDetailDialog from "../components/MachineDetailDialog";
import MachineStatsWidgets, {
  type WidgetFilter,
} from "../components/MachineStatsWidgets";
import MachinesTable from "../components/MachinesTable";
import RescheduleDateDialog from "../components/RescheduleDateDialog";
import { useActor } from "../hooks/useActor";

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

interface DataPortalProps {
  onNavigateMGC: () => void;
}

export default function DataPortal({ onNavigateMGC }: DataPortalProps) {
  const { actor, isFetching } = useActor();
  const backend = actor as unknown as backendInterface | null;
  const [machineDialogOpen, setMachineDialogOpen] = useState(false);
  const [machines, setMachines] = useState<MachineRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailMachine, setDetailMachine] = useState<MachineRecord | null>(
    null,
  );
  const [rescheduleMachine, setRescheduleMachine] =
    useState<MachineRecord | null>(null);
  const [widgetFilter, setWidgetFilter] = useState<WidgetFilter>(null);

  // Load machines from backend on mount
  useEffect(() => {
    if (!backend || isFetching) return;
    setLoading(true);
    backend
      .getAllMachines()
      .then((records) => {
        setMachines(records as MachineRecord[]);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, [backend, isFetching]);

  const handleAddMachine = (record: MachineRecord) => {
    setMachines((prev) => [...prev, record]);
    backend
      ?.addMachine(
        record.id,
        record.machineType,
        record.machineNo,
        record.doneDate,
        record.dueDate,
        record.parts,
      )
      .catch(() => {});
  };

  const handleRescheduleSave = (
    id: string,
    doneDate: string,
    dueDate: string,
  ) => {
    let updatedParts: MachineRecord["parts"] = [];
    setMachines((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          updatedParts = m.parts;
          return { ...m, doneDate, dueDate };
        }
        return m;
      }),
    );
    backend?.updateMachine(id, doneDate, dueDate, updatedParts).catch(() => {});
  };

  const handleDelete = (id: string) => {
    setMachines((prev) => prev.filter((m) => m.id !== id));
    backend?.deleteMachine(id).catch(() => {});
  };

  const handleEdit = (updated: MachineRecord) => {
    setMachines((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    backend
      ?.updateMachine(
        updated.id,
        updated.doneDate,
        updated.dueDate,
        updated.parts,
      )
      .catch(() => {});
  };

  const handleMarkCleaned = (id: string) => {
    const today = new Date().toISOString().slice(0, 10);
    let machine: MachineRecord | undefined;
    setMachines((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          machine = m;
          return {
            ...m,
            doneDate: today,
            parts: m.parts.map((p) => ({ ...p, status: "cleaned" as const })),
          };
        }
        return m;
      }),
    );
    if (machine) {
      const updatedParts = machine.parts.map((p) => ({
        ...p,
        status: "cleaned",
      }));
      backend
        ?.updateMachine(id, today, machine.dueDate, updatedParts)
        .catch(() => {});
    }
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
                src="/assets/uploads/Screenshot-2026-03-11-135111-1.png"
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
            <div className="flex items-center gap-2">
              <Button
                data-ocid="nav.mgc.button"
                onClick={onNavigateMGC}
                size="sm"
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold"
              >
                MGC
              </Button>
              <div className="flex items-center gap-2 text-muted-foreground ml-2">
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
              </div>
            </div>

            {loading ? (
              <div
                className="flex items-center justify-center py-16 text-muted-foreground gap-2"
                data-ocid="machines.loading_state"
              >
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading machines...</span>
              </div>
            ) : (
              <>
                <MachineStatsWidgets
                  machines={machines}
                  activeFilter={widgetFilter}
                  onFilterClick={setWidgetFilter}
                />
                <MachinesTable
                  machines={machines}
                  onViewDetail={setDetailMachine}
                  onReschedule={setRescheduleMachine}
                  widgetFilter={widgetFilter}
                />
              </>
            )}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-border">
        <div className="container mx-auto px-6 py-6 max-w-6xl">
          <Separator className="mb-4" />
          <p className="text-sm text-muted-foreground text-center">
            Inspire By " Hemant Mahamuni "<br />
            Made by Rahul Vishwakarma
          </p>
        </div>
      </footer>

      {/* Floating Add Machine Button */}
      <motion.button
        data-ocid="fab.add_machine.button"
        onClick={() => setMachineDialogOpen(true)}
        className="fixed bottom-8 right-8 z-50 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Plus className="h-5 w-5" />
        Add Machine
      </motion.button>

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
        onEdit={handleEdit}
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
