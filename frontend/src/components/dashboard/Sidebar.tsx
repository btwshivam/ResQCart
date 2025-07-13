import { useState } from 'react';
import ReactDOM from 'react-dom';

interface SidebarProps {
  activeItem: string;
  onItemSelect: (id: string) => void;
}

const Sidebar = ({ activeItem, onItemSelect }: SidebarProps) => {
  const [hovered, setHovered] = useState(false);
  const collapsed = !hovered;

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'products', label: 'Product Management', icon: '📦' },
    { id: 'image', label: 'Image Prediction', icon: '🖼️' },
    { id: 'insights', label: 'AI Insights', icon: '🧠' },
  ];

  const sidebarContent = (
    <>
      <style>{`
        .custom-sidebar-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-sidebar-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.08);
          border-radius: 8px;
        }
        .custom-sidebar-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
      <div
        className={`custom-sidebar-scrollbar transition-all duration-300 ${collapsed ? 'z-30 w-17' : 'z-[9999] w-75'} bg-white/90 shadow-xl flex flex-col rounded-2xl ml-3 fixed left-0 top-1/2 -translate-y-1/2 h-[60vh] overflow-y-auto overflow-x-hidden pt-[20px] pb-[8px] mt-[20px]`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
      {/* Header */}
      <div className={`flex ${collapsed ? 'flex-col justify-center items-center mb-8' : 'items-center mb-8'} transition-all duration-300`}>
        <div className={`w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg ${collapsed ? '' : 'mr-4'}`}>
          <span className="text-white text-xl font-bold">R</span>
        </div>
        {!collapsed && (
          <div>
            <h2 className="text-xl font-bold text-gray-800">ResQCart</h2>
            <p className="text-sm text-gray-500">Admin Dashboard</p>
          </div>
        )}
      </div>
      {/* Navigation */}
      <nav className="flex-1">
        <ul className="space-y-3">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onItemSelect(item.id)}
                className={`relative flex items-center w-full p-4 rounded-xl text-left transition-all duration-200 focus:outline-none focus:ring-0 ${activeItem === item.id ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md'}`}
              >
                {/* Vertical colored bar for active icon in collapsed mode */}
                {collapsed && activeItem === item.id && (
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-8 rounded-full bg-gradient-to-b from-orange-400 to-yellow-400 shadow-md"></span>
                )}
                <span className={`text-xl ${collapsed ? 'mx-auto' : 'mr-3'} ${activeItem === item.id ? 'text-white' : 'text-gray-500'}`}>{item.icon}</span>
                {!collapsed && <span className={`font-semibold ${activeItem === item.id ? 'text-white' : 'text-gray-700'}`}>{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      {/* Footer */}
      {!collapsed && (
        <div className="mt-2 pt-2 border-t border-gray-100">
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
      )}
    </div>
    </>
  );

  return ReactDOM.createPortal(sidebarContent, document.body);
};

export default Sidebar; 