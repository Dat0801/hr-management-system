import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, Plus, ChevronLeft, ChevronRight, CheckCircle, Star, TrendingUp, MoreHorizontal, Edit } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../store/auth';

const ITEMS_PER_PAGE = 10;

const PerformanceReviewList = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [showForm, setShowForm] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  const [formData, setFormData] = useState({
    employee_id: '',
    reviewer_id: user?.id || '',
    rating_year: new Date().getFullYear(),
    period: 'q1',
    performance_summary: '',
    strengths: '',
    areas_for_improvement: '',
    overall_rating: '',
    rating_leadership: '',
    rating_teamwork: '',
    rating_communication: '',
    rating_technical_skills: '',
    rating_attendance: '',
    feedback_from_manager: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formFieldErrors, setFormFieldErrors] = useState({});

  useEffect(() => {
    document.title = 'Performance Reviews | HR Management';
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
    data: reviewsData,
    isLoading: reviewsLoading,
  } = useQuery({
    queryKey: ['performance-reviews', activeTab, selectedYear],
    queryFn: async () => {
      let res;
      if (activeTab === 'year') {
        res = await api.get(`/performance-reviews/year/${selectedYear}`);
      } else {
        res = await api.get('/performance-reviews');
      }
      const payload = res.data;
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      return [];
    },
  });

  const reviews = useMemo(() => {
    if (Array.isArray(reviewsData)) return reviewsData;
    if (Array.isArray(reviewsData?.data)) return reviewsData.data;
    return [];
  }, [reviewsData]);

  // Derived Data
  const draftCount = useMemo(() => 
    reviews.filter(r => r.status === 'draft').length, 
  [reviews]);
  
  const submittedCount = useMemo(() => 
    reviews.filter(r => r.status === 'submitted').length, 
  [reviews]);

  const filteredReviews = useMemo(() => {
    if (activeTab === 'all') return reviews;
    if (activeTab === 'year') return reviews;
    return reviews.filter(r => r.status === activeTab);
  }, [reviews, activeTab]);

  const totalPages = Math.ceil(filteredReviews.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedReviews = filteredReviews.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  // Helpers
  const getStatusStyle = (status) => {
    switch(status?.toLowerCase()) {
      case 'draft':
        return { label: 'Draft', className: 'bg-gray-100 text-gray-700' };
      case 'submitted':
        return { label: 'Submitted', className: 'bg-yellow-100 text-yellow-700' };
      case 'approved':
        return { label: 'Approved', className: 'bg-green-100 text-green-700' };
      default:
        return { label: status || 'Unknown', className: 'bg-gray-50 text-gray-600' };
    }
  };

  const getPeriodLabel = (period) => {
    const labels = {
      q1: 'Q1',
      q2: 'Q2',
      q3: 'Q3',
      q4: 'Q4',
      annual: 'Annual',
    };
    return labels[period] || period;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />);
    }
    if (hasHalfStar) {
      stars.push(<Star key="half" size={14} className="fill-yellow-400 text-yellow-400 opacity-50" />);
    }
    const emptyStars = 5 - Math.ceil(rating || 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={14} className="text-gray-300" />);
    }
    return stars;
  };

  // Form Handlers
  const resetForm = () => {
    setFormData({
      employee_id: '',
      reviewer_id: user?.id || '',
      rating_year: new Date().getFullYear(),
      period: 'q1',
      performance_summary: '',
      strengths: '',
      areas_for_improvement: '',
      overall_rating: '',
      rating_leadership: '',
      rating_teamwork: '',
      rating_communication: '',
      rating_technical_skills: '',
      rating_attendance: '',
      feedback_from_manager: '',
    });
    setFormError('');
    setFormFieldErrors({});
  };

  const handleOpenCreate = () => {
    setSelectedReview(null);
    resetForm();
    setShowForm(true);
  };

  const handleOpenEdit = (review) => {
    setSelectedReview(review);
    setFormData({
      employee_id: review.employee_id,
      reviewer_id: review.reviewer_id || user?.id || '',
      rating_year: review.rating_year,
      period: review.period,
      performance_summary: review.performance_summary || '',
      strengths: review.strengths || '',
      areas_for_improvement: review.areas_for_improvement || '',
      overall_rating: review.overall_rating || '',
      rating_leadership: review.rating_leadership || '',
      rating_teamwork: review.rating_teamwork || '',
      rating_communication: review.rating_communication || '',
      rating_technical_skills: review.rating_technical_skills || '',
      rating_attendance: review.rating_attendance || '',
      feedback_from_manager: review.feedback_from_manager || '',
    });
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name === 'employee_id' || name === 'reviewer_id' || name === 'rating_year' 
        ? parseInt(value) || value 
        : (name.includes('rating') ? parseFloat(value) || value : value)
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
        employee_id: parseInt(formData.employee_id),
        reviewer_id: parseInt(formData.reviewer_id),
        rating_year: parseInt(formData.rating_year),
        period: formData.period,
        performance_summary: formData.performance_summary,
        strengths: formData.strengths,
        areas_for_improvement: formData.areas_for_improvement,
        overall_rating: parseFloat(formData.overall_rating),
        rating_leadership: formData.rating_leadership ? parseFloat(formData.rating_leadership) : null,
        rating_teamwork: formData.rating_teamwork ? parseFloat(formData.rating_teamwork) : null,
        rating_communication: formData.rating_communication ? parseFloat(formData.rating_communication) : null,
        rating_technical_skills: formData.rating_technical_skills ? parseFloat(formData.rating_technical_skills) : null,
        rating_attendance: formData.rating_attendance ? parseFloat(formData.rating_attendance) : null,
        feedback_from_manager: formData.feedback_from_manager,
      };

      if (selectedReview?.id) {
        await api.put(`/performance-reviews/${selectedReview.id}`, payload);
      } else {
        await api.post('/performance-reviews', payload);
      }

      await queryClient.invalidateQueries({ queryKey: ['performance-reviews'] });
      setShowForm(false);
      setSelectedReview(null);
      resetForm();
      setCurrentPage(1);
    } catch (err) {
      if (err.response?.data?.errors) {
        setFormFieldErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        setFormError(err.response.data.message);
      } else {
        setFormError('Failed to save performance review. Please try again.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmit = async (reviewId) => {
    try {
      await api.post(`/performance-reviews/${reviewId}/submit`);
      await queryClient.invalidateQueries({ queryKey: ['performance-reviews'] });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleApprove = async (reviewId) => {
    try {
      await api.post(`/performance-reviews/${reviewId}/approve`);
      await queryClient.invalidateQueries({ queryKey: ['performance-reviews'] });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve review');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Reviews</h1>
          <p className="mt-1 text-gray-500">Manage and track employee performance evaluations.</p>
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
              New Review
            </button>
          )}
        </div>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-8 items-center">
            {['all', 'draft', 'submitted', 'approved'].map((tab) => (
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
                {tab === 'draft' && draftCount > 0 && (
                  <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {draftCount}
                  </span>
                )}
                {tab === 'submitted' && submittedCount > 0 && (
                  <span className="bg-yellow-100 text-yellow-600 py-0.5 px-2 rounded-full text-xs">
                    {submittedCount}
                  </span>
                )}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <label className="text-sm text-gray-600">Year:</label>
              <select
                value={selectedYear}
                onChange={(e) => { setSelectedYear(parseInt(e.target.value)); setCurrentPage(1); }}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Period</th>
                <th className="px-6 py-4">Overall Rating</th>
                <th className="px-6 py-4">Reviewer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reviewsLoading ? (
                 <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      Loading performance reviews...
                    </td>
                 </tr>
              ) : paginatedReviews.length === 0 ? (
                 <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No {activeTab === 'all' ? '' : activeTab} performance reviews found.
                    </td>
                 </tr>
              ) : (
                paginatedReviews.map((review) => {
                  const statusStyle = getStatusStyle(review.status);
                  
                  return (
                    <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm">
                            {review.employee?.user?.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{review.employee?.user?.name || 'Unknown'}</div>
                            <div className="text-sm text-gray-500">{review.employee?.position || 'Employee'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-medium">
                          {getPeriodLabel(review.period)} {review.rating_year}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {renderStars(review.overall_rating)}
                          <span className="text-sm font-semibold text-gray-900">
                            {review.overall_rating?.toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {review.reviewer?.name || 'N/A'}
                        </div>
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
                              {review.status === 'draft' && (
                                <>
                                  <button 
                                    onClick={() => handleOpenEdit(review)}
                                    className="text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-2"
                                  >
                                    <Edit size={14} /> Edit
                                  </button>
                                  <button 
                                    onClick={() => handleSubmit(review.id)}
                                    className="text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md flex items-center gap-2"
                                  >
                                    <TrendingUp size={14} /> Submit
                                  </button>
                                </>
                              )}
                              {review.status === 'submitted' && (
                                <button 
                                  onClick={() => handleApprove(review.id)}
                                  className="text-left px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-md flex items-center gap-2"
                                >
                                  <CheckCircle size={14} /> Approve
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
        {filteredReviews.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{startIdx + 1}</span> to <span className="font-medium">{Math.min(startIdx + ITEMS_PER_PAGE, filteredReviews.length)}</span> of <span className="font-medium">{filteredReviews.length}</span> reviews
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
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedReview ? 'Edit Performance Review' : 'New Performance Review'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setSelectedReview(null);
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
                    Period *
                  </label>
                  <select
                    name="period"
                    value={formData.period}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="q1">Q1</option>
                    <option value="q2">Q2</option>
                    <option value="q3">Q3</option>
                    <option value="q4">Q4</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating Year *
                </label>
                <input
                  type="number"
                  name="rating_year"
                  value={formData.rating_year}
                  onChange={handleFormChange}
                  min="2000"
                  max="2099"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Overall Rating * (1-5)
                </label>
                <input
                  type="number"
                  name="overall_rating"
                  value={formData.overall_rating}
                  onChange={handleFormChange}
                  min="1"
                  max="5"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {formFieldErrors.overall_rating && (
                  <p className="mt-1 text-sm text-red-600">
                    {formFieldErrors.overall_rating[0]}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Leadership Rating (1-5)
                  </label>
                  <input
                    type="number"
                    name="rating_leadership"
                    value={formData.rating_leadership}
                    onChange={handleFormChange}
                    min="1"
                    max="5"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teamwork Rating (1-5)
                  </label>
                  <input
                    type="number"
                    name="rating_teamwork"
                    value={formData.rating_teamwork}
                    onChange={handleFormChange}
                    min="1"
                    max="5"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Communication Rating (1-5)
                  </label>
                  <input
                    type="number"
                    name="rating_communication"
                    value={formData.rating_communication}
                    onChange={handleFormChange}
                    min="1"
                    max="5"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Technical Skills Rating (1-5)
                  </label>
                  <input
                    type="number"
                    name="rating_technical_skills"
                    value={formData.rating_technical_skills}
                    onChange={handleFormChange}
                    min="1"
                    max="5"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attendance Rating (1-5)
                </label>
                <input
                  type="number"
                  name="rating_attendance"
                  value={formData.rating_attendance}
                  onChange={handleFormChange}
                  min="1"
                  max="5"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Performance Summary
                </label>
                <textarea
                  name="performance_summary"
                  value={formData.performance_summary}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Overall performance summary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Strengths
                </label>
                <textarea
                  name="strengths"
                  value={formData.strengths}
                  onChange={handleFormChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Key strengths and achievements"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Areas for Improvement
                </label>
                <textarea
                  name="areas_for_improvement"
                  value={formData.areas_for_improvement}
                  onChange={handleFormChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Areas that need improvement"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manager Feedback
                </label>
                <textarea
                  name="feedback_from_manager"
                  value={formData.feedback_from_manager}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional feedback from manager"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedReview(null);
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

export default PerformanceReviewList;
