import { Outlet } from 'react-router';
import { Header } from './Header';
import { HistoryPanel } from './HistoryPanel';
import { SettingsModal } from './SettingsModal';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f2f8f5' }}>
      <Header />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <HistoryPanel />
      <SettingsModal />
    </div>
  );
}
