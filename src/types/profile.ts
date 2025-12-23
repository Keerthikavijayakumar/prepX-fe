/**
 * Strict TypeScript interfaces for user profile data
 * This data is stored in the users table and represents the user's current profile
 * Separate from resume data which is stored in the resumes table
 */

// Basic Info - Mandatory fields for profile
export interface ProfileBasicInfo {
  first_name: string; // Required
  last_name: string; // Required
  full_name?: string; // Optional
  email: string; // Required
  phone?: string; // Optional
  summary: string; // Required
  location: {
    city?: string;
    state?: string;
    country?: string;
  };
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

// Work Experience - Mandatory fields
export interface ProfileWorkExperience {
  id: string; // Unique identifier
  title: string; // Required
  company: string; // Required
  location?: string;
  start_date: string; // Required (MM/YYYY format)
  end_date: string; // Required (MM/YYYY format or "Present")
  description?: string;
  achievements?: string[];
}

// Education - Mandatory fields
export interface ProfileEducation {
  id: string; // Unique identifier
  institution: string; // Required
  degree: string; // Required
  field_of_study: string; // Required
  start_date: string; // Required (MM/YYYY format)
  end_date: string; // Required (MM/YYYY format or "Ongoing")
  grade?: string;
}

// Projects - Mandatory fields
export interface ProfileProject {
  id: string; // Unique identifier
  title: string; // Required
  role: string; // Required
  description: string; // Required
  technologies?: string[];
  link?: string;
}

// Skills - Optional section
export interface ProfileSkill {
  id: string;
  name: string;
  level?: string; // Beginner, Intermediate, Advanced, Expert
}

// Certifications - Optional section
export interface ProfileCertification {
  id: string;
  name: string;
  issuer: string;
  issue_date?: string;
  expiry_date?: string;
  credential_url?: string;
}

// Languages - Optional section
export interface ProfileLanguage {
  id: string;
  language: string;
  proficiency?: string; // Elementary, Limited Working, Professional Working, Full Professional, Native
}

// Complete Profile Data Structure
export interface UserProfile {
  basic_info: ProfileBasicInfo;
  work_experience: ProfileWorkExperience[];
  education: ProfileEducation[];
  projects: ProfileProject[];
  skills: ProfileSkill[];
  certifications: ProfileCertification[];
  languages: ProfileLanguage[];
  interests: string[];
  last_updated: string; // ISO timestamp
}

// Validation result type
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

// Helper function to validate basic info
export function validateBasicInfo(
  basicInfo: Partial<ProfileBasicInfo>
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!basicInfo.first_name?.trim()) {
    errors.push({ field: "first_name", message: "First Name is required" });
  }

  if (!basicInfo.last_name?.trim()) {
    errors.push({ field: "last_name", message: "Last Name is required" });
  }

  if (!basicInfo.email?.trim()) {
    errors.push({ field: "email", message: "Email is required" });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(basicInfo.email)) {
    errors.push({ field: "email", message: "Email must be valid" });
  }

  if (!basicInfo.summary?.trim()) {
    errors.push({
      field: "summary",
      message: "Professional Summary is required",
    });
  }

  return errors;
}

// Helper function to validate work experience
export function validateWorkExperience(
  experience: Partial<ProfileWorkExperience>
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!experience.title?.trim()) {
    errors.push({ field: "title", message: "Job Title is required" });
  }

  if (!experience.company?.trim()) {
    errors.push({ field: "company", message: "Company is required" });
  }

  if (!experience.start_date?.trim()) {
    errors.push({ field: "start_date", message: "Start Date is required" });
  }

  if (!experience.end_date?.trim()) {
    errors.push({ field: "end_date", message: "End Date is required" });
  }

  return errors;
}

// Helper function to validate education
export function validateEducation(
  education: Partial<ProfileEducation>
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!education.institution?.trim()) {
    errors.push({ field: "institution", message: "Institution is required" });
  }

  if (!education.degree?.trim()) {
    errors.push({ field: "degree", message: "Degree is required" });
  }

  if (!education.field_of_study?.trim()) {
    errors.push({
      field: "field_of_study",
      message: "Field of Study is required",
    });
  }

  if (!education.start_date?.trim()) {
    errors.push({ field: "start_date", message: "Start Date is required" });
  }

  if (!education.end_date?.trim()) {
    errors.push({ field: "end_date", message: "End Date is required" });
  }

  return errors;
}

// Helper function to validate project
export function validateProject(
  project: Partial<ProfileProject>
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!project.title?.trim()) {
    errors.push({ field: "title", message: "Project Title is required" });
  }

  if (!project.role?.trim()) {
    errors.push({ field: "role", message: "Your Role is required" });
  }

  if (!project.description?.trim()) {
    errors.push({ field: "description", message: "Description is required" });
  }

  return errors;
}

// Helper function to create empty profile
export function createEmptyProfile(): UserProfile {
  return {
    basic_info: {
      first_name: "",
      last_name: "",
      email: "",
      summary: "",
      location: {
        city: "",
        state: "",
        country: "",
      },
    },
    work_experience: [],
    education: [],
    projects: [],
    skills: [],
    certifications: [],
    languages: [],
    interests: [],
    last_updated: new Date().toISOString(),
  };
}
