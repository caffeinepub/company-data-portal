import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Building2, Database, PlusCircle } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import AddMachineDialog, {
  type MachineRecord,
} from "../components/AddMachineDialog";
import DataEntryForm from "../components/DataEntryForm";
import MachinesTable from "../components/MachinesTable";
import RecordsTable from "../components/RecordsTable";
import StatsCards from "../components/StatsCards";
import { useGetAllRecords } from "../hooks/useQueries";

export default function DataPortal() {
  const { data: records = [], isLoading } = useGetAllRecords();
  const [activeTab, setActiveTab] = useState<"form" | "records" | "machines">(
    "form",
  );
  const [machineDialogOpen, setMachineDialogOpen] = useState(false);
  const [machines, setMachines] = useState<MachineRecord[]>([]);
  const currentYear = new Date().getFullYear();

  const handleAddMachine = (record: MachineRecord) => {
    setMachines((prev) => [...prev, record]);
    setActiveTab("machines");
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
        <div className="relative container mx-auto px-6 py-6 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-primary/20">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold text-foreground tracking-tight">
                  TA Hard Hygiene Work
                </h1>
                <p className="text-xs text-muted-foreground font-medium">
                  Company Data Management
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
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <StatsCards records={records} isLoading={isLoading} />
        </motion.div>

        {/* Tab Nav */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg w-fit">
            <button
              type="button"
              data-ocid="nav.form.tab"
              onClick={() => setActiveTab("form")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === "form"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Add Record
            </button>
            <button
              type="button"
              data-ocid="nav.records.tab"
              onClick={() => setActiveTab("records")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                activeTab === "records"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Records
              {records.length > 0 && (
                <span className="bg-primary/10 text-primary text-xs font-semibold px-1.5 py-0.5 rounded-full">
                  {records.length}
                </span>
              )}
            </button>
            <button
              type="button"
              data-ocid="nav.machines.tab"
              onClick={() => setActiveTab("machines")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                activeTab === "machines"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Machines
              {machines.length > 0 && (
                <span className="bg-primary/10 text-primary text-xs font-semibold px-1.5 py-0.5 rounded-full">
                  {machines.length}
                </span>
              )}
            </button>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "form" ? (
            <DataEntryForm onSuccess={() => setActiveTab("records")} />
          ) : activeTab === "records" ? (
            <RecordsTable records={records} isLoading={isLoading} />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">
                  Machine Records
                </h2>
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
              <MachinesTable machines={machines} />
            </div>
          )}
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
    </div>
  );
}
