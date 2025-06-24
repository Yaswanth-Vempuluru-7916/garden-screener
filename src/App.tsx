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
  <div className="relative min-h-screen w-full bg-white dark:bg-black">
    {/* Grid Background */}
    <div className="absolute inset-0 [background-size:40px_40px] [background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]" />
    
    {/* Radial gradient overlay for faded look */}
    <div className="pointer-events-none absolute inset-0 bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>
    
    {/* Content */}
    <div className="relative z-10 p-6">
      <div>
        <div>
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">Blacklisted Addresses</h1>
        </div>
      </div>
      {error && (
        <div className="mt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-950 dark:border-red-800">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-600 dark:text-red-400 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="font-medium text-red-800 dark:text-red-200">System Error</p>
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {loading && (
        <div className="mt-4">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 dark:border-neutral-100"></div>
            <p className="ml-3 text-neutral-700 dark:text-neutral-300">Loading addresses...</p>
          </div>
        </div>
      )}
      <div className="mt-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by address, chain, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-100 dark:placeholder-neutral-400"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          <div className="mr-2">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <span>Add New Address</span>
        </button>
      </div>
      <div className="mt-6">
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
      </div>
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
}

export default App;
