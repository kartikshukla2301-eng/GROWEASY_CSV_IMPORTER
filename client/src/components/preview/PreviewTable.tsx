"use client";

import { useMemo } from "react";

interface PreviewTableProps {
  headers: string[];
  rows: Record<string, string>[];
}

const MAX_VISIBLE_ROWS = 100;

export function PreviewTable({ headers, rows }: PreviewTableProps) {
  const visibleRows = useMemo(() => rows.slice(0, MAX_VISIBLE_ROWS), [rows]);
  const hasMore = rows.length > MAX_VISIBLE_ROWS;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
      <div className="overflow-x-auto overflow-y-auto max-h-[420px]">
        <table className="min-w-full text-sm" role="grid" aria-label="CSV preview">
          <thead className="sticky top-0 z-10 bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th
                scope="col"
                className="w-10 px-3 py-2.5 text-left text-xs font-medium text-neutral-400 whitespace-nowrap"
              >
                #
              </th>
              {headers.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="px-3 py-2.5 text-left text-xs font-medium text-neutral-600 whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {visibleRows.map((row, index) => (
              <tr
                key={index}
                className="transition-colors hover:bg-neutral-50"
              >
                <td className="px-3 py-2 text-xs text-neutral-300 tabular-nums">
                  {index + 1}
                </td>
                {headers.map((header) => (
                  <td
                    key={header}
                    className="px-3 py-2 text-xs text-neutral-700 whitespace-nowrap max-w-[180px] overflow-hidden text-ellipsis"
                    title={row[header]}
                  >
                    {row[header] || (
                      <span className="text-neutral-300" aria-label="empty cell">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hasMore && (
        <div className="border-t border-neutral-200 px-4 py-2.5 text-xs text-neutral-400">
          Showing first {MAX_VISIBLE_ROWS} of {rows.length} rows
        </div>
      )}
    </div>
  );
}
