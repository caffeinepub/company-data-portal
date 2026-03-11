import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart2,
  DollarSign,
  MoreHorizontal,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react";
import type { CompanyRecord } from "../backend.d";

const categoryConfig: Record<
  string,
  { label: string; icon: React.ReactNode; color: string }
> = {
  sales: {
    label: "Sales",
    icon: <TrendingUp className="h-3.5 w-3.5" />,
    color: "text-chart-2 bg-chart-2/10",
  },
  hr: {
    label: "HR",
    icon: <Users className="h-3.5 w-3.5" />,
    color: "text-chart-3 bg-chart-3/10",
  },
  finance: {
    label: "Finance",
    icon: <DollarSign className="h-3.5 w-3.5" />,
    color: "text-chart-4 bg-chart-4/10",
  },
  operations: {
    label: "Operations",
    icon: <Settings className="h-3.5 w-3.5" />,
    color: "text-chart-1 bg-chart-1/10",
  },
  other: {
    label: "Other",
    icon: <MoreHorizontal className="h-3.5 w-3.5" />,
    color: "text-chart-5 bg-chart-5/10",
  },
};

const SKELETON_KEYS = ["a", "b", "c", "d"];

interface Props {
  records: CompanyRecord[];
  isLoading: boolean;
}

export default function StatsCards({ records, isLoading }: Props) {
  const categoryCounts = records.reduce(
    (acc, r) => {
      const cat = r.category as string;
      acc[cat] = (acc[cat] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const totalValue = records.reduce((sum, r) => sum + Number(r.value), 0);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {SKELETON_KEYS.map((k) => (
          <Card key={k} className="shadow-card">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {/* Total Records */}
      <Card
        data-ocid="stats.total.card"
        className="shadow-card col-span-2 md:col-span-1"
      >
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

      {/* Per-Category */}
      {Object.entries(categoryConfig).map(([key, config]) => (
        <Card key={key} className="shadow-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {config.label}
            </CardTitle>
            <div
              className={`flex items-center justify-center w-7 h-7 rounded-md ${config.color}`}
            >
              {config.icon}
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold text-foreground">
              {categoryCounts[key] ?? 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">records</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
