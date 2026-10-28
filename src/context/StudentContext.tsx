import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  StudentProfile,
  Assignment,
  Notice,
  DocumentItem,
  InternshipOpp,
  ExpenseItem,
  AttendanceSubject,
  StudyBlock,
  NotificationItem,
} from '../types/student';

interface StudentContextType {
  profile: StudentProfile;
  updateProfile: (p: Partial<StudentProfile>) => void;
  assignments: Assignment[];
  addAssignment: (a: Assignment) => void;
  updateAssignment: (id: string, a: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  toggleChecklistItem: (assignmentId: string, checklistId: string) => void;
  notices: Notice[];
  addNotice: (n: Notice) => void;
  toggleNoticePin: (id: string) => void;
  toggleNoticeRead: (id: string) => void;
  deleteNotice: (id: string) => void;
  documents: DocumentItem[];
  addDocument: (d: DocumentItem) => void;
  deleteDocument: (id: string) => void;
  internships: InternshipOpp[];
  addInternship: (i: InternshipOpp) => void;
  updateInternshipStatus: (id: string, status: InternshipOpp['status']) => void;
  deleteInternship: (id: string) => void;
  expenses: ExpenseItem[];
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  syncWithServer: () => Promise<void>;
  addExpense: (e: ExpenseItem) => void;
  deleteExpense: (id: string) => void;
  attendanceList: AttendanceSubject[];
  updateAttendance: (id: string, attended: number, conducted: number) => void;
  addAttendanceSubject: (s: AttendanceSubject) => void;
  studyBlocks: StudyBlock[];
  setStudyBlocks: React.Dispatch<React.SetStateAction<StudyBlock[]>>;
  toggleStudyBlock: (id: string) => void;
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetToDemoData: () => void;
}

const INITIAL_PROFILE: StudentProfile = {
  name: 'Khushi',
  email: 'khushi@sarecmirzapur.ac.in',
  college: 'Samrat Ashok Rajkiya Engineering College Mirzapur',
  degree: 'B.Tech',
  branch: 'Computer Science & Engineering',
  semester: 'Semester 5',
  rollNumber: '2K23/CSE/042',
  academicGoals: 'Maintain >8.5 CGPA, secure SDE Intern role, complete Capstone project',
  preferredStudyHours: '6:00 PM - 10:30 PM',
  timeZone: 'Asia/Kolkata (IST)',
  isOnboarded: true,
};

const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg-1',
    title: 'Distributed Consensus & Raft Protocol Implementation',
    subject: 'Distributed Systems',
    dueDate: '2026-11-02',
    explicitDeadline: 'Nov 02, 2026 at 11:59 PM',
    isDeadlineAmbiguous: false,
    wordLimit: '12-page IEEE Technical Report',
    formatting: 'IEEE standard double-column 10pt font, PDF submission',
    rubric: ['Leader Election (30%)', 'Log Replication (30%)', 'Safety & Heartbeats (20%)', 'Documentation (20%)'],
    deliverables: ['raft_node.go', 'Simulation Log outputs', 'Technical Evaluation PDF'],
    checklist: [
      { id: 'c1', text: 'Implement randomized heartbeat timers', completed: true },
      { id: 'c2', text: 'Handle candidate state and vote request RPCs', completed: true },
      { id: 'c3', text: 'Implement AppendEntries log matching and commit index', completed: false },
      { id: 'c4', text: 'Benchmark network partition tolerance in local cluster', completed: false },
    ],
    priority: 'high',
    progress: 50,
    status: 'in-progress',
    createdAt: '2026-10-24',
  },
  {
    id: 'asg-2',
    title: 'TCP Flow Control & Sliding Window Network Simulator',
    subject: 'Computer Networks',
    dueDate: '2026-11-06',
    explicitDeadline: 'Nov 06, 2026 at 5:00 PM',
    isDeadlineAmbiguous: false,
    wordLimit: 'Code with readme & test metrics',
    formatting: 'Python 3.12 / C++ with terminal graph output',
    rubric: ['Go-Back-N implementation (40%)', 'Selective Repeat (40%)', 'Packet loss simulation (20%)'],
    deliverables: ['simulator.py', 'packet_loss_plots.png', 'README.md'],
    checklist: [
      { id: 'c5', text: 'Set up socket abstraction with artificial drop rate', completed: true },
      { id: 'c6', text: 'Calculate retransmission timeouts using Jacobson algorithm', completed: false },
      { id: 'c7', text: 'Plot throughput vs packet loss percentage', completed: false },
    ],
    priority: 'medium',
    progress: 33,
    status: 'in-progress',
    createdAt: '2026-10-25',
  },
  {
    id: 'asg-3',
    title: 'B+ Tree Indexing Engine & Query Optimization',
    subject: 'Database Systems',
    dueDate: '2026-11-12',
    explicitDeadline: 'Nov 12, 2026 at 11:59 PM',
    isDeadlineAmbiguous: false,
    wordLimit: 'Source code & benchmark report',
    formatting: 'Markdown report with execution plan diagrams',
    rubric: ['Node splitting & merging (50%)', 'Range scan performance (30%)', 'Concurrency latches (20%)'],
    deliverables: ['b_plus_tree.cpp', 'benchmark_results.csv', 'report.pdf'],
    checklist: [
      { id: 'c8', text: 'Define internal node and leaf node memory layouts', completed: true },
      { id: 'c9', text: 'Implement key insertion with node split cascading', completed: false },
      { id: 'c10', text: 'Implement range iterator for point queries', completed: false },
    ],
    priority: 'high',
    progress: 30,
    status: 'pending',
    createdAt: '2026-10-26',
  },
];

const INITIAL_NOTICES: Notice[] = [
  {
    id: 'not-1',
    title: 'End-Semester Theory & Practical Examination Schedule (Nov-Dec 2026)',
    issuingAuthority: 'Controller of Examinations',
    publicationDate: '26 Oct 2026',
    deadline: '08 Nov 2026, 5:00 PM',
    category: 'Examinations',
    summary: 'Regular semester examinations commence from Nov 20. Hall tickets will be issued only to candidates having minimum 75% attendance.',
    actionRequired: 'Verify attendance status on ERP portal and submit examination form with fee receipt before Nov 8.',
    checklist: ['Check subject codes', 'Pay ₹1,800 exam fee', 'Submit printout to academic section'],
    isPinned: true,
    isRead: false,
    sourceType: 'Official Bulletin',
  },
  {
    id: 'not-2',
    title: 'Winter Research Internship Applications Open — AI & Robotics Lab',
    issuingAuthority: 'Department of Computer Science',
    publicationDate: '25 Oct 2026',
    deadline: '05 Nov 2026',
    category: 'Internships',
    summary: 'Stipend of ₹25,000/month for undergraduate students to work on LLM multi-agent reasoning and procedural generation.',
    actionRequired: 'Upload updated resume and 1-page statement of purpose on the departmental portal.',
    checklist: ['Update Resume', 'Draft SOP highlighting ML coursework', 'Submit GitHub profile link'],
    isPinned: true,
    isRead: true,
    sourceType: 'Uploaded Circular',
  },
  {
    id: 'not-3',
    title: 'Merit-Cum-Means Scholarship Renewal Notice for Academic Year 2026-27',
    issuingAuthority: 'Dean of Student Welfare (DSW)',
    publicationDate: '22 Oct 2026',
    deadline: '15 Nov 2026',
    category: 'Scholarships',
    summary: 'Eligible students with family annual income under ₹6,00,000 and CGPA above 7.5 can apply for 100% tuition fee waiver renewal.',
    actionRequired: 'Attach previous semester marksheets, family income certificate, and bank account passbook copy.',
    checklist: ['Download Annexure A', 'Get income certificate countersigned by Tehsildar', 'Submit to DSW window 4'],
    isPinned: false,
    isRead: true,
    sourceType: 'Official Bulletin',
  },
];

const INITIAL_DOCS: DocumentItem[] = [
  {
    id: 'doc-1',
    title: 'Semester 4 Grade Sheet (DTU/CO/2026/S4)',
    category: 'marksheet',
    uploadDate: '2026-09-10',
    fileSize: '412 KB',
    fileType: 'PDF',
    extractedMeta: { SGPA: '8.84', CGPA: '8.62', TotalCredits: '24', Status: 'Passed First Class' },
    isVerified: true,
  },
  {
    id: 'doc-2',
    title: 'Official College Identity Card',
    category: 'identity',
    uploadDate: '2026-08-01',
    fileSize: '1.2 MB',
    fileType: 'PDF',
    extractedMeta: { StudentName: 'Khushi', RollNumber: '2K23/CSE/042', ValidTill: 'June 2027', BloodGroup: 'O+' },
    isVerified: true,
  },
  {
    id: 'doc-3',
    title: 'Khushi_SDE_Resume_2026.pdf',
    category: 'resume',
    uploadDate: '2026-10-15',
    fileSize: '185 KB',
    fileType: 'PDF',
    extractedMeta: { Stack: 'React, Node.js, Go, Python, PostgreSQL', Experience: 'Prev Intern @ TechCorp' },
    isVerified: true,
  },
  {
    id: 'doc-4',
    title: 'Odd Semester 2026-27 Fee Payment Receipt',
    category: 'fee_receipt',
    uploadDate: '2026-08-14',
    fileSize: '320 KB',
    fileType: 'PDF',
    extractedMeta: { AmountPaid: '₹ 86,500', TransactionID: 'SBI2026081498124', Semester: '5th' },
    isVerified: true,
  },
];

const INITIAL_INTERNSHIPS: InternshipOpp[] = [
  {
    id: 'int-1',
    company: 'Razorpay',
    role: 'Frontend Engineering Intern',
    location: 'Bengaluru / Hybrid',
    stipend: '₹ 50,000 / month',
    deadline: '2026-11-10',
    status: 'preparing',
    matchScore: 88,
    matchingSkills: ['React', 'TypeScript', 'Tailwind CSS', 'State Management', 'Web Performance'],
    missingSkills: ['Next.js SSR', 'Testing with Playwright'],
    notes: 'Referral submitted by college senior. Coding test expected next week.',
  },
  {
    id: 'int-2',
    company: 'CRED',
    role: 'Backend Systems Intern',
    location: 'Bengaluru',
    stipend: '₹ 65,000 / month',
    deadline: '2026-11-18',
    status: 'interested',
    matchScore: 82,
    matchingSkills: ['Go / Node.js', 'Distributed Systems', 'PostgreSQL', 'RESTful APIs'],
    missingSkills: ['Kafka', 'Redis Sentinel'],
    notes: 'Highlight Raft consensus assignment in project portfolio.',
  },
  {
    id: 'int-3',
    company: 'Zomato',
    role: 'Full Stack Development Intern',
    location: 'Gurugram / Onsite',
    stipend: '₹ 45,000 / month',
    deadline: '2026-10-30',
    status: 'applied',
    matchScore: 91,
    matchingSkills: ['React', 'Node.js', 'MongoDB', 'System Design Basics'],
    missingSkills: ['ElasticSearch'],
    notes: 'Application submitted on campus placement portal.',
  },
];

const INITIAL_EXPENSES: ExpenseItem[] = [
  { id: 'exp-1', title: 'SAREC Canteen Lunch (Thali + Chai)', amount: 120, category: 'Food', date: '2026-10-27', merchant: 'Central Canteen' },
  { id: 'exp-2', title: 'Lab Record Binding & Printing', amount: 160, category: 'Printing', date: '2026-10-26', merchant: 'Micron Xerox' },
  { id: 'exp-3', title: 'Delhi Metro Smart Card Recharge', amount: 500, category: 'Transport', date: '2026-10-25', merchant: 'DMRC Samaypur Badli' },
  { id: 'exp-4', title: 'Algorithms Textbook Reference Book', amount: 480, category: 'Education', date: '2026-10-22', merchant: 'Nai Sarak Books' },
  { id: 'exp-5', title: 'Hostel Wi-Fi Monthly Share', amount: 350, category: 'Hostel and Rent', date: '2026-10-20', merchant: 'Broadband Provider' },
];

const INITIAL_ATTENDANCE: AttendanceSubject[] = [
  { id: 'att-1', name: 'Distributed Systems', code: 'CO301', conducted: 36, attended: 31, targetPercent: 75 },
  { id: 'att-2', name: 'Computer Networks', code: 'CO303', conducted: 38, attended: 26, targetPercent: 75 },
  { id: 'att-3', name: 'Database Management Systems', code: 'CO305', conducted: 34, attended: 29, targetPercent: 75 },
  { id: 'att-4', name: 'Theory of Computation', code: 'CO307', conducted: 32, attended: 28, targetPercent: 75 },
  { id: 'att-5', name: 'Software Engineering Lab', code: 'CO309', conducted: 14, attended: 13, targetPercent: 75 },
];

const INITIAL_STUDY_BLOCKS: StudyBlock[] = [
  { id: 'sb-1', title: 'Raft Protocol Log Replication Coding', subject: 'Distributed Systems', startTime: '6:00 PM', endTime: '7:30 PM', durationMinutes: 90, priority: 'high', completed: false, day: 'Today' },
  { id: 'sb-2', title: 'TCP Sliding Window Analysis & Jacobson Formula', subject: 'Computer Networks', startTime: '7:40 PM', endTime: '8:40 PM', durationMinutes: 60, priority: 'medium', completed: false, day: 'Today' },
  { id: 'sb-3', title: 'B+ Tree Node Deletion & Merging Proofs', subject: 'Database Systems', startTime: '9:00 PM', endTime: '10:15 PM', durationMinutes: 75, priority: 'high', completed: false, day: 'Today' },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: 'n-1', title: 'Upcoming Deadline Warning', message: 'Distributed Systems Raft assignment is due in 5 days (Nov 02).', type: 'deadline', time: '1 hour ago', read: false, linkRoute: '/academics/assignments' },
  { id: 'n-2', title: 'Attendance Alert: Computer Networks', message: 'Current attendance is 68.4% (below 75%). Attend next 8 classes to avoid detention.', type: 'attendance', time: '3 hours ago', read: false, linkRoute: '/attendance' },
  { id: 'n-3', title: 'New Notice Published', message: 'End-Semester examination schedule released by Controller of Examinations.', type: 'notice', time: '1 day ago', read: true, linkRoute: '/college/notices' },
];

const StudentContext = createContext<StudentContextType | null>(null);

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem('vyuvik_profile');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem('vyuvik_assignments');
    return saved ? JSON.parse(saved) : INITIAL_ASSIGNMENTS;
  });

  const [notices, setNotices] = useState<Notice[]>(() => {
    const saved = localStorage.getItem('vyuvik_notices');
    return saved ? JSON.parse(saved) : INITIAL_NOTICES;
  });

  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const saved = localStorage.getItem('vyuvik_documents');
    return saved ? JSON.parse(saved) : INITIAL_DOCS;
  });

  const [internships, setInternships] = useState<InternshipOpp[]>(() => {
    const saved = localStorage.getItem('vyuvik_internships');
    return saved ? JSON.parse(saved) : INITIAL_INTERNSHIPS;
  });

  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    const saved = localStorage.getItem('vyuvik_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [attendanceList, setAttendanceList] = useState<AttendanceSubject[]>(() => {
    const saved = localStorage.getItem('vyuvik_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [studyBlocks, setStudyBlocks] = useState<StudyBlock[]>(() => {
    const saved = localStorage.getItem('vyuvik_study_blocks');
    return saved ? JSON.parse(saved) : INITIAL_STUDY_BLOCKS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('vyuvik_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('vyuvik_auth') === 'true';
  });

  // Rehydrate state from backend storage on mount if available
  useEffect(() => {
    const loadServerState = async () => {
      try {
        const res = await fetch('/api/student/state');
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            if (json.data.profile) setProfile(json.data.profile);
            if (json.data.assignments) setAssignments(json.data.assignments);
            if (json.data.notices) setNotices(json.data.notices);
            if (json.data.documents) setDocuments(json.data.documents);
            if (json.data.internships) setInternships(json.data.internships);
            if (json.data.expenses) setExpenses(json.data.expenses);
            if (json.data.attendanceList) setAttendanceList(json.data.attendanceList);
            if (json.data.studyBlocks) setStudyBlocks(json.data.studyBlocks);
            if (json.data.notifications) setNotifications(json.data.notifications);
          }
        }
      } catch (e) {
        console.warn('Initial server state load:', e);
      }
    };
    loadServerState();
  }, []);

  const syncWithServer = async () => {
    try {
      await fetch('/api/student/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          assignments,
          notices,
          documents,
          internships,
          expenses,
          attendanceList,
          studyBlocks,
          notifications,
          updatedAt: new Date().toISOString(),
        }),
      });
    } catch (e) {
      console.warn('Background sync:', e);
    }
  };

  const login = async (email: string, password?: string): Promise<boolean> => {
    setIsAuthenticated(true);
    localStorage.setItem('vyuvik_auth', 'true');
    if (email && email.includes('@')) {
      updateProfile({ email });
    }
    syncWithServer();
    return true;
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsAuthenticated(true);
    localStorage.setItem('vyuvik_auth', 'true');
    updateProfile({
      name,
      email,
      isOnboarded: false,
    });
    syncWithServer();
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('vyuvik_auth', 'false');
  };

  // Save to localStorage on changes
  useEffect(() => {
    localStorage.setItem('vyuvik_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('vyuvik_assignments', JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem('vyuvik_notices', JSON.stringify(notices));
  }, [notices]);

  useEffect(() => {
    localStorage.setItem('vyuvik_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('vyuvik_internships', JSON.stringify(internships));
  }, [internships]);

  useEffect(() => {
    localStorage.setItem('vyuvik_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('vyuvik_attendance', JSON.stringify(attendanceList));
  }, [attendanceList]);

  useEffect(() => {
    localStorage.setItem('vyuvik_study_blocks', JSON.stringify(studyBlocks));
  }, [studyBlocks]);

  useEffect(() => {
    localStorage.setItem('vyuvik_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const updateProfile = (p: Partial<StudentProfile>) => {
    setProfile((prev) => ({ ...prev, ...p }));
  };

  const addAssignment = (a: Assignment) => {
    setAssignments((prev) => [a, ...prev]);
  };

  const updateAssignment = (id: string, a: Partial<Assignment>) => {
    setAssignments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...a } : item))
    );
  };

  const deleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleChecklistItem = (assignmentId: string, checklistId: string) => {
    setAssignments((prev) =>
      prev.map((asg) => {
        if (asg.id !== assignmentId) return asg;
        const updatedChecklist = asg.checklist.map((c) =>
          c.id === checklistId ? { ...c, completed: !c.completed } : c
        );
        const completedCount = updatedChecklist.filter((c) => c.completed).length;
        const progress = Math.round((completedCount / updatedChecklist.length) * 100);
        return {
          ...asg,
          checklist: updatedChecklist,
          progress,
          status: progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : 'pending',
        };
      })
    );
  };

  const addNotice = (n: Notice) => {
    setNotices((prev) => [n, ...prev]);
  };

  const toggleNoticePin = (id: string) => {
    setNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    );
  };

  const toggleNoticeRead = (id: string) => {
    setNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  const deleteNotice = (id: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
  };

  const addDocument = (d: DocumentItem) => {
    setDocuments((prev) => [d, ...prev]);
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const addInternship = (i: InternshipOpp) => {
    setInternships((prev) => [i, ...prev]);
  };

  const updateInternshipStatus = (id: string, status: InternshipOpp['status']) => {
    setInternships((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status } : i))
    );
  };

  const deleteInternship = (id: string) => {
    setInternships((prev) => prev.filter((i) => i.id !== id));
  };

  const addExpense = (e: ExpenseItem) => {
    setExpenses((prev) => [e, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const updateAttendance = (id: string, attended: number, conducted: number) => {
    setAttendanceList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, attended, conducted } : a))
    );
  };

  const addAttendanceSubject = (s: AttendanceSubject) => {
    setAttendanceList((prev) => [...prev, s]);
  };

  const toggleStudyBlock = (id: string) => {
    setStudyBlocks((prev) =>
      prev.map((sb) => (sb.id === id ? { ...sb, completed: !sb.completed } : sb))
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const resetToDemoData = () => {
    setProfile(INITIAL_PROFILE);
    setAssignments(INITIAL_ASSIGNMENTS);
    setNotices(INITIAL_NOTICES);
    setDocuments(INITIAL_DOCS);
    setInternships(INITIAL_INTERNSHIPS);
    setExpenses(INITIAL_EXPENSES);
    setAttendanceList(INITIAL_ATTENDANCE);
    setStudyBlocks(INITIAL_STUDY_BLOCKS);
    setNotifications(INITIAL_NOTIFICATIONS);
    localStorage.clear();
  };

  return (
    <StudentContext.Provider
      value={{
        profile,
        updateProfile,
        assignments,
        addAssignment,
        updateAssignment,
        deleteAssignment,
        toggleChecklistItem,
        notices,
        addNotice,
        toggleNoticePin,
        toggleNoticeRead,
        deleteNotice,
        documents,
        addDocument,
        deleteDocument,
        internships,
        addInternship,
        updateInternshipStatus,
        deleteInternship,
        expenses,
        addExpense,
        deleteExpense,
        attendanceList,
        updateAttendance,
        addAttendanceSubject,
        studyBlocks,
        setStudyBlocks,
        toggleStudyBlock,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        resetToDemoData,
        isAuthenticated,
        login,
        signup,
        logout,
        syncWithServer,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const ctx = useContext(StudentContext);
  if (!ctx) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return ctx;
};
