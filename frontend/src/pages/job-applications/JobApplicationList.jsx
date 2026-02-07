import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, ChevronLeft, ChevronRight, Star, Eye, CheckCircle, XCircle, UserCheck, FileText, Send, UserX } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../store/auth';

const ITEMS_PER_PAGE = 10;

const JobApplicationList = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [rating, setRating] = useState(3);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    document.title = 'Job Applications | HR Management';
  }, []);

  const {
    data: applicationsData,
    isLoading: applicationsLoading,
  } = useQuery({
    queryKey: ['job-applications', activeTab],
    queryFn: async () => {
      let res;
      if (activeTab === 'all') {
        res = await api.get('/job-applications');
      } else if (activeTab === 'hired') {
        res = await api.get('/job-applications/hired/list');
      } else if (activeTab === 'top-rated') {
        res = await api.get('/job-applications/top-rated?limit=50');
      } else {
        res = await api.get(`/job-applications/status/${activeTab}`);
      }
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

  const filteredApplications = useMemo(() => {
    return applications;
  }, [applications]);

  const totalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedApplications = filteredApplications.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  // Helpers
  const getStatusStyle = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending':
        return { label: 'Pending', className: 'bg-yellow-100 text-yellow-700' };
      case 'screening':
        return { label: 'Screening', className: 'bg-blue-100 text-blue-700' };
      case 'interview':
        return { label: 'Interview', className: 'bg-purple-100 text-purple-700' };
      case 'offer':
        return { label: 'Offer', className: 'bg-green-100 text-green-700' };
      case 'hired':
        return { label: 'Hired', className: 'bg-green-100 text-green-700' };
      case 'rejected':
        return { label: 'Rejected', className: 'bg-red-100 text-red-700' };
      case 'withdrawn':
        return { label: 'Withdrawn', className: 'bg-gray-100 text-gray-700' };
      default:
        return { label: status || 'Unknown', className: 'bg-gray-50 text-gray-600' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />);
    }
    const emptyStars = 5 - fullStars;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={14} className="text-gray-300" />);
    }
    return stars;
  };

  const handleViewDetails = async (applicationId) => {
    try {
      const res = await api.get(`/job-applications/${applicationId}`);
      setSelectedApplication(res.data?.data || res.data);
      setShowDetailsModal(true);
    } catch (err) {
      alert('Failed to load application details');
    }
  };

  const handleOpenAction = (application, action) => {
    setSelectedApplication(application);
    setActionType(action);
    setActionNotes('');
    setRating(application.rating || 3);
    setShowActionModal(true);
  };

  const handleAction = async () => {
    if (!selectedApplication) return;
    
    setActionLoading(true);
    try {
      let endpoint = '';
      let payload = { notes: actionNotes || null };

      switch(actionType) {
        case 'screening':
          endpoint = `/job-applications/${selectedApplication.id}/move-to-screening`;
          break;
        case 'interview':
          endpoint = `/job-applications/${selectedApplication.id}/schedule-interview`;
          break;
        case 'offer':
          endpoint = `/job-applications/${selectedApplication.id}/make-offer`;
          break;
        case 'hire':
          endpoint = `/job-applications/${selectedApplication.id}/hire`;
          break;
        case 'reject':
          endpoint = `/job-applications/${selectedApplication.id}/reject`;
          break;
        case 'withdraw':
          endpoint = `/job-applications/${selectedApplication.id}/withdraw`;
          break;
        case 'rate':
          endpoint = `/job-applications/${selectedApplication.id}/rate`;
          payload = { rating, notes: actionNotes || null };
          break;
        default:
          return;
      }

      await api.post(endpoint, payload);
      await queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      setShowActionModal(false);
      setSelectedApplication(null);
      setActionType('');
      setActionNotes('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to perform action');
    } finally {
      setActionLoading(false);
    }
  };

  const getActionLabel = (action) => {
    const labels = {
      screening: 'Move to Screening',
      interview: 'Schedule Interview',
      offer: 'Make Offer',
      hire: 'Hire Candidate',
      reject: 'Reject Application',
      withdraw: 'Withdraw Application',
      rate: 'Rate Application',
    };
    return labels[action] || action;
  };

  const getAvailableActions = (status) => {
    const actions = [];
    switch(status?.toLowerCase()) {
      case 'pending':
        actions.push('screening', 'reject');
        break;
      case 'screening':
        actions.push('interview', 'reject', 'rate');
        break;
      case 'interview':
        actions.push('offer', 'reject', 'rate');
        break;
      case 'offer':
        actions.push('hire', 'reject');
        break;
      default:
        break;
    }
    return actions;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Applications</h1>
          <p className="mt-1 text-gray-500">Manage and track job applications through the recruitment process.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm">
            <Download size={20} />
            Export
          </button>
        </div>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-8 overflow-x-auto">
            {['all', 'pending', 'screening', 'interview', 'offer', 'hired', 'rejected', 'top-rated'].map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                className={`py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'top-rated' ? 'Top Rated' : tab.charAt(0).toUpperCase() + tab.slice(1)}
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
                <th className="px-6 py-4">Applied Date</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {applicationsLoading ? (
                 <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      Loading applications...
                    </td>
                 </tr>
              ) : paginatedApplications.length === 0 ? (
                 <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No {activeTab === 'all' ? '' : activeTab.replace('-', ' ')} applications found.
                    </td>
                 </tr>
              ) : (
                paginatedApplications.map((application) => {
                  const statusStyle = getStatusStyle(application.status);
                  const availableActions = getAvailableActions(application.status);
                  
                  return (
                    <tr key={application.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm">
                            {application.first_name?.charAt(0) || 'A'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {application.full_name || `${application.first_name} ${application.last_name}`}
                            </div>
                            <div className="text-sm text-gray-500">{application.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-medium">
                          {application.job_position?.title || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {application.job_position?.department?.name || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(application.applied_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {application.rating ? (
                          <div className="flex items-center gap-1">
                            {renderStars(application.rating)}
                            <span className="text-sm text-gray-600 ml-1">{application.rating}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Not rated</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${statusStyle.className}`}>
                          {statusStyle.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleViewDetails(application.id)}
                            className="px-3 py-1.5 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                            title="View Details"
                          >
                            <Eye size={14} />
                            View
                          </button>
                          {(user?.role === 'admin' || user?.role === 'hr') && availableActions.length > 0 && (
                            <div className="relative inline-block">
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleOpenAction(application, e.target.value);
                                    e.target.value = '';
                                  }
                                }}
                                className="px-3 py-1.5 bg-white border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Actions...</option>
                                {availableActions.map(action => (
                                  <option key={action} value={action}>
                                    {getActionLabel(action)}
                                  </option>
                                ))}
                              </select>
                            </div>
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
        {filteredApplications.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{startIdx + 1}</span> to <span className="font-medium">{Math.min(startIdx + ITEMS_PER_PAGE, filteredApplications.length)}</span> of <span className="font-medium">{filteredApplications.length}</span> applications
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

      {/* Details Modal */}
      {showDetailsModal && selectedApplication && (
        <div className="fixed inset-0 m-0 bg-black bg-opacity-50 flex items-center justify-center z-[300] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Application Details</h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedApplication(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <div className="mt-1 text-gray-900">{selectedApplication.full_name || `${selectedApplication.first_name} ${selectedApplication.last_name}`}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <div className="mt-1 text-gray-900">{selectedApplication.email}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <div className="mt-1 text-gray-900">{selectedApplication.phone || 'N/A'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Applied Date</label>
                  <div className="mt-1 text-gray-900">{formatDate(selectedApplication.applied_date)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Position</label>
                  <div className="mt-1 text-gray-900">{selectedApplication.job_position?.title || 'N/A'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusStyle(selectedApplication.status).className}`}>
                      {getStatusStyle(selectedApplication.status).label}
                    </span>
                  </div>
                </div>
                {selectedApplication.rating && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Rating</label>
                    <div className="mt-1 flex items-center gap-1">
                      {renderStars(selectedApplication.rating)}
                      <span className="text-gray-900 ml-1">{selectedApplication.rating}</span>
                    </div>
                  </div>
                )}
              </div>

              {selectedApplication.cover_letter && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Cover Letter</label>
                  <div className="mt-1 p-4 bg-gray-50 rounded-lg text-gray-900 whitespace-pre-wrap">
                    {selectedApplication.cover_letter}
                  </div>
                </div>
              )}

              {selectedApplication.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Notes</label>
                  <div className="mt-1 p-4 bg-gray-50 rounded-lg text-gray-900 whitespace-pre-wrap">
                    {selectedApplication.notes}
                  </div>
                </div>
              )}

              {selectedApplication.resume_path && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Resume</label>
                  <div className="mt-1">
                    <a 
                      href={selectedApplication.resume_path} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      View Resume
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && selectedApplication && (
        <div className="fixed inset-0 m-0 bg-black bg-opacity-50 flex items-center justify-center z-[300] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {getActionLabel(actionType)}
              </h2>
              <button
                onClick={() => {
                  setShowActionModal(false);
                  setSelectedApplication(null);
                  setActionType('');
                  setActionNotes('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Candidate: {selectedApplication.full_name || `${selectedApplication.first_name} ${selectedApplication.last_name}`}
                </label>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position: {selectedApplication.job_position?.title || 'N/A'}
                </label>
              </div>

              {actionType === 'rate' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating (1-5)
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <Star 
                          size={24} 
                          className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} 
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">{rating}/5</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes {actionType === 'rate' ? '(optional)' : ''}
                </label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add notes or comments..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowActionModal(false);
                    setSelectedApplication(null);
                    setActionType('');
                    setActionNotes('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAction}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                >
                  {actionLoading ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApplicationList;
