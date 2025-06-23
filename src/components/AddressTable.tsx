import { useState } from "react";
import type { BlacklistedAddress } from "../types";

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
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy address:", err);
      });
  };

  return (
    <div className="relative bg-[#1A1A1A] rounded-2xl shadow-2xl border border-[#333333] backdrop-blur-xl p-6 sm:p-8 w-full overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-[#FFFFFF]"></div>

      <div className="relative z-10">
        <div className="overflow-x-auto scrollbar-thin scrollbar-track-[#1A1A1A] scrollbar-thumb-[#333333] scrollbar-thumb-rounded-full">
          <table className="min-w-full divide-y divide-[#333333]">
            <thead className="bg-[#1A1A1A] backdrop-blur-sm">
              <tr className="border-b border-[#333333]">
                <th className="px-4 py-2 text-left text-sm font-bold text-[#FFFFFF] uppercase tracking-wider min-w-[200px] bg-[#000000]/20">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[#00BFFF] rounded-full animate-pulse"></div>
                    <span className="text-[#00BFFF]">Address</span>
                  </div>
                </th>
                <th className="px-4 py-2 text-left text-sm font-bold text-[#FFFFFF] uppercase tracking-wider min-w-[100px]">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[#FF6F61] rounded-full animate-pulse"></div>
                    <span className="text-[#FF6F61]">Chain</span>
                  </div>
                </th>
                <th className="px-4 py-2 text-left text-sm font-bold text-[#FFFFFF] uppercase tracking-wider min-w-[150px]">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-[#00FF7F] rounded-full animate-pulse"></div>
                    <span className="text-[#00FF7F]">Flagged By</span>
                    <select
                      value={flaggedBy}
                      onChange={(e) => setFlaggedBy(e.target.value)}
                      className="bg-[#000000] text-[#FFFFFF] border border-[#333333] rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]/50 focus:ring-offset-2 focus:ring-offset-[#000000] transition-all duration-500 cursor-pointer hover:border-[#FFFFFF]/70 backdrop-blur-sm"
                    >
                      {flaggedByOptions.map((option) => (
                        <option
                          key={option}
                          value={option}
                          className="bg-[#000000] text-[#FFFFFF] font-medium"
                        >
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </th>
                <th className="px-4 py-2 text-left text-sm font-bold text-[#FFFFFF] uppercase tracking-wider min-w-[120px]">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[#FFD700] rounded-full animate-pulse"></div>
                    <span className="text-[#FFD700]">Blacklisted At</span>
                  </div>
                </th>
                <th className="px-4 py-2 text-left text-sm font-bold text-[#FFFFFF] uppercase tracking-wider min-w-[150px]">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[#9370DB] rounded-full animate-pulse"></div>
                    <span className="text-[#9370DB]">Remarks</span>
                  </div>
                </th>
                <th className="px-4 py-2 text-left text-sm font-bold text-[#FFFFFF] uppercase tracking-wider min-w-[120px]">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[#FFA500] rounded-full animate-pulse"></div>
                    <span className="text-[#FFA500]">Actions</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#1A1A1A]/50 divide-y divide-[#333333] backdrop-blur-sm">
              {addresses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-2 text-center">
                    <div className="flex flex-col items-center justify-center py-4 space-y-2">
                      <div className="relative">
                        <div className="absolute inset-0 bg-[#333333]/20 rounded-full"></div>
                        <svg
                          className="relative w-12 h-12 text-[#FFFFFF]/50"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-lg font-bold text-[#FFFFFF]">
                          No addresses found
                        </p>
                        <p className="text-xs text-[#FFFFFF]/50 font-medium">
                          Try adjusting your search or filter criteria
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                addresses.map((addr, index) => (
                  <tr
                    key={addr.id}
                    className="group hover:bg-[#333333]/20 transition-all duration-500 border-b border-[#333333]/30 hover:border-[#FFFFFF]/30"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-mono text-[#FFFFFF] group-hover:text-[#FFFFFF] transition-colors duration-300 break-all">
                            {addr.address}
                          </span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(addr.address, addr.id)}
                          className={`flex-shrink-0 p-1 rounded-xl focus:outline-none transition-all duration-500 ${
                            copiedId === addr.id
                              ? "text-[#00FF7F] bg-[#000000] border border-[#00FF7F] scale-110"
                              : "text-[#FFFFFF]/50 hover:text-[#FFFFFF] hover:bg-[#000000] hover:border hover:border-[#333333] hover:scale-125"
                          } cursor-pointer backdrop-blur-sm`}
                          title={
                            copiedId === addr.id
                              ? "Copied!"
                              : "Copy to clipboard"
                          }
                        >
                          {copiedId === addr.id ? (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      {addr.chain ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-xl text-sm font-bold bg-[#1A1A1A] text-[#FFFFFF] border border-[#FF6F61] hover:border-[#FF6F61]/70 hover:scale-105 hover:shadow-xl hover:shadow-[#FF6F61]/30 transition-all duration-300 backdrop-blur-sm">
                          {addr.chain}
                        </span>
                      ) : (
                        <span className="text-[#FFFFFF]/50 text-sm font-medium">
                          -
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <span className="inline-flex items-center px-3 py-1 rounded-xl text-sm font-bold bg-[#1A1A1A] text-[#FFFFFF] border border-[#00FF7F] hover:border-[#00FF7F]/70 hover:scale-105 hover:shadow-xl hover:shadow-[#00FF7F]/30 transition-all duration-300 backdrop-blur-sm">
                        {addr.flagged_by}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <div className="space-y-0.5">
                        <span className="block text-[#FFFFFF] font-semibold">
                          {new Date(addr.blacklisted_at).toLocaleDateString()}
                        </span>
                        <span className="block text-xs text-[#FFFFFF]/50 font-medium">
                          {new Date(addr.blacklisted_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <div className="max-w-xs">
                        {addr.remarks ? (
                          <span className="text-[#FFFFFF] font-medium break-words">
                            {addr.remarks}
                          </span>
                        ) : (
                          <span className="text-[#FFFFFF]/50 font-medium">
                            -
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      {addr.flagged_by === "Garden" ? (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => onEdit(addr)}
                            className="px-3 py-1 bg-[#1A1A1A] text-[#FFFFFF] rounded-xl font-bold hover:scale-110 hover:shadow-xl hover:shadow-[#333333]/50 focus:outline-none focus:ring-2 focus:ring-[#00BFFF]/50 focus:ring-offset-2 focus:ring-offset-[#000000] transition-all duration-500 cursor-pointer backdrop-blur-sm border border-[#00BFFF]"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDelete(addr)}
                            className="px-3 py-1 bg-[#1A1A1A] text-[#FFFFFF] rounded-xl font-bold hover:scale-110 hover:shadow-xl hover:shadow-[#333333]/50 focus:outline-none focus:ring-2 focus:ring-[#FF6F61]/50 focus:ring-offset-2 focus:ring-offset-[#000000] transition-all duration-500 cursor-pointer backdrop-blur-sm border border-[#FF6F61]"
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <span className="text-[#FFFFFF]/50 font-medium text-sm">
                          -
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 space-y-2 sm:space-y-0 sm:space-x-2 bg-[#000000]/50 rounded-2xl p-2 border border-[#333333] backdrop-blur-sm">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="group w-full sm:w-auto px-4 py-1 bg-[#1A1A1A] text-[#FFFFFF] rounded-xl font-bold hover:scale-105 hover:shadow-xl hover:shadow-[#333333]/30 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]/50 focus:ring-offset-2 focus:ring-offset-[#000000] transition-all duration-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none border border-[#333333] text-sm"
          >
            <span className="flex items-center justify-center space-x-1">
              <svg
                className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span>Previous</span>
            </span>
          </button>

          <div className="flex items-center space-x-2">
            <div className="text-sm font-bold text-[#FFFFFF] px-2 py-1 bg-[#000000]/50 rounded-xl border border-[#333333]">
              Page {currentPage} of {totalPages}
            </div>
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="group w-full sm:w-auto px-4 py-1 bg-[#1A1A1A] text-[#FFFFFF] rounded-xl font-bold hover:scale-105 hover:shadow-xl hover:shadow-[#333333]/30 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]/50 focus:ring-offset-2 focus:ring-offset-[#000000] transition-all duration-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none border border-[#333333] text-sm"
          >
            <span className="flex items-center justify-center space-x-1">
              <span>Next</span>
              <svg
                className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressTable;

// import { useState } from 'react';
// import type { BlacklistedAddress } from '../types';

// interface AddressTableProps {
//   addresses: BlacklistedAddress[];
//   currentPage: number;
//   totalPages: number;
//   onPageChange: (page: number) => void;
//   onEdit: (address: BlacklistedAddress) => void;
//   onDelete: (address: BlacklistedAddress) => void;
//   flaggedBy: string;
//   setFlaggedBy: (value: string) => void;
//   flaggedByOptions: string[];
// }

// const AddressTable = ({
//   addresses,
//   currentPage,
//   totalPages,
//   onPageChange,
//   onEdit,
//   onDelete,
//   flaggedBy,
//   setFlaggedBy,
//   flaggedByOptions,
// }: AddressTableProps) => {
//   const [copiedId, setCopiedId] = useState<string | null>(null);

//   const copyToClipboard = (text: string, id: string) => {
//     navigator.clipboard.writeText(text).then(() => {
//       setCopiedId(id);
//       setTimeout(() => setCopiedId(null), 2000);
//     }).catch((err) => {
//       console.error('Failed to copy address:', err);
//     });
//   };

//   return (
//     <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700/50 backdrop-blur-xl p-6 sm:p-8 w-full overflow-hidden">
//       <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-teal-500/5 animate-pulse"></div>
//       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-teal-500 to-purple-500 animate-pulse"></div>

//       <div className="relative z-10">
//         <div className="overflow-x-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-teal-500 scrollbar-thumb-rounded-full">
//           <table className="min-w-full divide-y divide-slate-600/50">
//             <thead className="bg-gradient-to-r from-indigo-950 via-purple-950 to-indigo-950 backdrop-blur-sm">
//               <tr className="border-b border-slate-600/30">
//                 <th className="px-4 py-2 text-left text-sm font-bold text-white uppercase tracking-wider min-w-[200px] bg-gradient-to-r from-transparent to-purple-500/10">
//                   <div className="flex items-center space-x-2">
//                     <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
//                     <span className="bg-gradient-to-r from-white to-teal-200 bg-clip-text text-transparent">Address</span>
//                   </div>
//                 </th>
//                 <th className="px-4 py-2 text-left text-sm font-bold text-white uppercase tracking-wider min-w-[100px]">
//                   <div className="flex items-center space-x-2">
//                     <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
//                     <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">Chain</span>
//                   </div>
//                 </th>
//                 <th className="px-4 py-2 text-left text-sm font-bold text-white uppercase tracking-wider min-w-[150px]">
//                   <div className="flex items-center space-x-3">
//                     <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
//                     <span className="bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">Flagged By</span>
//                     <select
//                       value={flaggedBy}
//                       onChange={(e) => setFlaggedBy(e.target.value)}
//                       className="bg-gradient-to-r from-slate-800 to-slate-700 text-white border border-slate-600/50 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-500 cursor-pointer hover:shadow-lg hover:shadow-teal-500/20 backdrop-blur-sm"
//                     >
//                       {flaggedByOptions.map((option) => (
//                         <option key={option} value={option} className="bg-slate-800 text-white font-medium">
//                           {option}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </th>
//                 <th className="px-4 py-2 text-left text-sm font-bold text-white uppercase tracking-wider min-w-[120px]">
//                   <div className="flex items-center space-x-2">
//                     <div className="w-2 h-2 bg-rose-400 rounded-full animate-pulse"></div>
//                     <span className="bg-gradient-to-r from-white to-rose-200 bg-clip-text text-transparent">Blacklisted At</span>
//                   </div>
//                 </th>
//                 <th className="px-4 py-2 text-left text-sm font-bold text-white uppercase tracking-wider min-w-[150px]">
//                   <div className="flex items-center space-x-2">
//                     <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
//                     <span className="bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent">Remarks</span>
//                   </div>
//                 </th>
//                 <th className="px-4 py-2 text-left text-sm font-bold text-white uppercase tracking-wider min-w-[120px]">
//                   <div className="flex items-center space-x-2">
//                     <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
//                     <span className="bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">Actions</span>
//                   </div>
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 divide-y divide-slate-700/30 backdrop-blur-sm">
//               {addresses.length === 0 ? (
//                 <tr>
//                   <td colSpan={6} className="px-4 py-2 text-center">
//                     <div className="flex flex-col items-center justify-center py-6 space-y-2">
//                       <div className="relative">
//                         <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-teal-500/20 rounded-full blur-xl animate-pulse"></div>
//                         <svg className="relative w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                         </svg>
//                       </div>
//                       <div className="text-center space-y-1">
//                         <p className="text-lg font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">No addresses found</p>
//                         <p className="text-xs text-slate-400 font-medium">Try adjusting your search or filter criteria</p>
//                       </div>
//                     </div>
//                   </td>
//                 </tr>
//               ) : (
//                 addresses.map((addr, index) => (
//                   <tr
//                     key={addr.id}
//                     className="group hover:bg-gradient-to-r hover:from-slate-800/50 hover:via-purple-900/10 hover:to-teal-900/10 transition-all duration-500 border-b border-slate-700/20 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10"
//                     style={{ animationDelay: `${index * 100}ms` }}
//                   >
//                     <td className="px-4 py-2 whitespace-nowrap">
//                       <div className="flex items-center space-x-2">
//                         <div className="flex-1 min-w-0">
//                           <span className="text-sm font-mono text-white group-hover:text-teal-200 transition-colors duration-300 break-all">
//                             {addr.address}
//                           </span>
//                         </div>
//                         <button
//                           onClick={() => copyToClipboard(addr.address, addr.id)}
//                           className={`flex-shrink-0 p-1 rounded-xl focus:outline-none transition-all duration-500 ${copiedId === addr.id
//                             ? 'text-green-400 bg-green-500/20 shadow-lg shadow-green-500/20 scale-110'
//                             : 'text-slate-400 hover:text-teal-400 hover:bg-teal-500/20 hover:scale-125 hover:shadow-lg hover:shadow-teal-500/20'
//                           } cursor-pointer backdrop-blur-sm`}
//                           title={copiedId === addr.id ? 'Copied!' : 'Copy to clipboard'}
//                         >
//                           {copiedId === addr.id ? (
//                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                             </svg>
//                           ) : (
//                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
//                             </svg>
//                           )}
//                         </button>
//                       </div>
//                     </td>
//                     <td className="px-4 py-2 whitespace-nowrap text-sm">
//                       {addr.chain ? (
//                         <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 transition-all duration-300 hover:scale-105">
//                           {addr.chain}
//                         </span>
//                       ) : (
//                         <span className="text-slate-400 text-sm font-medium">-</span>
//                       )}
//                     </td>
//                     <td className="px-4 py-2 whitespace-nowrap text-sm">
//                       <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105">
//                         {addr.flagged_by}
//                       </span>
//                     </td>
//                     <td className="px-4 py-2 whitespace-nowrap text-sm">
//                       <div className="space-y-0.5">
//                         <span className="block text-white font-semibold">{new Date(addr.blacklisted_at).toLocaleDateString()}</span>
//                         <span className="block text-xs text-slate-400 font-medium">{new Date(addr.blacklisted_at).toLocaleTimeString()}</span>
//                       </div>
//                     </td>
//                     <td className="px-4 py-2 text-sm">
//                       <div className="max-w-xs">
//                         {addr.remarks ? (
//                           <span className="text-white font-medium break-words">{addr.remarks}</span>
//                         ) : (
//                           <span className="text-slate-400 font-medium">-</span>
//                         )}
//                       </div>
//                     </td>
//                     <td className="px-4 py-2 whitespace-nowrap text-sm">
//                       {addr.flagged_by === 'Garden' ? (
//                         <div className="flex space-x-1">
//                           <button
//                             onClick={() => onEdit(addr)}
//                             className="px-3 py-1 bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 text-white rounded-xl font-bold hover:scale-110 hover:shadow-xl hover:shadow-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-500 cursor-pointer backdrop-blur-sm border border-purple-400/20"
//                           >
//                             Edit
//                           </button>
//                           <button
//                             onClick={() => onDelete(addr)}
//                             className="px-3 py-1 bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white rounded-xl font-bold hover:scale-110 hover:shadow-xl hover:shadow-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-500 cursor-pointer backdrop-blur-sm border border-red-400/20"
//                           >
//                             Delete
//                           </button>
//                         </div>
//                       ) : (
//                         <span className="text-slate-400 font-medium text-sm">-</span>
//                       )}
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         <div className="flex flex-col sm:flex-row items-center justify-between mt-4 space-y-2 sm:space-y-0 sm:space-x-2 bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-2xl p-2 border border-slate-600/30 backdrop-blur-sm">
//           <button
//             onClick={() => onPageChange(currentPage - 1)}
//             disabled={currentPage === 1}
//             className="group w-full sm:w-auto px-4 py-1 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 text-white rounded-xl font-bold hover:scale-105 hover:shadow-xl hover:shadow-slate-500/30 focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none border border-slate-500/20 text-sm"
//           >
//             <span className="flex items-center justify-center space-x-1">
//               <svg className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//               </svg>
//               <span>Previous</span>
//             </span>
//           </button>

//           <div className="flex items-center space-x-2">
//             <div className="text-sm font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent px-2 py-1 bg-slate-800/50 rounded-xl border border-slate-600/30">
//               Page {currentPage} of {totalPages}
//             </div>
//           </div>

//           <button
//             onClick={() => onPageChange(currentPage + 1)}
//             disabled={currentPage === totalPages}
//             className="group w-full sm:w-auto px-4 py-1 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 text-white rounded-xl font-bold hover:scale-105 hover:shadow-xl hover:shadow-slate-500/30 focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none border border-slate-500/20 text-sm"
//           >
//             <span className="flex items-center justify-center space-x-1">
//               <span>Next</span>
//               <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//               </svg>
//             </span>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddressTable;
