import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, Plus, ChevronLeft, ChevronRight, CheckCircle, XCircle, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../store/auth';

const ITEMS_PER_PAGE = 10;

const JobOfferList = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [actionType, setActionType] = useState('');
  const [actionNotes, setActionNotes] = useState('');

  const [formData, setFormData] = useState({
    job_application_id: '',
    offered_salary: '',
    offered_date: '',
    offered_time: '',
    expiry_date: '',
    expiry_time: '',
    terms_and_conditions: '',
    notes: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formFieldErrors, setFormFieldErrors] = useState({});

  useEffect(() => {
    document.title = 'Job Offers | HR Management';
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
      .filter(app => app.status === 'offer')
      .map((app) => ({
        id: app.id,
        label: `${app.full_name || `${app.first_name} ${app.last_name}`} - ${app.job_position?.title || 'N/A'}`,
      }));
  }, [applications]);

  const {
    data: offersData,
    isLoading: offersLoading,
  } = useQuery({
    queryKey: ['job-offers', activeTab],
    queryFn: async () => {
      let res;
      if (activeTab === 'pending') {
        res = await api.get('/job-offers/pending/list');
      } else if (activeTab === 'accepted') {
        res = await api.get('/job-offers/accepted/list');
      } else {
        res = await api.get('/job-offers');
      }
      const payload = res.data;
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      return [];
    },
  });

  const offers = useMemo(() => {
    if (Array.isArray(offersData)) return offersData;
    if (Array.isArray(offersData?.data)) return offersData.data;
    return [];
  }, [offersData]);

  const filteredOffers = useMemo(() => {
    if (activeTab === 'all') return offers;
    if (activeTab === 'pending') return offers.filter(o => o.status === 'sent');
    return offers.filter(o => o.status === activeTab);
  }, [offers, activeTab]);

  const totalPages = Math.ceil(filteredOffers.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOffers = filteredOffers.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  // Helpers
  const getStatusStyle = (status) => {
    switch(status?.toLowerCase()) {
      case 'sent':
        return { label: 'Sent', className: 'bg-blue-100 text-blue-700' };
      case 'accepted':
        return { label: 'Accepted', className: 'bg-green-100 text-green-700' };
      case 'rejected':
        return { label: 'Rejected', className: 'bg-red-100 text-red-700' };
      default:
        return { label: status || 'Unknown', className: 'bg-gray-50 text-gray-600' };
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
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

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  // Form Handlers
  const resetForm = () => {
    setFormData({
      job_application_id: '',
      offered_salary: '',
      offered_date: '',
      offered_time: '',
      expiry_date: '',
      expiry_time: '',
      terms_and_conditions: '',
      notes: '',
    });
    setFormError('');
    setFormFieldErrors({});
  };

  const handleOpenCreate = () => {
    setSelectedOffer(null);
    resetForm();
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name === 'offered_salary' ? (value ? parseFloat(value) : value) : value
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
      const offeredDateTime = `${formData.offered_date}T${formData.offered_time}:00`;
      const expiryDateTime = `${formData.expiry_date}T${formData.expiry_time}:00`;
      
      const payload = {
        job_application_id: parseInt(formData.job_application_id),
        offered_salary: parseFloat(formData.offered_salary),
        offered_date: offeredDateTime,
        expiry_date: expiryDateTime,
        terms_and_conditions: formData.terms_and_conditions || null,
        notes: formData.notes || null,
      };

      if (selectedOffer?.id) {
        await api.put(`/job-offers/${selectedOffer.id}`, payload);
      } else {
        await api.post('/job-offers', payload);
      }

      await queryClient.invalidateQueries({ queryKey: ['job-offers'] });
      setShowForm(false);
      setSelectedOffer(null);
      resetForm();
      setCurrentPage(1);
    } catch (err) {
      if (err.response?.data?.errors) {
        setFormFieldErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        setFormError(err.response.data.message);
      } else {
        setFormError('Failed to save job offer. Please try again.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenAction = (offer, action) => {
    setSelectedOffer(offer);
    setActionType(action);
    setActionNotes('');
    setShowActionModal(true);
  };

  const handleAction = async () => {
    if (!selectedOffer) return;
    
    setFormLoading(true);
    try {
      let endpoint = '';
      let payload = { notes: actionNotes || null };

      if (actionType === 'accept') {
        endpoint = `/job-offers/${selectedOffer.id}/accept`;
      } else if (actionType === 'reject') {
        endpoint = `/job-offers/${selectedOffer.id}/reject`;
      } else {
        return;
      }

      await api.post(endpoint, payload);
      await queryClient.invalidateQueries({ queryKey: ['job-offers'] });
      setShowActionModal(false);
      setSelectedOffer(null);
      setActionType('');
      setActionNotes('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to perform action');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Offers</h1>
          <p className="mt-1 text-gray-500">Manage job offers and candidate responses.</p>
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
              New Offer
            </button>
          )}
        </div>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-8">
            {['all', 'pending', 'sent', 'accepted', 'rejected'].map((tab) => (
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
                <th className="px-6 py-4">Offered Salary</th>
                <th className="px-6 py-4">Offered Date</th>
                <th className="px-6 py-4">Expiry Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {offersLoading ? (
                 <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      Loading job offers...
                    </td>
                 </tr>
              ) : paginatedOffers.length === 0 ? (
                 <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No {activeTab === 'all' ? '' : activeTab} job offers found.
                    </td>
                 </tr>
              ) : (
                paginatedOffers.map((offer) => {
                  const statusStyle = getStatusStyle(offer.status);
                  const expired = isExpired(offer.expiry_date);
                  
                  return (
                    <tr key={offer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {offer.job_application?.full_name || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {offer.job_application?.email || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {offer.job_application?.job_position?.title || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <DollarSign size={16} className="text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(offer.offered_salary)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <div className="text-sm text-gray-900">
                            {formatDateTime(offer.offered_date)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-2 ${expired ? 'text-red-600' : ''}`}>
                          <Calendar size={14} className={expired ? 'text-red-400' : 'text-gray-400'} />
                          <div className="text-sm">
                            {formatDateTime(offer.expiry_date)}
                          </div>
                          {expired && (
                            <AlertCircle size={14} className="text-red-500" title="Expired" />
                          )}
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
                              {offer.status === 'sent' && (
                                <>
                                  <button 
                                    onClick={() => handleOpenAction(offer, 'accept')}
                                    className="px-3 py-1.5 bg-green-50 text-green-600 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1"
                                  >
                                    <CheckCircle size={14} />
                                    Accept
                                  </button>
                                  <button 
                                    onClick={() => handleOpenAction(offer, 'reject')}
                                    className="px-3 py-1.5 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1"
                                  >
                                    <XCircle size={14} />
                                    Reject
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
        {filteredOffers.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{startIdx + 1}</span> to <span className="font-medium">{Math.min(startIdx + ITEMS_PER_PAGE, filteredOffers.length)}</span> of <span className="font-medium">{filteredOffers.length}</span> offers
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
                New Job Offer
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setSelectedOffer(null);
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Offered Salary *
                </label>
                <input
                  type="number"
                  name="offered_salary"
                  value={formData.offered_salary}
                  onChange={handleFormChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {formFieldErrors.offered_salary && (
                  <p className="mt-1 text-sm text-red-600">
                    {formFieldErrors.offered_salary[0]}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Offered Date *
                  </label>
                  <input
                    type="date"
                    name="offered_date"
                    value={formData.offered_date}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Offered Time *
                  </label>
                  <input
                    type="time"
                    name="offered_time"
                    value={formData.offered_time}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    name="expiry_date"
                    value={formData.expiry_date}
                    onChange={handleFormChange}
                    min={formData.offered_date}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Time *
                  </label>
                  <input
                    type="time"
                    name="expiry_time"
                    value={formData.expiry_time}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Terms and Conditions
                </label>
                <textarea
                  name="terms_and_conditions"
                  value={formData.terms_and_conditions}
                  onChange={handleFormChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Terms and conditions of the offer"
                />
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
                  placeholder="Additional notes"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedOffer(null);
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
                  {formLoading ? 'Saving...' : 'Create Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && selectedOffer && (
        <div className="fixed inset-0 m-0 bg-black bg-opacity-50 flex items-center justify-center z-[300] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {actionType === 'accept' ? 'Accept Offer' : 'Reject Offer'}
              </h2>
              <button
                onClick={() => {
                  setShowActionModal(false);
                  setSelectedOffer(null);
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
                  Candidate: {selectedOffer.job_application?.full_name || 'N/A'}
                </label>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position: {selectedOffer.job_application?.job_position?.title || 'N/A'}
                </label>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Offered Salary: {formatCurrency(selectedOffer.offered_salary)}
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add notes or comments..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowActionModal(false);
                    setSelectedOffer(null);
                    setActionType('');
                    setActionNotes('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAction}
                  disabled={formLoading}
                  className={`flex-1 px-4 py-2 font-medium rounded-lg transition-colors ${
                    actionType === 'accept'
                      ? 'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400'
                      : 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400'
                  } disabled:cursor-not-allowed`}
                >
                  {formLoading ? 'Processing...' : actionType === 'accept' ? 'Accept Offer' : 'Reject Offer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobOfferList;
