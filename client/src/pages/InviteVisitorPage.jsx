import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { UserPlus, Send, Upload, X } from 'lucide-react';
import { visitorAPI, appointmentAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from '../utils/toast';

const InviteVisitorPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [visitorId, setVisitorId] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  const {
    register: registerVisitor,
    handleSubmit: handleVisitorSubmit,
    formState: { errors: visitorErrors },
    reset: resetVisitor,
  } = useForm();

  const {
    register: registerAppointment,
    handleSubmit: handleAppointmentSubmit,
    formState: { errors: appointmentErrors },
    reset: resetAppointment,
  } = useForm();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await userAPI.getUsers({ role: 'employee' });
      setEmployees(response.data.data);
    } catch (error) {
      console.error('Failed to fetch employees');
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const onVisitorSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('fullName', data.fullName);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('company', data.company || '');
      formData.append('purpose', data.purpose);
      formData.append('identityType', data.identityType);
      formData.append('identityNumber', data.identityNumber || '');

      if (photoFile) {
        formData.append('photograph', photoFile);
      }

      const response = await visitorAPI.createVisitor(formData);
      setVisitorId(response.data.data._id);
      toast.success('Visitor registered successfully!');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register visitor');
    } finally {
      setLoading(false);
    }
  };

  const onAppointmentSubmit = async (data) => {
    if (!visitorId) {
      toast.error('Please complete visitor registration first');
      return;
    }

    setLoading(true);
    try {
      const appointmentData = {
        visitorId,
        hostId: data.hostId,
        department: data.department,
        visitDate: data.visitDate,
        arrivalTime: data.arrivalTime,
        purpose: data.purpose,
        notes: data.notes || '',
      };

      await appointmentAPI.createAppointment(appointmentData);
      toast.success('Appointment created successfully!');
      
      // Reset forms
      resetVisitor();
      resetAppointment();
      setVisitorId(null);
      setStep(1);
      setPhotoPreview(null);
      setPhotoFile(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    resetVisitor();
    resetAppointment();
    setVisitorId(null);
    setStep(1);
    setPhotoPreview(null);
    setPhotoFile(null);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Invite Visitor</h1>
        <p className="text-gray-600 mt-1">Create visitor registration and appointment</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              1
            </div>
            <span className="ml-2 font-medium text-gray-700">Visitor Details</span>
          </div>

          <div className={`w-24 h-1 mx-4 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>

          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              2
            </div>
            <span className="ml-2 font-medium text-gray-700">Appointment Details</span>
          </div>
        </div>
      </div>

      {/* Step 1: Visitor Registration */}
      {step === 1 && (
        <div className="max-w-3xl mx-auto">
          <div className="card">
            <div className="flex items-center mb-6">
              <UserPlus className="text-primary-600 mr-3" size={24} />
              <h2 className="text-xl font-semibold text-gray-900">Visitor Information</h2>
            </div>

            <form onSubmit={handleVisitorSubmit(onVisitorSubmit)} className="space-y-4">
              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visitor Photo (Optional)
                </label>
                <div className="flex items-center space-x-4">
                  {photoPreview ? (
                    <div className="relative">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-32 h-32 rounded-lg object-cover border-2 border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                      <Upload className="text-gray-400 mb-2" size={32} />
                      <span className="text-sm text-gray-500">Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...registerVisitor('fullName', { required: 'Full name is required' })}
                    className="input-field"
                    placeholder="John Doe"
                  />
                  {visitorErrors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{visitorErrors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    {...registerVisitor('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    className="input-field"
                    placeholder="john@example.com"
                  />
                  {visitorErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{visitorErrors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    {...registerVisitor('phone', { required: 'Phone is required' })}
                    className="input-field"
                    placeholder="+1 234 567 8900"
                  />
                  {visitorErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">{visitorErrors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <input
                    type="text"
                    {...registerVisitor('company')}
                    className="input-field"
                    placeholder="Company Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose of Visit <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...registerVisitor('purpose', { required: 'Purpose is required' })}
                  className="input-field"
                  placeholder="Meeting, Interview, Delivery, etc."
                />
                {visitorErrors.purpose && (
                  <p className="mt-1 text-sm text-red-600">{visitorErrors.purpose.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Identity Type
                  </label>
                  <select {...registerVisitor('identityType')} className="input-field">
                    <option value="Aadhar Card">Aadhar Card</option>
                    <option value="PAN Card">PAN Card</option>
                    <option value="Driving License">Driving License</option>
                    <option value="Passport">Passport</option>
                    <option value="Voter ID">Voter ID</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Identity Number
                  </label>
                  <input
                    type="text"
                    {...registerVisitor('identityNumber')}
                    className="input-field"
                    placeholder="XXXX-XXXX-XXXX"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={handleReset} className="btn-secondary">
                  Reset
                </button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Processing...' : 'Next: Appointment Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Step 2: Appointment Creation */}
      {step === 2 && (
        <div className="max-w-3xl mx-auto">
          <div className="card">
            <div className="flex items-center mb-6">
              <Send className="text-primary-600 mr-3" size={24} />
              <h2 className="text-xl font-semibold text-gray-900">Appointment Details</h2>
            </div>

            <form onSubmit={handleAppointmentSubmit(onAppointmentSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Host / Person to Meet <span className="text-red-500">*</span>
                </label>
                <select
                  {...registerAppointment('hostId', { required: 'Please select a host' })}
                  className="input-field"
                >
                  <option value="">Select Host</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} - {emp.department}
                    </option>
                  ))}
                </select>
                {appointmentErrors.hostId && (
                  <p className="mt-1 text-sm text-red-600">{appointmentErrors.hostId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...registerAppointment('department', { required: 'Department is required' })}
                  className="input-field"
                  placeholder="Engineering, HR, Marketing, etc."
                />
                {appointmentErrors.department && (
                  <p className="mt-1 text-sm text-red-600">{appointmentErrors.department.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visit Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...registerAppointment('visitDate', { required: 'Visit date is required' })}
                    min={new Date().toISOString().split('T')[0]}
                    className="input-field"
                  />
                  {appointmentErrors.visitDate && (
                    <p className="mt-1 text-sm text-red-600">{appointmentErrors.visitDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Arrival Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...registerAppointment('arrivalTime', { required: 'Arrival time is required' })}
                    className="input-field"
                    placeholder="10:00 AM"
                  />
                  {appointmentErrors.arrivalTime && (
                    <p className="mt-1 text-sm text-red-600">{appointmentErrors.arrivalTime.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose of Meeting <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...registerAppointment('purpose', { required: 'Purpose is required' })}
                  rows="3"
                  className="input-field"
                  placeholder="Describe the purpose of this appointment..."
                />
                {appointmentErrors.purpose && (
                  <p className="mt-1 text-sm text-red-600">{appointmentErrors.purpose.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  {...registerAppointment('notes')}
                  rows="2"
                  className="input-field"
                  placeholder="Any special instructions or requirements..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary"
                >
                  Back
                </button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Creating...' : 'Create Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InviteVisitorPage;
