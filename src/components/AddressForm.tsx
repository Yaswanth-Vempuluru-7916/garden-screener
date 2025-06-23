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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full border border-gray-200">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {formData.type === 'create' ? 'Add New Address' : 'Edit Address'}
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.data.address}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="network" className="block text-sm font-medium text-gray-700 mb-1">
                Network *
              </label>
              <input
                type="text"
                id="network"
                name="network"
                value={formData.data.network}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="remark" className="block text-sm font-medium text-gray-700 mb-1">
                Remark
              </label>
              <input
                type="text"
                id="remark"
                name="remark"
                value={formData.data.remark}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="tag" className="block text-sm font-medium text-gray-700 mb-1">
                Tag
              </label>
              <input
                type="text"
                id="tag"
                name="tag"
                value={formData.data.tag}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button 
                type="button" 
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition-colors" 
                onClick={onCancel}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                {formData.type === 'create' ? 'Create' : 'Update'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddressForm;