import React, { useState, useEffect } from 'react';
import { StudentProvider, useStudent } from './context/StudentContext';
import { AppSidebar } from './components/layout/AppSidebar';
import { AppHeader } from './components/layout/AppHeader';

// Views
import { DashboardView } from './views/DashboardView';
import { AssistantView } from './views/AssistantView';
import { AssignmentsView } from './views/AssignmentsView';
import { PlannerView } from './views/PlannerView';
import { PreviousPapersView } from './views/PreviousPapersView';
import { NoticesView } from './views/NoticesView';
import { NoticeIntelligenceView } from './views/NoticeIntelligenceView';
import { FormsView } from './views/FormsView';
import { DocumentVaultView } from './views/DocumentVaultView';
import { InternshipsView } from './views/InternshipsView';
import { ResumeToolsView } from './views/ResumeToolsView';
import { VivaView } from './views/VivaView';
import { FinanceView } from './views/FinanceView';
import { AttendanceView } from './views/AttendanceView';
import { StudyAssistantView } from './views/StudyAssistantView';
import { FocusZoneView } from './views/FocusZoneView';
import { SettingsView } from './views/SettingsView';
import { OnboardingView } from './views/OnboardingView';
import { AuthView } from './views/AuthView';

const MainLayout: React.FC = () => {
  const { profile, isAuthenticated } = useStudent();
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const path = window.location.pathname;
    return path === '/' ? '/login' : path;
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Sync route with browser history
  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname;
      setCurrentRoute(p === '/' ? '/login' : p);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (route: string) => {
    const cleanRoute = route.split('?')[0];
    window.history.pushState({}, '', route);
    setCurrentRoute(cleanRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If user requests login or signup explicitly
  if (currentRoute === '/login' || (!isAuthenticated && currentRoute !== '/signup')) {
    return (
      <AuthView
        initialMode="login"
        onSuccess={(dest) => navigate(dest || '/dashboard')}
      />
    );
  }

  if (currentRoute === '/signup') {
    return (
      <AuthView
        initialMode="signup"
        onSuccess={(dest) => navigate(dest || '/onboarding')}
      />
    );
  }

  // If user requests /onboarding or isn't onboarded
  if (currentRoute === '/onboarding' || !profile.isOnboarded) {
    return <OnboardingView onComplete={() => navigate('/dashboard')} />;
  }

  const renderCurrentView = () => {
    switch (currentRoute) {
      case '/dashboard':
        return <DashboardView onNavigate={navigate} />;
      case '/assistant':
        return <AssistantView />;
      case '/academics/assignments':
        return <AssignmentsView />;
      case '/academics/planner':
        return <PlannerView />;
      case '/academics/previous-papers':
        return <PreviousPapersView />;
      case '/academics/study':
        return <StudyAssistantView />;
      case '/academics/viva':
        return <VivaView />;
      case '/college/notices':
        return <NoticesView onNavigate={navigate} />;
      case '/college/notice-intelligence':
        return <NoticeIntelligenceView onNavigate={navigate} />;
      case '/college/forms':
        return <FormsView />;
      case '/documents':
        return <DocumentVaultView />;
      case '/career/internships':
        return <InternshipsView onNavigate={navigate} />;
      case '/career/resume':
        return <ResumeToolsView />;
      case '/finance':
        return <FinanceView />;
      case '/attendance':
        return <AttendanceView />;
      case '/focus-zone':
        return <FocusZoneView />;
      case '/settings':
        return <SettingsView />;
      default:
        return <DashboardView onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#171827] flex">
      {/* Persistent Left Sidebar */}
      <AppSidebar
        currentRoute={currentRoute}
        onNavigate={navigate}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <AppHeader
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onNavigate={navigate}
        />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <StudentProvider>
      <MainLayout />
    </StudentProvider>
  );
}
