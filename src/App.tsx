import { useCallback, useEffect, useRef, useState } from 'react';
import type { BlacklistedAddress, FormData } from './types';
import { fetchBlacklistedAddress, manageBlacklistedAddress } from './utils/api';
import AddressForm from './components/AddressForm';
import AddressCard from './components/AddressCard';

const App = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    data: { address: '', remarks: '', tag: '', network: '' },
    id: '',
    type: 'create',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState<boolean>(true);
  const [showAddressCard, setShowAddressCard] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<BlacklistedAddress | null>(null);
  const [showSecretPrompt, setShowSecretPrompt] = useState<boolean>(false);
  const [tempSecret, setTempSecret] = useState<string>('');
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search bar on page load
  useEffect(() => {
    if (showSearch) {
      searchInputRef.current?.focus();
    }
  }, [showSearch]);

  // Handle Add New button
  const handleAddNew = useCallback(() => {
    console.log('Add New Address button clicked');
    setFormData({
      data: { address: '', remarks: '', tag: '', network: '' },
      id: '',
      type: 'create',
    });
    setIsFormOpen(true);
  }, []);

  // Handle form submission with app secret prompt
  const handleFormSubmit = async (data: FormData, secret?: string) => {
    try {
      let appSecret = localStorage.getItem('appSecret') || secret;
      if (!appSecret) {
        // Keep form open, show secret prompt
        setShowSecretPrompt(true);
        setPendingFormData(data);
        console.log('App secret prompt triggered', { isFormOpen, showSecretPrompt: true });
        return;
      }
      const formToSubmit = pendingFormData || data;
      console.log(`${data.type.toUpperCase()} FormData:`, formToSubmit);
      const result = await manageBlacklistedAddress(data, appSecret);
      console.log('API Result:', result);
      setIsFormOpen(false);
      setShowSecretPrompt(false);
      if (secret) {
        localStorage.setItem('appSecret', secret);
      }
      setPendingFormData(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save address');
    }
  };

  // Handle search submission, keep card visible for Ctrl+K
  const handleSearchSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setLoading(true);
      setShowSearch(false);
      try {
        const result = await fetchBlacklistedAddress(searchQuery.trim());
        setSearchResults(result);
        setShowAddressCard(true);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to search address');
        setSearchResults(null);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle app secret prompt submission
  const handleSecretSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempSecret && pendingFormData) {
      handleFormSubmit(pendingFormData, tempSecret);
      setTempSecret('');
    }
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.altKey && event.key.toLowerCase() === 'n') {
        event.preventDefault();
        handleAddNew();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setShowSearch(prev => !prev);
        if (!showSearch) {
          setTimeout(() => searchInputRef.current?.focus(), 0);
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleAddNew, showSearch]);

  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-black">
      {/* Grid Background */}
      <div className="absolute inset-0 [background-size:40px_40px] [background-image:linear-gradient(to_right,rgba(228,228,231,0.7)_1px,transparent_1px),linear-gradient(to_bottom,rgba(228,228,231,0.7)_1px,transparent_1px)] dark:[background-image:linear-gradient(to_right,rgba(38,38,38,0.7)_1px,transparent_1px),linear-gradient(to_bottom,rgba(38,38,38,0.7)_1px,transparent_1px)] pointer-events-none" />

      {/* Radial gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black" />

      {/* Add New Address button in fixed container */}
      <div className="fixed top-6 right-6 z-70 pointer-events-auto">
        <button
          onClick={handleAddNew}
          className="cursor-pointer select-none text-sm tracking-normal rounded-sm flex gap-1.5 items-center justify-center text-nowrap border transition-colors duration-75 fv-style disabled:opacity-50 disabled:cursor-not-allowed bg-[hsl(219,_93%,_35%)] border-transparent text-white [box-shadow:hsl(219,_93%,_35%)_0_-2px_0_0_inset,_hsl(219,_93%,_95%)_0_1px_3px_0] dark:[box-shadow:hsl(219,_93%,_35%)_0_-2px_0_0_inset,_hsl(0,_0%,_0%,_0.4)_0_1px_3px_0] hover:bg-[hsl(219,_93%,_30%)] active:[box-shadow:none] hover:[box-shadow:none] dark:hover:[box-shadow:none] h-8 px-5 py-5 data-kbd:pr-1 font-segoe pointer-events-auto"
        >
          <span>Add New Address</span>
          <span className="h-5 max-w-max rounded-xs px-1.5 items-center gap-0.5 text-[.6875rem] font-bold dark:text-gray-400 dark:border-offgray-400/10 border dark:bg-cream-900/10 hidden sm:flex !border-white/20 !bg-white/10 !text-white mr-3">Alt + N</span>
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 p-6">
        {/* {error && (
          <div className="mb-4 mt-25 flex items-center justify-between px-4 py-3 rounded bg-red-100 border border-red-300 text-red-800 shadow">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-red-600 hover:underline text-sm"
              aria-label="Dismiss error"
            >
              Dismiss
            </button>
          </div>
        )} */}
        {loading && (
          <div className=" absolute inset-2.5 mt-32">
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 dark:border-neutral-100"></div>
              <p className="ml-3 text-neutral-700 dark:text-neutral-300">Loading addresses...</p>
            </div>
          </div>
        )}
        {showSearch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 pointer-events-auto">
            <div className="relative w-auto max-w-lg -translate-y-7/2 sm:-translate-y-7/2 sm:w-full pointer-events-auto">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by address"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchSubmit}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-100 dark:placeholder-neutral-400 pointer-events-auto"
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
          </div>
        )}
        {isFormOpen && (
          <AddressForm
            formData={formData}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            className={showSecretPrompt ? 'opacity-50 pointer-events-none' : ''} // [mod] Reduce opacity when secret prompt is shown
          />
        )}
        {showSecretPrompt && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-100 p-4 sm:p-6 pointer-events-auto">
            <div className="relative bg-black/70 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-white mb-4">Enter App Secret</h2>
              <form onSubmit={handleSecretSubmit} className="space-y-4">
                <input
                  type="password"
                  value={tempSecret}
                  onChange={(e) => setTempSecret(e.target.value)}
                  placeholder="App Secret"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md text-white text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  required
                />
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowSecretPrompt(false)}
                    className="px-4 py-2 bg-red-500 text-white rounded-md font-medium hover:bg-red-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[hsl(219,_93%,_35%)] text-white rounded-md font-medium hover:bg-[hsl(219,_93%,_30%)]"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {showAddressCard && searchResults && (
          <div className="mt-6">
            <div className="min-h-screen flex items-center justify-center p-4">
              <AddressCard key={searchResults.id} {...searchResults} />
            </div>
          </div>
        )}
        {showAddressCard && !searchResults && (
          <div className="mt-6 text-center text-gray-500">No results found.</div>
        )}
      </div>
    </div>
  );
};

export default App;