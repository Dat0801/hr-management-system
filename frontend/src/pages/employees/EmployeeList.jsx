import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Eye, Edit, Trash2, Search, Filter, ChevronLeft, ChevronRight, MoreHorizontal, Briefcase, Calendar, Umbrella } from 'lucide-react';
import api from '../../lib/api';
import EmployeeForm from './EmployeeForm';
import { useAuth } from '../../store/auth';

const ITEMS_PER_PAGE = 10;

export default function EmployeeList() {
  const { user } = useAuth();
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

    // Search by name
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((emp) =>
        emp.user?.name?.toLowerCase().includes(query)
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

    if (user?.role !== 'admin') {
      setDeleteConfirm(null);
      return;
    }

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
        return 'bg-green-100 text-green-700';
      case 'inactive':
        return 'bg-gray-100 text-gray-700';
      case 'on_leave':
        return 'bg-orange-100 text-orange-700';
      case 'terminated':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
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
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Directory</h1>
          <p className="text-gray-500 mt-1">Manage your team members and their account status.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium text-sm">
            Total: {employeesData?.length || 0} Employees
          </div>
          {(user?.role === 'admin' || user?.role === 'hr') && (
            <button
              onClick={handleCreateClick}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              Add New Employee
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <Briefcase size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Hiring Goal</p>
            <p className="text-2xl font-bold text-gray-900">12 / 20</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-lg text-green-600">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">In Office Today</p>
            <p className="text-2xl font-bold text-gray-900">94%</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-orange-50 rounded-lg text-orange-600">
            <Umbrella size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Upcoming Leave</p>
            <p className="text-2xl font-bold text-gray-900">8 Requests</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg p-2 shadow-sm border border-gray-200 flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, ID, or role..."
            value={searchQuery}
            onChange={(e) => handleFilterChange(setSearchQuery)(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-lg focus:outline-none focus:ring-0 text-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase">Department</span>
            <select
              value={departmentFilter}
              onChange={(e) => handleFilterChange(setDepartmentFilter)(e.target.value)}
              className="pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange(setStatusFilter)(e.target.value)}
              className="pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
          
           <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
             <Filter size={18} />
           </button>
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
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Employee Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Employee ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedEmployees.map((employee) => (
                    <tr
                      key={employee.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                            {employee.user?.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{employee.user?.name || '-'}</div>
                            <div className="text-sm text-gray-500">{employee.user?.email || 'email@company.com'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                        EMP-{employee.id.toString().padStart(4, '0')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {employee.department?.name || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {employee.position || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                            employee.status
                          )}`}
                        >
                          {employee.status === 'on_leave' ? 'On Leave' : employee.status?.charAt(0).toUpperCase() + employee.status?.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end relative group">
                          <button className="text-gray-400 hover:text-gray-600">
                            <MoreHorizontal size={20} />
                          </button>
                          
                          <div className="hidden group-hover:flex absolute right-8 top-0 bg-white shadow-lg rounded-lg border border-gray-100 p-1 z-10 flex-col min-w-[120px]">
                             <button
                                onClick={() => handleViewClick(employee)}
                                className="text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-2"
                              >
                                <Eye size={14} /> View
                              </button>
                              {(user?.role === 'admin' || user?.role === 'hr') && (
                                <button
                                  onClick={() => handleEditClick(employee)}
                                  className="text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-2"
                                >
                                  <Edit size={14} /> Edit
                                </button>
                              )}
                              {user?.role === 'admin' && (
                                <button
                                  onClick={() => handleDeleteClick(employee)}
                                  className="text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center gap-2"
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium text-gray-900">{startIdx + 1}</span> to <span className="font-medium text-gray-900">{Math.min(startIdx + ITEMS_PER_PAGE, filteredEmployees.length)}</span> of{' '}
                  <span className="font-medium text-gray-900">{filteredEmployees.length}</span> results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-gray-600"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-gray-600"
                  >
                    <ChevronRight size={16} />
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
        <div className="fixed inset-0 m-0 bg-black bg-opacity-50 flex items-center justify-center z-[300] p-4">
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
