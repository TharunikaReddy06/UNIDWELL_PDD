import { Outlet } from 'react-router-dom';
import WebSidebar from '../components/navigation/WebSidebar';
import WebHeader from '../components/navigation/WebHeader';
import OwnerBottomNavigation from '../components/navigation/OwnerBottomNavigation';
import Footer from '../components/navigation/Footer';

export default function OwnerLayout() {
  return (
    <div className="min-h-screen flex w-full max-w-full overflow-x-hidden bg-[var(--bg-primary)] dark:bg-[#0B1320] text-gray-900 dark:text-gray-100 transition-colors duration-150">
      {/* Desktop Left Sidebar */}
      <WebSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
        {/* Top Header */}
        <WebHeader />

        {/* Centered 1600px Container */}
        <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 lg:pb-8 flex flex-col justify-between overflow-x-hidden">
          <div>
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>

      {/* Mobile Bottom Navigation (Hidden on Desktop lg:hidden) */}
      <div className="lg:hidden">
        <OwnerBottomNavigation />
      </div>
    </div>
  );
}
