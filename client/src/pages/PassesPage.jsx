import { useEffect, useState } from 'react';
import { QrCode, Download, Calendar } from 'lucide-react';
import { passAPI } from '../services/api';
import toast from '../utils/toast';
import { formatDate, getStatusColor } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';

const PassesPage = () => {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPasses();
  }, []);

  const fetchPasses = async () => {
    try {
      setLoading(true);
      const response = await passAPI.getPasses();
      setPasses(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch passes');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (passId) => {
    try {
      const response = await passAPI.downloadPDF(passId);
      const pdfUrl = response.data.data.pdfUrl;
      window.open(pdfUrl, '_blank');
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Visitor Passes</h1>
        <p className="text-gray-600 mt-1">View and manage visitor passes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {passes.length === 0 ? (
          <div className="col-span-3 card text-center py-12">
            <QrCode className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No passes found</h3>
            <p className="text-gray-600">Passes will appear here once generated.</p>
          </div>
        ) : (
          passes.map((pass) => (
            <div key={pass._id} className="card hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{pass.visitorId?.fullName}</h3>
                  <p className="text-sm text-gray-500">{pass.passId}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(pass.status)}`}>
                  {pass.status}
                </span>
              </div>

              {/* QR Code */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4 flex items-center justify-center">
                <img src={pass.qrCode} alt="QR Code" className="w-32 h-32" />
              </div>

              {/* Pass Details */}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Host:</span>
                  <span className="font-medium">{pass.appointmentId?.hostId?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Department:</span>
                  <span className="font-medium">{pass.appointmentId?.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valid Date:</span>
                  <span className="font-medium">{formatDate(pass.validFrom)}</span>
                </div>
              </div>

              {/* Actions */}
              {pass.pdfPath && (
                <button
                  onClick={() => handleDownloadPDF(pass._id)}
                  className="w-full btn-primary flex items-center justify-center"
                >
                  <Download size={16} className="mr-2" />
                  Download Pass
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PassesPage;
