import  { useEffect, useState } from 'react'
import type { BlacklistedAddress, FormData } from './types'
import { fetchAllBlackListedAddresses } from './utils/api';
import AddressForm from './components/AddressForm';
import AddressTable from './components/AddressTable';

const ITEMS_PER_PAGE = 10;

const App = () => {

  const [addresses, setAddresses] = useState<BlacklistedAddress[]>([]);

  const [filteredAddresses, setFilteredAddresses] = useState<BlacklistedAddress[]>([]);

  const [searchQuery, setSearchQuery] = useState<string>('')

  const [currentPage, setCurrentPage] = useState<number>(1)

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    data: { address: '', network: '', remark: '', tag: '' },
    id: '',
    type: 'create',
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAddresses = async () => {
      setLoading(true)
      try {

        const data = await fetchAllBlackListedAddresses()
        // Generate id as address-chain (temporary, until API provides id)
        //TODO : Remove this later 
        const addressesWithId = data.map((addr) => ({
          ...addr,
          id: `${addr.address}-${addr.chain}`,
        }));

        // Sort by flagged_by (asc) and blacklisted_at (desc)
        const sortedAddresses = addressesWithId.sort((a, b) => {
          return new Date(b.blacklisted_at).getTime() - new Date(a.blacklisted_at).getTime();
        });
        setAddresses(sortedAddresses);
        setFilteredAddresses(sortedAddresses);

      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch addresses');
      }
      finally {
        setLoading(false);
      }
    }

    loadAddresses();
  }, [])

  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = addresses.filter((addr) =>
      addr.address.toLowerCase().includes(lowerQuery) ||
      addr.chain.toLowerCase().includes(lowerQuery) ||
      addr.id.toLowerCase().includes(lowerQuery)
    );

    setFilteredAddresses(filtered);
    setCurrentPage(1); // Reset to first page on search
  }, [searchQuery, addresses]);

  // Handle Add New button
  const handleAddNew = () => {
    setFormData({
      data: { address: '', network: '', remark: '', tag: '' },
      id: '',
      type: 'create',
    });
    setIsFormOpen(true);
  };

  const handleEdit = (addr: BlacklistedAddress) => {
    setFormData({
      data: {
        address: addr.address,
        network: addr.chain, // Map chain to network
        remark: addr.remarks || '',
        tag: '',
      },
      id: addr.id,
      type: 'edit',
    });
    setIsFormOpen(true);
  };
  // Handle Delete button (to be passed to AddressTable)
  const handleDelete = async (addr: BlacklistedAddress) => {
    if (window.confirm(`Delete address ${addr.address}?`)) {
      try {
        // Prepare FormData for delete
        const deleteData: FormData = {
          data: {
            address: addr.address,
            network: addr.chain,
            remark: addr.remarks || '',
            tag: '',
          },
          id: addr.id,
          type: 'delete',
        };
        // Call API (placeholder, actual response handling depends on API)
        // await manageBlacklistedAddress(deleteData);
        // Update state (temporary, until POST API is integrated)
        setAddresses(addresses.filter((a) => a.id !== addr.id));
        setFilteredAddresses(filteredAddresses.filter((a) => a.id !== addr.id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete address');
      }
    }
  };

  // Handle form submission (to be passed to AddressForm)
  const handleFormSubmit = async (data: FormData) => {
    try {
      // Call API (placeholder, actual response handling depends on API)
      // const result = await manageBlacklistedAddress(data);
      // Update state (temporary, until POST API is integrated)
      const newAddress: BlacklistedAddress = {
        address: data.data.address,
        blacklisted_at: new Date().toISOString(),
        chain: data.data.network,
        flagged_by: 'Garden', 
        remarks: data.data.remark || null,
        id: data.id || `${data.data.address}-${data.data.network}`,
      };
      if (data.type === 'create') {
        setAddresses([newAddress, ...addresses]);
        setFilteredAddresses([newAddress, ...filteredAddresses]);
      } else if (data.type === 'edit') {
        setAddresses(addresses.map((a) => (a.id === data.id ? newAddress : a)));
        setFilteredAddresses(filteredAddresses.map((a) => (a.id === data.id ? newAddress : a)));
      }
      setIsFormOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save address');
    }
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAddresses = filteredAddresses.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredAddresses.length / ITEMS_PER_PAGE);


  return (
    <div className="container">
      <h1>BlackListed Addresses</h1>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      {loading && <p style={{ textAlign: 'center' }}>Loading...</p>}

          {/* Search Input */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by address, chain, or id..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
      </div>

           {/* Add New Button */}
      <button className="btn-primary" onClick={handleAddNew} style={{ marginBottom: '20px' }}>
        Add New
      </button>

       {/* AddressTable Placeholder */}
      {/* Expected props for AddressTable.tsx */}
      <AddressTable
        addresses={paginatedAddresses}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

        <div style={{ marginBottom: '20px' }}>
        <p>AddressTable Placeholder (Displays {paginatedAddresses.length} addresses)</p>
        <button
          className="btn-secondary"
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span style={{ margin: '0 10px' }}>
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="btn-secondary"
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

       {/* AddressForm Placeholder */}
      {/* Expected props for AddressForm.tsx */}
      {isFormOpen && (
        <AddressForm
          formData={formData}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      )}
      {isFormOpen && (
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '4px' }}>
          <p>AddressForm Placeholder (Mode: {formData.type})</p>
          <button className="btn-secondary" onClick={() => setIsFormOpen(false)}>
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}

export default App