import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, ClipboardList, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { CompanyRecord } from "../backend.d";
import { useDeleteRecord } from "../hooks/useQueries";

const categoryStyles: Record<string, string> = {
  sales: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  hr: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  finance: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  operations: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  other: "bg-chart-5/10 text-chart-5 border-chart-5/20",
};

const categoryLabels: Record<string, string> = {
  sales: "Sales",
  hr: "HR",
  finance: "Finance",
  operations: "Operations",
  other: "Other",
};

const SKELETON_ROWS = ["a", "b", "c", "d", "e"];

interface Props {
  records: CompanyRecord[];
  isLoading: boolean;
}

export default function RecordsTable({ records, isLoading }: Props) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState("");
  const { mutateAsync: deleteRecord, isPending: isDeleting } =
    useDeleteRecord();

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteId(id);
    setDeleteName(name);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteRecord(deleteId);
      toast.success("Record deleted", {
        description: `"${deleteName}" has been removed.`,
      });
    } catch {
      toast.error("Failed to delete record");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <>
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-display text-xl font-bold">
                All Records
              </CardTitle>
              <CardDescription>
                {records.length} record{records.length !== 1 ? "s" : ""} total
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3" data-ocid="records.loading_state">
              {SKELETON_ROWS.map((k) => (
                <Skeleton key={k} className="h-10 w-full" />
              ))}
            </div>
          ) : records.length === 0 ? (
            <div
              data-ocid="records.empty_state"
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-muted mb-4">
                <ClipboardList className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-display text-lg font-semibold text-foreground">
                No records yet
              </p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Add your first record using the form to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table data-ocid="records.table">
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="font-semibold text-xs uppercase tracking-wider pl-6">
                      Name
                    </TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider">
                      Category
                    </TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider">
                      Department
                    </TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider">
                      Date
                    </TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-right">
                      Value
                    </TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider">
                      Notes
                    </TableHead>
                    <TableHead className="w-16 pr-6" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record, index) => (
                    <TableRow
                      key={record.id}
                      data-ocid={`records.item.${index + 1}`}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <TableCell className="font-medium pl-6">
                        {record.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs font-semibold ${categoryStyles[record.category as string] ?? ""}`}
                        >
                          {categoryLabels[record.category as string] ??
                            record.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {record.department}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(record.date).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {Number(record.value).toLocaleString(undefined, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="max-w-48">
                        <span
                          className="block truncate text-muted-foreground text-sm"
                          title={record.notes}
                        >
                          {record.notes || (
                            <span className="text-muted-foreground/50 italic">
                              —
                            </span>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="pr-6">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          data-ocid={`records.delete_button.${index + 1}`}
                          onClick={() =>
                            handleDeleteClick(record.id, record.name)
                          }
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          disabled={isDeleting}
                          aria-label={`Delete ${record.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent data-ocid="records.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 font-display">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Delete Record
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                &quot;{deleteName}&quot;
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="records.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="records.delete.confirm_button"
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
