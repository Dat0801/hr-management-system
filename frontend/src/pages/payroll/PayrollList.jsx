import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, Plus, ChevronLeft, ChevronRight, CheckCircle, XCircle, DollarSign, MoreHorizontal, Edit } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../store/auth';

const ITEMS_PER_PAGE = 10;

const PayrollList = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);

  const [formData, setFormData] = useState({
    employee_id: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    base_salary: '',
    overtime_amount: '',
    bonus_amount: '',
    allowances: '',
    deductions: '',
    tax_amount: '',
    insurance_amount: '',
    status: 'draft',
    notes: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formFieldErrors, setFormFieldErrors] = useState({});

  useEffect(() => {
    document.title = 'Payroll Management | HR Management';
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
    data: payrollsData,
    isLoading: payrollsLoading,
  } = useQuery({
    queryKey: ['payrolls', activeTab],
    queryFn: async () => {
      let res;
      if (activeTab === 'all') {
        res = await api.get('/payrolls');
      } else {
        res = await api.get(`/payrolls/status/${activeTab}`);
      }
      const payload = res.data;
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      return [];
    },
  });

  const payrolls = useMemo(() => {
    if (Array.isArray(payrollsData)) return payrollsData;
    if (Array.isArray(payrollsData?.data)) return payrollsData.data;
    return [];
  }, [payrollsData]);

  // Derived Data
  const draftCount = useMemo(() => 
    payrolls.filter(p => p.status === 'draft').length, 
  [payrolls]);
  
  const pendingCount = useMemo(() => 
    payrolls.filter(p => p.status === 'pending').length, 
  [payrolls]);

  const filteredPayrolls = useMemo(() => {
    if (activeTab === 'all') return payrolls;
    return payrolls.filter(p => p.status === activeTab);
  }, [payrolls, activeTab]);

  const totalPages = Math.ceil(filteredPayrolls.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPayrolls = filteredPayrolls.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  // Helpers
  const getStatusStyle = (status) => {
    switch(status?.toLowerCase()) {
      case 'draft':
        return { label: 'Draft', className: 'bg-gray-100 text-gray-700' };
      case 'pending':
        return { label: 'Pending', className: 'bg-yellow-100 text-yellow-700' };
      case 'approved':
        return { label: 'Approved', className: 'bg-blue-100 text-blue-700' };
      case 'paid':
        return { label: 'Paid', className: 'bg-green-100 text-green-700' };
      default:
        return { label: status || 'Unknown', className: 'bg-gray-50 text-gray-600' };
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1] || '';
  };

  // Form Handlers
  const resetForm = () => {
    setFormData({
      employee_id: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      base_salary: '',
      overtime_amount: '',
      bonus_amount: '',
      allowances: '',
      deductions: '',
      tax_amount: '',
      insurance_amount: '',
      status: 'draft',
      notes: '',
    });
    setFormError('');
    setFormFieldErrors({});
  };

  const handleOpenCreate = () => {
    setSelectedPayroll(null);
    resetForm();
    setShowForm(true);
  };

  const handleOpenEdit = (payroll) => {
    setSelectedPayroll(payroll);
    setFormData({
      employee_id: payroll.employee_id,
      month: payroll.month,
      year: payroll.year,
      base_salary: payroll.base_salary,
      overtime_amount: payroll.overtime_amount || '',
      bonus_amount: payroll.bonus_amount || '',
      allowances: payroll.allowances || '',
      deductions: payroll.deductions || '',
      tax_amount: payroll.tax_amount || '',
      insurance_amount: payroll.insurance_amount || '',
      status: payroll.status,
      notes: payroll.notes || '',
    });
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name === 'notes' ? value : (name === 'employee_id' || name === 'month' || name === 'year' ? parseInt(value) || value : parseFloat(value) || value)
    }));

    if (formFieldErrors[name]) {
      setFormFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const calculateTotals = () => {
    const base = parseFloat(formData.base_salary) || 0;
    const overtime = parseFloat(formData.overtime_amount) || 0;
    const bonus = parseFloat(formData.bonus_amount) || 0;
    const allowances = parseFloat(formData.allowances) || 0;
    const deductions = parseFloat(formData.deductions) || 0;
    const tax = parseFloat(formData.tax_amount) || 0;
    const insurance = parseFloat(formData.insurance_amount) || 0;

    const gross = base + overtime + bonus + allowances;
    const net = gross - deductions - tax - insurance;

    return { gross, net };
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    setFormFieldErrors({});

    try {
      const payload = {
        employee_id: parseInt(formData.employee_id),
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        base_salary: parseFloat(formData.base_salary) || 0,
        overtime_amount: parseFloat(formData.overtime_amount) || 0,
        bonus_amount: parseFloat(formData.bonus_amount) || 0,
        allowances: parseFloat(formData.allowances) || 0,
        deductions: parseFloat(formData.deductions) || 0,
        tax_amount: parseFloat(formData.tax_amount) || 0,
        insurance_amount: parseFloat(formData.insurance_amount) || 0,
        status: formData.status,
        notes: formData.notes,
      };

      if (selectedPayroll?.id) {
        await api.put(`/payrolls/${selectedPayroll.id}`, payload);
      } else {
        await api.post('/payrolls', payload);
      }

      await queryClient.invalidateQueries({ queryKey: ['payrolls'] });
      setShowForm(false);
      setSelectedPayroll(null);
      resetForm();
      setCurrentPage(1);
    } catch (err) {
      if (err.response?.data?.errors) {
        setFormFieldErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        setFormError(err.response.data.message);
      } else {
        setFormError('Failed to save payroll. Please try again.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleApprove = async (payrollId) => {
    try {
      await api.post(`/payrolls/${payrollId}/approve`);
      await queryClient.invalidateQueries({ queryKey: ['payrolls'] });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve payroll');
    }
  };

  const handleMarkAsPaid = async (payrollId) => {
    try {
      await api.post(`/payrolls/${payrollId}/mark-as-paid`, {
        paid_date: new Date().toISOString().split('T')[0],
      });
      await queryClient.invalidateQueries({ queryKey: ['payrolls'] });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark payroll as paid');
    }
  };

  const { gross, net } = calculateTotals();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
          <p className="mt-1 text-gray-500">Manage employee payroll records and processing.</p>
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
              New Payroll
            </button>
          )}
        </div>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-8">
            {['all', 'draft', 'pending', 'approved', 'paid'].map((tab) => (
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
                {tab === 'pending' && pendingCount > 0 && (
                  <span className="bg-yellow-100 text-yellow-600 py-0.5 px-2 rounded-full text-xs">
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
                <th className="px-6 py-4">Period</th>
                <th className="px-6 py-4 text-right">Gross Salary</th>
                <th className="px-6 py-4 text-right">Deductions</th>
                <th className="px-6 py-4 text-right">Net Salary</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payrollsLoading ? (
                 <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      Loading payroll records...
                    </td>
                 </tr>
              ) : paginatedPayrolls.length === 0 ? (
                 <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No {activeTab === 'all' ? '' : activeTab} payroll records found.
                    </td>
                 </tr>
              ) : (
                paginatedPayrolls.map((payroll) => {
                  const statusStyle = getStatusStyle(payroll.status);
                  
                  return (
                    <tr key={payroll.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm">
                            {payroll.employee?.user?.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{payroll.employee?.user?.name || 'Unknown'}</div>
                            <div className="text-sm text-gray-500">{payroll.employee?.position || 'Employee'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-medium">
                          {getMonthName(payroll.month)} {payroll.year}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(payroll.gross_salary)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm text-gray-600">
                          {formatCurrency((payroll.deductions || 0) + (payroll.tax_amount || 0) + (payroll.insurance_amount || 0))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm font-semibold text-green-600">
                          {formatCurrency(payroll.net_salary)}
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
                              {payroll.status === 'draft' && (
                                <button 
                                  onClick={() => handleOpenEdit(payroll)}
                                  className="text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-2"
                                >
                                  <Edit size={14} /> Edit
                                </button>
                              )}
                              {(payroll.status === 'draft' || payroll.status === 'pending') && (
                                <button 
                                  onClick={() => handleApprove(payroll.id)}
                                  className="text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md flex items-center gap-2"
                                >
                                  <CheckCircle size={14} /> Approve
                                </button>
                              )}
                              {payroll.status === 'approved' && (
                                <button 
                                  onClick={() => handleMarkAsPaid(payroll.id)}
                                  className="text-left px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-md flex items-center gap-2"
                                >
                                  <DollarSign size={14} /> Mark Paid
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
        {filteredPayrolls.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{startIdx + 1}</span> to <span className="font-medium">{Math.min(startIdx + ITEMS_PER_PAGE, filteredPayrolls.length)}</span> of <span className="font-medium">{filteredPayrolls.length}</span> records
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
                {selectedPayroll ? 'Edit Payroll' : 'New Payroll'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setSelectedPayroll(null);
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
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Month *
                  </label>
                  <select
                    name="month"
                    value={formData.month}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                      <option key={m} value={m}>{getMonthName(m)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year *
                  </label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleFormChange}
                    min="2000"
                    max="2099"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Salary *
                  </label>
                  <input
                    type="number"
                    name="base_salary"
                    value={formData.base_salary}
                    onChange={handleFormChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {formFieldErrors.base_salary && (
                    <p className="mt-1 text-sm text-red-600">
                      {formFieldErrors.base_salary[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Overtime Amount
                  </label>
                  <input
                    type="number"
                    name="overtime_amount"
                    value={formData.overtime_amount}
                    onChange={handleFormChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bonus Amount
                  </label>
                  <input
                    type="number"
                    name="bonus_amount"
                    value={formData.bonus_amount}
                    onChange={handleFormChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allowances
                  </label>
                  <input
                    type="number"
                    name="allowances"
                    value={formData.allowances}
                    onChange={handleFormChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deductions
                  </label>
                  <input
                    type="number"
                    name="deductions"
                    value={formData.deductions}
                    onChange={handleFormChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Amount
                  </label>
                  <input
                    type="number"
                    name="tax_amount"
                    value={formData.tax_amount}
                    onChange={handleFormChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Insurance Amount
                </label>
                <input
                  type="number"
                  name="insurance_amount"
                  value={formData.insurance_amount}
                  onChange={handleFormChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Gross Salary:</span>
                    <span className="ml-2 font-semibold text-gray-900">{formatCurrency(gross)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Net Salary:</span>
                    <span className="ml-2 font-semibold text-green-600">{formatCurrency(net)}</span>
                  </div>
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
                  placeholder="Additional notes or comments"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedPayroll(null);
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

export default PayrollList;
