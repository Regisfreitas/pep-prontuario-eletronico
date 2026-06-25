import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main id="wrapper" className="flex-1 flex flex-col min-w-0 overflow-auto fuse-content">
        <Outlet />
      </main>
    </div>
  );
}
