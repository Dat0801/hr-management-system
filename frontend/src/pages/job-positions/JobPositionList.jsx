import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, Plus, ChevronLeft, ChevronRight, Lock, Play, Pause, XCircle, Eye } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../store/auth';

const ITEMS_PER_PAGE = 10;

const JobPositionList = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const [showForm, setShowForm] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);

  const [formData, setFormData] = useState({
    department_id: '',
    title: '',
    description: '',
    requirements: '',
    headcount: 1,
    employment_type: 'full_time',
    status: 'open',
    salary_from: '',
    salary_to: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formFieldErrors, setFormFieldErrors] = useState({});

  useEffect(() => {
    document.title = 'Job Positions | HR Management';
  }, []);

  const { data: departmentsData } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await api.get('/departments');
      const payload = res.data;
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      return [];
    },
  });

  const departments = useMemo(() => {
    if (Array.isArray(departmentsData)) return departmentsData;
    if (Array.isArray(departmentsData?.data)) return departmentsData.data;
    return [];
  }, [departmentsData]);

  const {
    data: positionsData,
    isLoading: positionsLoading,
  } = useQuery({
    queryKey: ['job-positions', activeTab, selectedDepartment],
    queryFn: async () => {
      let res;
      if (selectedDepartment !== 'all') {
        res = await api.get(`/job-positions/by-department/${selectedDepartment}`);
      } else if (activeTab === 'open') {
        res = await api.get('/job-positions');
      } else {
        res = await api.get('/job-positions');
      }
      const payload = res.data;
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      return [];
    },
  });

  const positions = useMemo(() => {
    if (Array.isArray(positionsData)) return positionsData;
    if (Array.isArray(positionsData?.data)) return positionsData.data;
    return [];
  }, [positionsData]);

  const filteredPositions = useMemo(() => {
    let filtered = [...positions];
    
    if (activeTab === 'open') {
      filtered = filtered.filter(p => p.status === 'open');
    } else if (activeTab === 'closed') {
      filtered = filtered.filter(p => p.status === 'closed');
    } else if (activeTab === 'on_hold') {
      filtered = filtered.filter(p => p.status === 'on_hold');
    }
    
    return filtered;
  }, [positions, activeTab]);

  const totalPages = Math.ceil(filteredPositions.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPositions = filteredPositions.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  // Helpers
  const getStatusStyle = (status) => {
    switch(status?.toLowerCase()) {
      case 'open':
        return { label: 'Open', className: 'bg-green-100 text-green-700' };
      case 'closed':
        return { label: 'Closed', className: 'bg-gray-100 text-gray-700' };
      case 'on_hold':
        return { label: 'On Hold', className: 'bg-yellow-100 text-yellow-700' };
      default:
        return { label: status || 'Unknown', className: 'bg-gray-50 text-gray-600' };
    }
  };

  const getEmploymentTypeLabel = (type) => {
    const labels = {
      full_time: 'Full Time',
      part_time: 'Part Time',
      contract: 'Contract',
      intern: 'Intern',
    };
    return labels[type] || type;
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Form Handlers
  const resetForm = () => {
    setFormData({
      department_id: '',
      title: '',
      description: '',
      requirements: '',
      headcount: 1,
      employment_type: 'full_time',
      status: 'open',
      salary_from: '',
      salary_to: '',
    });
    setFormError('');
    setFormFieldErrors({});
  };

  const handleOpenCreate = () => {
    setSelectedPosition(null);
    resetForm();
    setShowForm(true);
  };

  const handleOpenEdit = (position) => {
    setSelectedPosition(position);
    setFormData({
      department_id: position.department_id,
      title: position.title,
      description: position.description || '',
      requirements: position.requirements || '',
      headcount: position.headcount,
      employment_type: position.employment_type,
      status: position.status,
      salary_from: position.salary_from || '',
      salary_to: position.salary_to || '',
    });
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name === 'department_id' || name === 'headcount' 
        ? (value ? parseInt(value) : value) 
        : (name === 'salary_from' || name === 'salary_to' ? (value ? parseFloat(value) : value) : value)
    }));

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
        department_id: parseInt(formData.department_id),
        title: formData.title,
        description: formData.description || null,
        requirements: formData.requirements || null,
        headcount: parseInt(formData.headcount),
        employment_type: formData.employment_type,
        status: formData.status,
        salary_from: formData.salary_from ? parseFloat(formData.salary_from) : null,
        salary_to: formData.salary_to ? parseFloat(formData.salary_to) : null,
      };

      if (selectedPosition?.id) {
        await api.put(`/job-positions/${selectedPosition.id}`, payload);
      } else {
        await api.post('/job-positions', payload);
      }

      await queryClient.invalidateQueries({ queryKey: ['job-positions'] });
      setShowForm(false);
      setSelectedPosition(null);
      resetForm();
      setCurrentPage(1);
    } catch (err) {
      if (err.response?.data?.errors) {
        setFormFieldErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        setFormError(err.response.data.message);
      } else {
        setFormError('Failed to save job position. Please try again.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleClose = async (positionId) => {
    if (!confirm('Close this job position?')) return;
    try {
      await api.post(`/job-positions/${positionId}/close`);
      await queryClient.invalidateQueries({ queryKey: ['job-positions'] });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to close position');
    }
  };

  const handleHold = async (positionId) => {
    if (!confirm('Put this job position on hold?')) return;
    try {
      await api.post(`/job-positions/${positionId}/hold`);
      await queryClient.invalidateQueries({ queryKey: ['job-positions'] });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to hold position');
    }
  };

  const handleReopen = async (positionId) => {
    if (!confirm('Reopen this job position?')) return;
    try {
      await api.post(`/job-positions/${positionId}/reopen`);
      await queryClient.invalidateQueries({ queryKey: ['job-positions'] });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reopen position');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Positions</h1>
          <p className="mt-1 text-gray-500">Manage job openings and recruitment positions.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm">
            <Download size={20} />
            Export
          </button>
          {(user?.role === 'admin' || user?.role === 'hr') && (
            <button 
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={20} />
              New Position
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex gap-4 items-center">
          <label className="text-sm font-medium text-gray-700">Department:</label>
          <select
            value={selectedDepartment}
            onChange={(e) => { setSelectedDepartment(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-8">
            {['all', 'open', 'closed', 'on_hold'].map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'on_hold' ? 'On Hold' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Position</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Salary Range</th>
                <th className="px-6 py-4">Applications</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {positionsLoading ? (
                 <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      Loading job positions...
                    </td>
                 </tr>
              ) : paginatedPositions.length === 0 ? (
                 <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No {activeTab === 'all' ? '' : activeTab.replace('_', ' ')} job positions found.
                    </td>
                 </tr>
              ) : (
                paginatedPositions.map((position) => {
                  const statusStyle = getStatusStyle(position.status);
                  
                  return (
                    <tr key={position.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{position.title}</div>
                        <div className="text-sm text-gray-500 mt-1 line-clamp-2">{position.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {position.department?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {getEmploymentTypeLabel(position.employment_type)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Headcount: {position.headcount}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {position.salary_from && position.salary_to 
                            ? `${formatCurrency(position.salary_from)} - ${formatCurrency(position.salary_to)}`
                            : position.salary_from 
                              ? `From ${formatCurrency(position.salary_from)}`
                              : 'Not specified'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {position.applications_count || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${statusStyle.className}`}>
                          {statusStyle.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {(user?.role === 'admin' || user?.role === 'hr') && (
                            <>
                              {position.status === 'open' && (
                                <>
                                  <button 
                                    onClick={() => handleOpenEdit(position)}
                                    className="px-3 py-1.5 bg-gray-50 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => handleHold(position.id)}
                                    className="px-3 py-1.5 bg-yellow-50 text-yellow-600 text-sm font-medium rounded-lg hover:bg-yellow-100 transition-colors flex items-center gap-1"
                                    title="Put on Hold"
                                  >
                                    <Pause size={14} />
                                    Hold
                                  </button>
                                  <button 
                                    onClick={() => handleClose(position.id)}
                                    className="px-3 py-1.5 bg-gray-50 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1"
                                  >
                                    <Lock size={14} />
                                    Close
                                  </button>
                                </>
                              )}
                              {position.status === 'closed' && (
                                <button 
                                  onClick={() => handleReopen(position.id)}
                                  className="px-3 py-1.5 bg-green-50 text-green-600 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1"
                                >
                                  <Play size={14} />
                                  Reopen
                                </button>
                              )}
                              {position.status === 'on_hold' && (
                                <>
                                  <button 
                                    onClick={() => handleReopen(position.id)}
                                    className="px-3 py-1.5 bg-green-50 text-green-600 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1"
                                  >
                                    <Play size={14} />
                                    Reopen
                                  </button>
                                  <button 
                                    onClick={() => handleClose(position.id)}
                                    className="px-3 py-1.5 bg-gray-50 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1"
                                  >
                                    <Lock size={14} />
                                    Close
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredPositions.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{startIdx + 1}</span> to <span className="font-medium">{Math.min(startIdx + ITEMS_PER_PAGE, filteredPositions.length)}</span> of <span className="font-medium">{filteredPositions.length}</span> positions
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
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedPosition ? 'Edit Job Position' : 'New Job Position'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setSelectedPosition(null);
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department *
                  </label>
                  <select
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                  {formFieldErrors.department_id && (
                    <p className="mt-1 text-sm text-red-600">
                      {formFieldErrors.department_id[0]}
                    </p>
                  )}
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
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {formFieldErrors.title && (
                  <p className="mt-1 text-sm text-red-600">
                    {formFieldErrors.title[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Job description and responsibilities"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requirements
                </label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Required qualifications and skills"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employment Type *
                  </label>
                  <select
                    name="employment_type"
                    value={formData.employment_type}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="intern">Intern</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Headcount *
                  </label>
                  <input
                    type="number"
                    name="headcount"
                    value={formData.headcount}
                    onChange={handleFormChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {formFieldErrors.headcount && (
                    <p className="mt-1 text-sm text-red-600">
                      {formFieldErrors.headcount[0]}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salary From
                  </label>
                  <input
                    type="number"
                    name="salary_from"
                    value={formData.salary_from}
                    onChange={handleFormChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Minimum salary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salary To
                  </label>
                  <input
                    type="number"
                    name="salary_to"
                    value={formData.salary_to}
                    onChange={handleFormChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Maximum salary"
                  />
                  {formFieldErrors.salary_to && (
                    <p className="mt-1 text-sm text-red-600">
                      {formFieldErrors.salary_to[0]}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedPosition(null);
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

export default JobPositionList;
