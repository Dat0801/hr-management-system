import React, { useEffect, useState } from 'react';
import { Users, UserCheck, Clock, FileText, TrendingUp, TrendingDown, ArrowUpRight, Activity } from 'lucide-react';
import api from '../lib/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data.stats);
        setRecentActivity(response.data.recentActivity);
        setDepartments(response.data.departments);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const iconMapping = {
    'Total Employees': { icon: Users, bgColor: 'bg-blue-50', iconColor: 'text-blue-600' },
    'Active Employees': { icon: UserCheck, bgColor: 'bg-green-50', iconColor: 'text-green-600' },
    'Today Attendance': { icon: Clock, bgColor: 'bg-orange-50', iconColor: 'text-orange-600' },
    'Pending Leave Requests': { icon: FileText, bgColor: 'bg-pink-50', iconColor: 'text-pink-600' },
  };

  const departmentColors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600 text-lg">Welcome back! Here's your HR management overview.</p>
        </div>

        {/* Summary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const config = iconMapping[stat.title] || iconMapping['Total Employees'];
            const Icon = config.icon;
            
            return (
              <div
                key={stat.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`${config.bgColor} ${config.iconColor} w-12 h-12 rounded-lg flex items-center justify-center`}>
                    <Icon size={24} strokeWidth={2} />
                  </div>
                  {stat.trend && (
                    <div className="flex items-center gap-1">
                      {stat.trend.type === 'up' ? (
                        <>
                          <TrendingUp size={16} className="text-green-600" />
                          <span className="text-sm font-semibold text-green-600">
                            +{stat.trend.value}%
                          </span>
                        </>
                      ) : stat.trend.type === 'percentage' ? (
                        <span className="text-sm font-semibold text-orange-600">
                          {stat.trend.value}%
                        </span>
                      ) : (
                        <>
                          <TrendingDown size={16} className="text-pink-600" />
                          <span className="text-sm font-semibold text-pink-600">
                            -{stat.trend.value}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">
                  {stat.title}
                </p>
                <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
              </div>
            );
          })}
        </div>

        {/* Content Grid - 2 Columns on Desktop */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Recent Activity - Takes 2 columns */}
          <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                  <Activity size={20} className="text-primary-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              </div>
              <button className="flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                View All
                <ArrowUpRight size={16} />
              </button>
            </div>

            {/* Activity List */}
            <div className="space-y-1">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between py-4 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {activity.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{activity.name}</p>
                        <p className="text-sm text-gray-600">{activity.action}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                          activity.status === 'success' || activity.status === 'approved'
                            ? 'bg-green-100 text-green-600'
                            : activity.status === 'pending'
                            ? 'bg-orange-100 text-orange-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {activity.status === 'success' || activity.status === 'approved' ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </span>
                      <p className="text-sm text-gray-500 font-medium min-w-[80px] text-right">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">No recent activity</div>
              )}
            </div>
          </div>

          {/* Department Overview - Takes 1 column */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Users size={20} className="text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Departments</h2>
            </div>

            {/* Department List */}
            <div className="space-y-3">
              {departments.length > 0 ? (
                departments.map((dept, index) => (
                  <div key={index} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{dept.name}</span>
                      <span className="text-lg font-bold text-gray-900">{dept.count}</span>
                    </div>
                    <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`absolute top-0 left-0 h-full ${departmentColors[index % departmentColors.length]} rounded-full transition-all duration-500 group-hover:opacity-80`}
                        style={{ width: `${(dept.count / (stats.find(s => s.title === 'Total Employees')?.value || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">No departments found</div>
              )}
            </div>

            {/* Department Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 font-medium">Total Departments</span>
                <span className="font-bold text-gray-900">{departments.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
