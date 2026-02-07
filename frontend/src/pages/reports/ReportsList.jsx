import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, FileText, TrendingUp, Users, DollarSign, Calendar, Clock, Award, RefreshCw } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import api from '../../lib/api';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const ReportsList = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    document.title = 'Reports & Analytics | HR Management';
  }, []);

  // Dashboard Reports
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['reports', 'dashboard'],
    queryFn: async () => {
      const res = await api.get('/reports/dashboard');
      return res.data?.data || {};
    },
  });

  // Employee Analytics
  const { data: employeeData, isLoading: employeeLoading } = useQuery({
    queryKey: ['reports', 'employees'],
    queryFn: async () => {
      const res = await api.get('/reports/employees');
      return res.data?.data || {};
    },
  });

  // Salary Analytics
  const { data: salaryData, isLoading: salaryLoading } = useQuery({
    queryKey: ['reports', 'salary', selectedYear],
    queryFn: async () => {
      const res = await api.get(`/reports/salary?year=${selectedYear}`);
      return res.data?.data || {};
    },
  });

  // Leave Analytics
  const { data: leaveData, isLoading: leaveLoading } = useQuery({
    queryKey: ['reports', 'leave', selectedYear],
    queryFn: async () => {
      const res = await api.get(`/reports/leave?year=${selectedYear}`);
      return res.data?.data || {};
    },
  });

  // Attendance Analytics
  const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
    queryKey: ['reports', 'attendance', selectedYear],
    queryFn: async () => {
      const res = await api.get(`/reports/attendance?year=${selectedYear}`);
      return res.data?.data || {};
    },
  });

  // Performance Analytics
  const { data: performanceData, isLoading: performanceLoading } = useQuery({
    queryKey: ['reports', 'performance', selectedYear],
    queryFn: async () => {
      const res = await api.get(`/reports/performance?year=${selectedYear}`);
      return res.data?.data || {};
    },
  });

  // Turnover Analytics
  const { data: turnoverData, isLoading: turnoverLoading } = useQuery({
    queryKey: ['reports', 'turnover'],
    queryFn: async () => {
      const res = await api.get('/reports/turnover');
      return res.data?.data || {};
    },
  });

  // Comprehensive Report
  const { data: comprehensiveData, isLoading: comprehensiveLoading } = useQuery({
    queryKey: ['reports', 'comprehensive', selectedYear],
    queryFn: async () => {
      const res = await api.get(`/reports/comprehensive?year=${selectedYear}`);
      return res.data?.data || {};
    },
  });

  const handleExport = async (reportType) => {
    try {
      const res = await api.post('/reports/export', {
        report_type: reportType,
        year: selectedYear,
      });
      
      // Create download link
      const dataStr = JSON.stringify(res.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}_report_${selectedYear}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export report');
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: FileText },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'salary', label: 'Salary', icon: DollarSign },
    { id: 'leave', label: 'Leave', icon: Calendar },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'performance', label: 'Performance', icon: Award },
    { id: 'turnover', label: 'Turnover', icon: TrendingUp },
    { id: 'comprehensive', label: 'Comprehensive', icon: FileText },
  ];

  const renderDashboardReport = () => {
    if (dashboardLoading) return <div className="text-center py-12 text-gray-500">Loading dashboard report...</div>;
    if (!dashboardData) return <div className="text-center py-12 text-gray-500">No data available</div>;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dashboardData.stats?.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-sm text-gray-500 mb-1">{stat.title}</div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              {stat.trend && (
                <div className={`text-sm mt-1 ${stat.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trend > 0 ? '+' : ''}{stat.trend}%
                </div>
              )}
            </div>
          ))}
        </div>
        {dashboardData.departments && dashboardData.departments.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Department Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData.departments}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {dashboardData.departments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  const renderEmployeeReport = () => {
    if (employeeLoading) return <div className="text-center py-12 text-gray-500">Loading employee analytics...</div>;
    if (!employeeData) return <div className="text-center py-12 text-gray-500">No data available</div>;

    return (
      <div className="space-y-6">
        {employeeData.department_distribution && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Department Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={employeeData.department_distribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {employeeData.hiring_trends && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Hiring Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={employeeData.hiring_trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="hired" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  const renderSalaryReport = () => {
    if (salaryLoading) return <div className="text-center py-12 text-gray-500">Loading salary analytics...</div>;
    if (!salaryData) return <div className="text-center py-12 text-gray-500">No data available</div>;

    return (
      <div className="space-y-6">
        {salaryData.monthly_salary && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Monthly Salary Distribution ({selectedYear})</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salaryData.monthly_salary}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="average" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {salaryData.department_salary && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Salary by Department</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salaryData.department_salary}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="average" fill="#3b82f6" />
                <Bar dataKey="total" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  const renderLeaveReport = () => {
    if (leaveLoading) return <div className="text-center py-12 text-gray-500">Loading leave analytics...</div>;
    if (!leaveData) return <div className="text-center py-12 text-gray-500">No data available</div>;

    return (
      <div className="space-y-6">
        {leaveData.leave_by_type && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Leave by Type ({selectedYear})</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={leaveData.leave_by_type}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {leaveData.leave_by_type.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        {leaveData.monthly_leave && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Monthly Leave Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={leaveData.monthly_leave}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="approved" stackId="1" stroke="#10b981" fill="#10b981" />
                <Area type="monotone" dataKey="pending" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  const renderAttendanceReport = () => {
    if (attendanceLoading) return <div className="text-center py-12 text-gray-500">Loading attendance analytics...</div>;
    if (!attendanceData) return <div className="text-center py-12 text-gray-500">No data available</div>;

    return (
      <div className="space-y-6">
        {attendanceData.monthly_attendance && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Monthly Attendance Rate ({selectedYear})</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceData.monthly_attendance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {attendanceData.attendance_by_status && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Attendance by Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData.attendance_by_status}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  const renderPerformanceReport = () => {
    if (performanceLoading) return <div className="text-center py-12 text-gray-500">Loading performance analytics...</div>;
    if (!performanceData) return <div className="text-center py-12 text-gray-500">No data available</div>;

    return (
      <div className="space-y-6">
        {performanceData.average_ratings && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Average Ratings by Category ({selectedYear})</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData.average_ratings}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="average" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {performanceData.rating_distribution && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Rating Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={performanceData.rating_distribution}
                  dataKey="count"
                  nameKey="rating"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {performanceData.rating_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  const renderTurnoverReport = () => {
    if (turnoverLoading) return <div className="text-center py-12 text-gray-500">Loading turnover analytics...</div>;
    if (!turnoverData) return <div className="text-center py-12 text-gray-500">No data available</div>;

    return (
      <div className="space-y-6">
        {turnoverData.monthly_turnover && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Monthly Turnover Rate</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={turnoverData.monthly_turnover}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="rate" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {turnoverData.department_turnover && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Turnover by Department</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={turnoverData.department_turnover}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="rate" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  const renderComprehensiveReport = () => {
    if (comprehensiveLoading) return <div className="text-center py-12 text-gray-500">Loading comprehensive report...</div>;
    if (!comprehensiveData) return <div className="text-center py-12 text-gray-500">No data available</div>;

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Comprehensive Annual Report ({selectedYear})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {comprehensiveData.summary && Object.entries(comprehensiveData.summary).map(([key, value]) => (
              <div key={key} className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">{key.replace(/_/g, ' ').toUpperCase()}</div>
                <div className="text-xl font-bold text-gray-900">{value}</div>
              </div>
            ))}
          </div>
        </div>
        {comprehensiveData.trends && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Key Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={comprehensiveData.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                {comprehensiveData.trends[0] && Object.keys(comprehensiveData.trends[0]).filter(k => k !== 'period').map((key, idx) => (
                  <Line key={key} type="monotone" dataKey={key} stroke={COLORS[idx % COLORS.length]} strokeWidth={2} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return renderDashboardReport();
      case 'employees':
        return renderEmployeeReport();
      case 'salary':
        return renderSalaryReport();
      case 'leave':
        return renderLeaveReport();
      case 'attendance':
        return renderAttendanceReport();
      case 'performance':
        return renderPerformanceReport();
      case 'turnover':
        return renderTurnoverReport();
      case 'comprehensive':
        return renderComprehensiveReport();
      default:
        return <div>Select a report type</div>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="mt-1 text-gray-500">Comprehensive insights and analytics for your HR data.</p>
        </div>
        <div className="flex gap-3 items-center">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button 
            onClick={() => handleExport(activeTab)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Download size={20} />
            Export Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ReportsList;
