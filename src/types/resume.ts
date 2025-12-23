// Resume types for the application

export interface ResumeLocation {
  city?: string;
  state?: string;
  country?: string;
}

export interface ResumeBasicInfo {
  full_name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  location?: ResumeLocation;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  headline?: string;
  summary?: string;
}

export interface ResumeWorkExperience {
  id?: string;
  company: string;
  title: string;
  location?: string;
  start_date: string | null;
  end_date: string | null;
  is_current?: boolean;
  currently_working?: boolean; // Added for compatibility
  description?: string;
  highlights?: string[];
  achievements?: string[]; // Added for compatibility
  technologies?: string[];
}

export interface ResumeEducation {
  id?: string;
  institution: string;
  degree: string;
  field_of_study?: string;
  location?: string;
  start_date: string | null;
  end_date: string | null;
  is_current?: boolean;
  gpa?: string;
  grade?: string; // Added for compatibility
  description?: string;
  activities?: string[];
}

export interface ResumeSkill {
  id?: string;
  name: string;
  level?: "beginner" | "intermediate" | "advanced" | "expert";
  category?: string;
  years_of_experience?: number;
}

export interface ResumeProject {
  id?: string;
  name: string;
  title: string; // Added for compatibility
  role: string; // Added for compatibility
  description?: string;
  url?: string;
  link?: string; // Added for compatibility
  start_date?: string | null;
  end_date?: string | null;
  is_current?: boolean;
  highlights?: string[];
  technologies?: string[];
}

export interface ResumeCertification {
  id?: string;
  name: string;
  issuing_organization?: string;
  issuer?: string; // Added for compatibility
  issue_date?: string | null;
  expiration_date?: string | null;
  expiry_date?: string; // Added for compatibility
  credential_id?: string;
  credential_url?: string;
}

export interface ResumeLanguage {
  id?: string;
  name: string;
  language?: string; // Added for compatibility
  proficiency?:
    | "elementary"
    | "limited_working"
    | "professional_working"
    | "full_professional"
    | "native"
    | "bilingual";
}

export interface ResumeInterest {
  id?: string;
  name: string;
}

export interface ParsedResume {
  basic_info: ResumeBasicInfo;
  work_experience: ResumeWorkExperience[];
  education: ResumeEducation[];
  skills: ResumeSkill[];
  projects: ResumeProject[];
  certifications: ResumeCertification[];
  languages: ResumeLanguage[];
  interests: ResumeInterest[];
  raw_text?: string;
  original_filename?: string;
  last_updated?: string;
}

export interface ResumeData {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  original_filename?: string;
  parsed_data: ParsedResume;
}
