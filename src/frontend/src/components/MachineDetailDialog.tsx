import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Wrench,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { MachinePart, MachineRecord } from "./AddMachineDialog";

const ADMIN_PASSWORD = "admin@1234";

interface Props {
  machine: MachineRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReschedule?: (machine: MachineRecord) => void;
  onDelete?: (id: string) => void;
  onMarkCleaned?: (id: string) => void;
  onEdit?: (updated: MachineRecord) => void;
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

function PasswordField({
  value,
  onChange,
  error,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1">
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "Enter password to confirm"}
          className={`pr-10 text-sm ${error ? "border-destructive" : ""}`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export default function MachineDetailDialog({
  machine,
  open,
  onOpenChange,
  onReschedule,
  onDelete,
  onMarkCleaned,
  onEdit,
}: Props) {
  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    machineType: "",
    machineNo: "",
    doneDate: "",
    dueDate: "",
  });
  const [editParts, setEditParts] = useState<MachinePart[]>([]);
  const [editPartName, setEditPartName] = useState("");
  const [editPartStatus, setEditPartStatus] = useState<"cleaned" | "pending">(
    "cleaned",
  );
  const [editPassword, setEditPassword] = useState("");
  const [editPasswordError, setEditPasswordError] = useState("");

  // Delete confirm state
  const [deleteMode, setDeleteMode] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deletePasswordError, setDeletePasswordError] = useState("");

  if (!machine) return null;

  const machineParts = machine.parts.map((p) => p.name).join(", ");

  // ----- Edit helpers -----
  const startEdit = () => {
    setEditForm({
      machineType: machine.machineType,
      machineNo: machine.machineNo,
      doneDate: machine.doneDate,
      dueDate: machine.dueDate,
    });
    setEditParts([...machine.parts]);
    setEditPartName("");
    setEditPartStatus("cleaned");
    setEditPassword("");
    setEditPasswordError("");
    setEditMode(true);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditPassword("");
    setEditPasswordError("");
  };

  const addEditPart = () => {
    if (!editPartName.trim()) return;
    setEditParts((p) => [
      ...p,
      { name: editPartName.trim(), status: editPartStatus },
    ]);
    setEditPartName("");
  };

  const removeEditPart = (idx: number) => {
    setEditParts((p) => p.filter((_, i) => i !== idx));
  };

  const handleSaveEdit = () => {
    if (!editPassword) {
      setEditPasswordError("Password is required");
      return;
    }
    if (editPassword !== ADMIN_PASSWORD) {
      setEditPasswordError("Incorrect password");
      return;
    }
    onEdit?.({
      ...machine,
      machineType: editForm.machineType,
      machineNo: editForm.machineNo,
      doneDate: editForm.doneDate,
      dueDate: editForm.dueDate,
      parts: editParts,
    });
    toast.success("Machine updated!");
    setEditMode(false);
    setEditPassword("");
    setEditPasswordError("");
    onOpenChange(false);
  };

  // ----- Delete helpers -----
  const startDelete = () => {
    setDeletePassword("");
    setDeletePasswordError("");
    setDeleteMode(true);
  };

  const cancelDelete = () => {
    setDeleteMode(false);
    setDeletePassword("");
    setDeletePasswordError("");
  };

  const handleConfirmDelete = () => {
    if (!deletePassword) {
      setDeletePasswordError("Password is required");
      return;
    }
    if (deletePassword !== ADMIN_PASSWORD) {
      setDeletePasswordError("Incorrect password");
      return;
    }
    onDelete?.(machine.id);
    toast.success("Machine deleted.");
    setDeleteMode(false);
    onOpenChange(false);
  };

  const handleClose = (v: boolean) => {
    if (!v) {
      setEditMode(false);
      setDeleteMode(false);
      setEditPassword("");
      setDeletePassword("");
      setEditPasswordError("");
      setDeletePasswordError("");
    }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-md p-0 overflow-hidden rounded-2xl"
        data-ocid="machine_detail.dialog"
      >
        {/* ---- EDIT MODE ---- */}
        {editMode ? (
          <div className="px-5 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold">Edit Machine</h2>
              <button
                type="button"
                onClick={cancelEdit}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Machine Type</Label>
                <Input
                  value={editForm.machineType}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, machineType: e.target.value }))
                  }
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium">Machine No.</Label>
                <Input
                  value={editForm.machineNo}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, machineNo: e.target.value }))
                  }
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium">Done Date</Label>
                <Input
                  type="date"
                  value={editForm.doneDate}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, doneDate: e.target.value }))
                  }
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium">Due Date</Label>
                <Input
                  type="date"
                  value={editForm.dueDate}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, dueDate: e.target.value }))
                  }
                  className="text-sm"
                />
              </div>
            </div>

            {/* Parts editor */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Parts</Label>
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="Part name"
                  value={editPartName}
                  onChange={(e) => setEditPartName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addEditPart();
                    }
                  }}
                  className="flex-1 text-sm"
                />
                <div className="flex rounded-md border border-border overflow-hidden text-xs">
                  <button
                    type="button"
                    onClick={() => setEditPartStatus("cleaned")}
                    className={`px-2 py-1.5 flex items-center gap-1 transition-colors ${
                      editPartStatus === "cleaned"
                        ? "bg-green-500/10 text-green-700 font-medium"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <CheckCircle2 className="h-3 w-3" /> Cleaned
                  </button>
                  <div className="w-px bg-border" />
                  <button
                    type="button"
                    onClick={() => setEditPartStatus("pending")}
                    className={`px-2 py-1.5 flex items-center gap-1 transition-colors ${
                      editPartStatus === "pending"
                        ? "bg-amber-500/10 text-amber-700 font-medium"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Clock className="h-3 w-3" /> Pending
                  </button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addEditPart}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              {editParts.length > 0 && (
                <ul className="space-y-1">
                  {editParts.map((p, i) => (
                    <li
                      key={p.name}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-muted/50 border border-border text-xs"
                    >
                      <span className="flex items-center gap-1.5">
                        {p.status === "cleaned" ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <Clock className="h-3 w-3 text-amber-500" />
                        )}
                        <span className="font-medium">{p.name}</span>
                        <span
                          className={`px-1 py-0.5 rounded-full ${
                            p.status === "cleaned"
                              ? "bg-green-500/10 text-green-700"
                              : "bg-amber-500/10 text-amber-700"
                          }`}
                        >
                          {p.status}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => removeEditPart(i)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label className="text-xs font-medium">
                Password to confirm changes
              </Label>
              <PasswordField
                value={editPassword}
                onChange={(v) => {
                  setEditPassword(v);
                  setEditPasswordError("");
                }}
                error={editPasswordError}
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={cancelEdit}>
                Cancel
              </Button>
              <Button
                className="flex-1 flex items-center gap-2"
                onClick={handleSaveEdit}
              >
                <Save className="h-4 w-4" /> Save Changes
              </Button>
            </div>
          </div>
        ) : deleteMode ? (
          /* ---- DELETE CONFIRM MODE ---- */
          <div className="px-5 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-red-600">
                Confirm Delete
              </h2>
              <button
                type="button"
                onClick={cancelDelete}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              You are about to delete{" "}
              <span className="font-semibold text-foreground">
                {machine.machineType} #{machine.machineNo}
              </span>
              . This cannot be undone.
            </p>
            <div className="space-y-1">
              <Label className="text-xs font-medium">
                Enter password to confirm delete
              </Label>
              <PasswordField
                value={deletePassword}
                onChange={(v) => {
                  setDeletePassword(v);
                  setDeletePasswordError("");
                }}
                error={deletePasswordError}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={cancelDelete}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white border-0"
                onClick={handleConfirmDelete}
              >
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </div>
          </div>
        ) : (
          /* ---- NORMAL VIEW MODE ---- */
          <>
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
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  data-ocid="machine_detail.edit_button"
                  onClick={startEdit}
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                  data-ocid="machine_detail.delete_button"
                  onClick={startDelete}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
