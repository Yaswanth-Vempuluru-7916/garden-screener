import { useState, type FormEvent } from 'react';
import type { FormData } from '../types';
import '../styles/AddressForm.css';

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
    <div className="modal-overlay">
      <div className="address-form-container">
        <h2>{formData.type === 'create' ? 'Add New Address' : 'Edit Address'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.data.address}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="network">Network</label>
            <input
              type="text"
              id="network"
              name="network"
              value={formData.data.network}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="remark">Remark</label>
            <input
              type="text"
              id="remark"
              name="remark"
              value={formData.data.remark}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="tag">Tag</label>
            <input
              type="text"
              id="tag"
              name="tag"
              value={formData.data.tag}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {formData.type === 'create' ? 'Create' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddressForm;