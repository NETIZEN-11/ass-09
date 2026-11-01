import { useEffect, useState } from 'react';
import { FileText, Download, Calendar, Filter, Search } from 'lucide-react';
import { securityAPI, appointmentAPI, visitorAPI } from '../services/api';
import toast from '../utils/toast';
import { formatDate, formatDateTime, getStatusColor } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';

const ReportsPage = () => {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('visitor-history');
  const [visitorHistory, setVisitorHistory] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [filters, setFilters] = useState({
    status: '',
    department: '',
  });

  useEffect(() => {
    fetchReportData();
  }, [reportType, dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      if (reportType === 'visitor-history') {
        const params = {};
        if (dateRange.startDate) params.startDate = dateRange.startDate;
        if (dateRange.endDate) params.endDate = dateRange.endDate;
        
        const response = await securityAPI.getVisitorHistory(params);
        setVisitorHistory(response.data.data);
      } else if (reportType === 'appointments') {
        const params = {};
        if (filters.status) params.status = filters.status;
        
        const response = await appointmentAPI.getAppointments(params);
        setAppointments(response.data.data);
      } else if (reportType === 'visitors') {
        const response = await visitorAPI.getVisitors({ limit: 100 });
        setVisitors(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch report data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    let csvContent = '';
    let filename = '';

    if (reportType === 'visitor-history') {
      filename = `visitor-history-${new Date().toISOString().split('T')[0]}.csv`;
      csvContent = 'Visitor Name,Company,Check-In Time,Check-Out Time,Status,Security Staff\n';
      
      visitorHistory.forEach(log => {
        csvContent += `"${log.visitorId?.fullName || 'N/A'}","${log.visitorId?.company || 'N/A'}","${formatDateTime(log.checkInTime)}","${log.checkOutTime ? formatDateTime(log.checkOutTime) : 'N/A'}","${log.entryStatus}","${log.securityUserId?.name || 'N/A'}"\n`;
      });
    } else if (reportType === 'appointments') {
      filename = `appointments-${new Date().toISOString().split('T')[0]}.csv`;
      csvContent = 'Visitor,Company,Host,Department,Visit Date,Time,Purpose,Status\n';
      
      appointments.forEach(apt => {
        csvContent += `"${apt.visitorId?.fullName || 'N/A'}","${apt.visitorId?.company || 'N/A'}","${apt.hostId?.name || 'N/A'}","${apt.department}","${formatDate(apt.visitDate)}","${apt.arrivalTime}","${apt.purpose}","${apt.status}"\n`;
      });
    } else if (reportType === 'visitors') {
      filename = `visitors-${new Date().toISOString().split('T')[0]}.csv`;
      csvContent = 'Name,Email,Phone,Company,Purpose,Identity Type,Visit Count,Status\n';
      
      visitors.forEach(visitor => {
        csvContent += `"${visitor.fullName}","${visitor.email}","${visitor.phone}","${visitor.company || 'N/A'}","${visitor.purpose}","${visitor.identityType}","${visitor.visitCount}","${visitor.isBlacklisted ? 'Blacklisted' : 'Active'}"\n`;
      });
    }

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Report exported successfully!');
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">Generate and export visitor reports</p>
      </div>

      {/* Report Type Selection */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Report Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setReportType('visitor-history')}
            className={`p-4 rounded-lg border-2 transition-all ${
              reportType === 'visitor-history'
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300'
            }`}
          >
            <FileText className={`mb-2 ${reportType === 'visitor-history' ? 'text-primary-600' : 'text-gray-400'}`} size={24} />
            <h3 className="font-semibold text-gray-900">Visitor History</h3>
            <p className="text-sm text-gray-600 mt-1">Check-in and check-out logs</p>
          </button>

          <button
            onClick={() => setReportType('appointments')}
            className={`p-4 rounded-lg border-2 transition-all ${
              reportType === 'appointments'
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300'
            }`}
          >
            <Calendar className={`mb-2 ${reportType === 'appointments' ? 'text-primary-600' : 'text-gray-400'}`} size={24} />
            <h3 className="font-semibold text-gray-900">Appointments</h3>
            <p className="text-sm text-gray-600 mt-1">All appointment records</p>
          </button>

          <button
            onClick={() => setReportType('visitors')}
            className={`p-4 rounded-lg border-2 transition-all ${
              reportType === 'visitors'
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300'
            }`}
          >
            <Search className={`mb-2 ${reportType === 'visitors' ? 'text-primary-600' : 'text-gray-400'}`} size={24} />
            <h3 className="font-semibold text-gray-900">Visitors</h3>
            <p className="text-sm text-gray-600 mt-1">All registered visitors</p>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Filter size={20} className="mr-2" />
          Filters
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(reportType === 'visitor-history' || reportType === 'appointments') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  className="input-field"
                />
              </div>
            </>
          )}

          {reportType === 'appointments' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="input-field"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          )}

          <div className="flex items-end">
            <button
              onClick={handleExportCSV}
              className="btn-primary flex items-center w-full"
            >
              <Download size={18} className="mr-2" />
              Export to CSV
            </button>
          </div>
        </div>
      </div>

      {/* Report Data */}
      {loading ? (
        <LoadingSpinner fullScreen />
      ) : (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Data</h2>
          
          {/* Visitor History Report */}
          {reportType === 'visitor-history' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visitor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-In</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-Out</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Security</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {visitorHistory.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        No records found
                      </td>
                    </tr>
                  ) : (
                    visitorHistory.map((log) => (
                      <tr key={log._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{log.visitorId?.fullName || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{log.visitorId?.email}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{log.visitorId?.company || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{formatDateTime(log.checkInTime)}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {log.checkOutTime ? formatDateTime(log.checkOutTime) : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(log.entryStatus)}`}>
                            {log.entryStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{log.securityUserId?.name || 'N/A'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Appointments Report */}
          {reportType === 'appointments' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visitor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Host</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visit Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        No appointments found
                      </td>
                    </tr>
                  ) : (
                    appointments.map((apt) => (
                      <tr key={apt._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{apt.visitorId?.fullName}</div>
                          <div className="text-sm text-gray-500">{apt.visitorId?.company}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{apt.hostId?.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{apt.department}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{formatDate(apt.visitDate)}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{apt.arrivalTime}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{apt.purpose}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(apt.status)}`}>
                            {apt.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Visitors Report */}
          {reportType === 'visitors' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visits</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {visitors.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        No visitors found
                      </td>
                    </tr>
                  ) : (
                    visitors.map((visitor) => (
                      <tr key={visitor._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{visitor.fullName}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{visitor.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{visitor.phone}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{visitor.company || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{visitor.visitCount}</td>
                        <td className="px-6 py-4">
                          {visitor.isBlacklisted ? (
                            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                              Blacklisted
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
