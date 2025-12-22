import type { ParsedResume } from "@/types/resume";

export const createEmptyResume = (): ParsedResume => ({
  basic_info: {
    first_name: "",
    last_name: "",
    full_name: "",
    email: "",
    phone: "",
    linkedin: "",
    github: "",
    portfolio: "",
    location: { city: "", state: "", country: "" },
    summary: ""
  },
  work_experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  publications: [],
  awards: [],
  interests: [],
  last_updated: new Date().toISOString()
});

export const isFieldEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return !value.trim();
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') {
    return Object.values(value).every(v => isFieldEmpty(v));
  }
  return false;
};
