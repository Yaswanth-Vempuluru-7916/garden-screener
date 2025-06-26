import { useCallback, useEffect, useRef, useState } from "react";
import type { BlacklistedAddress, FormData } from "./types";
import { fetchBlacklistedAddress, manageBlacklistedAddress } from "./utils/api";
import AddressForm from "./components/AddressForm";
import AddressCard from "./components/AddressCard";
import { toast, Toaster } from "sonner";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

const App = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    data: { address: "", network: "", remark: "", tag: "" },
    id: "",
    type: "create",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [showAddressCard, setShowAddressCard] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<BlacklistedAddress | null>(null);
  const [showSecretPrompt, setShowSecretPrompt] = useState<boolean>(false);
  const [tempSecret, setTempSecret] = useState<string>("");
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load search history from localStorage on mount
  useEffect(() => {
    const history = localStorage.getItem("searchHistory");
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // Save search history to localStorage whenever it changes
  useEffect(() => {
    if (searchHistory.length > 0) {
      localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    }
  }, [searchHistory]);

  // Focus search bar when showSearch becomes true
  useEffect(() => {
    if (showSearch) {
      searchInputRef.current?.focus();
    }
  }, [showSearch]);

  // Handle Add New button
  const handleAddNew = useCallback(() => {
    console.log("Add New Address button clicked");
    setFormData({
      data: { address: "", network: "", remark: "", tag: "" },
      id: "",
      type: "create",
    });
    setIsFormOpen(true);
  }, []);

  // Handle form submission with app secret prompt
  const handleFormSubmit = async (data: FormData, secret?: string) => {
    try {
      let appSecret = localStorage.getItem("appSecret") || secret;
      if (!appSecret) {
        setShowSecretPrompt(true);
        setPendingFormData(data);
        console.log("App secret prompt triggered", { isFormOpen, showSecretPrompt: true });
        return;
      }
      const formToSubmit = pendingFormData || data;
      console.log(`FormData just before api call:`, formToSubmit);
      const result = await manageBlacklistedAddress(data, appSecret);
      console.log("API Result:", result);
      setIsFormOpen(false);
      setShowSecretPrompt(false);
      toast.success("Address blacklisted successfully");
      const response = await fetchBlacklistedAddress(formToSubmit.data.address);
      setShowAddressCard(true);
      setSearchResults(response);
      if (secret) {
        localStorage.setItem("appSecret", secret);
      }
      setPendingFormData(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save address"
      );
    }
  };

  // Handle search submission, update history
  const handleSearchSubmit = async (query: string) => {
    if (query.trim()) {
      setLoading(true);
      setShowSearch(false);
      try {
        const result = await fetchBlacklistedAddress(query.trim());
        setSearchResults(result);
        setShowAddressCard(true);
        setSearchHistory((prev) => {
          const newHistory = [query.trim(), ...prev.filter((item) => item !== query.trim())].slice(0, 10); // Limit to 10 items
          return newHistory;
        });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to search address"
        );
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
      setTempSecret("");
    }
    setShowSecretPrompt(false);
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;
      if (!isTyping && event.key.toLowerCase() === "n") {
        event.preventDefault();
        handleAddNew();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setShowSearch((prev) => !prev);
        if (showAddressCard) {
          setShowAddressCard(false); // Hide AddressCard when showing search
          setSearchResults(null); // Clear search results
        }
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleAddNew, showAddressCard]);

  return (
    <>
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
            <span className="h-5 max-w-max rounded-xs px-1.5 items-center gap-0.5 text-[.6875rem] font-bold dark:text-gray-400 dark:border-offgray-400/10 border dark:bg-cream-900/10 hidden sm:flex !border-white/20 !bg-white/10 !text-white mr-3">
              N
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="relative z-10 p-6">
          {/* {loading && (
            <div className="absolute inset-2.5 mt-32">
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 dark:border-neutral-100"></div>
                <p className="ml-3 text-neutral-700 dark:text-neutral-300">
                  Loading addresses...
                </p>
              </div>
            </div>
          )} */}
          {!showAddressCard && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="w-full max-w-2xl mx-4 -translate-y-3/4">
                <Command className="dark:bg-black-100 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden backdrop-blur-xl py-2">
                  <CommandInput
                    ref={searchInputRef}
                    placeholder="Search by address..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearchSubmit(searchQuery);
                      }
                    }}
                    className="text-lg px-6 py-4"
                  />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    {searchHistory.length > 0 && (
                      <CommandGroup heading="Recent Searches"  className="space-y-2">
                        {searchHistory.map((item, index) => (
                          <CommandItem
                            key={index}
                            onSelect={() => {
                              setSearchQuery(item);
                              handleSearchSubmit(item);
                            }}
                          >
                            {item}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </div>
            </div>
          )}
         
          {isFormOpen && (
            <AddressForm
              formData={formData}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormOpen(false)}
              className={
                showSecretPrompt ? "opacity-50 pointer-events-none" : ""
              }
            />
          )}
          {showSecretPrompt && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-100 p-4 sm:p-6 pointer-events-auto">
              <div className="relative bg-black/70 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold text-white mb-4">
                  Enter App Secret
                </h2>
                <form onSubmit={handleSecretSubmit} className="space-y-4">
                  <input
                    type="password"
                    value={tempSecret}
                    onChange={(e) => setTempSecret(e.target.value)}
                    placeholder="App Secret"
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-md text-white text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
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
            <div className="-mt-5">
              <div className="min-h-screen flex items-center justify-center p-4">
                <AddressCard key={searchResults.id} {...searchResults} />
              </div>
            </div>
          )}
        </div>
      </div>
      <Toaster position="bottom-center" richColors />
    </>
  );
};

export default App;