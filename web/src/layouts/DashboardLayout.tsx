import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { AnandHomesLogo } from '../components/AnandHomesLogo';
import { useDashboardContext } from '../context/DashboardContext';
import {
  LayoutDashboard,
  Building2,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  FileSpreadsheet,
  Truck,
  Camera,
  BarChart3,
  Users,
  Handshake,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  PhoneCall,
  Calendar,
  Shield,
  HardHat,
  ChevronRight,
  MapPin,
  AlertTriangle,
  LogOut,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    roleMode,
    setRoleMode,
    selectedSite,
    setSelectedSite,
    sitesList,
    globalSearch,
    setGlobalSearch,
    selectedDate,
    setSelectedDate,
  } = useDashboardContext();

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

  // Notifications sample data
  const notifications = [
    { id: 1, title: 'Low Stock Alert', desc: 'Sand stock below reorder level (3 Loads remaining)', time: '10m ago', unread: true },
    { id: 2, title: 'Delivery Received', desc: 'DLV-0042 Cement 195 Bags received at Site Alpha', time: '1h ago', unread: true },
    { id: 3, title: 'Material Request', desc: 'REQ-1024 Cement submitted by Rajesh Kumar', time: '3h ago', unread: false },
  ];

  // Navigation items matching Image 1 & 2
  const adminNavItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Sites / Projects', path: '/sites', icon: Building2 },
    { label: 'Inventory', path: '/inventory', icon: Package },
    { label: 'Stock In', path: '/stock-in', icon: ArrowDownToLine },
    { label: 'Stock Out', path: '/stock-out', icon: ArrowUpFromLine },
    { label: 'Material Requests', path: '/material-requests', icon: FileSpreadsheet },
    { label: 'Deliveries', path: '/deliveries', icon: Truck },
    { label: 'Photo Monitoring', path: '/photo-monitoring', icon: Camera },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
    { label: 'Site Map View', path: '/map', icon: MapPin },
    { label: 'Low Stock Alerts', path: '/low-stock', icon: AlertTriangle, badge: '7' },
    { label: 'Users', path: '/users', icon: Users },
    { label: 'Suppliers', path: '/suppliers', icon: Handshake },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const supervisorNavItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Site', path: '/my-site', icon: Building2 },
    { label: 'Inventory', path: '/inventory', icon: Package },
    { label: 'Stock In', path: '/stock-in', icon: ArrowDownToLine },
    { label: 'Stock Out', path: '/stock-out', icon: ArrowUpFromLine },
    { label: 'Material Requests', path: '/material-requests', icon: FileSpreadsheet },
    { label: 'Deliveries', path: '/deliveries', icon: Truck },
    { label: 'Photo Monitoring', path: '/photo-monitoring', icon: Camera },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
    { label: 'Site Map View', path: '/map', icon: MapPin },
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: '3' },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const navItems = roleMode === 'admin' ? adminNavItems : supervisorNavItems;

  const getPageTitle = () => {
    const p = location.pathname;
    if (p.includes('/sites')) return 'Sites / Projects';
    if (p.includes('/my-site')) return 'My Site';
    if (p.includes('/inventory')) return 'Inventory';
    if (p.includes('/stock-in')) return 'Stock In';
    if (p.includes('/stock-out')) return 'Stock Out';
    if (p.includes('/material-requests')) return 'Material Requests';
    if (p.includes('/deliveries')) return 'Deliveries';
    if (p.includes('/photo-monitoring')) return 'Photo Monitoring';
    if (p.includes('/reports')) return 'Reports';
    if (p.includes('/map')) return 'Site Map View';
    if (p.includes('/low-stock')) return 'Low Stock Alerts';
    if (p.includes('/profile')) return 'Profile';
    if (p.includes('/users')) return 'Users Management';
    if (p.includes('/suppliers')) return 'Suppliers';
    if (p.includes('/settings')) return 'Settings';
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 flex flex-col bg-[#0A3925] text-white border-r border-[#0D482F] transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Area */}
        <div className="py-5 px-4 border-b border-[#0E4F32] flex flex-col items-center justify-center relative">
          <AnandHomesLogo collapsed={!sidebarOpen} />
          {/* Close button for mobile */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden absolute top-4 right-4 text-emerald-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-3 mx-3 my-3 bg-[#082E1E]/80 border border-[#0F4A30] rounded-xl flex items-center gap-3">
          <div className="relative shrink-0">
            {roleMode === 'admin' ? (
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Admin"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/40"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center">
                <HardHat className="w-5 h-5 text-amber-400" />
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0A3925]" />
          </div>

          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white truncate">
                  {roleMode === 'admin' ? 'Admin User' : 'Rajesh Kumar'}
                </h4>
              </div>
              <p className="text-[10px] text-emerald-300/80 font-medium truncate">
                {roleMode === 'admin' ? 'Super Admin' : 'Site Supervisor • Alpha'}
              </p>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1 py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#0D5C3A] text-white shadow-sm font-semibold'
                    : 'text-emerald-100/75 hover:bg-[#0E4930] hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-300' : 'text-emerald-200/60'}`} />
                {sidebarOpen && (
                  <span className="truncate flex-1">{item.label}</span>
                )}
                {sidebarOpen && item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500 text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Supervisor Need Help Footer */}
        {sidebarOpen && roleMode === 'supervisor' && (
          <div className="p-3 mx-3 mb-3 bg-[#082E1E]/80 border border-[#0F4A30] rounded-xl text-center">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-1">
              <PhoneCall className="w-3.5 h-3.5" />
            </div>
            <p className="text-[11px] font-medium text-slate-300">Need Help?</p>
            <p className="text-[10px] text-slate-400">Contact Admin</p>
            <p className="text-xs font-bold text-emerald-400 mt-1">98765 43210</p>
          </div>
        )}
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 shadow-xs">
          {/* Left: Hamburger & Title & Site Selector */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setMobileMenuOpen(true);
                } else {
                  setSidebarOpen(!sidebarOpen);
                }
              }}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              aria-label="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <h1 className="text-lg font-bold text-slate-800 tracking-tight">{getPageTitle()}</h1>

            {/* Site selector for Supervisor view */}
            {roleMode === 'supervisor' && (
              <div className="hidden sm:flex items-center gap-2 ml-4 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700">
                <Building2 className="w-3.5 h-3.5 text-[#0D5C3A]" />
                <select
                  value={selectedSite}
                  onChange={(e) => setSelectedSite(e.target.value)}
                  className="bg-transparent font-semibold outline-none cursor-pointer pr-2"
                >
                  {sitesList.map((site) => (
                    <option key={site} value={site}>
                      {site}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Center: Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search anything..."
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:border-[#0D5C3A] focus:ring-2 focus:ring-[#0D5C3A]/10 transition-all placeholder:text-slate-400 text-slate-700"
              />
            </div>
          </div>

          {/* Right: Date, Role Switcher, Notifications, Profile */}
          <div className="flex items-center gap-3">
            {/* Date Indicator matching mockup */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-xs">
              <span>{selectedDate}</span>
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
            </div>

            {/* Active User Role Badge (Determined by Login) */}
            {roleMode === 'admin' ? (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[#0D5C3A] text-xs font-bold shadow-2xs">
                <Shield className="w-3.5 h-3.5 text-[#0D5C3A]" />
                <span>Admin Portal</span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold shadow-2xs">
                <HardHat className="w-3.5 h-3.5 text-amber-700" />
                <span>Supervisor (Site Alpha)</span>
              </div>
            )}

            {/* Notifications with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white flex items-center justify-center text-[8px] text-white font-bold">
                  1
                </span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                    <span className="text-xs font-bold text-slate-800">Notifications</span>
                    <span className="text-[10px] text-[#0D5C3A] font-semibold cursor-pointer">Mark all as read</span>
                  </div>
                  <div className="space-y-2">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs hover:bg-slate-100 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-bold text-slate-800">{n.title}</span>
                          <span className="text-[10px] text-slate-400">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar & Name */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-slate-100 transition-colors text-left"
              >
                <img
                  src={
                    roleMode === 'admin'
                      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
                  }
                  alt="User"
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                />
                <div className="hidden lg:block leading-tight">
                  <span className="block text-xs font-bold text-slate-800">
                    {roleMode === 'admin' ? 'Admin User' : 'Rajesh Kumar'}
                  </span>
                  <span className="block text-[10px] text-slate-500 font-medium">
                    {roleMode === 'admin' ? 'Super Admin' : 'Supervisor'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-800">{roleMode === 'admin' ? 'Admin User' : 'Rajesh Kumar'}</p>
                    <p className="text-[10px] text-slate-500">{roleMode === 'admin' ? 'admin@anandhomes.com' : 'rajesh.k@anandhomes.com'}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="block w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 font-medium mt-1"
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={() => {
                      localStorage.removeItem('ah_user_role');
                      setShowUserMenu(false);
                      navigate('/login');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-600 font-bold flex items-center justify-between transition-colors"
                  >
                    <span>Log Out</span>
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
