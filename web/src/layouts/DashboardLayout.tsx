import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { AnandHomesLogo } from '../components/AnandHomesLogo';
import { useAuth } from '../hooks/useAuth';
import { useDashboardContext } from '../context/DashboardContext';
import { DatabaseStatusBadge } from '../components/common';
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
  Heart,
  FileQuestion,
  User as UserIcon,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  section?: 'real-estate' | 'construction' | 'system';
}

export const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    roleMode,
    selectedSite,
    setSelectedSite,
    sitesList,
    globalSearch,
    setGlobalSearch,
    selectedDate,
  } = useDashboardContext();

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

  const notifications = [
    { id: 1, title: 'New Property Listed', desc: '4 BHK Luxury Villa in ECR added to portfolio', time: '10m ago', unread: true },
    { id: 2, title: 'Delivery Received', desc: 'DLV-0042 Cement 195 Bags received at Site Alpha', time: '1h ago', unread: true },
    { id: 3, title: 'Enquiry Received', desc: 'Client requested a callback for Anna Nagar Apartment', time: '2h ago', unread: false },
  ];

  const isAdmin = user?.role === 'admin' || roleMode === 'admin' || user?.email?.toLowerCase().includes('admin@');
  const userRole = isAdmin ? 'Super Admin' : 'Site Supervisor';
  const userName = user?.name || (isAdmin ? 'Admin User' : 'Rajesh Kumar');
  const userEmail = user?.email || (isAdmin ? 'admin@anandhomes.com' : 'rajesh.k@anandhomes.com');

  // Navigation items strictly tailored by role
  const adminNavItems: NavItem[] = [
    { label: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Sites / Projects', path: '/sites', icon: Building2 },
    { label: 'Global Inventory', path: '/inventory', icon: Package },
    { label: 'Material Approvals', path: '/material-requests', icon: FileSpreadsheet },
    { label: 'Deliveries Monitoring', path: '/deliveries', icon: Truck },
    { label: 'Photo Monitoring', path: '/photo-monitoring', icon: Camera },
    { label: 'GIS Site Map', path: '/map', icon: MapPin },
    { label: 'Low Stock Alerts', path: '/low-stock', icon: AlertTriangle },
    { label: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
    { label: 'Properties Portfolio', path: '/properties', icon: Building2 },
    { label: 'Profile Settings', path: '/profile', icon: Settings },
  ];

  const supervisorNavItems: NavItem[] = [
    { label: 'Supervisor Dashboard', path: '/supervisor/dashboard', icon: LayoutDashboard },
    { label: 'My Assigned Site', path: '/my-site', icon: HardHat },
    { label: 'Record Stock In', path: '/stock-in', icon: ArrowDownToLine },
    { label: 'Record Stock Out', path: '/stock-out', icon: ArrowUpFromLine },
    { label: 'Material Indents', path: '/material-requests', icon: FileSpreadsheet },
    { label: 'Consignment Deliveries', path: '/deliveries', icon: Truck },
    { label: 'Site Progress Photos', path: '/photo-monitoring', icon: Camera },
    { label: 'Low Stock Warnings', path: '/low-stock', icon: AlertTriangle },
    { label: 'Site Map View', path: '/map', icon: MapPin },
    { label: 'My Profile', path: '/profile', icon: Settings },
  ];

  const navItems = isAdmin ? adminNavItems : supervisorNavItems;

  const getPageTitle = () => {
    const p = location.pathname;
    if (p === '/admin/dashboard') return 'Super Admin Dashboard';
    if (p === '/supervisor/dashboard') return 'Site Supervisor Dashboard';
    if (p === '/dashboard' || p === '/') return isAdmin ? 'Super Admin Dashboard' : 'Site Supervisor Dashboard';
    if (p.includes('/properties')) return 'Properties Portfolio';
    if (p.includes('/favorites')) return 'Saved Favorites';
    if (p.includes('/enquiries')) return 'Property Enquiries';
    if (p.includes('/sites')) return 'Sites / Projects';
    if (p.includes('/my-site')) return 'My Assigned Site';
    if (p.includes('/inventory')) return 'Inventory Management';
    if (p.includes('/stock-in')) return 'Record Stock In';
    if (p.includes('/stock-out')) return 'Record Stock Out';
    if (p.includes('/material-requests')) return isAdmin ? 'Material Requisition Approvals' : 'Site Material Indents';
    if (p.includes('/deliveries')) return 'Deliveries & Shipments';
    if (p.includes('/photo-monitoring')) return 'Photo Monitoring';
    if (p.includes('/reports')) return 'Reports & Audit';
    if (p.includes('/map')) return 'Site Map Telemetry';
    if (p.includes('/low-stock')) return 'Low Stock Alerts';
    if (p.includes('/profile')) return 'User Profile';
    return 'Operations Portal';
  };

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    navigate('/login');
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0D5C3A] to-emerald-400 text-white font-bold flex items-center justify-center ring-2 ring-emerald-500/40">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0A3925]" />
          </div>

          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white truncate">
                {userName}
              </h4>
              <p className="text-[10px] text-emerald-300/80 font-medium truncate">
                {userRole}
              </p>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1 py-2">
          {navItems.map((item) => {
            const isDashboard = item.path.includes('/dashboard');
            const isDashboardRoute = location.pathname === '/' || location.pathname === '/dashboard' || location.pathname === '/admin/dashboard' || location.pathname === '/supervisor/dashboard';
            const isActive = (isDashboard && isDashboardRoute) || location.pathname === item.path;
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

        {/* Sidebar Footer Logout */}
        {sidebarOpen && (
          <div className="p-3 border-t border-[#0E4F32]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[#082E1E] hover:bg-rose-950/60 text-emerald-200/80 hover:text-rose-300 border border-[#0F4A30] text-xs font-bold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 shadow-xs">
          {/* Left: Hamburger & Title */}
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

            {/* Contextual Role Quick Link */}
            {isAdmin ? (
              <Link
                to="/sites"
                className="hidden md:inline-flex items-center gap-1.5 ml-3 px-3 py-1 rounded-full text-xs font-bold text-[#0D5C3A] bg-emerald-50 hover:bg-emerald-100 transition-colors"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Manage Project Sites</span>
              </Link>
            ) : (
              <Link
                to="/stock-in"
                className="hidden md:inline-flex items-center gap-1.5 ml-3 px-3 py-1 rounded-full text-xs font-bold text-[#0D5C3A] bg-emerald-50 hover:bg-emerald-100 transition-colors"
              >
                <ArrowDownToLine className="w-3.5 h-3.5" />
                <span>+ Record Stock In</span>
              </Link>
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
                placeholder="Search properties, materials, sites..."
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:border-[#0D5C3A] focus:ring-2 focus:ring-[#0D5C3A]/10 transition-all placeholder:text-slate-400 text-slate-700"
              />
            </div>
          </div>

          {/* Right: Date, Notifications, Profile */}
          <div className="flex items-center gap-3">
            {/* Date Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-xs">
              <span>{selectedDate}</span>
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
            </div>

            {/* Live Database Connectivity Badge */}
            <DatabaseStatusBadge />

            {/* Role Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[#0D5C3A] text-xs font-bold">
              {isAdmin ? (
                <Shield className="w-3.5 h-3.5 text-[#0D5C3A]" />
              ) : (
                <HardHat className="w-3.5 h-3.5 text-amber-600" />
              )}
              <span>{userRole}</span>
            </div>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white flex items-center justify-center text-[8px] text-white font-bold" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                    <span className="text-xs font-bold text-slate-800">Notifications</span>
                    <span className="text-[10px] text-[#0D5C3A] font-semibold cursor-pointer">Mark all as read</span>
                  </div>
                  <div className="space-y-2">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs hover:bg-slate-100 transition-colors cursor-pointer">
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

            {/* Profile Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-slate-100 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-[#0D5C3A] text-white font-bold text-xs flex items-center justify-center ring-1 ring-slate-200">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block leading-tight">
                  <span className="block text-xs font-bold text-slate-800 truncate max-w-[120px]">
                    {userName}
                  </span>
                  <span className="block text-[10px] text-slate-500 font-medium">
                    {userRole}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-800 truncate">{userName}</p>
                    <p className="text-[10px] text-slate-500 truncate">{userEmail}</p>
                  </div>
                  <Link
                    to={isAdmin ? '/admin/dashboard' : '/supervisor/dashboard'}
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-medium mt-1"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isAdmin ? 'Admin Dashboard' : 'Supervisor Dashboard'}</span>
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-medium"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to={isAdmin ? '/sites' : '/my-site'}
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-medium"
                  >
                    <HardHat className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isAdmin ? 'Construction Sites' : 'My Assigned Site'}</span>
                  </Link>
                  <Link
                    to="/inventory"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-medium"
                  >
                    <Package className="w-3.5 h-3.5 text-blue-500" />
                    <span>Inventory Materials</span>
                  </Link>
                  <div className="pt-1 mt-1 border-t border-slate-100">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 font-bold flex items-center justify-between transition-colors"
                    >
                      <span>Log Out</span>
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    </button>
                  </div>
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
