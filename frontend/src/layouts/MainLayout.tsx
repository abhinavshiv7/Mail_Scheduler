import { Outlet, Link } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <nav className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-xl font-bold text-slate-900 dark:text-white">
                  Dashboard
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <Link to="/login" className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300">
                Logout
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
