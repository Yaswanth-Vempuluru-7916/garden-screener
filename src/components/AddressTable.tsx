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
    <div className="address-table">
      <table>
        <thead>
          <tr>
            <th>Address</th>
            <th>Chain</th>
            <th>
              Flagged By
              <select
                value={flaggedBy}
                onChange={(e) => setFlaggedBy(e.target.value)}
                className="flagged-by-filter"
              >
                {flaggedByOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </th>
            <th>Blacklisted At</th>
            <th>Remarks</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {addresses.length === 0 ? (
            <tr>
              <td colSpan={6}>No addresses found</td>
            </tr>
          ) : (
            addresses.map((addr) => (
              <tr key={addr.id}>
                <td>{addr.address}</td>
                <td>{addr.chain}</td>
                <td>{addr.flagged_by}</td>
                <td>{new Date(addr.blacklisted_at).toLocaleString()}</td>
                <td>{addr.remarks || '-'}</td>
                <td>
                  {addr.flagged_by === 'Garden' ? (
                    <>
                      <button className="btn-secondary" onClick={() => onEdit(addr)}>
                        Edit
                      </button>
                      <button className="btn-danger" onClick={() => onDelete(addr)}>
                        Delete
                      </button>
                    </>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="pagination">
        <button
          className="btn-secondary"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="btn-secondary"
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