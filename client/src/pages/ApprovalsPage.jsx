import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, User, Calendar, Clock, Building } from 'lucide-react';
import { appointmentAPI, passAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from '../utils/toast';
import { formatDate, getStatusColor } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';

const ApprovalsPage = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = {
        hostId: user.id,
        status: filter,
      };

      const response = await appointmentAPI.getAppointments(params);
      setAppointments(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch appointments');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appointmentId) => {
    setProcessingId(appointmentId);
    try {
      await appointmentAPI.approveAppointment(appointmentId);
      toast.success('Appointment approved successfully!');
      
      // Generate pass automatically
      try {
        await passAPI.generatePass(appointmentId);
        toast.success('Visitor pass generated!');
      } catch (error) {
        console.error('Pass generation error:', error);
        toast.error('Appointment approved but pass generation failed');
      }
      
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve appointment');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (appointmentId) => {
    const reason = prompt('Enter rejection reason (optional):');
    if (reason === null) return; // User cancelled

    setProcessingId(appointmentId);
    try {
      await appointmentAPI.rejectAppointment(appointmentId, reason);
      toast.success('Appointment rejected');
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject appointment');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const pendingCount = appointments.filter(apt => apt.status === 'pending').length;
  const approvedCount = appointments.filter(apt => apt.status === 'approved').length;
  const rejectedCount = appointments.filter(apt => apt.status === 'rejected').length;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Appointment Approvals</h1>
        <p className="text-gray-600 mt-1">Review and approve visitor appointment requests</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Approval</p>
              <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Clock className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Approved</p>
              <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Rejected</p>
              <p className="text-3xl font-bold text-red-600">{rejectedCount}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
              <XCircle className="text-red-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex space-x-2">
        {['pending', 'approved', 'rejected', 'all'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status === 'all' ? '' : status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === (status === 'all' ? '' : status)
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status === 'pending' && pendingCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-white text-primary-600 rounded-full text-xs">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {appointments.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments found</h3>
          <p className="text-gray-600">
            {filter === 'pending'
              ? 'No pending appointments to review'
              : 'No appointments matching your criteria'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {appointments.map((appointment) => (
            <div key={appointment._id} className="card hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    {appointment.visitorId?.photograph ? (
                      <img
                        src={`http://localhost:5000${appointment.visitorId.photograph}`}
                        alt={appointment.visitorId.fullName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <User className="text-primary-600" size={24} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {appointment.visitorId?.fullName}
                    </h3>
                    <p className="text-sm text-gray-500">{appointment.visitorId?.company || 'Individual'}</p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    appointment.status
                  )}`}
                >
                  {appointment.status}
                </span>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <User size={16} className="mr-2" />
                  <span>{appointment.visitorId?.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock size={16} className="mr-2" />
                  <span>{appointment.visitorId?.phone}</span>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">Visit Date</p>
                    <p className="font-medium text-gray-900 flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {formatDate(appointment.visitDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Time</p>
                    <p className="font-medium text-gray-900 flex items-center">
                      <Clock size={14} className="mr-1" />
                      {appointment.arrivalTime}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-600 mb-1">Department</p>
                    <p className="font-medium text-gray-900 flex items-center">
                      <Building size={14} className="mr-1" />
                      {appointment.department}
                    </p>
                  </div>
                </div>
              </div>

              {/* Purpose */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Purpose of Visit</p>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {appointment.purpose}
                </p>
              </div>

              {/* Notes */}
              {appointment.notes && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Additional Notes</p>
                  <p className="text-sm text-gray-700">{appointment.notes}</p>
                </div>
              )}

              {/* Rejection Reason */}
              {appointment.status === 'rejected' && appointment.rejectionReason && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600 mb-1 font-medium">Rejection Reason</p>
                  <p className="text-sm text-red-700">{appointment.rejectionReason}</p>
                </div>
              )}

              {/* Approval Date */}
              {appointment.status === 'approved' && appointment.approvalDate && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Approved on {formatDate(appointment.approvalDate)}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              {appointment.status === 'pending' && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleApprove(appointment._id)}
                    disabled={processingId === appointment._id}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    <CheckCircle size={18} className="mr-2" />
                    {processingId === appointment._id ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleReject(appointment._id)}
                    disabled={processingId === appointment._id}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    <XCircle size={18} className="mr-2" />
                    {processingId === appointment._id ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              )}

              {/* Approved Badge */}
              {appointment.status === 'approved' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <CheckCircle className="inline text-green-600 mr-2" size={20} />
                  <span className="text-green-700 font-medium">
                    Approved - Pass Generated
                  </span>
                </div>
              )}

              {/* Rejected Badge */}
              {appointment.status === 'rejected' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                  <XCircle className="inline text-red-600 mr-2" size={20} />
                  <span className="text-red-700 font-medium">Appointment Rejected</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApprovalsPage;
