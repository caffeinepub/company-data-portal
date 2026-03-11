import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart2 } from "lucide-react";
import type { CompanyRecord } from "../backend.d";

interface Props {
  records: CompanyRecord[];
  isLoading: boolean;
}

export default function StatsCards({ records, isLoading }: Props) {
  const totalValue = records.reduce((sum, r) => sum + Number(r.value), 0);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4">
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      <Card data-ocid="stats.total.card" className="shadow-card">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Total Records
          </CardTitle>
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
            <BarChart2 className="h-3.5 w-3.5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="font-display text-3xl font-bold text-foreground">
            {records.length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Total value:{" "}
            <span className="font-semibold text-foreground">
              {totalValue.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
