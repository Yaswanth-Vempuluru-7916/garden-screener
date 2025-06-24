import { useCallback, useEffect, useRef, useState } from 'react';
import type { BlacklistedAddress, FormData, DeletePayload } from './types';
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

  const searchInputRef = useRef<HTMLInputElement>(null)
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
  const handleAddNew = useCallback(() => {
    setFormData({
      data: { address: '', network: '', remark: '', tag: '' },
      id: '',
      type: 'create',
    });
    setIsFormOpen(true);
  }, []);

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

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      //ALt+N for Add New
      if (event.altKey && event.key.toLowerCase() === 'n') {
        event.preventDefault();
        handleAddNew();
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchInputRef.current?.focus()
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleAddNew]);


  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAddresses = filteredAddresses.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredAddresses.length / ITEMS_PER_PAGE);

  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-black">
      {/* Grid Background with reduced opacity */}
      <div className="absolute inset-0 [background-size:40px_40px] [background-image:linear-gradient(to_right,rgba(228,228,231,0.7)_1px,transparent_1px),linear-gradient(to_bottom,rgba(228,228,231,0.7)_1px,transparent_1px)] dark:[background-image:linear-gradient(to_right,rgba(38,38,38,0.7)_1px,transparent_1px),linear-gradient(to_bottom,rgba(38,38,38,0.7)_1px,transparent_1px)]" />

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
              ref={searchInputRef}
              type="text"
              placeholder="Search by address, chain, or ID...  "
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-100 dark:placeholder-neutral-400"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:block">
              <kbd className="px-2 py-1 rounded bg-neutral-200 text-xs font-mono text-neutral-700 dark:bg-neutral-700 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-600 shadow">
                ⌘ + K
              </kbd>
            </div>
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
            className="cursor-pointer group select-none text-sm tracking-tight rounded-sm flex gap-1.5 items-center justify-center text-nowrap border transition-colors duration-75 fv-style disabled:opacity-50 disabled:cursor-not-allowed bg-[hsl(219,_93%,_35%)] border-transparent text-white [box-shadow:hsl(219,_93%,_35%)_0_-2px_0_0_inset,_hsl(219,_93%,_95%)_0_1px_3px_0] dark:[box-shadow:hsl(219,_93%,_35%)_0_-2px_0_0_inset,_hsl(0,_0%,_0%,_0.4)_0_1px_3px_0] hover:bg-[hsl(219,_93%,_30%)] active:[box-shadow:none] hover:[box-shadow:none] dark:hover:[box-shadow:none] h-8 px-5 py-5 data-kbd:pr-1 font-segoe"
          >
            <span>Add New Address</span>
            <span className="h-5 max-w-max rounded-xs px-1.5  items-center gap-0.5 text-[.6875rem] font-bold  dark:text-gray-300 dark:border-offgray-400/10 border  dark:bg-cream-900/10  hidden sm:flex !border-white/20 !bg-white/10 !text-white mr-3">Alt + N</span>
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