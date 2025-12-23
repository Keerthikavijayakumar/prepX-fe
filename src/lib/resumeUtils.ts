import type { ParsedResume } from "@/types/resume";

export const createEmptyResume = (): ParsedResume => ({
  basic_info: {
    first_name: "",
    last_name: "",
    full_name: "",
    email: "",
    phone: "",
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
    location: { city: "", state: "", country: "" },
    summary: "",
  },
  work_experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  interests: [],
});

export const isFieldEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return !value.trim();
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") {
    return Object.values(value).every((v) => isFieldEmpty(v));
  }
  return false;
};
