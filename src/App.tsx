import { useEffect, useState } from 'react';
import type { BlacklistedAddress, FormData, DeletePayload} from './types';
import { fetchBlacklistedAddresses } from './utils/api';
import AddressForm from './components/AddressForm';
import AddressTable from './components/AddressTable';

const ITEMS_PER_PAGE = 10;

const App = () => {

  const [addresses, setAddresses] = useState<BlacklistedAddress[]>([]);

  const [filteredAddresses, setFilteredAddresses] = useState<BlacklistedAddress[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [flaggedBy, setFlaggedBy] = useState<string>('All'); // Default to no filter
  const [flaggedByOptions, setFlaggedByOptions] = useState<string[]>(['All']); // Dynamic options
  const [currentPage, setCurrentPage] = useState<number>(1);
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
        const data = await fetchBlacklistedAddresses();
        // Generate id as address-chain (temporary, until API provides id)
        // TODO: Remove this later
        const addressesWithId = data.map((addr) => ({
          ...addr,
          id: `${addr.address}-${addr.chain}`,
        }));
        // Sort by blacklisted_at (desc)
        const sortedAddresses = addressesWithId.sort((a, b) => {
          return new Date(b.blacklisted_at).getTime() - new Date(a.blacklisted_at).getTime();
        });
        setAddresses(sortedAddresses);
        setFilteredAddresses(sortedAddresses);
        // Extract unique flagged_by values
        const uniqueFlaggedBy = ['All', ...new Set(sortedAddresses.map((addr) => addr.flagged_by))];
        setFlaggedByOptions(uniqueFlaggedBy);
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
      (addr.address.toLowerCase().includes(lowerQuery) ||
        addr.chain.toLowerCase().includes(lowerQuery) ||
        addr.id.toLowerCase().includes(lowerQuery)) &&
      (flaggedBy === 'All' || addr.flagged_by === flaggedBy)
    );
    setFilteredAddresses(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  }, [searchQuery, flaggedBy, addresses]);

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
      type: 'update',
    });
    setIsFormOpen(true);
  };

  // Handle Delete button
  const handleDelete = async (addr: BlacklistedAddress) => {
    if (window.confirm(`Delete address ${addr.address}?`)) {
      try {
        const deleteData: DeletePayload = {
          id: addr.id,
          type: 'delete',
        };
        // Log the delete payload
        console.log('Delete FormData:', deleteData);
        // Call API (commented out to avoid DB updates)
        // await manageBlacklistedAddress(deleteData);
        // Update state
        setAddresses(addresses.filter((a) => a.id !== addr.id));
        setFilteredAddresses(filteredAddresses.filter((a) => a.id !== addr.id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete address');
      }
    }
  };

  // Handle form submission
  const handleFormSubmit = async (data: FormData) => {
    try {
      // Log the create/update payload
      console.log(`${data.type.toUpperCase()} FormData:`, data);
      // Call API (commented out to avoid DB updates)
      // const result = await manageBlacklistedAddress(data);
      // Update state
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
        // Update flagged_by options if new value
        if (!flaggedByOptions.includes('Garden')) {
          setFlaggedByOptions([...flaggedByOptions, 'Garden']);
        }
      } else if (data.type === 'update') {
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
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">BlackListed Addresses</h1>
      {error && <p className="text-red-600 text-center mb-4">{error}</p>}
      {loading && <p className="text-center mb-4">Loading...</p>}

      {/* Search Input */}
      <div className="mb-5">
        <input
          type="text"
          placeholder="Search by address, chain, or id..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Add New Button */}
      <button 
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors mb-5" 
        onClick={handleAddNew}
      >
        Add New
      </button>

      {/* AddressTable */}
      <AddressTable
        addresses={paginatedAddresses}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
        flaggedBy={flaggedBy}
        setFlaggedBy={setFlaggedBy}
        flaggedByOptions={flaggedByOptions}
      />

      {/* AddressForm */}
      {isFormOpen && (
        <AddressForm
          formData={formData}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
};

export default App;