import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../../lib/api';

export default function EmployeeForm({ isOpen, employee, departments, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    code: '',
    user: { name: '', email: '' },
    department_id: '',
    position: '',
    status: 'active',
    join_date: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (employee) {
      setFormData({
        code: employee.code || '',
        user: {
          name: employee.user?.name || '',
          email: employee.user?.email || '',
        },
        department_id: employee.department_id || '',
        position: employee.position || '',
        status: employee.status || 'active',
        join_date: employee.join_date ? employee.join_date.split('T')[0] : '',
      });
      setError('');
      setFieldErrors({});
    } else {
      setFormData({
        code: '',
        user: { name: '', email: '' },
        department_id: '',
        position: '',
        status: 'active',
        join_date: '',
      });
      setError('');
      setFieldErrors({});
    }
  }, [employee, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('user.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        user: { ...prev.user, [field]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});

    try {
      const submitData = {
        code: formData.code,
        name: formData.user.name,
        email: formData.user.email,
        department_id: formData.department_id,
        position: formData.position,
        status: formData.status,
        join_date: formData.join_date,
      };

      if (employee?.id) {
        await api.put(`/employees/${employee.id}`, submitData);
      } else {
        await api.post('/employees', submitData);
      }

      onSuccess();
      onClose();
    } catch (err) {
      if (err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to save employee. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">
            {employee ? 'Edit Employee' : 'Create Employee'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Employee Code */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee Code *
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              disabled={!!employee}
              placeholder="e.g., EMP001"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            {fieldErrors.code && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.code[0]}</p>
            )}
          </div>

          {/* Full Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="user.name"
              value={formData.user.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {fieldErrors['user.name'] && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors['user.name'][0]}</p>
            )}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="user.email"
              value={formData.user.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {fieldErrors['user.email'] && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors['user.email'][0]}</p>
            )}
          </div>

          {/* Department */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department *
            </label>
            <select
              name="department_id"
              value={formData.department_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a department</option>
              {departments?.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {fieldErrors.department_id && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.department_id[0]}</p>
            )}
          </div>

          {/* Position */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position *
            </label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="Software Engineer"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {fieldErrors.position && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.position[0]}</p>
            )}
          </div>

          {/* Join Date */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Join Date *
            </label>
            <input
              type="date"
              name="join_date"
              value={formData.join_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {fieldErrors.join_date && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.join_date[0]}</p>
            )}
          </div>

          {/* Status */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
              <option value="terminated">Terminated</option>
            </select>
            {fieldErrors.status && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.status[0]}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
