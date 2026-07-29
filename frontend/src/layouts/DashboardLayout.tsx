import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Filter, RefreshCw, PenSquare, Clock, Send, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function DashboardLayout() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const isScheduled = location.pathname.includes('/scheduled') || location.pathname === '/';
  const isSent = location.pathname.includes('/sent');

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  let user = {
    name: 'Oliver Brown',
    email: 'oliver.brown@domain.io',
    avatarUrl: 'https://i.pravatar.cc/150?u=oliver',
  };

  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      user = JSON.parse(storedUser);
    }
  } catch (e) {
    console.error(e);
  }

  return (
    <div className="flex h-screen bg-[#F9FAFB] font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#E5E7EB] flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-[#E5E7EB]">
          <h1 className="text-2xl font-bold tracking-tight text-[#111827]">ONE</h1>
        </div>

        {/* Profile Dropdown */}
        <div className="relative mx-4 mt-6">
          <div 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="p-4 bg-[#F9FAFB] rounded-[12px] border border-[#E5E7EB] flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <img src={user.avatarUrl || 'https://i.pravatar.cc/150'} alt="Avatar" className="w-10 h-10 rounded-full" />
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold text-[#111827] truncate w-24">{user.name}</span>
                <span className="text-xs text-[#6B7280] truncate w-24">{user.email}</span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-[#6B7280]" />
          </div>
          
          {showProfileMenu && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white border border-[#E5E7EB] rounded-[12px] shadow-lg z-10 py-2">
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Compose Button */}
        <div className="px-4 mt-6">
          <Link to="/compose">
            <button className="w-full flex items-center justify-center space-x-2 border-2 border-[#16A34A] text-[#16A34A] bg-white hover:bg-[#F0FDF4] font-medium py-3 rounded-[12px] transition-colors shadow-sm">
              <PenSquare className="w-5 h-5" />
              <span>Compose</span>
            </button>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4 mt-8 space-y-1">
          <p className="px-2 text-xs font-semibold text-[#9CA3AF] tracking-wider mb-4 uppercase">Core</p>
          
          <Link 
            to="/dashboard/scheduled" 
            className={`flex items-center justify-between px-3 py-3 rounded-[12px] transition-colors ${isScheduled ? 'bg-[#ECFDF5] text-[#16A34A]' : 'text-[#4B5563] hover:bg-gray-100'}`}
          >
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5" />
              <span className="font-medium">Scheduled</span>
            </div>
          </Link>

          <Link 
            to="/dashboard/sent" 
            className={`flex items-center justify-between px-3 py-3 rounded-[12px] transition-colors ${isSent ? 'bg-[#ECFDF5] text-[#16A34A]' : 'text-[#4B5563] hover:bg-gray-100'}`}
          >
            <div className="flex items-center space-x-3">
              <Send className="w-5 h-5" />
              <span className="font-medium">Sent</span>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-8">
          <div className="flex items-center bg-[#F9FAFB] border border-[#E5E7EB] rounded-[12px] px-4 py-2 w-96 focus-within:ring-2 focus-within:ring-[#16A34A] focus-within:border-transparent transition-shadow">
            <Search className="w-5 h-5 text-[#9CA3AF] mr-3" />
            <input 
              type="text" 
              placeholder="Search emails..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:outline-none w-full text-sm text-[#111827] placeholder-[#9CA3AF]"
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button 
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={`p-2 rounded-lg transition-colors ${statusFilter !== 'all' ? 'text-[#16A34A] bg-[#F0FDF4]' : 'text-[#6B7280] hover:bg-gray-100'}`}
              >
                <Filter className="w-5 h-5" />
              </button>
              
              {showFilterMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E5E7EB] rounded-[12px] shadow-lg z-10 py-2">
                  <div className="px-4 py-2 text-xs font-semibold text-[#9CA3AF] uppercase">Filter by Status</div>
                  <button onClick={() => {setStatusFilter('all'); setShowFilterMenu(false)}} className="w-full text-left px-4 py-2 text-sm text-[#111827] hover:bg-gray-50 flex items-center justify-between">
                    All {statusFilter === 'all' && <div className="w-2 h-2 rounded-full bg-[#16A34A]"></div>}
                  </button>
                  <button onClick={() => {setStatusFilter('sent'); setShowFilterMenu(false)}} className="w-full text-left px-4 py-2 text-sm text-[#111827] hover:bg-gray-50 flex items-center justify-between">
                    Delivered {statusFilter === 'sent' && <div className="w-2 h-2 rounded-full bg-[#16A34A]"></div>}
                  </button>
                  <button onClick={() => {setStatusFilter('failed'); setShowFilterMenu(false)}} className="w-full text-left px-4 py-2 text-sm text-[#111827] hover:bg-gray-50 flex items-center justify-between">
                    Failed {statusFilter === 'failed' && <div className="w-2 h-2 rounded-full bg-[#16A34A]"></div>}
                  </button>
                </div>
              )}
            </div>

            <button 
              onClick={() => {
                setRefreshTrigger(prev => prev + 1);
                setIsRefreshing(true);
                setTimeout(() => setIsRefreshing(false), 1000);
              }}
              className="p-2 text-[#6B7280] hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-[#16A34A]' : ''}`} />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet context={{ searchQuery, refreshTrigger, statusFilter }} />
        </div>
      </main>

    </div>
  );
}
