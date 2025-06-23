import type { BlacklistedAddress } from '../types';
import '../styles/AddressTable.css';

interface AddressTableProps {
  addresses: BlacklistedAddress[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (address: BlacklistedAddress) => void;
  onDelete: (address: BlacklistedAddress) => void;
}

function AddressTable({
  addresses,
  currentPage,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
}: AddressTableProps) {
  return (
    <div className="address-table-container">
      <div className="table-wrapper">
        <table className="address-table">
          <thead>
            <tr>
              <th>Address</th>
              <th>Network</th>
              <th>Flagged By</th>
              <th>Blacklisted At</th>
              <th>Remarks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {addresses.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center' }}>
                  No addresses found
                </td>
              </tr>
            ) : (
              addresses.map((addr) => (
                <tr key={addr.id}>
                  <td>{addr.address}</td>
                  <td>{addr.chain}</td>
                  <td>{addr.flagged_by}</td>
                  <td>
                    {new Date(addr.blacklisted_at).toLocaleString()}
                  </td>
                  <td>{addr.remarks || '-'}</td>
                  <td>
                    <button
                      className="btn-primary"
                      onClick={() => onEdit(addr)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => onDelete(addr)}
                      style={{ marginLeft: '8px' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="pagination">
        <button
          className="btn-secondary"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="pagination-info">
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
}

export default AddressTable;