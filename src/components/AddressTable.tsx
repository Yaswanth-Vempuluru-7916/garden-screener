import { useState } from "react";
import type { BlacklistedAddress } from "../types";

interface AddressTableProps {
  addresses: BlacklistedAddress[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (address: BlacklistedAddress) => void;
  onDelete: (address: BlacklistedAddress) => void;
  flaggedBy: string;
  setFlaggedBy: (value: string) => void;
  flaggedByOptions: string[];
}

const AddressTable = ({
  addresses,
  currentPage,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
  flaggedBy,
  setFlaggedBy,
  flaggedByOptions,
}: AddressTableProps) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy address:", err);
      });
  };

  return (
    <div className="relative w-full overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-900 dark:text-gray-100">
        <thead className="text-xs uppercase bg-gray-100/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <tr>
            <th className="px-4 py-3 font-lg text-gray-900 dark:text-gray-100 min-w-[200px]">
              Address
            </th>
            <th className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 min-w-[100px]">
              Chain
            </th>
            <th className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 min-w-[150px]">
              <div className="flex items-center space-x-3">
                <span>Flagged By</span>
                <select
                  value={flaggedBy}
                  onChange={(e) => setFlaggedBy(e.target.value)}
                  className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black"
                >
                  {flaggedByOptions.map((option) => (
                    <option
                      key={option}
                      value={option}
                      className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </th>
            <th className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 min-w-[120px]">
              Blacklisted At
            </th>
            <th className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 min-w-[150px]">
              Remarks
            </th>
            <th className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 min-w-[120px]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {addresses.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-3 text-center">
                <div className="flex flex-col items-center justify-center py-4 space-y-2">
                  <svg
                    className="w-12 h-12 text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div className="text-center space-y-1">
                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      No addresses found
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                </div>
              </td>
            </tr>
          ) : (
            addresses.map((addr, index) => (
              <tr
                key={addr.id}
                className="hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-200 dark:border-gray-700"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`flex-1 min-w-0 cursor-pointer group`}
                      onClick={() => copyToClipboard(addr.address, addr.id)}
                      title={copiedId === addr.id ? "Copied!" : "Click to copy"}
                    >
                      <span
                        className="text-sm font-mono break-all transition-colors cursor-pointer group-hover:text-blue-600 dark:group-hover:text-blue-400"
                        onClick={() => copyToClipboard(addr.address, addr.id)}
                        title={copiedId === addr.id ? "Copied!" : "Click to copy"}
                      >
                        {addr.address}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {addr.chain ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                      {addr.chain}
                    </span>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    {addr.flagged_by}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <div className="space-y-0.5">
                    <span className="block text-gray-900 dark:text-gray-100 font-medium">
                      {new Date(addr.blacklisted_at).toLocaleDateString()}
                    </span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      {new Date(addr.blacklisted_at).toLocaleTimeString()}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="max-w-xs">
                    {addr.remarks ? (
                      <span className="text-gray-900 dark:text-gray-100 break-words">
                        {addr.remarks}
                      </span>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">
                        -
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {addr.flagged_by === "Garden" ? (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => onEdit(addr)}
                        // className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md font-medium hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black"
                        className="px-3 cursor-pointer py-1 rounded bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(addr)}
                        // className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md font-medium hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black"
                        className="px-3 py-1 cursor-pointer rounded bg-red-600 text-white text-xs font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">-</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="flex flex-col sm:flex-row items-center justify-between mt-4 space-y-2 sm:space-y-0 sm:space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-full sm:w-auto px-4 py-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md font-medium hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-200 dark:disabled:hover:bg-gray-700"
        >
          <span className="flex items-center justify-center space-x-1">
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Previous</span>
          </span>
        </button>

        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Page {currentPage} of {totalPages}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-full sm:w-auto px-4 py-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md font-medium hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed disabled:hover meadow:bg-gray-200 dark:disabled:hover:bg-gray-700"
        >
          <span className="flex items-center justify-center space-x-1">
            <span>Next</span>
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
};

export default AddressTable;
