import { useState, type FormEvent } from 'react';
import type { FormData } from '../types';

interface AddressFormProps {
  formData: FormData;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

function AddressForm({ formData: initialFormData, onSubmit, onCancel }: AddressFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      data: { ...prev.data, [name]: value },
      id: `${prev.data.address}-${prev.data.network}`,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.data.address || !formData.data.network) {
      alert('Address and Network are required');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-[#000000]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
      <div className="relative bg-[#1A1A1A] rounded-3xl shadow-2xl border border-[#333333] p-8 w-full max-w-2xl backdrop-blur-xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#FFFFFF]"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-[#000000] rounded-2xl border border-[#333333]">
                <svg
                  className="w-8 h-8 text-[#FFFFFF]"
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
              <h2 className="text-3xl font-bold text-[#FFFFFF] tracking-tight">
                {formData.type === "create"
                  ? "Add New Address"
                  : "Edit Address"}
              </h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-3">
                <label
                  htmlFor="address"
                  className="block text-lg font-bold text-[#FFFFFF]"
                >
                  Address *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.data.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-5 py-4 bg-[#000000] border border-[#333333] rounded-2xl text-[#FFFFFF] text-lg font-medium placeholder-[#FFFFFF]/50 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]/50 focus:ring-offset-2 focus:ring-offset-[#000000] focus:border-[#FFFFFF]/50 transition-all duration-500 hover:border-[#FFFFFF]/70 backdrop-blur-sm"
                  placeholder="Enter wallet address..."
                />
              </div>

              <div className="space-y-3">
                <label
                  htmlFor="network"
                  className="block text-lg font-bold text-[#FFFFFF]"
                >
                  Network *
                </label>
                <input
                  type="text"
                  id="network"
                  name="network"
                  value={formData.data.network}
                  onChange={handleInputChange}
                  required
                  className="w-full px-5 py-4 bg-[#000000] border border-[#333333] rounded-2xl text-[#FFFFFF] text-lg font-medium placeholder-[#FFFFFF]/50 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]/50 focus:ring-offset-2 focus:ring-offset-[#000000] focus:border-[#FFFFFF]/50 transition-all duration-500 hover:border-[#FFFFFF]/70 backdrop-blur-sm"
                  placeholder="Enter network name..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label
                    htmlFor="remark"
                    className="block text-lg font-bold text-[#FFFFFF]"
                  >
                    Remark
                  </label>
                  <input
                    type="text"
                    id="remark"
                    name="remark"
                    value={formData.data.remark}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 bg-[#000000] border border-[#333333] rounded-2xl text-[#FFFFFF] text-lg font-medium placeholder-[#FFFFFF]/50 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]/50 focus:ring-offset-2 focus:ring-offset-[#000000] focus:border-[#FFFFFF]/50 transition-all duration-500 hover:border-[#FFFFFF]/70 backdrop-blur-sm"
                    placeholder="Optional remark..."
                  />
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="tag"
                    className="block text-lg font-bold text-[#FFFFFF]"
                  >
                    Tag
                  </label>
                  <input
                    type="text"
                    id="tag"
                    name="tag"
                    value={formData.data.tag}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 bg-[#000000] border border-[#333333] rounded-2xl text-[#FFFFFF] text-lg font-medium placeholder-[#FFFFFF]/50 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]/50 focus:ring-offset-2 focus:ring-offset-[#000000] focus:border-[#FFFFFF]/50 transition-all duration-500 hover:border-[#FFFFFF]/70 backdrop-blur-sm"
                    placeholder="Optional tag..."
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4 pt-6 border-t border-[#333333]">
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto px-8 py-4 bg-[#1A1A1A] text-[#FFFFFF] rounded-2xl font-bold hover:scale-105 hover:shadow-xl hover:shadow-[#333333]/30 focus:outline-none focus:ring-2 focus:ring-[#FF6F61]/50 focus:ring-offset-2 focus:ring-offset-[#000000] transition-all duration-500 cursor-pointer border border-[#FF6F61]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-4 bg-[#1A1A1A] text-[#FFFFFF] rounded-2xl font-bold hover:scale-105 hover:shadow-xl hover:shadow-[#333333]/30 focus:outline-none focus:ring-2 focus:ring-[#00FF7F]/50 focus:ring-offset-2 focus:ring-offset-[#000000] transition-all duration-500 cursor-pointer border border-[#00FF7F]"
              >
                {formData.type === "create"
                  ? "Create Address"
                  : "Update Address"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddressForm;