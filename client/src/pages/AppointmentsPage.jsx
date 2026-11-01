import { useEffect, useState } from 'react';
import { Calendar, Clock, User, CheckCircle, XCircle, Plus } from 'lucide-react';
import { appointmentAPI, passAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from '../utils/toast';
import { formatDate, getStatusColor } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';

const AppointmentsPage = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (filter !== 'all') {
        params.status = filter;
      }
      
      if (user.role === 'employee') {
        params.hostId = user.id;
      }

      const response = await appointmentAPI.getAppointments(params);
      setAppointments(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appointmentId) => {
    try {
      await appointmentAPI.approveAppointment(appointmentId);
      toast.success('Appointment approved successfully');
      
      // Generate pass
      try {
        await passAPI.generatePass(appointmentId);
        toast.success('Visitor pass generated');
      } catch (error) {
        console.error('Pass generation error:', error);
      }
      
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve appointment');
    }
  };

  const handleReject = async (appointmentId) => {
    const reason = prompt('Enter rejection reason (optional):');
    try {
      await appointmentAPI.rejectAppointment(appointmentId, reason);
      toast.success('Appointment rejected');
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject appointment');
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-1">Manage visitor appointments</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex space-x-2">
        {['all', 'pending', 'approved', 'rejected', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {appointments.length === 0 ? (
          <div className="col-span-2 card text-center py-12">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-600">There are no appointments matching your criteria.</p>
          </div>
        ) : (
          appointments.map((appointment) => (
            <div key={appointment._id} className="card hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="text-primary-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{appointment.visitorId?.fullName}</h3>
                    <p className="text-sm text-gray-500">{appointment.visitorId?.company}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <User size={16} className="mr-2" />
                  <span>Host: {appointment.hostId?.name}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar size={16} className="mr-2" />
                  <span>{formatDate(appointment.visitDate)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock size={16} className="mr-2" />
                  <span>{appointment.arrivalTime}</span>
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-4">
                <strong>Purpose:</strong> {appointment.purpose}
              </p>

              {appointment.status === 'pending' && (user.role === 'admin' || appointment.hostId?._id === user.id) && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApprove(appointment._id)}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <CheckCircle size={16} className="mr-2" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(appointment._id)}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                  >
                    <XCircle size={16} className="mr-2" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;
