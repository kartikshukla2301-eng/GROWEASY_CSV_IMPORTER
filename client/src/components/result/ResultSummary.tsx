import { ImportResponse } from "../../types";
import { Card, CardContent } from "../ui/Card";

interface ResultSummaryProps {
  result: ImportResponse;
}

export function ResultSummary({ result }: ResultSummaryProps) {
  const { totalRows, totalImported, totalSkipped } = result;

  const stats = [
    {
      label: "Total rows",
      value: totalRows,
      color: "text-neutral-800",
      bg: "bg-neutral-50",
      border: "border-neutral-200",
    },
    {
      label: "Imported",
      value: totalImported,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
    },
    {
      label: "Skipped",
      value: totalSkipped,
      color: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-200",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className={`${stat.bg} ${stat.border}`}>
          <CardContent className="py-4">
            <p className="text-xs font-medium text-neutral-500">{stat.label}</p>
            <p className={`mt-1 text-2xl font-semibold tabular-nums ${stat.color}`}>
              {stat.value.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
