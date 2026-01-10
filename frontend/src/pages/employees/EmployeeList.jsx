import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Eye, Edit, Trash2, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../lib/api';
import EmployeeForm from './EmployeeForm';

const ITEMS_PER_PAGE = 10;

export default function EmployeeList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const queryClient = useQueryClient();

  // Fetch employees
  const { data: employeesData, isLoading: employeesLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const res = await api.get('/employees');
      return res.data?.data || [];
    },
  });

  // Fetch departments
  const { data: departmentsData } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await api.get('/departments');
      return res.data?.data || [];
    },
  });

  // Filter and search logic
  const filteredEmployees = useMemo(() => {
    let filtered = Array.isArray(employeesData) ? employeesData : [];

    // Search by name or code
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((emp) =>
        emp.user?.name?.toLowerCase().includes(query) ||
        emp.code?.toLowerCase().includes(query)
      );
    }

    // Filter by department
    if (departmentFilter) {
      filtered = filtered.filter((emp) => emp.department_id === parseInt(departmentFilter));
    }

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter((emp) => emp.status === statusFilter);
    }

    return filtered;
  }, [employeesData, searchQuery, departmentFilter, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEmployees = filteredEmployees.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  // Reset to first page when filters change
  const handleFilterChange = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleCreateClick = () => {
    setSelectedEmployee(null);
    setShowForm(true);
  };

  const handleEditClick = (employee) => {
    setSelectedEmployee(employee);
    setShowForm(true);
  };

  const handleViewClick = (employee) => {
    // You can navigate to a detail view or open a read-only modal
    console.log('View employee:', employee);
  };

  const handleDeleteClick = (employee) => {
    setDeleteConfirm(employee);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await api.delete(`/employees/${deleteConfirm.id}`);
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete employee:', error);
    }
  };

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['employees'] });
    setShowForm(false);
    setCurrentPage(1);
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'on_leave':
        return 'bg-yellow-100 text-yellow-800';
      case 'terminated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600 mt-1">Manage your organization's workforce</p>
        </div>
        <button
          onClick={handleCreateClick}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Create Employee
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or code..."
              value={searchQuery}
              onChange={(e) => handleFilterChange(setSearchQuery)(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Department Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-3 text-gray-400" size={18} />
            <select
              value={departmentFilter}
              onChange={(e) => handleFilterChange(setDepartmentFilter)(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="">All Departments</option>
              {Array.isArray(departmentsData) &&
                departmentsData.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-3 text-gray-400" size={18} />
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange(setStatusFilter)(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {employeesLoading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2">Loading employees...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No employees found</p>
            {(searchQuery || departmentFilter || statusFilter) && (
              <p className="text-sm mt-2">Try adjusting your filters</p>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Join Date
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEmployees.map((employee) => (
                    <tr
                      key={employee.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {employee.code}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {employee.user?.name || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {employee.department?.name || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {employee.position || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
                            employee.status
                          )}`}
                        >
                          {employee.status === 'on_leave' ? 'On Leave' : employee.status?.charAt(0).toUpperCase() + employee.status?.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {formatDate(employee.join_date)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewClick(employee)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEditClick(employee)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(employee)}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {startIdx + 1} to {Math.min(startIdx + ITEMS_PER_PAGE, filteredEmployees.length)} of{' '}
                  {filteredEmployees.length} employees
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Form Modal */}
      <EmployeeForm
        isOpen={showForm}
        employee={selectedEmployee}
        departments={departmentsData}
        onClose={() => {
          setShowForm(false);
          setSelectedEmployee(null);
        }}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Employee</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{deleteConfirm.user?.name}</strong>? This action cannot be undone.
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
