import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, Plus, ChevronLeft, ChevronRight, CheckCircle, XCircle, Target, AlertCircle, MoreHorizontal, Edit } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../store/auth';

const ITEMS_PER_PAGE = 10;

const GoalList = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  const [formData, setFormData] = useState({
    employee_id: '',
    title: '',
    description: '',
    category: 'professional',
    success_criteria: '',
    start_date: '',
    due_date: '',
    weight: '',
    alignment_with_company: '',
  });
  const [progressData, setProgressData] = useState({
    progress_percentage: 0,
    notes: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formFieldErrors, setFormFieldErrors] = useState({});

  useEffect(() => {
    document.title = 'Goals Management | HR Management';
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
    data: goalsData,
    isLoading: goalsLoading,
  } = useQuery({
    queryKey: ['goals', activeTab],
    queryFn: async () => {
      let res;
      if (activeTab === 'all') {
        res = await api.get('/goals');
      } else if (activeTab === 'overdue') {
        res = await api.get('/goals/overdue');
      } else {
        res = await api.get(`/goals/status/${activeTab}`);
      }
      const payload = res.data;
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      return [];
    },
  });

  const goals = useMemo(() => {
    if (Array.isArray(goalsData)) return goalsData;
    if (Array.isArray(goalsData?.data)) return goalsData.data;
    return [];
  }, [goalsData]);

  // Derived Data
  const inProgressCount = useMemo(() => 
    goals.filter(g => g.status === 'in_progress').length, 
  [goals]);
  
  const overdueCount = useMemo(() => {
    const today = new Date();
    return goals.filter(g => {
      if (g.status === 'completed' || g.status === 'cancelled') return false;
      return new Date(g.due_date) < today;
    }).length;
  }, [goals]);

  const filteredGoals = useMemo(() => {
    if (activeTab === 'all') return goals;
    if (activeTab === 'overdue') {
      const today = new Date();
      return goals.filter(g => {
        if (g.status === 'completed' || g.status === 'cancelled') return false;
        return new Date(g.due_date) < today;
      });
    }
    return goals.filter(g => g.status === activeTab);
  }, [goals, activeTab]);

  const totalPages = Math.ceil(filteredGoals.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedGoals = filteredGoals.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  // Helpers
  const getStatusStyle = (status) => {
    switch(status?.toLowerCase()) {
      case 'not_started':
        return { label: 'Not Started', className: 'bg-gray-100 text-gray-700' };
      case 'in_progress':
        return { label: 'In Progress', className: 'bg-blue-100 text-blue-700' };
      case 'completed':
        return { label: 'Completed', className: 'bg-green-100 text-green-700' };
      case 'cancelled':
        return { label: 'Cancelled', className: 'bg-red-100 text-red-700' };
      default:
        return { label: status || 'Unknown', className: 'bg-gray-50 text-gray-600' };
    }
  };

  const getCategoryStyle = (category) => {
    switch(category?.toLowerCase()) {
      case 'business':
        return { label: 'Business', className: 'bg-purple-100 text-purple-700' };
      case 'professional':
        return { label: 'Professional', className: 'bg-blue-100 text-blue-700' };
      case 'personal':
        return { label: 'Personal', className: 'bg-green-100 text-green-700' };
      case 'technical':
        return { label: 'Technical', className: 'bg-orange-100 text-orange-700' };
      default:
        return { label: category || 'Unknown', className: 'bg-gray-50 text-gray-600' };
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Form Handlers
  const resetForm = () => {
    setFormData({
      employee_id: '',
      title: '',
      description: '',
      category: 'professional',
      success_criteria: '',
      start_date: '',
      due_date: '',
      weight: '',
      alignment_with_company: '',
    });
    setFormError('');
    setFormFieldErrors({});
  };

  const handleOpenCreate = () => {
    setSelectedGoal(null);
    resetForm();
    setShowForm(true);
  };

  const handleOpenEdit = (goal) => {
    setSelectedGoal(goal);
    setFormData({
      employee_id: goal.employee_id,
      title: goal.title,
      description: goal.description || '',
      category: goal.category,
      success_criteria: goal.success_criteria || '',
      start_date: goal.start_date.split(' ')[0],
      due_date: goal.due_date.split(' ')[0],
      weight: goal.weight || '',
      alignment_with_company: goal.alignment_with_company || '',
    });
    setShowForm(true);
  };

  const handleOpenProgress = (goal) => {
    setSelectedGoal(goal);
    setProgressData({
      progress_percentage: goal.progress_percentage || 0,
      notes: goal.progress_notes || '',
    });
    setShowProgressModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name === 'employee_id' || name === 'weight' ? (value ? parseFloat(value) : value) : value
    }));

    if (formFieldErrors[name]) {
      setFormFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleProgressChange = (e) => {
    const { name, value } = e.target;
    setProgressData((prev) => ({ 
      ...prev, 
      [name]: name === 'progress_percentage' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    setFormFieldErrors({});

    try {
      const payload = {
        employee_id: parseInt(formData.employee_id),
        created_by: user?.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        success_criteria: formData.success_criteria || null,
        start_date: formData.start_date,
        due_date: formData.due_date,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        alignment_with_company: formData.alignment_with_company || null,
      };

      if (selectedGoal?.id) {
        await api.put(`/goals/${selectedGoal.id}`, payload);
      } else {
        await api.post('/goals', payload);
      }

      await queryClient.invalidateQueries({ queryKey: ['goals'] });
      setShowForm(false);
      setSelectedGoal(null);
      resetForm();
      setCurrentPage(1);
    } catch (err) {
      if (err.response?.data?.errors) {
        setFormFieldErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        setFormError(err.response.data.message);
      } else {
        setFormError('Failed to save goal. Please try again.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/goals/${selectedGoal.id}/update-progress`, progressData);
      await queryClient.invalidateQueries({ queryKey: ['goals'] });
      setShowProgressModal(false);
      setSelectedGoal(null);
      setProgressData({ progress_percentage: 0, notes: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update progress');
    }
  };

  const handleComplete = async (goalId) => {
    if (!confirm('Mark this goal as completed?')) return;
    try {
      await api.post(`/goals/${goalId}/complete`);
      await queryClient.invalidateQueries({ queryKey: ['goals'] });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete goal');
    }
  };

  const handleCancel = async (goalId) => {
    const reason = prompt('Reason for cancellation (optional):');
    try {
      await api.post(`/goals/${goalId}/cancel`, { reason: reason || null });
      await queryClient.invalidateQueries({ queryKey: ['goals'] });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel goal');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Goals Management</h1>
          <p className="mt-1 text-gray-500">Track and manage employee goals and objectives.</p>
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
              New Goal
            </button>
          )}
        </div>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-8">
            {['all', 'not_started', 'in_progress', 'completed', 'overdue'].map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                className={`py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'not_started' ? 'Not Started' : tab.charAt(0).toUpperCase() + tab.slice(1).replace('_', ' ')}
                {tab === 'in_progress' && inProgressCount > 0 && (
                  <span className="bg-blue-100 text-blue-600 py-0.5 px-2 rounded-full text-xs">
                    {inProgressCount}
                  </span>
                )}
                {tab === 'overdue' && overdueCount > 0 && (
                  <span className="bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs">
                    {overdueCount}
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
                <th className="px-6 py-4">Goal</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Progress</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {goalsLoading ? (
                 <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      Loading goals...
                    </td>
                 </tr>
              ) : paginatedGoals.length === 0 ? (
                 <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No {activeTab === 'all' ? '' : activeTab.replace('_', ' ')} goals found.
                    </td>
                 </tr>
              ) : (
                paginatedGoals.map((goal) => {
                  const statusStyle = getStatusStyle(goal.status);
                  const categoryStyle = getCategoryStyle(goal.category);
                  const overdue = isOverdue(goal.due_date);
                  
                  return (
                    <tr key={goal.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm">
                            {goal.employee?.user?.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{goal.employee?.user?.name || 'Unknown'}</div>
                            <div className="text-sm text-gray-500">{goal.employee?.position || 'Employee'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{goal.title}</div>
                        <div className="text-sm text-gray-500 mt-1 line-clamp-2">{goal.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${categoryStyle.className}`}>
                          {categoryStyle.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                goal.progress_percentage >= 100 ? 'bg-green-500' : 
                                goal.progress_percentage >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                              }`}
                              style={{ width: `${Math.min(goal.progress_percentage || 0, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-700 w-12 text-right">
                            {goal.progress_percentage || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm ${overdue ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                          {formatDate(goal.due_date)}
                        </div>
                        {overdue && (
                          <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                            <AlertCircle size={12} />
                            Overdue
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${statusStyle.className}`}>
                          {statusStyle.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {(user?.role === 'admin' || user?.role === 'hr') && (
                          <div className="flex justify-end relative group">
                            <button className="text-gray-400 hover:text-gray-600">
                              <MoreHorizontal size={20} />
                            </button>
                            
                            <div className="hidden group-hover:flex absolute right-8 top-0 bg-white shadow-lg rounded-lg border border-gray-100 p-1 z-10 flex-col min-w-[140px]">
                              {goal.status !== 'completed' && goal.status !== 'cancelled' && (
                                <>
                                  <button 
                                    onClick={() => handleOpenProgress(goal)}
                                    className="text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md flex items-center gap-2"
                                  >
                                    <Target size={14} /> Update Progress
                                  </button>
                                  <button 
                                    onClick={() => handleOpenEdit(goal)}
                                    className="text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-2"
                                  >
                                    <Edit size={14} /> Edit
                                  </button>
                                </>
                              )}
                              {goal.status === 'in_progress' && (
                                <button 
                                  onClick={() => handleComplete(goal.id)}
                                  className="text-left px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-md flex items-center gap-2"
                                >
                                  <CheckCircle size={14} /> Complete
                                </button>
                              )}
                              {goal.status !== 'completed' && goal.status !== 'cancelled' && (
                                <button 
                                  onClick={() => handleCancel(goal.id)}
                                  className="text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center gap-2"
                                >
                                  <XCircle size={14} /> Cancel
                                </button>
                              )}
                            </div>
                          </div>
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
        {filteredGoals.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{startIdx + 1}</span> to <span className="font-medium">{Math.min(startIdx + ITEMS_PER_PAGE, filteredGoals.length)}</span> of <span className="font-medium">{filteredGoals.length}</span> goals
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

      {/* Goal Form Modal */}
      {showForm && (
        <div className="fixed inset-0 m-0 bg-black bg-opacity-50 flex items-center justify-center z-[300] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedGoal ? 'Edit Goal' : 'New Goal'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setSelectedGoal(null);
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
                  Goal Title *
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
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {formFieldErrors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {formFieldErrors.description[0]}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="business">Business</option>
                    <option value="professional">Professional</option>
                    <option value="personal">Personal</option>
                    <option value="technical">Technical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (0.1 - 5.0)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleFormChange}
                    min="0.1"
                    max="5"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
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
                    Due Date *
                  </label>
                  <input
                    type="date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {formFieldErrors.due_date && (
                    <p className="mt-1 text-sm text-red-600">
                      {formFieldErrors.due_date[0]}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Success Criteria
                </label>
                <textarea
                  name="success_criteria"
                  value={formData.success_criteria}
                  onChange={handleFormChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="How success will be measured"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alignment with Company Goals
                </label>
                <textarea
                  name="alignment_with_company"
                  value={formData.alignment_with_company}
                  onChange={handleFormChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="How this goal aligns with company objectives"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedGoal(null);
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

      {/* Progress Update Modal */}
      {showProgressModal && selectedGoal && (
        <div className="fixed inset-0 m-0 bg-black bg-opacity-50 flex items-center justify-center z-[300] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Update Progress: {selectedGoal.title}
              </h2>
              <button
                onClick={() => {
                  setShowProgressModal(false);
                  setSelectedGoal(null);
                  setProgressData({ progress_percentage: 0, notes: '' });
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateProgress} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Progress Percentage *
                </label>
                <input
                  type="number"
                  name="progress_percentage"
                  value={progressData.progress_percentage}
                  onChange={handleProgressChange}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      progressData.progress_percentage >= 100 ? 'bg-green-500' : 
                      progressData.progress_percentage >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${Math.min(progressData.progress_percentage, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Progress Notes
                </label>
                <textarea
                  name="notes"
                  value={progressData.notes}
                  onChange={handleProgressChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Update on progress made"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowProgressModal(false);
                    setSelectedGoal(null);
                    setProgressData({ progress_percentage: 0, notes: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Progress
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalList;
