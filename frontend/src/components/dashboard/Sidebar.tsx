import { useState } from 'react';
import ReactDOM from 'react-dom';

interface SidebarProps {
  activeItem: string;
  onItemSelect: (id: string) => void;
}

const user = {
  name: 'Admin',
  role: 'Administrator',
  avatar: 'https://ui-avatars.com/api/?name=Admin&background=4f46e5&color=fff&size=128',
};

const Sidebar = ({ activeItem, onItemSelect }: SidebarProps) => {
  const [hovered, setHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const collapsed = !hovered && !mobileOpen;

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '📊', description: 'Dashboard overview and analytics' },
    { id: 'products', label: 'Product Management', icon: '📦', description: 'Manage inventory and products' },
    { id: 'image', label: 'Image Prediction', icon: '🖼️', description: 'AI-powered image analysis' },
    { id: 'realtime', label: 'Realtime Prediction', icon: '🎥', description: 'Live video prediction system' },
    { id: 'insights', label: 'AI Insights', icon: '🧠', description: 'Advanced AI insights and recommendations' },
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onItemSelect(id);
    }
  };

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
        .sidebar-item {
          position: relative;
          overflow: hidden;
        }
        .sidebar-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(99,102,241,0.08), transparent);
          transition: left 0.5s;
        }
        .sidebar-item:hover::before, .sidebar-item:focus::before {
          left: 100%;
        }
        .tooltip {
          position: absolute;
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(30,41,59,0.98);
          color: white;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
          z-index: 1000;
          margin-left: 14px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s;
          box-shadow: 0 2px 8px rgba(30,41,59,0.12);
        }
        .tooltip::before {
          content: '';
          position: absolute;
          left: -6px;
          top: 50%;
          transform: translateY(-50%);
          border: 6px solid transparent;
          border-right-color: rgba(30,41,59,0.98);
        }
        .tooltip.show {
          opacity: 1;
        }
        .sidebar-mobile-toggle {
          display: none;
        }
        @media (max-width: 900px) {
          .sidebar-mobile-toggle {
            display: block;
            position: fixed;
            top: 18px;
            left: 18px;
            z-index: 10001;
          }
        }
        @media (max-width: 900px) {
          .sidebar-portal {
            left: 0 !important;
            top: 0 !important;
            transform: none !important;
            height: 100vh !important;
            border-radius: 0 !important;
            width: ${mobileOpen ? '260px' : '0'} !important;
            min-width: 0 !important;
            transition: width 0.3s cubic-bezier(.4,0,.2,1);
            box-shadow: 0 0 0 9999px rgba(0,0,0,0.25);
          }
        }
      `}</style>
      {/* Mobile Toggle Button */}
      <button
        className="sidebar-mobile-toggle bg-white/90 shadow-lg rounded-full p-2 border border-gray-200 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
        aria-label={mobileOpen ? 'Close sidebar' : 'Open sidebar'}
        onClick={() => setMobileOpen((v) => !v)}
      >
        {mobileOpen ? (
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        )}
      </button>
      <div
        className={`sidebar-portal custom-sidebar-scrollbar transition-all duration-300 ${collapsed ? 'z-30 w-17 min-w-[68px]' : 'z-[9999] w-72 min-w-[260px]'} bg-white/90 backdrop-blur-md shadow-2xl flex flex-col rounded-2xl ml-3 fixed left-0 top-1/2 -translate-y-1/2 h-[80vh] overflow-y-auto overflow-x-hidden pt-[20px] pb-[8px] mt-[20px] border border-white/20`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        tabIndex={-1}
        aria-label="Sidebar navigation"
      >
        {/* User Profile */}
        <div className={`flex items-center mb-8 px-4 transition-all duration-300 ${collapsed ? 'flex-col justify-center' : ''}`} style={{ minHeight: 64 }}>
          <img
            src={user.avatar}
            alt={user.name}
            className={`w-12 h-12 rounded-2xl shadow-lg border-2 border-blue-200 ${collapsed ? 'mb-2' : 'mr-4'}`}
            draggable={false}
          />
          {!collapsed && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 leading-tight">{user.name}</h2>
              <p className="text-xs text-blue-600 font-medium">{user.role}</p>
            </div>
          )}
        </div>
        {/* Navigation */}
        <nav className="flex-1" aria-label="Sidebar main navigation">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onItemSelect(item.id)}
                  onKeyDown={(e) => handleKeyDown(e, item.id)}
                  onMouseEnter={() => collapsed && setShowTooltip(item.id)}
                  onMouseLeave={() => setShowTooltip(null)}
                  onFocus={() => collapsed && setShowTooltip(item.id)}
                  onBlur={() => setShowTooltip(null)}
                  className={`sidebar-item group relative flex items-center w-full px-4 py-3 rounded-xl text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 ${activeItem === item.id ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-[1.04]' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md'}`}
                  aria-current={activeItem === item.id ? 'page' : undefined}
                  aria-label={item.label}
                  tabIndex={0}
                >
                  {/* Animated active indicator */}
                  <span className={`absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-8 rounded-full transition-all duration-300 ${activeItem === item.id ? 'bg-gradient-to-b from-orange-400 to-yellow-400 shadow-md opacity-100' : 'opacity-0'}`}></span>
                  {/* Tooltip for collapsed mode */}
                  {collapsed && showTooltip === item.id && (
                    <div className="tooltip show" role="tooltip">
                      {item.label}
                    </div>
                  )}
                  <span className={`text-xl ${collapsed ? 'mx-auto' : 'mr-3'} transition-transform duration-200 ${activeItem === item.id ? 'text-white scale-110' : 'text-blue-500 group-hover:scale-110'}`}>{item.icon}</span>
                  {!collapsed && (
                    <div className="flex-1">
                      <span className={`font-semibold ${activeItem === item.id ? 'text-white' : 'text-gray-800'}`}>{item.label}</span>
                      <p className={`text-xs mt-1 ${activeItem === item.id ? 'text-blue-100' : 'text-gray-500'}`}>{item.description}</p>
                    </div>
                  )}
                  {/* Active indicator dot */}
                  {activeItem === item.id && !collapsed && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-sm border border-blue-300"></div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        {/* Footer */}
        <div className={`mt-auto pt-4 px-4 border-t border-gray-100 ${collapsed ? 'flex flex-col items-center space-y-2' : ''}`}>
          {/* System Status */}
          <div className="flex items-center mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span className="text-xs text-green-700 font-medium">System Online</span>
          </div>
          {/* Support & Logout */}
          {!collapsed && (
            <div className="flex flex-col gap-2 mt-2">
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200 shadow-sm transform hover:scale-105" tabIndex={0} aria-label="Get Support">
                Get Support
              </button>
              <button className="w-full bg-gray-100 hover:bg-red-100 text-red-600 text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200 shadow-sm transform hover:scale-105" tabIndex={0} aria-label="Logout">
                Logout
              </button>
            </div>
          )}
          {collapsed && (
            <>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <button className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-red-100 text-red-600 rounded-full transition-colors duration-200 shadow-sm" tabIndex={0} aria-label="Logout">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );

  return ReactDOM.createPortal(sidebarContent, document.body);
};

export default Sidebar; 