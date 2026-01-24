import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays,
  Clock,
  UserCircle,
  Plus,
  Edit,
  Trash2,
  Filter,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Search,
  ArrowRight,
  User
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../store/auth';

const ITEMS_PER_PAGE = 10;

const CalendarWidget = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className="font-semibold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button 
          onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {['S','M','T','W','T','F','S'].map(d => (
          <div key={d} className="text-gray-400 font-medium py-1">{d}</div>
        ))}
        {blanks.map(i => <div key={`blank-${i}`} />)}
        {days.map(d => (
          <div 
            key={d} 
            className={`py-1 rounded-full cursor-pointer hover:bg-blue-50 ${
              d === new Date().getDate() && 
              currentDate.getMonth() === new Date().getMonth() && 
              currentDate.getFullYear() === new Date().getFullYear()
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'text-gray-700'
            }`}
          >
            {d}
          </div>
        ))}
      </div>
    </div>
  );
};

const Attendance = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Filters
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    date: '',
    check_in: '',
    check_out: '',
    status: 'present',
    notes: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formFieldErrors, setFormFieldErrors] = useState({});

  useEffect(() => {
    document.title = 'Attendance | HR Management';
  }, []);

  // Queries
  const { data: employeesData } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const res = await api.get('/employees');
      return Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
    },
  });

  const { data: departmentsData } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await api.get('/departments');
      return Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
    },
  });

  const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
    queryKey: ['attendances'],
    queryFn: async () => {
      const res = await api.get('/attendances', { params: { per_page: 100 } });
      return Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
    },
  });

  // Derived Data
  const employees = useMemo(() => employeesData || [], [employeesData]);
  const departments = useMemo(() => departmentsData || [], [departmentsData]);
  const attendances = useMemo(() => attendanceData || [], [attendanceData]);

  const employeeOptions = useMemo(
    () =>
      employees.map((emp) => ({
        id: emp.id,
        name: emp.user?.name || `Employee #${emp.id}`,
        department: emp.department?.name,
        avatar: emp.user?.name?.charAt(0) || 'U'
      })),
    [employees]
  );

  // Stats Calculation
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = attendances.filter(a => a.date?.startsWith(today));
    
    return {
      present: todayRecords.filter(a => a.status === 'present').length,
      late: todayRecords.filter(a => a.status === 'late').length,
      onLeave: todayRecords.filter(a => a.status === 'half_day').length, // Using half_day as proxy for leave
      noShow: todayRecords.filter(a => a.status === 'absent').length,
      total: employees.length
    };
  }, [attendances, employees]);

  // Filtering
  const filteredAttendances = useMemo(() => {
    let list = attendances;

    if (employeeFilter) {
      list = list.filter((item) => item.employee_id === parseInt(employeeFilter));
    }

    if (departmentFilter) {
      const deptEmployees = employees
        .filter(e => e.department_id === parseInt(departmentFilter))
        .map(e => e.id);
      list = list.filter(item => deptEmployees.includes(item.employee_id));
    }

    if (statusFilter) {
      list = list.filter((item) => item.status === statusFilter);
    }

    return list;
  }, [attendances, employees, employeeFilter, departmentFilter, statusFilter]);

  const totalPages = Math.ceil(filteredAttendances.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAttendances = filteredAttendances.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  // Helpers
  const getEmployeeDetails = (employeeId) => {
    return employees.find((e) => e.id === employeeId);
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return '-';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = endDate - startDate;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return 'Pending';
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Handlers
  const handleOpenCreate = () => {
    setSelectedAttendance(null);
    setFormData({
      employee_id: '',
      date: new Date().toISOString().split('T')[0],
      check_in: '',
      check_out: '',
      status: 'present',
      notes: '',
    });
    setFormError('');
    setFormFieldErrors({});
    setShowForm(true);
  };

  const handleOpenEdit = (attendance) => {
    setSelectedAttendance(attendance);
    setFormData({
      employee_id: String(attendance.employee_id || ''),
      date: attendance.date ? String(attendance.date).slice(0, 10) : '',
      check_in: attendance.check_in ? attendance.check_in.slice(0, 16) : '',
      check_out: attendance.check_out ? attendance.check_out.slice(0, 16) : '',
      status: attendance.status || 'present',
      notes: attendance.notes || '',
    });
    setFormError('');
    setFormFieldErrors({});
    setShowForm(true);
  };

  const handleDeleteClick = (attendance) => {
    setDeleteConfirm(attendance);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await api.delete(`/attendances/${deleteConfirm.id}`);
      await queryClient.invalidateQueries({ queryKey: ['attendances'] });
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete attendance:', err);
      alert('Failed to delete attendance record');
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
        date: formData.date,
        check_in: formData.check_in || null,
        check_out: formData.check_out || null,
        status: formData.status,
        notes: formData.notes || null,
      };

      if (selectedAttendance?.id) {
        await api.put(`/attendances/${selectedAttendance.id}`, payload);
      } else {
        await api.post('/attendances', payload);
      }

      await queryClient.invalidateQueries({ queryKey: ['attendances'] });
      setShowForm(false);
      setSelectedAttendance(null);
      resetForm();
      setCurrentPage(1);
    } catch (err) {
      if (err.response?.data?.errors) {
        setFormFieldErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        setFormError(err.response.data.message);
      } else {
        setFormError('Failed to save attendance. Please try again.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: '',
      date: '',
      check_in: '',
      check_out: '',
      status: 'present',
      notes: '',
    });
    setFormError('');
    setFormFieldErrors({});
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // UI Components
  const StatusBadge = ({ status }) => {
    const styles = {
      present: 'bg-green-100 text-green-700',
      late: 'bg-yellow-100 text-yellow-700',
      absent: 'bg-red-100 text-red-700',
      half_day: 'bg-blue-100 text-blue-700',
    };
    
    const labels = {
      present: 'On Time',
      late: 'Late',
      absent: 'Absent',
      half_day: 'On Leave',
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles.present}`}>
        <div className={`w-1.5 h-1.5 rounded-full mr-2 bg-current`} />
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Daily Attendance Logs</h1>
          <p className="text-gray-500 mt-1">Real-time monitoring of employee check-in and out times.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
            <Download size={18} />
            Export CSV
          </button>
          {(user?.role === 'admin' || user?.role === 'hr') && (
            <button 
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              Manual Entry
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-blue-600">Present Today</p>
            <CheckCircle2 className="text-green-500" size={20} />
          </div>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold text-gray-900">{stats.present}/{employees.length}</h3>
            <span className="text-xs font-medium text-green-600 mb-1">+2% from yesterday</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-blue-600">Late Arrivals</p>
            <Clock className="text-yellow-500" size={20} />
          </div>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold text-gray-900">{stats.late}</h3>
            <span className="text-xs font-medium text-red-600 mb-1">+3 more than usual</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-blue-600">On Leave</p>
            <CalendarIcon className="text-blue-500" size={20} />
          </div>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold text-gray-900">{stats.onLeave}</h3>
            <span className="text-xs font-medium text-gray-500 mb-1">Planned absences</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-blue-600">No Show</p>
            <AlertCircle className="text-red-500" size={20} />
          </div>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold text-gray-900">{stats.noShow}</h3>
            <span className="text-xs font-medium text-red-600 mb-1">-5% recovery</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="lg:w-72 flex-shrink-0">
          <CalendarWidget />
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Quick Filters</h3>
            </div>
            <div className="p-2">
              <button 
                onClick={() => setStatusFilter('')}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${!statusFilter ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <span className="font-medium">All Records</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${!statusFilter ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  {attendances.length}
                </span>
              </button>
              
              <button 
                onClick={() => setStatusFilter('present')}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${statusFilter === 'present' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <span className="font-medium">On Time</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${statusFilter === 'present' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  {attendances.filter(a => a.status === 'present').length}
                </span>
              </button>

              <button 
                onClick={() => setStatusFilter('late')}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${statusFilter === 'late' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <span className="font-medium">Late Arrivals</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${statusFilter === 'late' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  {attendances.filter(a => a.status === 'late').length}
                </span>
              </button>

              <button 
                onClick={() => setStatusFilter('absent')}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${statusFilter === 'absent' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <span className="font-medium">Absentees</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${statusFilter === 'absent' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  {attendances.filter(a => a.status === 'absent').length}
                </span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-[600px]">
          {/* Table Header / Filters */}
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={departmentFilter}
                  onChange={(e) => {
                    setDepartmentFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronRight className="rotate-90 text-gray-400" size={14} />
                </div>
              </div>

              <div className="relative">
                <select
                  className="pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="">All Shifts</option>
                  <option value="morning">Morning Shift</option>
                  <option value="evening">Evening Shift</option>
                </select>
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronRight className="rotate-90 text-gray-400" size={14} />
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              Showing <span className="font-bold text-gray-900">{paginatedAttendances.length}</span> of {filteredAttendances.length} records
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Employee</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Check-In</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Check-Out</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Total Hours</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-blue-900 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendanceLoading ? (
                   <tr>
                    <td colSpan="6" className="px-4 py-10 text-center text-gray-500">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    </td>
                  </tr>
                ) : paginatedAttendances.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-10 text-center text-gray-500">
                      No records found
                    </td>
                  </tr>
                ) : (
                  paginatedAttendances.map((item) => {
                    const emp = getEmployeeDetails(item.employee_id);
                    return (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {emp?.user?.avatar ? (
                              <img src={emp.user.avatar} alt="" className="w-10 h-10 rounded-full" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                {emp?.user?.name?.charAt(0) || 'U'}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-gray-900">{emp?.user?.name || `Employee #${item.employee_id}`}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>ID: #{item.employee_id}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                <span>{emp?.department?.name || 'General'}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {item.check_in ? (
                              <>
                                <ArrowRight size={14} className="text-green-500" />
                                <span className="font-medium text-gray-900">{formatTime(item.check_in)}</span>
                              </>
                            ) : (
                              <span className="text-gray-400 italic">None</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                           <div className="flex items-center gap-2">
                            {item.check_out ? (
                              <>
                                <ArrowRight size={14} className="text-red-500" />
                                <span className="font-medium text-gray-900">{formatTime(item.check_out)}</span>
                              </>
                            ) : (
                              <span className="text-gray-400 italic">Pending</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {calculateDuration(item.check_in, item.check_out)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                             {(user?.role === 'admin' || user?.role === 'hr') && (
                              <button 
                                onClick={() => handleOpenEdit(item)}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <MoreVertical size={16} />
                              </button>
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
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modal and Confirm Dialog (Keep as is just unstyled or styled similarly) */}
      {showForm && (
        <div className="fixed inset-0 m-0 bg-black bg-opacity-50 flex items-center justify-center z-[300] p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedAttendance ? 'Edit Attendance' : 'Manual Entry'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setSelectedAttendance(null);
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
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {formFieldErrors.date && (
                  <p className="mt-1 text-sm text-red-600">{formFieldErrors.date[0]}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check In
                  </label>
                  <input
                    type="datetime-local"
                    name="check_in"
                    value={formData.check_in}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formFieldErrors.check_in && (
                    <p className="mt-1 text-sm text-red-600">
                      {formFieldErrors.check_in[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check Out
                  </label>
                  <input
                    type="datetime-local"
                    name="check_out"
                    value={formData.check_out}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formFieldErrors.check_out && (
                    <p className="mt-1 text-sm text-red-600">
                      {formFieldErrors.check_out[0]}
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
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="half_day">Half Day</option>
                </select>
                {formFieldErrors.status && (
                  <p className="mt-1 text-sm text-red-600">{formFieldErrors.status[0]}</p>
                )}
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
                  placeholder="Optional notes about this attendance"
                />
                {formFieldErrors.notes && (
                  <p className="mt-1 text-sm text-red-600">{formFieldErrors.notes[0]}</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedAttendance(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {formLoading ? 'Saving...' : selectedAttendance ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 m-0 bg-black bg-opacity-50 flex items-center justify-center z-[300] p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Attendance</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this record? This action cannot be undone.
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
};

export default Attendance;
