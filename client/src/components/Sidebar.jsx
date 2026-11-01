import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  QrCode,
  Shield,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { user, logout } = useAuth();

  const getMenuItems = () => {
    const commonItems = [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    ];

    if (user?.role === 'admin') {
      return [
        ...commonItems,
        { name: 'Visitors', icon: Users, path: '/visitors' },
        { name: 'Appointments', icon: Calendar, path: '/appointments' },
        { name: 'Passes', icon: QrCode, path: '/passes' },
        { name: 'Staff Management', icon: UserCheck, path: '/staff' },
        { name: 'Reports', icon: Shield, path: '/reports' },
        { name: 'Settings', icon: Settings, path: '/settings' },
      ];
    }

    if (user?.role === 'security') {
      return [
        ...commonItems,
        { name: 'QR Scanner', icon: QrCode, path: '/scanner' },
        { name: 'Expected Visitors', icon: Calendar, path: '/expected-visitors' },
        { name: 'Active Visitors', icon: UserCheck, path: '/active-visitors' },
        { name: 'History', icon: Shield, path: '/visitor-history' },
      ];
    }

    if (user?.role === 'employee') {
      return [
        ...commonItems,
        { name: 'My Appointments', icon: Calendar, path: '/appointments' },
        { name: 'Invite Visitor', icon: Users, path: '/invite-visitor' },
        { name: 'Approvals', icon: UserCheck, path: '/approvals' },
      ];
    }

    return commonItems;
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-40
          transition-all duration-300 ease-in-out
          ${isOpen ? 'w-64' : 'w-0 lg:w-20'}
        `}
      >
        <div className={`flex flex-col h-full ${isOpen ? 'p-6' : 'p-4'}`}>
          {/* Logo */}
          <div className="mb-8">
            <NavLink to="/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <Shield className="text-white" size={24} />
              </div>
              {isOpen && (
                <div>
                  <h1 className="text-xl font-bold text-gray-900">VisitorPass</h1>
                  <p className="text-xs text-gray-500">Smart Management</p>
                </div>
              )}
            </NavLink>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                <item.icon size={20} />
                {isOpen && <span className="font-medium">{item.name}</span>}
              </NavLink>
            ))}
          </nav>

          {/* User info & Logout */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            {isOpen && user && (
              <div className="mb-4 px-4">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
                <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                  user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                  user.role === 'security' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {user.role}
                </span>
              </div>
            )}
            <button
              onClick={logout}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full transition-colors"
            >
              <LogOut size={20} />
              {isOpen && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
