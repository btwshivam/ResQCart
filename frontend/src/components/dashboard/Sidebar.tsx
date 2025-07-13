import type { ReactNode } from 'react';

interface SidebarItemProps {
  id: string;
  label: string;
  icon: ReactNode;
  active: boolean;
  onClick: (id: string) => void;
}

const SidebarItem = ({ id, label, icon, active, onClick }: SidebarItemProps) => {
  return (
    <li>
      <button
        onClick={() => onClick(id)}
        className={`flex items-center w-full p-4 rounded-xl text-left transition-all duration-200 ${
          active
            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md'
        }`}
      >
        <span className={`text-xl mr-3 ${active ? 'text-white' : 'text-gray-500'}`}>{icon}</span>
        <span className={`font-semibold ${active ? 'text-white' : 'text-gray-700'}`}>{label}</span>
        {active && (
          <div className="ml-auto">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        )}
      </button>
    </li>
  );
};

interface SidebarProps {
  activeItem: string;
  onItemSelect: (id: string) => void;
}

const Sidebar = ({ activeItem, onItemSelect }: SidebarProps) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'products', label: 'Product Management', icon: '📦' },
    { id: 'image', label: 'Image Prediction', icon: '🖼️' },
    { id: 'insights', label: 'AI Insights', icon: '🧠' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 h-full flex flex-col w-80">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
            <span className="text-white text-xl font-bold">R</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">ResQCart</h2>
            <p className="text-sm text-gray-500">Admin Dashboard</p>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1">
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">
            Navigation
          </h3>
        </div>
        <ul className="space-y-3">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.id}
              id={item.id}
              label={item.label}
              icon={item.icon}
              active={activeItem === item.id}
              onClick={onItemSelect}
            />
          ))}
        </ul>
      </nav>
      
      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3 shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-blue-800">Need Help?</h3>
          </div>
          <p className="text-xs text-blue-600 mb-3">Check our documentation or contact support for assistance.</p>
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200 shadow-sm">
            Get Support
          </button>
        </div>
        
        {/* Quick Stats */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-3 text-center shadow-sm">
            <div className="text-lg font-bold text-gray-800">24/7</div>
            <div className="text-xs text-gray-500">Support</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center shadow-sm">
            <div className="text-lg font-bold text-gray-800">99.9%</div>
            <div className="text-xs text-gray-500">Uptime</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 