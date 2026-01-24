import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../store/auth';

const ITEMS_PER_PAGE = 10;

const LeaveRequests = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('pending');
  const [currentPage, setCurrentPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  const [formData, setFormData] = useState({
    employee_id: '',
    type: 'annual',
    start_date: '',
    end_date: '',
    reason: '',
    status: 'pending',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formFieldErrors, setFormFieldErrors] = useState({});

  useEffect(() => {
    document.title = 'Leave Requests | HR Management';
  }, []);

  const { data: employeesData } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const res = await api.get('/employees');
      const payload = res.data;
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      return [];
    },
  });

  const employees = useMemo(() => {
    if (Array.isArray(employeesData)) return employeesData;
    if (Array.isArray(employeesData?.data)) return employeesData.data;
    return [];
  }, [employeesData]);

  const employeeOptions = useMemo(() => {
    return employees.map((emp) => ({
      id: emp.id,
      name: emp.user?.name || `Employee #${emp.id}`,
    }));
  }, [employees]);

  const {
    data: leavesData,
    isLoading: leavesLoading,
  } = useQuery({
    queryKey: ['leaves'],
    queryFn: async () => {
      const res = await api.get('/leaves');
      const payload = res.data;
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      return [];
    },
  });

  const leaves = useMemo(() => {
    if (Array.isArray(leavesData)) return leavesData;
    if (Array.isArray(leavesData?.data)) return leavesData.data;
    return [];
  }, [leavesData]);

  // Derived Data
  const pendingCount = useMemo(() => 
    leaves.filter(l => l.status === 'pending').length, 
  [leaves]);

  const filteredLeaves = useMemo(() => {
    let filtered = [...leaves];
    
    if (activeTab === 'pending') {
      filtered = filtered.filter(l => l.status === 'pending');
    } else if (activeTab === 'approved') {
      filtered = filtered.filter(l => l.status === 'approved');
    } else if (activeTab === 'rejected') {
      filtered = filtered.filter(l => l.status === 'rejected');
    }
    
    return filtered;
  }, [leaves, activeTab]);

  const totalPages = Math.ceil(filteredLeaves.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLeaves = filteredLeaves.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  // Helpers
  const getEmployeeDetails = (employeeId) => {
    return employees.find((e) => e.id === employeeId);
  };

  const getDuration = (start, end) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = Math.abs(e - s);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
    return diffDays;
  };

  const formatDateRange = (start, end) => {
    if (!start || !end) return '-';
    const s = new Date(start);
    const e = new Date(end);
    const options = { month: 'short', day: 'numeric' };
    return `${s.toLocaleDateString('en-US', options)} - ${e.toLocaleDateString('en-US', options)}`;
  };

  const getTypeStyle = (type) => {
    switch(type?.toLowerCase()) {
      case 'annual':
      case 'vacation':
        return { label: 'Vacation', className: 'bg-blue-50 text-blue-700' };
      case 'sick':
      case 'sickness':
        return { label: 'Sickness', className: 'bg-yellow-50 text-yellow-700' };
      case 'personal':
        return { label: 'Personal', className: 'bg-gray-100 text-gray-700' };
      default:
        return { label: type || 'Unknown', className: 'bg-gray-50 text-gray-600' };
    }
  };

  // Form Handlers
  const resetForm = () => {
    setFormData({
      employee_id: '',
      type: 'annual',
      start_date: '',
      end_date: '',
      reason: '',
      status: 'pending',
    });
    setFormError('');
    setFormFieldErrors({});
  };

  const handleOpenCreate = () => {
    setSelectedLeave(null);
    resetForm();
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (formFieldErrors[name]) {
      setFormFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    setFormFieldErrors({});

    try {
      const payload = {
        employee_id: formData.employee_id,
        type: formData.type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason,
        status: formData.status,
      };

      if (selectedLeave?.id) {
        await api.put(`/leaves/${selectedLeave.id}`, payload);
      } else {
        await api.post('/leaves', payload);
      }

      await queryClient.invalidateQueries({ queryKey: ['leaves'] });
      setShowForm(false);
      setSelectedLeave(null);
      resetForm();
      setCurrentPage(1);
    } catch (err) {
      if (err.response?.data?.errors) {
        setFormFieldErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        setFormError(err.response.data.message);
      } else {
        setFormError('Failed to save leave request. Please try again.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusChange = async (leave, newStatus) => {
    try {
      const payload = {
        employee_id: leave.employee_id,
        type: leave.type,
        start_date: leave.start_date,
        end_date: leave.end_date,
        reason: leave.reason,
        status: newStatus,
      };
      await api.put(`/leaves/${leave.id}`, payload);
      await queryClient.invalidateQueries({ queryKey: ['leaves'] });
    } catch (err) {
      console.error(err);
      // Optional: show toast or error
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave Requests</h1>
          <p className="mt-1 text-gray-500">Review and manage employee absence requests across the organization.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm">
            <Download size={20} />
            Export Report
          </button>
          {(user?.role === 'admin' || user?.role === 'hr') && (
            <button 
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={20} />
              New Request
            </button>
          )}
        </div>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-8">
            {['pending', 'approved', 'rejected'].map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                className={`py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'pending' && pendingCount > 0 && (
                  <span className="bg-blue-100 text-blue-600 py-0.5 px-2 rounded-full text-xs">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Leave Type</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leavesLoading ? (
                 <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      Loading leave requests...
                    </td>
                 </tr>
              ) : paginatedLeaves.length === 0 ? (
                 <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No {activeTab} leave requests found.
                    </td>
                 </tr>
              ) : (
                paginatedLeaves.map((leave) => {
                  const emp = getEmployeeDetails(leave.employee_id);
                  const typeStyle = getTypeStyle(leave.type);
                  const duration = getDuration(leave.start_date, leave.end_date);
                  
                  return (
                    <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {emp?.user?.avatar ? (
                            <img src={emp.user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm">
                              {emp?.user?.name?.charAt(0) || 'U'}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{emp?.user?.name || 'Unknown'}</div>
                            <div className="text-sm text-blue-500">{emp?.position || 'Employee'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${typeStyle.className}`}>
                          {typeStyle.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-medium">
                          {formatDateRange(leave.start_date, leave.end_date)}
                        </div>
                        <div className="text-xs text-blue-500 mt-0.5">
                          {duration} days total
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 max-w-xs truncate" title={leave.reason}>{leave.reason}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {leave.status === 'pending' && (user?.role === 'admin' || user?.role === 'hr') ? (
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleStatusChange(leave, 'approved')}
                              className="px-3 py-1.5 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleStatusChange(leave, 'rejected')}
                              className="px-3 py-1.5 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className={`text-sm font-medium ${
                            leave.status === 'approved' ? 'text-green-600' : 
                            leave.status === 'rejected' ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredLeaves.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{startIdx + 1}</span> to <span className="font-medium">{Math.min(startIdx + ITEMS_PER_PAGE, filteredLeaves.length)}</span> of <span className="font-medium">{filteredLeaves.length}</span> requests
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} className="text-gray-600" />
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} className="text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 m-0 bg-black bg-opacity-50 flex items-center justify-center z-[300] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedLeave ? 'Edit Leave Request' : 'New Leave Request'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setSelectedLeave(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              {formError && (
                <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee *
                </label>
                <select
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select employee</option>
                  {employeeOptions.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
                {formFieldErrors.employee_id && (
                  <p className="mt-1 text-sm text-red-600">
                    {formFieldErrors.employee_id[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Leave Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="annual">Annual / Vacation</option>
                  <option value="sick">Sick</option>
                  <option value="personal">Personal</option>
                </select>
                {formFieldErrors.type && (
                  <p className="mt-1 text-sm text-red-600">{formFieldErrors.type[0]}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {formFieldErrors.start_date && (
                    <p className="mt-1 text-sm text-red-600">
                      {formFieldErrors.start_date[0]}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {formFieldErrors.end_date && (
                    <p className="mt-1 text-sm text-red-600">
                      {formFieldErrors.end_date[0]}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                {formFieldErrors.status && (
                  <p className="mt-1 text-sm text-red-600">{formFieldErrors.status[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason *
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Explain the reason for this leave request"
                  required
                />
                {formFieldErrors.reason && (
                  <p className="mt-1 text-sm text-red-600">{formFieldErrors.reason[0]}</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedLeave(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                >
                  {formLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequests;
