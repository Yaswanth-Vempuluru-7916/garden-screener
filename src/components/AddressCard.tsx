import type { BlacklistedAddress } from '../types';

// [mod] Use typed props with optional remark
const AddressCard = ({ address, remarks, blacklisted_at, flagged_by }: BlacklistedAddress) => {
    // [mod] Debug log to check remark value
    console.log('AddressCard props:', { address, remarks, blacklisted_at, flagged_by });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="bg-black/90 border border-gray-600 rounded-xl p-6 w-full max-w-2xl shadow-2xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-800 rounded-lg border border-gray-700">
                        <svg
                            className="w-5 h-5 text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-100">Wallet Address</h3>
                </div>
                {blacklisted_at && (
                    <span className="text-gray-300 text-xs font-mono px-2 py-1 rounded inline-block w-fit italic">
                        {formatDate(blacklisted_at)}
                    </span>
                )}
            </div>

            <div className="space-y-7">
                <div className="flex flex-col space-y-2">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Address
                    </span>
                    <span className="text-gray-200 font-mono text-sm bg gray-900/70 border border-gray-700 px-3 py-2 rounded-lg break-all">
                        {address}
                    </span>
                </div>

                {flagged_by && (
                    <div className="flex flex-row items-center space-x-3">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Flagged By
                        </span>
                        <span className="text-sm text-gray-300 font-medium">{flagged_by}</span>
                    </div>
                )}

                {/* [mod] Add fallback for remark to diagnose issue */}
                <div className="flex flex-row items-center space-x-3">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Remark
                    </span>
                    <span className="text-sm text-gray-300 leading-relaxed">
                        {remarks || 'No remark provided'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default AddressCard;
