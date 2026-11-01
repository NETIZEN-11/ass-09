import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode, CheckCircle, XCircle, Search } from 'lucide-react';
import { securityAPI } from '../services/api';
import toast from '../utils/toast';
import { formatDateTime } from '../utils/formatters';

const QRScannerPage = () => {
  const [scanning, setScanning] = useState(false);
  const [verifiedPass, setVerifiedPass] = useState(null);
  const [manualPassId, setManualPassId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (scanning) {
      initializeScanner();
    }
    return () => {
      // Cleanup scanner
      const scanner = document.getElementById('qr-reader');
      if (scanner) {
        scanner.innerHTML = '';
      }
    };
  }, [scanning]);

  const initializeScanner = () => {
    const html5QrcodeScanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    html5QrcodeScanner.render(onScanSuccess, onScanError);

    function onScanSuccess(decodedText) {
      handleScan(decodedText);
      html5QrcodeScanner.clear();
      setScanning(false);
    }

    function onScanError(error) {
      console.warn(error);
    }
  };

  const handleScan = async (qrData) => {
    try {
      setLoading(true);
      const response = await securityAPI.verifyPass({ qrData });
      setVerifiedPass(response.data.data);
      toast.success('Pass verified successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
      setVerifiedPass(null);
    } finally {
      setLoading(false);
    }
  };

  const handleManualVerify = async (e) => {
    e.preventDefault();
    if (!manualPassId.trim()) {
      toast.error('Please enter a pass ID');
      return;
    }

    try {
      setLoading(true);
      const response = await securityAPI.verifyPass({ passId: manualPassId });
      setVerifiedPass(response.data.data);
      toast.success('Pass verified successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
      setVerifiedPass(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      await securityAPI.checkIn({ passId: verifiedPass.pass.passId });
      toast.success('Visitor checked in successfully!');
      setVerifiedPass(null);
      setManualPassId('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setLoading(true);
      await securityAPI.checkOut({ passId: verifiedPass.pass.passId });
      toast.success('Visitor checked out successfully!');
      setVerifiedPass(null);
      setManualPassId('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-out failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">QR Code Scanner</h1>
        <p className="text-gray-600 mt-1">Scan visitor passes for check-in and verification</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Scanner */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Scan QR Code</h2>
          
          {!scanning ? (
            <button
              onClick={() => setScanning(true)}
              className="w-full py-12 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 transition-colors"
            >
              <QrCode className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 font-medium">Click to start scanning</p>
            </button>
          ) : (
            <div id="qr-reader" className="w-full"></div>
          )}

          {scanning && (
            <button
              onClick={() => setScanning(false)}
              className="w-full mt-4 btn-secondary"
            >
              Stop Scanning
            </button>
          )}
        </div>

        {/* Manual Entry */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Manual Pass ID Entry</h2>
          
          <form onSubmit={handleManualVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Pass ID
              </label>
              <input
                type="text"
                value={manualPassId}
                onChange={(e) => setManualPassId(e.target.value)}
                placeholder="VP-XXXXXXXX"
                className="input-field"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              <Search size={20} className="inline mr-2" />
              Verify Pass
            </button>
          </form>
        </div>
      </div>

      {/* Verification Result */}
      {verifiedPass && (
        <div className="card mt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Verification Result</h2>
            {verifiedPass.pass.visitorId.isBlacklisted ? (
              <span className="flex items-center text-red-600">
                <XCircle size={20} className="mr-2" />
                Blacklisted
              </span>
            ) : (
              <span className="flex items-center text-green-600">
                <CheckCircle size={20} className="mr-2" />
                Verified
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Visitor Info */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Visitor Information</h3>
              <div className="space-y-2">
                <InfoRow label="Name" value={verifiedPass.pass.visitorId.fullName} />
                <InfoRow label="Email" value={verifiedPass.pass.visitorId.email} />
                <InfoRow label="Phone" value={verifiedPass.pass.visitorId.phone} />
                <InfoRow label="Company" value={verifiedPass.pass.visitorId.company} />
              </div>
            </div>

            {/* Pass Info */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Pass Information</h3>
              <div className="space-y-2">
                <InfoRow label="Pass ID" value={verifiedPass.pass.passId} />
                <InfoRow label="Host" value={verifiedPass.pass.appointmentId.hostId.name} />
                <InfoRow label="Department" value={verifiedPass.pass.appointmentId.department} />
                <InfoRow 
                  label="Valid From" 
                  value={formatDateTime(verifiedPass.pass.validFrom)} 
                />
                <InfoRow 
                  label="Valid Until" 
                  value={formatDateTime(verifiedPass.pass.validUntil)} 
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          {!verifiedPass.pass.visitorId.isBlacklisted && (
            <div className="flex space-x-4 mt-6">
              {!verifiedPass.isAlreadyCheckedIn ? (
                <button
                  onClick={handleCheckIn}
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  Check In Visitor
                </button>
              ) : (
                <button
                  onClick={handleCheckOut}
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  Check Out Visitor
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-gray-600">{label}:</span>
    <span className="font-medium text-gray-900">{value}</span>
  </div>
);

export default QRScannerPage;
