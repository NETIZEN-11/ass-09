import { useEffect, useState } from 'react';
import { Calendar, Clock, User, Building } from 'lucide-react';
import { securityAPI } from '../services/api';
import toast from '../utils/toast';
import LoadingSpinner from '../components/LoadingSpinner';

const ExpectedVisitorsPage = () => {
  const [expectedVisitors, setExpectedVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpectedVisitors();
  }, []);

  const fetchExpectedVisitors = async () => {
    try {
      setLoading(true);
      const response = await securityAPI.getExpectedVisitors();
      setExpectedVisitors(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch expected visitors');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Expected Visitors Today</h1>
        <p className="text-gray-600 mt-1">Approved appointments for today</p>
      </div>

      {expectedVisitors.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No expected visitors today</h3>
          <p className="text-gray-600">There are no approved appointments for today.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {expectedVisitors.map((appointment) => (
            <div key={appointment._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="text-primary-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{appointment.visitorId?.fullName}</h3>
                  <p className="text-sm text-gray-500">{appointment.visitorId?.email}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <Building size={16} className="mr-2" />
                  <span>{appointment.visitorId?.company || 'N/A'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock size={16} className="mr-2" />
                  <span>Expected: {appointment.arrivalTime}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <User size={16} className="mr-2" />
                  <span>Host: {appointment.hostId?.name}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-700">
                  <strong>Purpose:</strong> {appointment.purpose}
                </p>
                {appointment.pass && (
                  <div className="mt-2">
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      Pass Generated: {appointment.pass.passId}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpectedVisitorsPage;
