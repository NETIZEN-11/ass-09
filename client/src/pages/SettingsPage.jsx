import { useState, useEffect } from 'react';
import { Settings, Building, Mail, Bell, Shield, Save, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from '../utils/toast';

const SettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('organization');
  const [loading, setLoading] = useState(false);

  const [organizationSettings, setOrganizationSettings] = useState({
    name: 'Demo Organization',
    address: '123 Business Street, City, State 12345',
    phone: '+1 (555) 123-4567',
    email: 'contact@visitorpass.com',
    website: 'www.visitorpass.com',
    workingHours: '9:00 AM - 6:00 PM',
    timezone: 'America/New_York',
  });

  const [emailSettings, setEmailSettings] = useState({
    enabled: true,
    sendApprovalEmails: true,
    sendRejectionEmails: true,
    sendArrivalNotifications: true,
    sendPassGeneratedEmails: true,
    emailHost: 'smtp.gmail.com',
    emailPort: '587',
    emailFrom: 'noreply@visitorpass.com',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    dailyReport: true,
    weeklyReport: false,
  });

  const [securitySettings, setSecuritySettings] = useState({
    requirePhotoUpload: true,
    requireIdentityDocument: false,
    autoApproveAppointments: false,
    passValidityHours: 24,
    maxVisitsPerDay: 50,
    enableBlacklist: true,
    twoFactorAuth: false,
  });

  const handleSaveOrganization = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.setItem('organizationSettings', JSON.stringify(organizationSettings));
      toast.success('Organization settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEmail = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.setItem('emailSettings', JSON.stringify(emailSettings));
      toast.success('Email settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
      toast.success('Notification settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSecurity = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.setItem('securitySettings', JSON.stringify(securitySettings));
      toast.success('Security settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load saved settings from localStorage
    const savedOrgSettings = localStorage.getItem('organizationSettings');
    if (savedOrgSettings) {
      setOrganizationSettings(JSON.parse(savedOrgSettings));
    }

    const savedEmailSettings = localStorage.getItem('emailSettings');
    if (savedEmailSettings) {
      setEmailSettings(JSON.parse(savedEmailSettings));
    }

    const savedNotificationSettings = localStorage.getItem('notificationSettings');
    if (savedNotificationSettings) {
      setNotificationSettings(JSON.parse(savedNotificationSettings));
    }

    const savedSecuritySettings = localStorage.getItem('securitySettings');
    if (savedSecuritySettings) {
      setSecuritySettings(JSON.parse(savedSecuritySettings));
    }
  }, []);

  const tabs = [
    { id: 'organization', label: 'Organization', icon: Building },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your organization settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={20} className="mr-3" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Organization Settings */}
          {activeTab === 'organization' && (
            <div className="card">
              <div className="flex items-center mb-6">
                <Building className="text-primary-600 mr-3" size={24} />
                <h2 className="text-xl font-semibold text-gray-900">Organization Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={organizationSettings.name}
                    onChange={(e) => setOrganizationSettings({ ...organizationSettings, name: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={organizationSettings.address}
                    onChange={(e) => setOrganizationSettings({ ...organizationSettings, address: e.target.value })}
                    rows="3"
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={organizationSettings.phone}
                      onChange={(e) => setOrganizationSettings({ ...organizationSettings, phone: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={organizationSettings.email}
                      onChange={(e) => setOrganizationSettings({ ...organizationSettings, email: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="text"
                      value={organizationSettings.website}
                      onChange={(e) => setOrganizationSettings({ ...organizationSettings, website: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Working Hours
                    </label>
                    <input
                      type="text"
                      value={organizationSettings.workingHours}
                      onChange={(e) => setOrganizationSettings({ ...organizationSettings, workingHours: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    value={organizationSettings.timezone}
                    onChange={(e) => setOrganizationSettings({ ...organizationSettings, timezone: e.target.value })}
                    className="input-field"
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Asia/Kolkata">India Standard Time (IST)</option>
                    <option value="Europe/London">British Summer Time (BST)</option>
                  </select>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSaveOrganization}
                    disabled={loading}
                    className="btn-primary flex items-center"
                  >
                    <Save size={18} className="mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Email Settings */}
          {activeTab === 'email' && (
            <div className="card">
              <div className="flex items-center mb-6">
                <Mail className="text-primary-600 mr-3" size={24} />
                <h2 className="text-xl font-semibold text-gray-900">Email Configuration</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Enable Email Notifications</h3>
                    <p className="text-sm text-gray-600">Send automated emails to visitors and staff</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailSettings.enabled}
                      onChange={(e) => setEmailSettings({ ...emailSettings, enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900 mt-4">Email Types</h3>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailSettings.sendApprovalEmails}
                      onChange={(e) => setEmailSettings({ ...emailSettings, sendApprovalEmails: e.target.checked })}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-gray-700">Appointment approval emails</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailSettings.sendRejectionEmails}
                      onChange={(e) => setEmailSettings({ ...emailSettings, sendRejectionEmails: e.target.checked })}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-gray-700">Appointment rejection emails</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailSettings.sendArrivalNotifications}
                      onChange={(e) => setEmailSettings({ ...emailSettings, sendArrivalNotifications: e.target.checked })}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-gray-700">Visitor arrival notifications</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailSettings.sendPassGeneratedEmails}
                      onChange={(e) => setEmailSettings({ ...emailSettings, sendPassGeneratedEmails: e.target.checked })}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-gray-700">Pass generated emails</span>
                  </label>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="font-medium text-gray-900 mb-3">SMTP Configuration</h3>
                  <p className="text-sm text-gray-600 mb-4">Configure in server .env file for security</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        value={emailSettings.emailHost}
                        onChange={(e) => setEmailSettings({ ...emailSettings, emailHost: e.target.value })}
                        className="input-field"
                        disabled
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Port
                      </label>
                      <input
                        type="text"
                        value={emailSettings.emailPort}
                        onChange={(e) => setEmailSettings({ ...emailSettings, emailPort: e.target.value })}
                        className="input-field"
                        disabled
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From Email
                    </label>
                    <input
                      type="email"
                      value={emailSettings.emailFrom}
                      onChange={(e) => setEmailSettings({ ...emailSettings, emailFrom: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSaveEmail}
                    disabled={loading}
                    className="btn-primary flex items-center"
                  >
                    <Save size={18} className="mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="card">
              <div className="flex items-center mb-6">
                <Bell className="text-primary-600 mr-3" size={24} />
                <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Email Notifications</h3>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailNotifications}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">SMS Notifications</h3>
                    <p className="text-sm text-gray-600">Receive notifications via SMS (requires Twilio)</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.smsNotifications}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, smsNotifications: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Push Notifications</h3>
                    <p className="text-sm text-gray-600">Receive in-app notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.pushNotifications}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, pushNotifications: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="font-medium text-gray-900 mb-3">Report Schedule</h3>
                  
                  <label className="flex items-center space-x-3 cursor-pointer mb-3">
                    <input
                      type="checkbox"
                      checked={notificationSettings.dailyReport}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, dailyReport: e.target.checked })}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-gray-700">Send daily visitor report</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.weeklyReport}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, weeklyReport: e.target.checked })}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-gray-700">Send weekly summary report</span>
                  </label>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSaveNotifications}
                    disabled={loading}
                    className="btn-primary flex items-center"
                  >
                    <Save size={18} className="mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="card">
              <div className="flex items-center mb-6">
                <Shield className="text-primary-600 mr-3" size={24} />
                <h2 className="text-xl font-semibold text-gray-900">Security & Access Control</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Require Photo Upload</h3>
                    <p className="text-sm text-gray-600">Visitors must upload photo during registration</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securitySettings.requirePhotoUpload}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, requirePhotoUpload: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Require Identity Document</h3>
                    <p className="text-sm text-gray-600">Mandate identity verification for all visitors</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securitySettings.requireIdentityDocument}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, requireIdentityDocument: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Auto-Approve Appointments</h3>
                    <p className="text-sm text-gray-600">Automatically approve all appointment requests</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securitySettings.autoApproveAppointments}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, autoApproveAppointments: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Enable Blacklist</h3>
                    <p className="text-sm text-gray-600">Block blacklisted visitors from entry</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securitySettings.enableBlacklist}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, enableBlacklist: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600">Require 2FA for all user logins</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securitySettings.twoFactorAuth}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, twoFactorAuth: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="font-medium text-gray-900 mb-3">Access Limits</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pass Validity (Hours)
                      </label>
                      <input
                        type="number"
                        value={securitySettings.passValidityHours}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, passValidityHours: parseInt(e.target.value) })}
                        className="input-field"
                        min="1"
                        max="72"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Visits Per Day
                      </label>
                      <input
                        type="number"
                        value={securitySettings.maxVisitsPerDay}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, maxVisitsPerDay: parseInt(e.target.value) })}
                        className="input-field"
                        min="1"
                        max="1000"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSaveSecurity}
                    disabled={loading}
                    className="btn-primary flex items-center"
                  >
                    <Save size={18} className="mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
