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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            BlackListed Addresses
          </h1>
          <div className="h-1 w-20 bg-blue-600 rounded-full"></div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        {loading && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md mb-4">
            <p className="font-medium">Loading...</p>
          </div>
        )}

        {/* Search Input */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by address, chain, or id..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
            <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Add New Button */}
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors mb-6 w-full sm:w-auto" 
          onClick={handleAddNew}
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Address
          </span>
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
    </div>
  );
};

export default App;