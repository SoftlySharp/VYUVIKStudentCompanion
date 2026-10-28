import React, { useState } from 'react';
import {
  LayoutDashboard,
  Sparkles,
  BookOpen,
  CalendarDays,
  FileSearch,
  BookMarked,
  Mic,
  BellRing,
  FileSpreadsheet,
  FolderLock,
  Briefcase,
  FileText,
  Wallet,
  Clock,
  Compass,
  Settings,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useStudent } from '../../context/StudentContext';

interface AppSidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentRoute,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { profile } = useStudent();
  const [academicsOpen, setAcademicsOpen] = useState(true);
  const [collegeHubOpen, setCollegeHubOpen] = useState(true);
  const [careerHubOpen, setCareerHubOpen] = useState(true);

  const navItemClass = (route: string) => {
    const isActive = currentRoute === route;
    return `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
      isActive
        ? 'bg-[#F0EEFF] text-[#7065E8] font-semibold shadow-xs'
        : 'text-[#53566B] hover:text-[#171827] hover:bg-[#F4F4F8]'
    }`;
  };

  const handleNav = (route: string) => {
    onNavigate(route);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-[#E8E8EF] flex flex-col z-50 transition-transform duration-200 md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-[#E8E8EF] flex items-center justify-between">
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => handleNav('/dashboard')}
          >
            <div className="w-9 h-9 rounded-xl bg-[#7065E8] text-white flex items-center justify-center shadow-sm relative group">
              <GraduationCap className="w-5 h-5" />
              <Sparkles className="w-3 h-3 text-[#FFD166] absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-[#171827] tracking-tight">VYUVIK</span>
                <span className="text-[10px] uppercase tracking-wider font-bold bg-[#F0EEFF] text-[#7065E8] px-1.5 py-0.5 rounded-sm">
                  Student
                </span>
              </div>
              <p className="text-[11px] text-[#717487] font-medium leading-none">Simplified by AI</p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-[#717487] hover:text-[#171827] rounded-lg"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 text-xs">
          {/* Main Top Nav */}
          <button
            onClick={() => handleNav('/dashboard')}
            className={`w-full ${navItemClass('/dashboard')}`}
          >
            <LayoutDashboard className="w-4 h-4 text-[#7065E8]" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => handleNav('/assistant')}
            className={`w-full ${navItemClass('/assistant')}`}
          >
            <div className="relative">
              <Sparkles className="w-4 h-4 text-[#7065E8]" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#18856B]" />
            </div>
            <span>AI Command Center</span>
            <span className="ml-auto text-[10px] bg-[#EBE8FF] text-[#7065E8] font-bold px-1.5 py-0.2 rounded-full">
              Core
            </span>
          </button>

          {/* Academics Section */}
          <div className="pt-2">
            <button
              onClick={() => setAcademicsOpen(!academicsOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-[#8C8FA3] hover:text-[#171827] uppercase tracking-wider"
            >
              <span>Academics</span>
              {academicsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
            {academicsOpen && (
              <div className="space-y-1 pl-2 mt-1">
                <button
                  onClick={() => handleNav('/academics/assignments')}
                  className={`w-full ${navItemClass('/academics/assignments')}`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Assignments</span>
                </button>
                <button
                  onClick={() => handleNav('/academics/planner')}
                  className={`w-full ${navItemClass('/academics/planner')}`}
                >
                  <CalendarDays className="w-4 h-4" />
                  <span>Study Planner</span>
                </button>
                <button
                  onClick={() => handleNav('/academics/previous-papers')}
                  className={`w-full ${navItemClass('/academics/previous-papers')}`}
                >
                  <FileSearch className="w-4 h-4" />
                  <span>PYQ Paper Analyzer</span>
                </button>
                <button
                  onClick={() => handleNav('/academics/study')}
                  className={`w-full ${navItemClass('/academics/study')}`}
                >
                  <BookMarked className="w-4 h-4" />
                  <span>Study Assistant</span>
                </button>
                <button
                  onClick={() => handleNav('/academics/viva')}
                  className={`w-full ${navItemClass('/academics/viva')}`}
                >
                  <Mic className="w-4 h-4" />
                  <span>AI Viva Prep</span>
                </button>
              </div>
            )}
          </div>

          {/* College Hub Section */}
          <div className="pt-2">
            <button
              onClick={() => setCollegeHubOpen(!collegeHubOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-[#8C8FA3] hover:text-[#171827] uppercase tracking-wider"
            >
              <span>College Hub</span>
              {collegeHubOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
            {collegeHubOpen && (
              <div className="space-y-1 pl-2 mt-1">
                <button
                  onClick={() => handleNav('/college/notices')}
                  className={`w-full ${navItemClass('/college/notices')}`}
                >
                  <BellRing className="w-4 h-4" />
                  <span>Notice Center</span>
                </button>
                <button
                  onClick={() => handleNav('/college/notice-intelligence')}
                  className={`w-full ${navItemClass('/college/notice-intelligence')}`}
                >
                  <Sparkles className="w-4 h-4 text-[#7065E8]" />
                  <span>Notice Intelligence</span>
                </button>
                <button
                  onClick={() => handleNav('/college/forms')}
                  className={`w-full ${navItemClass('/college/forms')}`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Form Assistant</span>
                </button>
              </div>
            )}
          </div>

          {/* Document Vault */}
          <div className="pt-2">
            <button
              onClick={() => handleNav('/documents')}
              className={`w-full ${navItemClass('/documents')}`}
            >
              <FolderLock className="w-4 h-4" />
              <span>Document Vault</span>
            </button>
          </div>

          {/* Career Hub */}
          <div className="pt-2">
            <button
              onClick={() => setCareerHubOpen(!careerHubOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-[#8C8FA3] hover:text-[#171827] uppercase tracking-wider"
            >
              <span>Career Hub</span>
              {careerHubOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
            {careerHubOpen && (
              <div className="space-y-1 pl-2 mt-1">
                <button
                  onClick={() => handleNav('/career/internships')}
                  className={`w-full ${navItemClass('/career/internships')}`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Internships</span>
                </button>
                <button
                  onClick={() => handleNav('/career/resume')}
                  className={`w-full ${navItemClass('/career/resume')}`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Resume Tools</span>
                </button>
              </div>
            )}
          </div>

          {/* Utilities & Attendance */}
          <div className="pt-2">
            <div className="px-3 py-1 text-xs font-semibold text-[#8C8FA3] uppercase tracking-wider">
              Student Life
            </div>
            <button
              onClick={() => handleNav('/attendance')}
              className={`w-full ${navItemClass('/attendance')}`}
            >
              <Clock className="w-4 h-4" />
              <span>Attendance Tracker</span>
            </button>
            <button
              onClick={() => handleNav('/finance')}
              className={`w-full ${navItemClass('/finance')}`}
            >
              <Wallet className="w-4 h-4" />
              <span>Expense Manager</span>
            </button>
            <button
              onClick={() => handleNav('/focus-zone')}
              className={`w-full ${navItemClass('/focus-zone')}`}
            >
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>3D Focus & Zen Break</span>
            </button>
            <button
              onClick={() => handleNav('/settings')}
              className={`w-full ${navItemClass('/settings')}`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Student Profile Card Footer */}
        <div className="p-3 border-t border-[#E8E8EF] bg-[#FAFAFC]">
          <div className="flex items-center justify-between gap-2">
            <div
              className="flex items-center gap-2.5 min-w-0 cursor-pointer"
              onClick={() => handleNav('/settings')}
            >
              <div className="w-8 h-8 rounded-full bg-[#E0DCFE] text-[#7065E8] flex items-center justify-center font-bold text-xs shrink-0">
                {profile.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#171827] truncate">{profile.name}</p>
                <p className="text-[10px] text-[#717487] truncate">{profile.college.split(' ')[0]}</p>
              </div>
            </div>
            <button
              onClick={() => handleNav('/login')}
              className="p-1.5 text-[#8C8FA3] hover:text-[#C64545] rounded-lg hover:bg-white"
              title="Sign Out / Switch Account"
              aria-label="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
