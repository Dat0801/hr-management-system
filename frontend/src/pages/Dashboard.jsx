import React, { useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Clock, 
  Calendar, 
  MoreVertical, 
  Filter, 
  Download,
  ArrowUp,
  AlertCircle,
  Cake,
  LogIn,
  FileText,
  UserPlus
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

const Dashboard = () => {
  useEffect(() => {
    document.title = 'Dashboard | HR Console';
  }, []);

  // Mock data to match the design image
  const chartData = [
    { name: 'JAN', value: 30 },
    { name: 'FEB', value: 45 },
    { name: 'MAR', value: 35 },
    { name: 'APR', value: 50 },
    { name: 'MAY', value: 40 },
    { name: 'JUN', value: 25 },
    { name: 'JUL', value: 65 },
    { name: 'AUG', value: 35 },
    { name: 'SEP', value: 55 },
  ];

  const activities = [
    {
      id: 1,
      user: 'Marcus Wu',
      action: 'Clocked in at 08:55 AM',
      time: '2 MINS AGO',
      type: 'clock-in',
      icon: LogIn,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 2,
      user: 'Sarah Jenkins',
      action: 'Applied for Sick Leave (2 Days)',
      time: '45 MINS AGO',
      type: 'leave',
      icon: FileText,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      id: 3,
      user: 'Liam Wilson',
      action: 'Birthday celebration tomorrow',
      time: '2 HOURS AGO',
      type: 'birthday',
      icon: Cake,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 4,
      user: 'Julia Song',
      action: 'Onboarding completed',
      time: '5 HOURS AGO',
      type: 'new-hire',
      icon: UserPlus,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ];

  const employees = [
    {
      id: 1,
      name: 'Olivia Chen',
      department: 'Product Design',
      status: 'Active',
      lastActivity: '10:45 AM Today',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    {
      id: 2,
      name: 'Robert Fox',
      department: 'Engineering',
      status: 'On Leave',
      lastActivity: 'Yesterday',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    {
      id: 3,
      name: 'Arlene McCoy',
      department: 'Marketing',
      status: 'Active',
      lastActivity: '09:15 AM Today',
      avatar: 'https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {/* Total Employees */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Employees</h3>
            <div className="bg-blue-50 p-2 rounded-lg">
              <Users size={20} className="text-blue-600" />
            </div>
          </div>
          <div className="mb-2">
            <span className="text-3xl font-bold text-gray-900">1,248</span>
          </div>
          <div className="flex items-center text-sm">
            <ArrowUp size={16} className="text-green-500 mr-1" />
            <span className="text-green-500 font-medium">+2.5%</span>
            <span className="text-gray-400 ml-1">from last month</span>
          </div>
        </div>

        {/* Present Today */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Present Today</h3>
            <div className="bg-green-50 p-2 rounded-lg">
              <UserCheck size={20} className="text-green-600" />
            </div>
          </div>
          <div className="mb-4">
            <span className="text-3xl font-bold text-gray-900">1,120</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '90%' }}></div>
          </div>
          <p className="text-xs text-gray-400">90% attendance rate</p>
        </div>

        {/* Pending Leaves */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Pending Leaves</h3>
            <div className="bg-orange-50 p-2 rounded-lg">
              <Calendar size={20} className="text-orange-600" />
            </div>
          </div>
          <div className="mb-2">
            <span className="text-3xl font-bold text-gray-900">15</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-orange-500 font-medium">Requires immediate action</span>
          </div>
        </div>

        {/* Upcoming Birthdays */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Upcoming Birthdays</h3>
            <div className="bg-purple-50 p-2 rounded-lg">
              <Cake size={20} className="text-purple-600" />
            </div>
          </div>
          <div className="mb-2">
            <span className="text-3xl font-bold text-gray-900">4</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-gray-400">Next 7 days</span>
          </div>
        </div>
      </div>

      {/* Charts & Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Monthly Attendance Trends</h3>
              <p className="text-sm text-gray-500">Year-over-year performance visualization</p>
            </div>
            <div className="flex items-center gap-2">
              <ArrowUp size={16} className="text-green-500" />
              <span className="text-green-500 font-bold">94.2%</span>
              <span className="text-gray-400 text-sm">avg</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: 'none', 
                    borderRadius: '8px', 
                    color: 'white' 
                  }}
                  itemStyle={{ color: 'white' }}
                  cursor={{ stroke: '#e5e7eb', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#2563eb" 
                  strokeWidth={3} 
                  dot={false} 
                  activeDot={{ r: 6, fill: '#2563eb', stroke: 'white', strokeWidth: 2 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Activity Log</h3>
            <button className="text-blue-600 text-sm font-medium hover:underline">View All</button>
          </div>
          <div className="space-y-6">
            {activities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className={`${activity.bgColor} p-2 rounded-lg shrink-0`}>
                    <Icon size={18} className={activity.iconColor} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{activity.user}</p>
                    <p className="text-xs text-gray-500 mb-1">{activity.action}</p>
                    <p className="text-[10px] text-gray-400 font-medium uppercase">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Employee Activity Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h3 className="text-lg font-bold text-gray-900">Recent Employee Activity</h3>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
              <Filter size={16} />
              Filters
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Employee</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Department</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Last Activity</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img src={employee.avatar} alt={employee.name} className="w-10 h-10 rounded-full object-cover" />
                      <span className="font-semibold text-gray-900">{employee.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{employee.department}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${employee.status === 'Active' ? 'bg-green-100 text-green-800' : 
                        employee.status === 'On Leave' ? 'bg-orange-100 text-orange-800' : 
                        'bg-gray-100 text-gray-800'}`}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{employee.lastActivity}</td>
                  <td className="py-4 px-4 text-right">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
