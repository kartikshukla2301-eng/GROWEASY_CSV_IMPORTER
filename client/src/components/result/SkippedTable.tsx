import { SkippedRecord } from "../../types";
import { Badge } from "../ui/Badge";
import { EmptyState } from "../ui/EmptyState";

interface SkippedTableProps {
  records: SkippedRecord[];
}

export function SkippedTable({ records }: SkippedTableProps) {
  if (records.length === 0) {
    return (
      <EmptyState
        title="No rows were skipped"
        description="All uploaded rows were successfully imported."
      />
    );
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
      <div className="overflow-x-auto overflow-y-auto max-h-[320px]">
        <table className="min-w-full text-sm" aria-label="Skipped records">
          <thead className="sticky top-0 z-10 bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th scope="col" className="px-3 py-2.5 text-left text-xs font-medium text-neutral-600">
                Row
              </th>
              <th scope="col" className="px-3 py-2.5 text-left text-xs font-medium text-neutral-600">
                Reason
              </th>
              <th scope="col" className="px-3 py-2.5 text-left text-xs font-medium text-neutral-600">
                Raw data (preview)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {records.map((record, index) => {
              const rawPreview = Object.entries(record.rawData)
                .slice(0, 3)
                .map(([k, v]) => `${k}: ${v}`)
                .join(" | ");

              return (
                <tr key={index} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-3 py-2 text-xs tabular-nums text-neutral-500">
                    {record.row}
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant="error">{record.reason}</Badge>
                  </td>
                  <td
                    className="px-3 py-2 text-xs text-neutral-400 max-w-[320px] overflow-hidden text-ellipsis whitespace-nowrap"
                    title={rawPreview}
                  >
                    {rawPreview || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
