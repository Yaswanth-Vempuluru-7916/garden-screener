import { useState, type FormEvent } from "react";
import type { FormData } from "../types";
interface AddressFormProps {
  formData: FormData;
  onSubmit: (data: FormData, secret?: string) => void;
  onCancel: () => void;
  className?:string
}

function AddressForm({
  formData: initialFormData,
  onSubmit,
  onCancel,
  className,
}: AddressFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = {
        ...prev.data,
        [name]: value,
      };
      return {
        ...prev,
        data: newData,
        id: `${Date.now()}`,
      };
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.data.address) {
      alert("Address is required");
      return;
    }
    console.log('Submitting FormData:', formData);
    onSubmit(formData);
  };

  return (
   <div className={`fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 sm:p-6 ${className || ''}`}>
      <div className="relative bg-black/70 border border-gray-800 rounded-2xl p-6 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-2  rounded-lg gray-900/70 border border-gray-700">
              <svg
                className="w-6 h-6 text-white"
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
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {formData.type === "create" ? "Add New Address" : "Edit Address"}
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label
                htmlFor="address"
                className="block text-lg font-medium text-white"
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
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-md text-white text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-black"
                placeholder="Enter wallet address..."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label
                  htmlFor="remarks"
                  className="block text-lg font-medium text-white"
                >
                  Remark
                </label>
                <input
                  type="text"
                  id="remark"
                  name="remark"
                  value={formData.data.remark}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-md text-white text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-black"
                  placeholder="Optional remark..."
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="tag"
                  className="block text-lg font-medium text-white"
                >
                  Tag
                </label>
                <input
                  type="text"
                  id="tag"
                  name="tag"
                  value={formData.data.tag}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-md text-white text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-black"
                  placeholder="Optional tag..."
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-800">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded-md font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cursor-pointer w-full sm:w-auto px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black transition-colors bg-[hsl(219,_93%,_35%)] border-transparent text-white [box-shadow:hsl(219,_93%,_35%)_0_-2px_0_0_inset,_hsl(219,_93%,_95%)_0_1px_3px_0] dark:[box-shadow:hsl(219,_93%,_35%)_0_-2px_0_0_inset,_hsl(0,_0%,_0%,_0.4)_0_1px_3px_0] hover:bg-[hsl(219,_93%,_30%)] active:[box-shadow:none] hover:[box-shadow:none] dark:hover:[box-shadow:none] focus:ring-blue-500"
            >
              Create Address
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default AddressForm;