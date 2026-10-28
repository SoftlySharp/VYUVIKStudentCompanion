export interface StudentProfile {
  name: string;
  email: string;
  college: string;
  degree: string;
  branch: string;
  semester: string;
  rollNumber: string;
  academicGoals: string;
  preferredStudyHours: string;
  timeZone: string;
  isOnboarded: boolean;
}

export interface AssignmentChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  explicitDeadline: string;
  isDeadlineAmbiguous: boolean;
  wordLimit?: string;
  formatting?: string;
  rubric: string[];
  deliverables: string[];
  checklist: AssignmentChecklistItem[];
  priority: 'high' | 'medium' | 'low';
  progress: number;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  createdAt: string;
}

export interface StudyBlock {
  id: string;
  title: string;
  subject: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  day: string;
}

export interface Notice {
  id: string;
  title: string;
  issuingAuthority: string;
  publicationDate: string;
  deadline?: string;
  category: 'Examinations' | 'Assignments' | 'Fees' | 'Scholarships' | 'Admissions' | 'Events' | 'Internships' | 'General';
  summary: string;
  actionRequired: string;
  checklist: string[];
  isPinned: boolean;
  isRead: boolean;
  sourceType: 'Uploaded Circular' | 'Official Bulletin' | 'Student Notice';
}

export interface DocumentItem {
  id: string;
  title: string;
  category: 'identity' | 'marksheet' | 'certificate' | 'resume' | 'fee_receipt' | 'scholarship' | 'internship' | 'form' | 'study_material';
  uploadDate: string;
  fileSize: string;
  fileType: string;
  extractedMeta?: Record<string, string>;
  isVerified?: boolean;
}

export interface InternshipOpp {
  id: string;
  company: string;
  role: string;
  location: string;
  stipend: string;
  deadline: string;
  status: 'interested' | 'preparing' | 'applied' | 'interview' | 'rejected' | 'offered';
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  notes?: string;
}

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  category: 'Food' | 'Transport' | 'Education' | 'Printing' | 'Hostel and Rent' | 'Shopping' | 'Entertainment' | 'Subscriptions' | 'Miscellaneous';
  date: string;
  merchant?: string;
}

export interface AttendanceSubject {
  id: string;
  name: string;
  code: string;
  conducted: number;
  attended: number;
  targetPercent: number;
}

export interface VivaSession {
  id: string;
  subject: string;
  mode: 'basic' | 'technical' | 'project_defense' | 'rapid_fire';
  questionsAnswered: number;
  totalQuestions: number;
  avgScore: number;
  date: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'deadline' | 'notice' | 'attendance' | 'reminder';
  time: string;
  read: boolean;
  linkRoute?: string;
}
