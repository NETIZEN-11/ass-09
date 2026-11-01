import { useEffect, useState } from 'react';
import { UserCheck, LogOut, Clock } from 'lucide-react';
import { securityAPI } from '../services/api';
import toast from '../utils/toast';
import { formatDateTime } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';

const ActiveVisitorsPage = () => {
  const [activeVisitors, setActiveVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveVisitors();
    const interval = setInterval(fetchActiveVisitors, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchActiveVisitors = async () => {
    try {
      setLoading(true);
      const response = await securityAPI.getActiveVisitors();
      setActiveVisitors(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch active visitors');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (checkLogId) => {
    try {
      await securityAPI.checkOut({ checkLogId });
      toast.success('Visitor checked out successfully');
      fetchActiveVisitors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-out failed');
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Active Visitors</h1>
          <p className="text-gray-600 mt-1">Visitors currently inside the premises</p>
        </div>
        <div className="bg-primary-100 text-primary-800 px-6 py-3 rounded-lg">
          <div className="text-sm font-medium">Currently Inside</div>
          <div className="text-3xl font-bold">{activeVisitors.length}</div>
        </div>
      </div>

      {activeVisitors.length === 0 ? (
        <div className="card text-center py-12">
          <UserCheck className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No active visitors</h3>
          <p className="text-gray-600">All visitors have checked out.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeVisitors.map((log) => (
            <div key={log._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <UserCheck className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{log.visitorId?.fullName}</h3>
                    <p className="text-sm text-gray-500">{log.visitorId?.company}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <Clock size={16} className="mr-2" />
                  <span>Checked in: {formatDateTime(log.checkInTime)}</span>
                </div>
                {log.securityUserId && (
                  <div className="text-gray-600">
                    <span>By: {log.securityUserId.name}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleCheckOut(log._id)}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <LogOut size={16} className="mr-2" />
                Check Out
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveVisitorsPage;
