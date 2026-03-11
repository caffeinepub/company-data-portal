import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MachineRecord } from "./AddMachineDialog";

interface Props {
  machines: MachineRecord[];
}

function formatDate(d: string) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function MachinesTable({ machines }: Props) {
  if (machines.length === 0) {
    return (
      <div
        data-ocid="machines.empty_state"
        className="flex flex-col items-center justify-center py-16 text-muted-foreground border border-dashed rounded-lg"
      >
        <p className="text-sm font-medium">No machines added yet.</p>
        <p className="text-xs mt-1">Click "Add Machine" to get started.</p>
      </div>
    );
  }

  return (
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
            <TableHead className="font-semibold">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {machines.map((m, i) => {
            const isOverdue = m.dueDate && new Date(m.dueDate) < new Date();
            return (
              <TableRow key={m.id} data-ocid={`machines.row.${i + 1}`}>
                <TableCell className="text-muted-foreground text-sm">
                  {i + 1}
                </TableCell>
                <TableCell className="font-medium">{m.machineType}</TableCell>
                <TableCell>{m.machineNo}</TableCell>
                <TableCell>{formatDate(m.doneDate)}</TableCell>
                <TableCell>{formatDate(m.dueDate)}</TableCell>
                <TableCell>
                  <Badge variant={isOverdue ? "destructive" : "secondary"}>
                    {isOverdue ? "Overdue" : "On Track"}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
