import { useEffect, useState } from 'react';
import { Users, UserCheck, Clock, CheckCircle, Calendar, TrendingUp } from 'lucide-react';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats (available to all users)
      const statsRes = await dashboardAPI.getStats();
      setStats(statsRes.data.data);

      // Fetch analytics only for admin and security
      if (user?.role === 'admin' || user?.role === 'security') {
        try {
          const analyticsRes = await dashboardAPI.getAnalytics();
          setAnalytics(analyticsRes.data.data);
        } catch (error) {
          console.error('Error fetching analytics:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Visitors"
          value={stats?.totalVisitors || 0}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Today's Visitors"
          value={stats?.todayVisitors || 0}
          icon={UserCheck}
          color="green"
        />
        <StatCard
          title="Currently Inside"
          value={stats?.currentlyInside || 0}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="Pending Approvals"
          value={stats?.pendingApprovals || 0}
          icon={Calendar}
          color="red"
        />
      </div>

      {/* Charts */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Trend */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Visitor Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="visitors" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Department Distribution */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Visitors by Department</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.visitorsByDepartment?.slice(0, 5)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.department}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.visitorsByDepartment?.slice(0, 5).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {analytics?.recentActivity && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {analytics.recentActivity.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    {activity.entryStatus === 'checked-in' ? (
                      <CheckCircle className="text-green-600" size={20} />
                    ) : (
                      <Clock className="text-gray-600" size={20} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{activity.visitorId?.fullName}</p>
                    <p className="text-sm text-gray-500">{activity.visitorId?.company}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    activity.entryStatus === 'checked-in'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {activity.entryStatus}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.checkInTime).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
