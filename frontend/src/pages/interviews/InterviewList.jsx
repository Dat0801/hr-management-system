import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, Plus, ChevronLeft, ChevronRight, CheckCircle, XCircle, Calendar, Clock, Video, Phone, User } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../store/auth';

const ITEMS_PER_PAGE = 10;

const InterviewList = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);

  const [formData, setFormData] = useState({
    job_application_id: '',
    interviewer_id: user?.id || '',
    scheduled_date: '',
    scheduled_time: '',
    duration_minutes: 30,
    interview_type: 'video',
    notes: '',
  });
  const [completeData, setCompleteData] = useState({
    rating: 3,
    feedback: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formFieldErrors, setFormFieldErrors] = useState({});

  useEffect(() => {
    document.title = 'Interviews | HR Management';
  }, []);

  const { data: applicationsData } = useQuery({
    queryKey: ['job-applications'],
    queryFn: async () => {
      const res = await api.get('/job-applications');
      const payload = res.data;
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      return [];
    },
  });

  const applications = useMemo(() => {
    if (Array.isArray(applicationsData)) return applicationsData;
    if (Array.isArray(applicationsData?.data)) return applicationsData.data;
    return [];
  }, [applicationsData]);

  const applicationOptions = useMemo(() => {
    return applications
      .filter(app => app.status === 'screening' || app.status === 'interview')
      .map((app) => ({
        id: app.id,
        label: `${app.full_name || `${app.first_name} ${app.last_name}`} - ${app.job_position?.title || 'N/A'}`,
      }));
  }, [applications]);

  const {
    data: interviewsData,
    isLoading: interviewsLoading,
  } = useQuery({
    queryKey: ['interviews', activeTab],
    queryFn: async () => {
      let res;
      if (activeTab === 'scheduled') {
        res = await api.get('/interviews/scheduled/list');
      } else {
        res = await api.get('/interviews');
      }
      const payload = res.data;
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      return [];
    },
  });

  const interviews = useMemo(() => {
    if (Array.isArray(interviewsData)) return interviewsData;
    if (Array.isArray(interviewsData?.data)) return interviewsData.data;
    return [];
  }, [interviewsData]);

  const filteredInterviews = useMemo(() => {
    if (activeTab === 'all') return interviews;
    if (activeTab === 'scheduled') return interviews.filter(i => i.status === 'scheduled');
    return interviews.filter(i => i.status === activeTab);
  }, [interviews, activeTab]);

  const totalPages = Math.ceil(filteredInterviews.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedInterviews = filteredInterviews.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  // Helpers
  const getStatusStyle = (status) => {
    switch(status?.toLowerCase()) {
      case 'scheduled':
        return { label: 'Scheduled', className: 'bg-blue-100 text-blue-700' };
      case 'completed':
        return { label: 'Completed', className: 'bg-green-100 text-green-700' };
      case 'cancelled':
        return { label: 'Cancelled', className: 'bg-red-100 text-red-700' };
      case 'rescheduled':
        return { label: 'Rescheduled', className: 'bg-yellow-100 text-yellow-700' };
      default:
        return { label: status || 'Unknown', className: 'bg-gray-50 text-gray-600' };
    }
  };

  const getInterviewTypeIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'phone':
        return Phone;
      case 'video':
        return Video;
      case 'in_person':
        return User;
      default:
        return Calendar;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    for (let i = 0; i < fullStars; i++) {
      stars.push(<CheckCircle key={i} size={14} className="fill-yellow-400 text-yellow-400" />);
    }
    const emptyStars = 5 - fullStars;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<CheckCircle key={`empty-${i}`} size={14} className="text-gray-300" />);
    }
    return stars;
  };

  // Form Handlers
  const resetForm = () => {
    setFormData({
      job_application_id: '',
      interviewer_id: user?.id || '',
      scheduled_date: '',
      scheduled_time: '',
      duration_minutes: 30,
      interview_type: 'video',
      notes: '',
    });
    setFormError('');
    setFormFieldErrors({});
  };

  const handleOpenCreate = () => {
    setSelectedInterview(null);
    resetForm();
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name === 'job_application_id' || name === 'interviewer_id' || name === 'duration_minutes'
        ? (value ? parseInt(value) : value)
        : value
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
      const scheduledDateTime = `${formData.scheduled_date}T${formData.scheduled_time}:00`;
      
      const payload = {
        job_application_id: parseInt(formData.job_application_id),
        interviewer_id: formData.interviewer_id ? parseInt(formData.interviewer_id) : null,
        scheduled_date: scheduledDateTime,
        duration_minutes: parseInt(formData.duration_minutes),
        interview_type: formData.interview_type,
        notes: formData.notes || null,
      };

      if (selectedInterview?.id) {
        await api.put(`/interviews/${selectedInterview.id}`, payload);
      } else {
        await api.post('/interviews', payload);
      }

      await queryClient.invalidateQueries({ queryKey: ['interviews'] });
      setShowForm(false);
      setSelectedInterview(null);
      resetForm();
      setCurrentPage(1);
    } catch (err) {
      if (err.response?.data?.errors) {
        setFormFieldErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        setFormError(err.response.data.message);
      } else {
        setFormError('Failed to save interview. Please try again.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!selectedInterview) return;
    
    setFormLoading(true);
    try {
      await api.post(`/interviews/${selectedInterview.id}/complete`, completeData);
      await queryClient.invalidateQueries({ queryKey: ['interviews'] });
      setShowCompleteModal(false);
      setSelectedInterview(null);
      setCompleteData({ rating: 3, feedback: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete interview');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancel = async (interviewId) => {
    const notes = prompt('Reason for cancellation (optional):');
    try {
      await api.post(`/interviews/${interviewId}/cancel`, { notes: notes || null });
      await queryClient.invalidateQueries({ queryKey: ['interviews'] });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel interview');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Interviews</h1>
          <p className="mt-1 text-gray-500">Schedule and manage candidate interviews.</p>
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
              Schedule Interview
            </button>
          )}
        </div>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-8">
            {['all', 'scheduled', 'completed', 'cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Candidate</th>
                <th className="px-6 py-4">Position</th>
                <th className="px-6 py-4">Scheduled Date</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {interviewsLoading ? (
                 <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      Loading interviews...
                    </td>
                 </tr>
              ) : paginatedInterviews.length === 0 ? (
                 <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      No {activeTab === 'all' ? '' : activeTab} interviews found.
                    </td>
                 </tr>
              ) : (
                paginatedInterviews.map((interview) => {
                  const statusStyle = getStatusStyle(interview.status);
                  const TypeIcon = getInterviewTypeIcon(interview.interview_type);
                  
                  return (
                    <tr key={interview.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {interview.job_application?.full_name || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {interview.job_application?.email || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {interview.job_application?.job_position?.title || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <div className="text-sm text-gray-900">
                            {formatDateTime(interview.scheduled_date)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <TypeIcon size={16} className="text-gray-400" />
                          <span className="text-sm text-gray-900 capitalize">
                            {interview.interview_type?.replace('_', ' ') || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {interview.duration_minutes} min
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${statusStyle.className}`}>
                          {statusStyle.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {interview.rating ? (
                          <div className="flex items-center gap-1">
                            {renderStars(interview.rating)}
                            <span className="text-sm text-gray-600 ml-1">{interview.rating}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {(user?.role === 'admin' || user?.role === 'hr') && (
                            <>
                              {interview.status === 'scheduled' && (
                                <>
                                  <button 
                                    onClick={() => {
                                      setSelectedInterview(interview);
                                      setCompleteData({ rating: 3, feedback: '' });
                                      setShowCompleteModal(true);
                                    }}
                                    className="px-3 py-1.5 bg-green-50 text-green-600 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1"
                                  >
                                    <CheckCircle size={14} />
                                    Complete
                                  </button>
                                  <button 
                                    onClick={() => handleCancel(interview.id)}
                                    className="px-3 py-1.5 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1"
                                  >
                                    <XCircle size={14} />
                                    Cancel
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
        {filteredInterviews.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{startIdx + 1}</span> to <span className="font-medium">{Math.min(startIdx + ITEMS_PER_PAGE, filteredInterviews.length)}</span> of <span className="font-medium">{filteredInterviews.length}</span> interviews
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

      {/* Schedule Form Modal */}
      {showForm && (
        <div className="fixed inset-0 m-0 bg-black bg-opacity-50 flex items-center justify-center z-[300] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Schedule Interview
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setSelectedInterview(null);
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
                  Job Application *
                </label>
                <select
                  name="job_application_id"
                  value={formData.job_application_id}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select application</option>
                  {applicationOptions.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.label}
                    </option>
                  ))}
                </select>
                {formFieldErrors.job_application_id && (
                  <p className="mt-1 text-sm text-red-600">
                    {formFieldErrors.job_application_id[0]}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="scheduled_date"
                    value={formData.scheduled_date}
                    onChange={handleFormChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time *
                  </label>
                  <input
                    type="time"
                    name="scheduled_time"
                    value={formData.scheduled_time}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    name="duration_minutes"
                    value={formData.duration_minutes}
                    onChange={handleFormChange}
                    min="15"
                    step="15"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interview Type *
                  </label>
                  <select
                    name="interview_type"
                    value={formData.interview_type}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="phone">Phone</option>
                    <option value="video">Video</option>
                    <option value="in_person">In Person</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes or instructions"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedInterview(null);
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
                  {formLoading ? 'Saving...' : 'Schedule Interview'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Interview Modal */}
      {showCompleteModal && selectedInterview && (
        <div className="fixed inset-0 m-0 bg-black bg-opacity-50 flex items-center justify-center z-[300] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Complete Interview
              </h2>
              <button
                onClick={() => {
                  setShowCompleteModal(false);
                  setSelectedInterview(null);
                  setCompleteData({ rating: 3, feedback: '' });
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating (1-5)
                </label>
                <div className="flex items-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setCompleteData(prev => ({ ...prev, rating: star }))}
                      className="focus:outline-none"
                    >
                      <CheckCircle 
                        size={24} 
                        className={star <= completeData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} 
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">{completeData.rating}/5</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feedback
                </label>
                <textarea
                  value={completeData.feedback}
                  onChange={(e) => setCompleteData(prev => ({ ...prev, feedback: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Interview feedback and notes..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCompleteModal(false);
                    setSelectedInterview(null);
                    setCompleteData({ rating: 3, feedback: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleComplete}
                  disabled={formLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
                >
                  {formLoading ? 'Completing...' : 'Complete Interview'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewList;
