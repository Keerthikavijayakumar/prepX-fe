export type ResumeLocation = {
  city: string;
  state: string;
  country: string;
};

export type ResumeBasicInfo = {
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  portfolio: string;
  location: ResumeLocation;
  summary: string;
};

export type ResumeWorkExperience = {
  job_title: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string;
  currently_working: boolean;
  description: string;
  achievements: string[];
};

export type ResumeEducation = {
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  grade: string;
  location: string;
};

export type ResumeSkill = {
  name: string;
  level: string;
  category: string;
};

export type ResumeProject = {
  title: string;
  description: string;
  technologies: string[];
  role: string;
  link: string;
};

export type ResumeCertification = {
  name: string;
  issuer: string;
  issue_date: string;
  expiry_date: string;
  credential_id: string;
  credential_url: string;
};

export type ResumeLanguage = {
  language: string;
  proficiency: string;
};

export type ResumePublication = {
  title: string;
  publisher: string;
  publication_date: string;
  url: string;
};

export type ResumeAward = {
  title: string;
  issuer: string;
  date: string;
  description: string;
};

export type ParsedResume = {
  basic_info: ResumeBasicInfo;
  work_experience: ResumeWorkExperience[];
  education: ResumeEducation[];
  skills: ResumeSkill[];
  projects: ResumeProject[];
  certifications: ResumeCertification[];
  languages: ResumeLanguage[];
  publications: ResumePublication[];
  awards: ResumeAward[];
  interests: string[];
  last_updated: string;
};

export type ResumeData = ParsedResume;
