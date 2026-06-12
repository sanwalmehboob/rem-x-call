import React, { useCallback, useMemo, useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useUnreadMessageCount } from '../hooks/useUnreadMessageCount';
import { useNotifications } from '../hooks/useNotifications';
import {
  LayoutDashboard,
  MessageSquare,
  Inbox,
  Users,
  Package,
  PieChart,
  CreditCard,
  Settings,
  Search,
  PanelLeft,
  LayoutGrid,
  LogOut,
} from 'lucide-react';
import InboxPanel from './InboxPanel';
import { useAuth } from '../context/AuthContext';

const AgentLogo = ({ user, whiteLabelEnabled }) => (
  <div className="flex items-center gap-3">
    <img
      src={whiteLabelEnabled && user?.company?.whiteLabelLogoUrl ? user.company.whiteLabelLogoUrl : '/dashboard-logo.svg'}
      alt={user?.company?.name || 'RemXCall'}
      className="h-9 w-9 shrink-0 rounded-md object-cover"
    />
    <span
      className="font-display font-[900] text-[22px] tracking-[-0.03em] text-white"
      style={whiteLabelEnabled && user?.company?.brandFont ? { fontFamily: user.company.brandFont } : undefined}
    >
      {user?.company?.name || 'RemXCall'}
    </span>
  </div>
);

const baseNav = [
  { name: 'Dashboard', path: '/agent/dashboard', icon: LayoutDashboard },
  { name: 'Messages', path: '/agent/messages', icon: MessageSquare },
  { name: 'Notifications', action: 'toggle_notifications', icon: Inbox },
  { name: 'Contact Management', path: '/agent/contacts', icon: Users },
  { name: 'Product Management', path: '/agent/products', icon: Package },
  { name: 'Reports & Analytics', path: '/agent/reports', icon: PieChart },
  { name: 'Subscriptions & Billing', path: '/agent/billing', icon: CreditCard },
];

const itemClass = (isActive) =>
  `flex items-center justify-between gap-2 w-full px-3 py-2.5 rounded-xl text-[14px] font-semibold transition-all duration-200 ${
    isActive ? 'bg-white text-[#0a0a0a] shadow-lg shadow-black/20' : 'text-gray-400 hover:bg-white/10 hover:text-white'
  }`;

export default function AgentDashboardLayout() {
  const unreadMessages = useUnreadMessageCount();
  const { unreadCount } = useNotifications();
  const [searchParams, setSearchParams] = useSearchParams();
  const headerSearchQ = searchParams.get('q') ?? '';
  const setHeaderSearch = (value) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        const v = String(value ?? '');
        if (v.trim()) next.set('q', v);
        else next.delete('q');
        return next;
      },
      { replace: true }
    );
  };
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const headerAvatarSrc =
    user?.profileImageUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || user?.email || 'User')}&background=e5e7eb&color=374151&size=128`;
  const whiteLabelEnabled = Boolean(user?.company?.subscriptionPlan?.whiteLabelEnabled);
  const primary = whiteLabelEnabled ? user?.company?.primaryBrandColor || '#000000' : '#000000';
  const secondary = whiteLabelEnabled ? user?.company?.secondaryBrandColor || '#111111' : '#111111';
  const sidebarStyle = {
    background: `linear-gradient(180deg, ${primary} 0%, ${secondary} 100%)`,
    ...(whiteLabelEnabled && user?.company?.brandFont ? { fontFamily: user.company.brandFont } : {}),
  };

  const breadcrumb = useMemo(() => {
    const path = location.pathname;
    const seg = baseNav.find((n) => n.path && path.startsWith(n.path));
    if (seg) return ['Dashboard', seg.name];
    if (path.startsWith('/agent/settings')) return ['Dashboard', 'Settings'];
    return ['Dashboard'];
  }, [location.pathname]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  /** Only collapse the drawer on small screens after navigation — desktop sidebar stays open. */
  const closeSidebarIfMobile = useCallback(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches) {
      setIsSidebarOpen(false);
    }
  }, []);

  return (
    <div className="relative flex h-screen min-h-0 w-full overflow-hidden bg-[#f4f4f4] font-sans">
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[55]"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={`
        bg-black h-full flex flex-col pt-6 pb-8 transition-all duration-300 shrink-0 z-[60]
        fixed lg:relative border-r border-white/5
        ${
          isSidebarOpen
            ? 'w-[260px] px-4 translate-x-0 opacity-100'
            : '-translate-x-full w-0 px-0 opacity-0 overflow-hidden lg:translate-x-0 lg:w-[260px] lg:px-4 lg:opacity-100 lg:overflow-visible'
        }
      `}
        style={sidebarStyle}
      >
        <div className="px-2 mb-10 whitespace-nowrap">
          <AgentLogo user={user} whiteLabelEnabled={whiteLabelEnabled} />
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto pr-1 scrollbar-hide">
          {baseNav.map((link) => {
            if (link.action === 'toggle_notifications') {
              return (
                <button
                  key={link.name}
                  type="button"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-[14px] font-semibold transition-all ${
                    isNotificationsOpen
                      ? 'bg-white text-[#0a0a0a] shadow-lg'
                      : 'text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <link.icon className="w-4 h-4 shrink-0" />
                    <span>{link.name}</span>
                  </div>
                  {unreadCount > 0 && (
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full min-w-[22px] text-center ${
                        isNotificationsOpen ? 'bg-gray-900 text-white' : 'bg-white/15 text-white'
                      }`}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            }

            const isMsgsNav = link.path === '/agent/messages';
            const msgBadge = isMsgsNav ? unreadMessages : 0;
            const showMsgBadge = msgBadge > 0;
            const staticBadge = !isMsgsNav ? link.badge : 0;
            const showStatic = staticBadge > 0;

            return (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) => itemClass(isActive)}
                onClick={closeSidebarIfMobile}
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3 min-w-0">
                      <link.icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{link.name}</span>
                    </div>
                    {showMsgBadge ? (
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          isActive ? 'bg-gray-200 text-gray-900' : 'bg-white/15 text-white'
                        }`}
                      >
                        {msgBadge > 9 ? '9+' : msgBadge}
                      </span>
                    ) : showStatic ? (
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          isActive ? 'bg-gray-200 text-gray-900' : 'bg-white/15 text-white'
                        }`}
                      >
                        {staticBadge}
                      </span>
                    ) : null}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <NavLink
            to="/agent/settings"
            className={({ isActive }) => itemClass(isActive)}
            onClick={closeSidebarIfMobile}
          >
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4 shrink-0" />
              <span>Settings</span>
            </div>
          </NavLink>
        </div>
      </aside>

      <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#f4f4f4]">
        <InboxPanel isOpen={isNotificationsOpen} />

        <header className="h-[72px] shrink-0 flex items-center justify-between px-4 lg:px-8 bg-[#f4f4f4]">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-500 hover:text-gray-900 p-1.5 rounded-lg transition-colors shrink-0"
              aria-label="Toggle sidebar"
            >
              <PanelLeft className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-[13px] font-semibold text-gray-500 truncate">
              <LayoutGrid className="w-4 h-4 shrink-0 text-gray-400" />
              {breadcrumb.map((part, i) => (
                <span key={part} className="flex items-center gap-2 min-w-0">
                  {i > 0 && <span className="text-gray-300">/</span>}
                  <span className={i === breadcrumb.length - 1 ? 'text-gray-900 truncate' : 'truncate'}>{part}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="hidden md:block relative w-[220px] lg:w-[260px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="search"
                value={headerSearchQ}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="Search"
                autoComplete="off"
                className="w-full bg-white border border-gray-200/80 py-2.5 pl-10 pr-4 rounded-full text-sm font-medium shadow-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8bed21]/50"
              />
            </div>
            <button
              type="button"
              className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-white bg-gray-200 shadow-md ring-1 ring-gray-200"
              aria-label="Profile"
            >
              <img
                src={headerAvatarSrc}
                alt=""
                className="h-full w-full object-cover"
                key={user?.profileImageUrl || user?.id || 'avatar'}
              />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="hidden sm:inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
            >
              <LogOut className="h-3.5 w-3.5" />
              {isLoggingOut ? '…' : 'Logout'}
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pb-12 pt-1 [-webkit-overflow-scrolling:touch] lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
