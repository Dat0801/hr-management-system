import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, MoreVertical, Users, Briefcase, Search, UserPlus, Eye } from 'lucide-react';
import api from '../../lib/api';
import DepartmentForm from './DepartmentForm';
import { useAuth } from '../../store/auth';

// Mock data helpers
const COLORS = [
  'bg-blue-600',
  'bg-pink-600',
  'bg-amber-600',
  'bg-emerald-500',
  'bg-red-700',
  'bg-cyan-600',
  'bg-purple-600',
  'bg-indigo-600',
];

const MOCK_MANAGERS = [
  { name: 'Alice Johnson', avatar: 'https://i.pravatar.cc/150?u=1' },
  { name: 'Bob Smith', avatar: 'https://i.pravatar.cc/150?u=2' },
  { name: 'Clara Doe', avatar: 'https://i.pravatar.cc/150?u=3' },
  { name: 'David Wilson', avatar: 'https://i.pravatar.cc/150?u=4' },
  { name: 'Eve Brown', avatar: 'https://i.pravatar.cc/150?u=5' },
  { name: 'Frank Wright', avatar: 'https://i.pravatar.cc/150?u=6' },
];

export default function DepartmentList() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const queryClient = useQueryClient();

  const { data: departmentsData, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await api.get('/departments');
      const payload = res.data;
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      return [];
    },
  });

  const rawDepartments = Array.isArray(departmentsData) ? departmentsData : [];
  
  // Enhance departments with mock data for UI visualization
  const departments = rawDepartments.map((dept, index) => ({
    ...dept,
    color: COLORS[index % COLORS.length],
    manager: MOCK_MANAGERS[index % MOCK_MANAGERS.length],
    employeeCount: dept.employees_count ?? dept.employees?.length ?? Math.floor(Math.random() * 50) + 5, // Mock if missing
  }));

  const filteredDepartments = departments.filter(dept => 
    dept.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateClick = () => {
    setSelectedDepartment(null);
    setShowForm(true);
  };

  const handleEditClick = (department) => {
    setSelectedDepartment(department);
    setShowForm(true);
  };

  const handleDeleteClick = (department) => {
    setDeleteConfirm(department);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    if (user?.role !== 'admin') {
      setDeleteConfirm(null);
      return;
    }
    try {
      await api.delete(`/departments/${deleteConfirm.id}`);
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete department:', err);
    }
  };

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['departments'] });
    setShowForm(false);
  };

  // Stats
  const totalDepartments = departments.length || 12; // Fallback to 12 if empty for visual
  const unassignedEmployees = 4; // Mock
  const openPositions = 8; // Mock

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Department Management</h1>
          <p className="text-gray-500 mt-1">Manage your organization's structure, leadership, and team allocations.</p>
        </div>
        <div className="flex items-center gap-4">
           {/* Search Bar - Visual only for now matching image placement idea */}
           <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search departments..." 
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {(user?.role === 'admin' || user?.role === 'hr') && (
            <button
              onClick={handleCreateClick}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={20} />
              Create New Department
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Briefcase size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Departments</p>
            <h3 className="text-3xl font-bold text-gray-900">{totalDepartments}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
            <UserPlus size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Unassigned Employees</p>
            <h3 className="text-3xl font-bold text-gray-900">{unassignedEmployees}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Open Positions</p>
            <h3 className="text-3xl font-bold text-gray-900">{openPositions}</h3>
          </div>
        </div>
      </div>

      {/* Department Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {filteredDepartments.map((dept) => (
          <div key={dept.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            {/* Color Top */}
            <div className={`h-24 ${dept.color} w-full relative`}></div>
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-900 truncate" title={dept.name}>{dept.name}</h3>
                <div className="relative">
                  <button 
                    onClick={() => setOpenMenuId(openMenuId === dept.id ? null : dept.id)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50"
                  >
                    <MoreVertical size={20} />
                  </button>
                  {openMenuId === dept.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-100 py-1">
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => {
                            handleDeleteClick(dept);
                            setOpenMenuId(null);
                          }}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={16} className="mr-2" />
                          Delete Department
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                  dept.color.replace('bg-', 'bg-').replace('600', '50').replace('500', '50').replace('700', '50') + ' ' + 
                  dept.color.replace('bg-', 'text-')
                }`}>
                  {dept.employeeCount} Employees
                </span>
              </div>

              <div className="mt-auto">
                <div className="flex items-center gap-3 mb-4">
                  <img 
                    src={dept.manager.avatar} 
                    alt={dept.manager.name} 
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">MANAGER</p>
                    <p className="text-sm font-medium text-gray-900">{dept.manager.name}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {(user?.role === 'admin' || user?.role === 'hr') && (
                    <button 
                      onClick={() => handleEditClick(dept)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                  )}
                   <button 
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Eye size={16} />
                      View
                    </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add Department Card */}
        {(user?.role === 'admin' || user?.role === 'hr') && (
          <button 
            onClick={handleCreateClick}
            className="min-h-[300px] bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all flex flex-col items-center justify-center p-6 text-center group"
          >
            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus size={32} className="text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Add Department</h3>
            <p className="text-sm text-gray-500">Create a new organizational unit</p>
          </button>
        )}
      </div>

      {/* Pagination (Visual) */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-6">
        <p className="text-sm text-gray-500">
          Showing <span className="font-medium">{filteredDepartments.length}</span> of <span className="font-medium">{departments.length || 12}</span> departments
        </p>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            Previous
          </button>
          <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            Next
          </button>
        </div>
      </div>
      
      <div className="text-center mt-12 pb-6 text-gray-400 text-sm">
        &copy; 2024 HR Admin System. All rights reserved.
      </div>

      <DepartmentForm
        isOpen={showForm}
        department={selectedDepartment}
        onClose={() => {
          setShowForm(false);
          setSelectedDepartment(null);
        }}
        onSuccess={handleFormSuccess}
      />

      {deleteConfirm && (
        <div className="fixed inset-0 m-0 bg-black bg-opacity-50 flex items-center justify-center z-[300] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Department</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
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
}
