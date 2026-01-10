import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2 } from 'lucide-react';
import api from '../../lib/api';
import DepartmentForm from './DepartmentForm';

export default function DepartmentList() {
  const [showForm, setShowForm] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const queryClient = useQueryClient();

  const { data: departmentsData, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await api.get('/departments');
      const payload = res.data;

      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      return [];
    },
  });

  const departments = Array.isArray(departmentsData) ? departmentsData : [];

  const handleCreateClick = () => {
    setSelectedDepartment(null);
    setShowForm(true);
  };

  const handleEditClick = (department) => {
    setSelectedDepartment(department);
    setShowForm(true);
  };

  const handleDeleteClick = (department) => {
    setDeleteConfirm(department);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await api.delete(`/departments/${deleteConfirm.id}`);
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete department:', err);
    }
  };

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['departments'] });
    setShowForm(false);
  };

  const renderTable = () => {
    if (isLoading) {
      return (
        <div className="p-8 text-center text-gray-500">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2">Loading departments...</p>
        </div>
      );
    }

    if (!departments.length) {
      return (
        <div className="p-8 text-center text-gray-500">
          <p>No departments found</p>
          <p className="text-sm mt-2">Start by adding your first department.</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Total Employees
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {departments.map((department) => (
              <tr
                key={department.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{department.name}</td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {department.description || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {department.employees_count ?? department.employees?.length ?? 0}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEditClick(department)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(department)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-600 mt-1">Organize teams and ownership</p>
        </div>
        <button
          onClick={handleCreateClick}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Department
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {renderTable()}
      </div>

      <DepartmentForm
        isOpen={showForm}
        department={selectedDepartment}
        onClose={() => {
          setShowForm(false);
          setSelectedDepartment(null);
        }}
        onSuccess={handleFormSuccess}
      />

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Department</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
