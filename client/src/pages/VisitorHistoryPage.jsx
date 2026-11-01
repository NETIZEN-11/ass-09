import { useEffect, useState } from 'react';
import { History, Calendar, Clock, Download, Filter } from 'lucide-react';
import { securityAPI } from '../services/api';
import toast from '../utils/toast';
import { formatDate, formatDateTime, formatTime, getStatusColor } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';

const VisitorHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
  });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    fetchHistory();
  }, [filters, pagination.page]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: 20,
      };

      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await securityAPI.getVisitorHistory(params);
      setHistory(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch visitor history');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const csvContent = 'Visitor Name,Email,Company,Check-In Time,Check-Out Time,Duration,Status,Security Staff\n' +
      history.map(log => {
        const duration = log.checkOutTime 
          ? Math.round((new Date(log.checkOutTime) - new Date(log.checkInTime)) / (1000 * 60))
          : 'N/A';
        
        return `"${log.visitorId?.fullName || 'N/A'}","${log.visitorId?.email || 'N/A'}","${log.visitorId?.company || 'N/A'}","${formatDateTime(log.checkInTime)}","${log.checkOutTime ? formatDateTime(log.checkOutTime) : 'Still Inside'}","${duration} min","${log.entryStatus}","${log.securityUserId?.name || 'N/A'}"`;
      }).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `visitor-history-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('History exported successfully!');
  };

  const calculateDuration = (checkIn, checkOut) => {
    if (!checkOut) return 'Ongoing';
    const duration = Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60));
    if (duration < 60) return `${duration} min`;
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}h ${minutes}m`;
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
    });
    setPagination({ ...pagination, page: 1 });
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Visitor History</h1>
        <p className="text-gray-600 mt-1">Complete check-in and check-out logs</p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Filter size={20} className="mr-2" />
            Filters
          </h2>
          <button
            onClick={handleExportCSV}
            className="btn-primary flex items-center text-sm"
          >
            <Download size={16} className="mr-2" />
            Export CSV
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => {
                setFilters({ ...filters, startDate: e.target.value });
                setPagination({ ...pagination, page: 1 });
              }}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => {
                setFilters({ ...filters, endDate: e.target.value });
                setPagination({ ...pagination, page: 1 });
              }}
              className="input-field"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="btn-secondary w-full"
            >
              Clear Filters
            </button>
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchHistory}
              className="btn-primary w-full"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Visits</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <History className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Checked In</p>
              <p className="text-2xl font-bold text-gray-900">
                {history.filter(log => log.entryStatus === 'checked-in').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <Clock className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Checked Out</p>
              <p className="text-2xl font-bold text-gray-900">
                {history.filter(log => log.entryStatus === 'checked-out').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
              <Calendar className="text-gray-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg Duration</p>
              <p className="text-2xl font-bold text-gray-900">
                {history.length > 0
                  ? Math.round(
                      history
                        .filter(log => log.checkOutTime)
                        .reduce((acc, log) => {
                          return acc + (new Date(log.checkOutTime) - new Date(log.checkInTime));
                        }, 0) /
                        (history.filter(log => log.checkOutTime).length || 1) /
                        (1000 * 60)
                    ) + ' min'
                  : '0 min'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Clock className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* History Table */}
      {loading ? (
        <LoadingSpinner fullScreen />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visitor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Security
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <History className="mx-auto text-gray-400 mb-4" size={48} />
                      <p className="text-gray-600 font-medium">No visitor history found</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {filters.startDate || filters.endDate
                          ? 'Try adjusting your filters'
                          : 'Visitor check-ins will appear here'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  history.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-semibold">
                              {log.visitorId?.fullName?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {log.visitorId?.fullName || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-500">{log.visitorId?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.visitorId?.company || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(log.checkInTime)}</div>
                        <div className="text-sm text-gray-500">{formatTime(log.checkInTime)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.checkOutTime ? (
                          <>
                            <div className="text-sm text-gray-900">{formatDate(log.checkOutTime)}</div>
                            <div className="text-sm text-gray-500">{formatTime(log.checkOutTime)}</div>
                          </>
                        ) : (
                          <span className="text-sm text-yellow-600 font-medium">Still Inside</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {calculateDuration(log.checkInTime, log.checkOutTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            log.entryStatus
                          )}`}
                        >
                          {log.entryStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.securityUserId?.name || 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing page {pagination.page} of {pagination.pages} ({pagination.total} total records)
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Previous
                </button>
                <div className="flex items-center px-4">
                  <span className="text-sm text-gray-700">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                </div>
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VisitorHistoryPage;
