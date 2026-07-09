"use client";

import { useMemo } from "react";
import { CrmRecord } from "../../types";
import { Badge } from "../ui/Badge";
import { EmptyState } from "../ui/EmptyState";

interface ImportedTableProps {
  records: CrmRecord[];
}

const COLUMNS: { key: string; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "mobile_without_country_code", label: "Mobile" },
  { key: "country_code", label: "Code" },
  { key: "company", label: "Company" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "crm_status", label: "Status" },
  { key: "data_source", label: "Source" },
  { key: "lead_owner", label: "Owner" },
  { key: "created_at", label: "Created" },
  { key: "crm_note", label: "Note" },
];

function StatusBadge({ value }: { value: string | null | undefined }) {
  if (!value) return <span className="text-neutral-300">—</span>;
  const variant =
    value === "GOOD_LEAD_FOLLOW_UP" ? "success"
    : value === "BAD_LEAD" ? "error"
    : value === "SALE_DONE" ? "info"
    : "warning";
  return <Badge variant={variant}>{value.replace(/_/g, " ")}</Badge>;
}

export function ImportedTable({ records }: ImportedTableProps) {
  const displayRecords = useMemo(() => records.slice(0, 500), [records]);

  if (records.length === 0) {
    return (
      <EmptyState
        title="No records were imported"
        description="All rows were either skipped or failed extraction."
      />
    );
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
      <div className="overflow-x-auto overflow-y-auto max-h-[480px]">
        <table className="min-w-full text-sm" aria-label="Imported CRM records">
          <thead className="sticky top-0 z-10 bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th scope="col" className="w-10 px-3 py-2.5 text-xs font-medium text-neutral-400">#</th>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className="px-3 py-2.5 text-left text-xs font-medium text-neutral-600 whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {displayRecords.map((record, index) => (
              <tr key={index} className="hover:bg-neutral-50 transition-colors">
                <td className="px-3 py-2 text-xs text-neutral-300 tabular-nums">{index + 1}</td>
                {COLUMNS.map((col) => {
                  const value = record[col.key as keyof CrmRecord];
                  if (col.key === "crm_status") {
                    return (
                      <td key={col.key} className="px-3 py-2">
                        <StatusBadge value={value as string} />
                      </td>
                    );
                  }
                  return (
                    <td
                      key={col.key}
                      className="px-3 py-2 text-xs text-neutral-700 whitespace-nowrap max-w-[160px] overflow-hidden text-ellipsis"
                      title={typeof value === "string" ? value : undefined}
                    >
                      {value ?? <span className="text-neutral-300">—</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {records.length > 500 && (
        <div className="border-t border-neutral-200 px-4 py-2.5 text-xs text-neutral-400">
          Showing 500 of {records.length.toLocaleString()} records
        </div>
      )}
    </div>
  );
}
