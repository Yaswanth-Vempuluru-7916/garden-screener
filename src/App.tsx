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
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] p-2 sm:p-3 lg:p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[#1A1A1A]/20"></div>
      <div className="relative z-10 max-w-full mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mx-4 mt-2 mb-6 space-y-3 sm:space-y-0">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#FFFFFF] tracking-tight mb-1">
              Blacklisted Addresses
            </h1>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#1A1A1A]/20 border border-[#FF6F61] rounded-xl shadow-lg backdrop-blur-sm mx-4">
            <div className="flex items-center space-x-2">
              <div className="p-1 bg-[#000000] rounded-lg border border-[#FF6F61]">
                <svg
                  className="w-5 h-5 text-[#FF6F61]"
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
              </div>
              <div>
                <p className="font-bold text-[#FF6F61] text-base">
                  System Error
                </p>
                <p className="text-[#FFFFFF]/70 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="mb-4 p-3 bg-[#1A1A1A]/50 rounded-xl shadow-lg backdrop-blur-sm border border-[#333333] mx-4">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#FFFFFF]"></div>
              <p className="text-[#FFFFFF] font-bold text-base">
                Loading addresses...
              </p>
            </div>
          </div>
        )}

        <div className="mb-6 mx-4 flex flex-row items-center space-x-4">
          <div className="relative group flex-grow-1">
            <input
              type="text"
              placeholder="Search by address, chain, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="relative w-full px-4 py-3 bg-[#1A1A1A] border border-[#333333] rounded-xl text-[#FFFFFF] text-sm font-medium placeholder-[#FFFFFF]/50 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]/50 focus:ring-offset-2 focus:ring-offset-[#000000] focus:border-[#FFFFFF]/50 transition-all duration-500 backdrop-blur-sm hover:border-[#FFFFFF]/70"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 bg-[#000000] rounded-lg border border-[#333333]">
              <svg
                className="w-5 h-5 text-[#FFFFFF]"
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
            className="group px-4 py-2 bg-[#1A1A1A] text-[#FFFFFF] rounded-xl font-bold hover:scale-105 hover:shadow-lg hover:shadow-[#333333]/40 focus:outline-none focus:ring-2 focus:ring-[#00FF7F]/50 focus:ring-offset-2 focus:ring-offset-[#000000] transition-all duration-500 cursor-pointer flex items-center space-x-1 w-auto justify-center border border-[#00FF7F] text-sm backdrop-blur-sm"
          >
            <div className="p-1 bg-[#000000] rounded-lg border border-[#00FF7F] group-hover:rotate-180 transition-transform duration-500">
              <svg
                className="w-4 h-4 text-[#00FF7F]"
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
            <span className="font-black tracking-wide">Add New Address</span>
          </button>
        </div>

        <div className="mx-4 mt-2">
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
};

export default App;
// import { useEffect, useState } from 'react';
// import type { BlacklistedAddress, FormData, DeletePayload } from './types';
// import { fetchBlacklistedAddresses } from './utils/api';
// import AddressForm from './components/AddressForm';
// import AddressTable from './components/AddressTable';

// const ITEMS_PER_PAGE = 15;

// const App = () => {
//   const [addresses, setAddresses] = useState<BlacklistedAddress[]>([]);
//   const [filteredAddresses, setFilteredAddresses] = useState<BlacklistedAddress[]>([]);
//   const [searchQuery, setSearchQuery] = useState<string>('');
//   const [flaggedBy, setFlaggedBy] = useState<string>('All');
//   const [flaggedByOptions, setFlaggedByOptions] = useState<string[]>(['All']);
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
//   const [formData, setFormData] = useState<FormData>({
//     data: { address: '', network: '', remark: '', tag: '' },
//     id: '',
//     type: 'create',
//   });
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const loadAddresses = async () => {
//       setLoading(true);
//       try {
//         const data = await fetchBlacklistedAddresses();
//         const addressesWithId = data.map((addr) => ({
//           ...addr,
//           id: `${addr.address}-${addr.chain}`,
//         }));
//         const sortedAddresses = addressesWithId.sort((a, b) => {
//           return new Date(b.blacklisted_at).getTime() - new Date(a.blacklisted_at).getTime();
//         });
//         setAddresses(sortedAddresses);
//         setFilteredAddresses(sortedAddresses);
//         const uniqueFlaggedBy = ['All', ...new Set(sortedAddresses.map((addr) => addr.flagged_by))];
//         setFlaggedByOptions(uniqueFlaggedBy);
//       } catch (error) {
//         setError(error instanceof Error ? error.message : 'Failed to fetch addresses');
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadAddresses();
//   }, []);

//   useEffect(() => {
//     const lowerQuery = searchQuery.toLowerCase();
//     const filtered = addresses.filter((addr) =>
//       (addr.address.toLowerCase().includes(lowerQuery) ||
//         addr.chain.toLowerCase().includes(lowerQuery) ||
//         addr.id.toLowerCase().includes(lowerQuery)) &&
//       (flaggedBy === 'All' || addr.flagged_by === flaggedBy)
//     );
//     setFilteredAddresses(filtered);
//     setCurrentPage(1);
//   }, [searchQuery, flaggedBy, addresses]);

//   const handleAddNew = () => {
//     setFormData({
//       data: { address: '', network: '', remark: '', tag: '' },
//       id: '',
//       type: 'create',
//     });
//     setIsFormOpen(true);
//   };

//   const handleEdit = (addr: BlacklistedAddress) => {
//     setFormData({
//       data: {
//         address: addr.address,
//         network: addr.chain,
//         remark: addr.remarks || '',
//         tag: '',
//       },
//       id: addr.id,
//       type: 'update',
//     });
//     setIsFormOpen(true);
//   };

//   const handleDelete = async (addr: BlacklistedAddress) => {
//     if (window.confirm(`Delete address ${addr.address}?`)) {
//       try {
//         const deleteData: DeletePayload = {
//           id: addr.id,
//           type: 'delete',
//         };
//         console.log('Delete FormData:', deleteData);
//         setAddresses(addresses.filter((a) => a.id !== addr.id));
//         setFilteredAddresses(filteredAddresses.filter((a) => a.id !== addr.id));
//       } catch (err) {
//         setError(err instanceof Error ? err.message : 'Failed to delete address');
//       }
//     }
//   };

//   const handleFormSubmit = async (data: FormData) => {
//     try {
//       console.log(`${data.type.toUpperCase()} FormData:`, data);
//       const newAddress: BlacklistedAddress = {
//         address: data.data.address,
//         blacklisted_at: new Date().toISOString(),
//         chain: data.data.network,
//         flagged_by: 'Garden',
//         remarks: data.data.remark || null,
//         id: data.id || `${data.data.address}-${data.data.network}`,
//       };
//       if (data.type === 'create') {
//         setAddresses([newAddress, ...addresses]);
//         setFilteredAddresses([newAddress, ...filteredAddresses]);
//         if (!flaggedByOptions.includes('Garden')) {
//           setFlaggedByOptions([...flaggedByOptions, 'Garden']);
//         }
//       } else if (data.type === 'update') {
//         setAddresses(addresses.map((a) => (a.id === data.id ? newAddress : a)));
//         setFilteredAddresses(filteredAddresses.map((a) => (a.id === data.id ? newAddress : a)));
//       }
//       setIsFormOpen(false);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to save address');
//     }
//   };

//   const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
//   const paginatedAddresses = filteredAddresses.slice(startIndex, startIndex + ITEMS_PER_PAGE);
//   const totalPages = Math.ceil(filteredAddresses.length / ITEMS_PER_PAGE);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 text-white p-2 sm:p-3 lg:p-4 relative overflow-hidden">
//       <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-teal-500/5 animate-pulse"></div>
//       <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
//       <div className="absolute bottom-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>

//       <div className="relative z-10 max-w-full mx-auto w-full">
//         <div className="flex flex-col sm:flex-row justify-between items-center mx-4 mt-2 mb-6 space-y-3 sm:space-y-0">
//           <div className="text-center sm:text-left">
//             <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-white via-teal-200 to-purple-200 bg-clip-text text-transparent tracking-tight mb-1">
//               Blacklisted Addresses
//             </h1>
//           </div>
//         </div>

//         {error && (
//           <div className="mb-4 p-3 bg-gradient-to-r from-red-600/20 to-red-800/20 border border-red-500/30 rounded-xl shadow-lg backdrop-blur-sm mx-4">
//             <div className="flex items-center space-x-2">
//               <div className="p-1 bg-red-500/20 rounded-lg">
//                 <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               </div>
//               <div>
//                 <p className="font-bold text-red-200 text-base">System Error</p>
//                 <p className="text-red-300 font-medium">{error}</p>
//               </div>
//             </div>
//           </div>
//         )}

//         {loading && (
//           <div className="mb-4 p-3 bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-xl shadow-lg backdrop-blur-sm border border-slate-600/30 mx-4">
//             <div className="flex items-center space-x-2">
//               <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-400"></div>
//               <p className="text-white font-bold text-base">Loading addresses...</p>
//             </div>
//           </div>
//         )}

//         <div className="mb-6 mx-4 flex flex-row items-center space-x-4">
//           <div className="relative group flex-grow-1">
//             <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-purple-500/20 rounded-xl blur-xl group-focus-within:blur-2xl transition-all duration-500"></div>
//             <input
//               type="text"
//               placeholder="Search by address, chain, or ID..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="relative w-full px-4 py-3 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-slate-600/50 rounded-xl text-white text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 focus:border-teal-500/50 transition-all duration-500 backdrop-blur-sm hover:shadow-lg hover:shadow-teal-500/20"
//             />
//             <div className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 bg-teal-500/20 rounded-lg">
//               <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//               </svg>
//             </div>
//           </div>
//           <button
//             onClick={handleAddNew}
//             className="group px-4 py-2 bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700 text-white rounded-xl font-bold hover:scale-105 hover:shadow-lg hover:shadow-teal-500/40 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-500 cursor-pointer flex items-center space-x-1 w-auto justify-center border border-teal-400/20 text-sm backdrop-blur-sm"
//           >
//             <div className="p-1 bg-white/20 rounded-lg group-hover:rotate-180 transition-transform duration-500">
//               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//               </svg>
//             </div>
//             <span className="font-black tracking-wide">Add New Address</span>
//           </button>
//         </div>

//         <div className="mx-4 mt-2">
//           <AddressTable
//             addresses={paginatedAddresses}
//             currentPage={currentPage}
//             totalPages={totalPages}
//             onPageChange={setCurrentPage}
//             onEdit={handleEdit}
//             onDelete={handleDelete}
//             flaggedBy={flaggedBy}
//             setFlaggedBy={setFlaggedBy}
//             flaggedByOptions={flaggedByOptions}
//           />
//         </div>

//         {isFormOpen && (
//           <AddressForm
//             formData={formData}
//             onSubmit={handleFormSubmit}
//             onCancel={() => setIsFormOpen(false)}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default App;
