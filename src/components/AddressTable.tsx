import type { BlacklistedAddress } from '../types';

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
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chain
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex flex-col gap-2">
                  <span>Flagged By</span>
                  <select
                    value={flaggedBy}
                    onChange={(e) => setFlaggedBy(e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {flaggedByOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Blacklisted At
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Remarks
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {addresses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-medium">No addresses found</p>
                    <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter criteria</p>
                  </div>
                </td>
              </tr>
            ) : (
              addresses.map((addr, index) => (
                <tr key={addr.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded sm:text-sm">
                      <span className="block sm:hidden">{addr.address.slice(0, 10)}...</span>
                      <span className="hidden sm:block">{addr.address}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {addr.chain ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {addr.chain}
                      </span>
                    ) : (
                      '-'  // fallback when addr.chain is '' or undefined / null
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {addr.flagged_by}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    <span className="block sm:hidden">{new Date(addr.blacklisted_at).toLocaleDateString()}</span>
                    <span className="hidden sm:block">{new Date(addr.blacklisted_at).toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {addr.remarks || <span className="text-gray-400 italic">-</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    {addr.flagged_by === 'Garden' ? (
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                        <button
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer"
                          onClick={() => onEdit(addr)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer"
                          onClick={() => onDelete(addr)}
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50 px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 gap-3">
        <button
          className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded font-medium transition-colors w-full sm:w-auto"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        <button
          className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded font-medium transition-colors w-full sm:w-auto"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AddressTable;