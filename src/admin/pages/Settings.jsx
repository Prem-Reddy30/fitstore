import { useState } from 'react';
import { Save, User, Bell, Shield, Store, Globe, CreditCard } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: Store },
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  return (
    <div className="max-w-5xl animate-fade-in-up">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your store preferences and account settings.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-all duration-200 ${
                  activeTab === tab.id 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <tab.icon size={18} className={activeTab === tab.id ? 'text-white' : 'text-gray-400'} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'general' && (
            <div className="space-y-6">
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900">Store Details</h2>
                  <p className="text-gray-500 text-sm mt-1">Update your store's basic information.</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Store Name</label>
                      <input 
                        type="text" 
                        defaultValue="FitStore Official"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Support Email</label>
                      <input 
                        type="email" 
                        defaultValue="support@fitstore.com"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                      <input 
                        type="tel" 
                        defaultValue="+1 (555) 000-0000"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900">Localization</h2>
                  <p className="text-gray-500 text-sm mt-1">Configure your region and currency formats.</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Default Currency</label>
                      <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white">
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Timezone</label>
                      <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white">
                        <option value="EST">Eastern Time (EST)</option>
                        <option value="PST">Pacific Time (PST)</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold hover:bg-emerald-600 transition-all shadow-md flex items-center gap-2">
                  <Save size={18} /> Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900">Notification Preferences</h2>
                  <p className="text-gray-500 text-sm mt-1">Manage when and how you receive alerts.</p>
                </div>
                <div className="p-0 divide-y divide-gray-100">
                  {[
                    { title: 'New Order Alerts', desc: 'Receive an email when a new order is placed.', defaultChecked: true },
                    { title: 'Low Stock Warnings', desc: 'Get notified when a product inventory falls below 10 items.', defaultChecked: true },
                    { title: 'New Customer Signups', desc: 'Receive daily summaries of new users.', defaultChecked: false },
                    { title: 'Marketing Updates', desc: 'Receive news and feature updates from our team.', defaultChecked: false },
                  ].map((item, idx) => (
                    <div key={idx} className="p-6 flex items-start justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                      <div>
                        <h3 className="font-bold text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
                        <input type="checkbox" defaultChecked={item.defaultChecked} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <button className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold hover:bg-emerald-600 transition-all shadow-md flex items-center gap-2">
                  <Save size={18} /> Save Preferences
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
                  <p className="text-gray-500 text-sm mt-1">Ensure your account is using a long, random password to stay secure.</p>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full max-w-md px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full max-w-md px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Confirm New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full max-w-md px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                  <div className="pt-2">
                     <button className="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-800 transition-colors">
                      Update Password
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900">Two-Factor Authentication</h2>
                  <p className="text-gray-500 text-sm mt-1">Add an extra layer of security to your account.</p>
                </div>
                <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-gray-900">Authenticator App</p>
                    <p className="text-sm text-gray-500 mt-1 max-w-md">Use an authenticator app to generate one time security codes.</p>
                  </div>
                  <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap">
                    Enable 2FA
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Placeholders for other tabs */}
          {['account', 'billing'].includes(activeTab) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[400px] text-center p-8">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
                {activeTab === 'account' ? <User size={32} /> : <CreditCard size={32} />}
              </div>
              <h2 className="text-xl font-black text-gray-900 mb-2 capitalize">{activeTab} Settings</h2>
              <p className="text-gray-500 max-w-md">This section is currently under construction. You will be able to manage your {activeTab} details here soon.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;
