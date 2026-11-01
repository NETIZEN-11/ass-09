import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto ml-0 lg:ml-64 transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
