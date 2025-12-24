"use client";

import { useState, useEffect, ChangeEvent } from "react";
import {
  Pencil,
  Upload,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  Languages,
  Heart,
  MapPin,
  Mail,
  Phone,
  Linkedin,
  Github,
  Globe,
  Plus,
  X,
  Loader2,
  Trash2,
  FileText,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/ui/date-picker";
import { PhoneInputComponent } from "@/components/ui/phone-input";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createEmptyResume, isFieldEmpty } from "@/lib/resumeUtils";
import type {
  ParsedResume,
  ResumeWorkExperience,
  ResumeEducation,
  ResumeSkill,
  ResumeProject,
  ResumeCertification,
  ResumeLanguage,
  ResumeInterest,
} from "../../types/resume";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

type EditSection =
  | "basic"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "languages"
  | "interests"
  | null;

type ResumeProfileProps = {
  apiUrl?: string;
  onComplete?: () => void;
};

export function ResumeProfileComplete({
  apiUrl,
  onComplete,
}: ResumeProfileProps) {
  const [parsedData, setParsedData] = useState<ParsedResume | null>(null);
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sheetError, setSheetError] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<EditSection>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [editIndex, setEditIndex] = useState<number>(-1);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [tempData, setTempData] = useState<ParsedResume | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [resumeFilename, setResumeFilename] = useState<string | null>(null);
  const [missingItems, setMissingItems] = useState<string[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);

  useEffect(() => {
    fetchExistingResume();
  }, []);

  const fetchExistingResume = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        setParsedData(null);
        setResumeFilename(null);
        setLoading(false);
        return;
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      
      // Fetch profile data (parsed resume data from users table)
      const profileResponse = await fetch(`${baseUrl}/api/profile`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (profileResponse.ok) {
        const profileBody = await profileResponse.json();
        setParsedData(profileBody.profile || null);
        setMissingItems(profileBody.missing_items || []);
        setCompletionPercentage(profileBody.completion_percentage || 0);
      } else {
        setParsedData(null);
        setMissingItems([]);
        setCompletionPercentage(0);
      }

      // Fetch resume metadata (filename, etc.)
      const resumeResponse = await fetch(`${baseUrl}/api/resume/current`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (resumeResponse.ok) {
        const resumeBody = await resumeResponse.json();
        setResumeFilename(resumeBody.resume?.filename || null);
      } else {
        setResumeFilename(null);
      }
    } catch (err) {
      console.error("Failed to fetch resume:", err);
      setParsedData(null);
      setResumeFilename(null);
    } finally {
      setLoading(false);
    }
  };

  const startManualEntry = () => {
    setParsedData(createEmptyResume());
  };

  const handleFileSelection = async (file: File) => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(
        `File size exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(
          1
        )}MB)`
      );
      return;
    }

    setError(null);
    setUploading(true);
    setParsing(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        setError("You must be signed in to upload a resume.");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${baseUrl}/api/resume`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || "Failed to upload resume");
      }

      const body = await response.json();
      if (body.parsed) {
        setParsedData({
          ...body.parsed,
          last_updated: body.parsed.last_updated ?? new Date().toISOString(),
        });
      }
      // Update completion percentage and missing items from response
      if (body.completion_percentage !== undefined) {
        setCompletionPercentage(body.completion_percentage);
      }
      if (body.missing_items) {
        setMissingItems(body.missing_items);
      }
      // Update resume filename from response
      if (body.resume_filename) {
        setResumeFilename(body.resume_filename);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload resume");
    } finally {
      setUploading(false);
      setParsing(false);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFileSelection(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelection(file);
  };

  const checkMandatoryFieldsFilled = (): boolean => {
    if (!tempData) return false;

    // Check based on current editing section
    if (editingSection === "basic") {
      return !!(
        tempData.basic_info.first_name?.trim() &&
        tempData.basic_info.last_name?.trim() &&
        tempData.basic_info.summary?.trim() &&
        tempData.basic_info.email?.trim()
      );
    } else if (editingSection === "experience" && editIndex >= 0) {
      const exp = tempData.work_experience[editIndex];
      return !!(
        exp?.title?.trim() &&
        exp?.company?.trim() &&
        exp?.start_date?.trim() &&
        exp?.end_date?.trim()
      );
    } else if (editingSection === "education" && editIndex >= 0) {
      const edu = tempData.education[editIndex];
      return !!(
        edu?.institution?.trim() &&
        edu?.degree?.trim() &&
        edu?.field_of_study?.trim() &&
        edu?.start_date?.trim() &&
        edu?.end_date?.trim()
      );
    } else if (editingSection === "projects" && editIndex >= 0) {
      const proj = tempData.projects[editIndex];
      return !!(
        proj?.title?.trim() &&
        proj?.role?.trim() &&
        proj?.description?.trim()
      );
    }

    return true; // For sections without mandatory fields
  };

  const validateMandatoryFields = (): {
    valid: boolean;
    errorMessage?: string;
  } => {
    if (!tempData) return { valid: false, errorMessage: "No data to save" };

    // Validate based on current editing section
    if (editingSection === "basic") {
      if (!tempData.basic_info.first_name?.trim())
        return { valid: false, errorMessage: "First Name is required" };
      if (!tempData.basic_info.last_name?.trim())
        return { valid: false, errorMessage: "Last Name is required" };
      if (!tempData.basic_info.summary?.trim())
        return {
          valid: false,
          errorMessage: "Professional Summary is required",
        };
      if (!tempData.basic_info.email?.trim())
        return { valid: false, errorMessage: "Email is required" };
    } else if (editingSection === "experience" && editIndex >= 0) {
      const exp = tempData.work_experience[editIndex];
      if (!exp?.title?.trim())
        return { valid: false, errorMessage: "Job Title is required" };
      if (!exp?.company?.trim())
        return { valid: false, errorMessage: "Company is required" };
      if (!exp?.start_date?.trim())
        return { valid: false, errorMessage: "Start Date is required" };
      if (!exp?.end_date?.trim())
        return { valid: false, errorMessage: "End Date is required" };
    } else if (editingSection === "education" && editIndex >= 0) {
      const edu = tempData.education[editIndex];
      if (!edu?.institution?.trim())
        return { valid: false, errorMessage: "Institution is required" };
      if (!edu?.degree?.trim())
        return { valid: false, errorMessage: "Degree is required" };
      if (!edu?.field_of_study?.trim())
        return { valid: false, errorMessage: "Field of Study is required" };
      if (!edu?.start_date?.trim())
        return { valid: false, errorMessage: "Start Date is required" };
      if (!edu?.end_date?.trim())
        return { valid: false, errorMessage: "End Date is required" };
    } else if (editingSection === "projects" && editIndex >= 0) {
      const proj = tempData.projects[editIndex];
      if (!proj?.title?.trim())
        return { valid: false, errorMessage: "Project Title is required" };
      if (!proj?.role?.trim())
        return { valid: false, errorMessage: "Your Role is required" };
      if (!proj?.description?.trim())
        return { valid: false, errorMessage: "Description is required" };
    } else if (editingSection === "interests") {
      // Check if any interest is empty
      const hasEmptyInterest = tempData.interests.some(
        (interest: ResumeInterest) => !interest?.name?.trim()
      );
      if (hasEmptyInterest) {
        return {
          valid: false,
          errorMessage:
            "All interests must have a value. Please remove empty interests or fill them in.",
        };
      }
    }

    return { valid: true };
  };

  const saveSheetData = async () => {
    if (!tempData) return;

    // Validate mandatory fields
    const validation = validateMandatoryFields();
    if (!validation.valid) {
      setSheetError(
        validation.errorMessage || "Please fill in all required fields"
      );
      return;
    }

    setSaving(true);
    setSheetError(null); // Clear any previous errors

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        setError("You must be signed in to save.");
        setSaving(false);
        return;
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${baseUrl}/api/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile: tempData,
          editing_section: editingSection,
        }),
      });

      if (response.ok) {
        const responseBody = await response.json();
        setParsedData(tempData);
        setMissingItems(responseBody.missing_items || []);
        setCompletionPercentage(responseBody.completion_percentage || 0);
        setHasUnsavedChanges(false);
        setSheetOpen(false);
      } else {
        // Handle validation errors from backend
        try {
          const errorBody = await response.json();
          if (
            errorBody.validation_errors &&
            Array.isArray(errorBody.validation_errors)
          ) {
            // Display validation errors in the sheet
            setSheetError(errorBody.validation_errors.join(", "));
          } else if (errorBody.error) {
            setSheetError(errorBody.error);
          } else {
            setSheetError("Failed to save changes");
          }
        } catch {
          setSheetError("Failed to save changes");
        }
      }
    } catch (err) {
      setSheetError("Failed to save changes");
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const openEditSheet = (section: EditSection, index: number = -1) => {
    setTempData(parsedData);
    setHasUnsavedChanges(false);
    setSheetError(null); // Clear sheet errors when opening
    setEditingSection(section);
    setEditIndex(index);
    setSheetOpen(true);
  };

  const closeEditSheet = () => {
    if (hasUnsavedChanges) {
      const confirmClose = window.confirm(
        "You have unsaved changes. Are you sure you want to close without saving?"
      );
      if (!confirmClose) return;
    }

    setSheetOpen(false);
  };

  const handleSheetOpenChange = (open: boolean) => {
    if (!open) {
      if (hasUnsavedChanges) {
        const confirmClose = window.confirm(
          "You have unsaved changes. Are you sure you want to close without saving?"
        );
        if (!confirmClose) return;
      }
      setSheetOpen(false);
    }
  };

  useEffect(() => {
    if (!sheetOpen && editingSection) {
      // Clear state after animation completes
      const timer = setTimeout(() => {
        setEditingSection(null);
        setEditIndex(-1);
        setHasUnsavedChanges(false);
        setTempData(null);
      }, 300); // Match Sheet animation duration
      return () => clearTimeout(timer);
    }
  }, [sheetOpen, editingSection]);

  const updateBasicInfo = (field: string, value: string) => {
    if (!tempData) return;
    const updated = {
      ...tempData,
      basic_info: { ...tempData.basic_info, [field]: value },
    };
    setTempData(updated);
    setHasUnsavedChanges(true);
  };

  const updateBasicLocation = (field: string, value: string) => {
    if (!tempData) return;
    const updated = {
      ...tempData,
      basic_info: {
        ...tempData.basic_info,
        location: { ...(tempData.basic_info.location || {}), [field]: value },
      },
    };
    setTempData(updated);
    setHasUnsavedChanges(true);
  };

  const addExperience = () => {
    if (!parsedData) return;
    const newExp: ResumeWorkExperience = {
      title: "",
      company: "",
      location: "",
      start_date: "",
      end_date: "",
      currently_working: false,
      description: "",
      achievements: [],
    };
    const updated = {
      ...parsedData,
      work_experience: [...parsedData.work_experience, newExp],
    };
    setTempData(updated);
    setHasUnsavedChanges(false);
    openEditSheet("experience", parsedData.work_experience.length);
  };

  const updateExperience = (index: number, field: string, value: any) => {
    if (!tempData) return;
    const updatedExp = [...tempData.work_experience];
    updatedExp[index] = { ...updatedExp[index], [field]: value };
    const updated = { ...tempData, work_experience: updatedExp };
    setTempData(updated);
    setHasUnsavedChanges(true);
  };

  const deleteExperience = async (index: number) => {
    if (!parsedData) return;
    const updated = {
      ...parsedData,
      work_experience: parsedData.work_experience.filter(
        (_: ResumeWorkExperience, i: number) => i !== index
      ),
    };

    // Save deletion to backend first
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) return;
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${baseUrl}/api/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile: updated,
          editing_section: "experience",
        }),
      });

      if (response.ok) {
        const responseBody = await response.json();
        // Only update UI after successful backend save
        setParsedData(updated);
        setMissingItems(responseBody.missing_items || []);
        setCompletionPercentage(responseBody.completion_percentage || 0);
      } else {
        const errorBody = await response.json().catch(() => ({}));
        setError(errorBody.error || "Failed to delete experience");
      }
    } catch (err) {
      console.error("Delete save failed:", err);
      setError("Failed to delete experience");
    }
  };

  const addEducation = () => {
    if (!parsedData) return;
    const newEdu: ResumeEducation = {
      institution: "",
      degree: "",
      field_of_study: "",
      start_date: "",
      end_date: "",
      grade: "",
      location: "",
    };
    const updated = {
      ...parsedData,
      education: [...parsedData.education, newEdu],
    };
    setTempData(updated);
    setHasUnsavedChanges(false);
    openEditSheet("education", parsedData.education.length);
  };

  const updateEducation = (index: number, field: string, value: string) => {
    if (!tempData) return;
    const updatedEdu = [...tempData.education];
    updatedEdu[index] = { ...updatedEdu[index], [field]: value };
    const updated = { ...tempData, education: updatedEdu };
    setTempData(updated);
    setHasUnsavedChanges(true);
  };

  const deleteEducation = async (index: number) => {
    if (!parsedData) return;
    const updated = {
      ...parsedData,
      education: parsedData.education.filter(
        (_: ResumeEducation, i: number) => i !== index
      ),
    };

    // Save deletion to backend first
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) return;
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${baseUrl}/api/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile: updated,
          editing_section: "education",
        }),
      });

      if (response.ok) {
        const responseBody = await response.json();
        setParsedData(updated);
        setMissingItems(responseBody.missing_items || []);
        setCompletionPercentage(responseBody.completion_percentage || 0);
      } else {
        const errorBody = await response.json().catch(() => ({}));
        setError(errorBody.error || "Failed to delete education");
      }
    } catch (err) {
      console.error("Delete save failed:", err);
      setError("Failed to delete education");
    }
  };

  const addSkill = () => {
    if (!parsedData) return;
    const newSkill: ResumeSkill = { name: "", category: "" };
    const updated = {
      ...parsedData,
      skills: [...parsedData.skills, newSkill],
    };
    setTempData(updated);
    setHasUnsavedChanges(false);
    openEditSheet("skills");
  };

  const updateSkill = (index: number, field: string, value: string) => {
    if (!tempData) return;
    const updatedSkills = [...tempData.skills];
    updatedSkills[index] = { ...updatedSkills[index], [field]: value };
    const updated = { ...tempData, skills: updatedSkills };
    setTempData(updated);
    setHasUnsavedChanges(true);
  };

  const deleteSkill = async (index: number) => {
    if (!parsedData) return;
    const updated = {
      ...parsedData,
      skills: parsedData.skills.filter(
        (_: ResumeSkill, i: number) => i !== index
      ),
    };

    // Save deletion to backend first
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) return;
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${baseUrl}/api/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile: updated,
          editing_section: "skills",
        }),
      });

      if (response.ok) {
        const responseBody = await response.json();
        setParsedData(updated);
        setMissingItems(responseBody.missing_items || []);
        setCompletionPercentage(responseBody.completion_percentage || 0);
      } else {
        const errorBody = await response.json().catch(() => ({}));
        setError(errorBody.error || "Failed to delete skill");
      }
    } catch (err) {
      console.error("Delete save failed:", err);
      setError("Failed to delete skill");
    }
  };

  const addProject = () => {
    if (!parsedData) return;
    const newProject: ResumeProject = {
      name: "",
      title: "",
      description: "",
      technologies: [],
      role: "",
      link: "",
    };
    const updated = {
      ...parsedData,
      projects: [...parsedData.projects, newProject],
    };
    setTempData(updated);
    setHasUnsavedChanges(false);
    openEditSheet("projects", parsedData.projects.length);
  };

  const updateProject = (index: number, field: string, value: any) => {
    if (!tempData) return;
    const updatedProjects = [...tempData.projects];
    updatedProjects[index] = { ...updatedProjects[index], [field]: value };
    const updated = { ...tempData, projects: updatedProjects };
    setTempData(updated);
    setHasUnsavedChanges(true);
  };

  const deleteProject = async (index: number) => {
    if (!parsedData) return;
    const updated = {
      ...parsedData,
      projects: parsedData.projects.filter(
        (_: ResumeProject, i: number) => i !== index
      ),
    };

    // Save deletion to backend first
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) return;
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${baseUrl}/api/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile: updated,
          editing_section: "projects",
        }),
      });

      if (response.ok) {
        const responseBody = await response.json();
        setParsedData(updated);
        setMissingItems(responseBody.missing_items || []);
        setCompletionPercentage(responseBody.completion_percentage || 0);
      } else {
        const errorBody = await response.json().catch(() => ({}));
        setError(errorBody.error || "Failed to delete project");
      }
    } catch (err) {
      console.error("Delete save failed:", err);
      setError("Failed to delete project");
    }
  };

  const addCertification = () => {
    if (!parsedData) return;
    const newCert: ResumeCertification = {
      name: "",
      issuer: "",
      issue_date: "",
      expiry_date: "",
      credential_id: "",
      credential_url: "",
    };
    const updated = {
      ...parsedData,
      certifications: [...parsedData.certifications, newCert],
    };
    setTempData(updated);
    setHasUnsavedChanges(false);
    openEditSheet("certifications", parsedData.certifications.length);
  };

  const updateCertification = (index: number, field: string, value: string) => {
    if (!tempData) return;
    const updatedCerts = [...tempData.certifications];
    updatedCerts[index] = { ...updatedCerts[index], [field]: value };
    const updated = { ...tempData, certifications: updatedCerts };
    setTempData(updated);
    setHasUnsavedChanges(true);
  };

  const deleteCertification = async (index: number) => {
    if (!parsedData) return;
    const updated = {
      ...parsedData,
      certifications: parsedData.certifications.filter(
        (_: ResumeCertification, i: number) => i !== index
      ),
    };

    // Save deletion to backend first
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) return;
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${baseUrl}/api/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile: updated,
          editing_section: "certifications",
        }),
      });

      if (response.ok) {
        const responseBody = await response.json();
        setParsedData(updated);
        setMissingItems(responseBody.missing_items || []);
        setCompletionPercentage(responseBody.completion_percentage || 0);
      } else {
        const errorBody = await response.json().catch(() => ({}));
        setError(errorBody.error || "Failed to delete certification");
      }
    } catch (err) {
      console.error("Delete save failed:", err);
      setError("Failed to delete certification");
    }
  };

  const addLanguage = () => {
    if (!parsedData) return;
    const newLang: ResumeLanguage = { name: "" };
    const updated = {
      ...parsedData,
      languages: [...parsedData.languages, newLang],
    };
    setTempData(updated);
    setHasUnsavedChanges(false);
    openEditSheet("languages");
  };

  const updateLanguage = (index: number, field: string, value: string) => {
    if (!tempData) return;
    const updatedLangs = [...tempData.languages];
    updatedLangs[index] = { ...updatedLangs[index], [field]: value };
    const updated = { ...tempData, languages: updatedLangs };
    setTempData(updated);
    setHasUnsavedChanges(true);
  };

  const deleteLanguage = async (index: number) => {
    if (!parsedData) return;
    const updated = {
      ...parsedData,
      languages: parsedData.languages.filter(
        (_: ResumeLanguage, i: number) => i !== index
      ),
    };

    // Save deletion to backend first
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) return;
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${baseUrl}/api/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile: updated,
          editing_section: "languages",
        }),
      });

      if (response.ok) {
        const responseBody = await response.json();
        setParsedData(updated);
        setMissingItems(responseBody.missing_items || []);
        setCompletionPercentage(responseBody.completion_percentage || 0);
      } else {
        const errorBody = await response.json().catch(() => ({}));
        setError(errorBody.error || "Failed to delete language");
      }
    } catch (err) {
      console.error("Delete save failed:", err);
      setError("Failed to delete language");
    }
  };

  const addInterest = () => {
    // If editing in sheet, use tempData; otherwise use parsedData
    const currentData = tempData || parsedData;
    if (!currentData) return;
    const updated = {
      ...currentData,
      interests: [...currentData.interests, { name: "" }],
    };
    setTempData(updated);
    setHasUnsavedChanges(true);
    // Only open sheet if not already editing
    if (!tempData) {
      openEditSheet("interests");
    }
  };

  const updateInterest = (index: number, value: string) => {
    if (!tempData) return;
    const updatedInterests = [...tempData.interests];
    updatedInterests[index] = { name: value };
    const updated = { ...tempData, interests: updatedInterests };
    setTempData(updated);
    setHasUnsavedChanges(true);
  };

  const deleteInterest = async (index: number) => {
    if (!parsedData) return;
    const updated = {
      ...parsedData,
      interests: parsedData.interests.filter(
        (_: ResumeInterest, i: number) => i !== index
      ),
    };

    // Save deletion to backend first
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) return;
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${baseUrl}/api/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile: updated,
          editing_section: "interests",
        }),
      });

      if (response.ok) {
        const responseBody = await response.json();
        setParsedData(updated);
        setMissingItems(responseBody.missing_items || []);
        setCompletionPercentage(responseBody.completion_percentage || 0);
      } else {
        const errorBody = await response.json().catch(() => ({}));
        setError(errorBody.error || "Failed to delete interest");
      }
    } catch (err) {
      console.error("Delete save failed:", err);
      setError("Failed to delete interest");
    }
  };

  const renderEditSheet = () => {
    if (!editingSection || !tempData) return null;

    return (
      <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl flex flex-col">
          <SheetHeader className="sticky top-0 z-10 bg-background pb-4 border-b">
            <SheetTitle className="capitalize">
              Edit {editingSection}
            </SheetTitle>
            <SheetDescription>
              Make changes to your {editingSection} information
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto mt-6 space-y-6 px-4 pb-24">
            {editingSection === "basic" && (
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="first_name" className="mb-2 block">
                      First Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="first_name"
                      value={tempData.basic_info.first_name}
                      onChange={(e) =>
                        updateBasicInfo("first_name", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name" className="mb-2 block">
                      Last Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="last_name"
                      value={tempData.basic_info.last_name}
                      onChange={(e) =>
                        updateBasicInfo("last_name", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="full_name" className="mb-2 block">
                    Full Name / Headline
                  </Label>
                  <Input
                    id="full_name"
                    value={tempData.basic_info.full_name}
                    onChange={(e) =>
                      updateBasicInfo("full_name", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="summary" className="mb-2 block">
                    Professional Summary{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="summary"
                    rows={4}
                    value={tempData.basic_info.summary}
                    onChange={(e) => updateBasicInfo("summary", e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="email" className="mb-2 block">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={tempData.basic_info.email}
                      onChange={(e) => updateBasicInfo("email", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="mb-2 block">
                      Phone
                    </Label>
                    <PhoneInputComponent
                      value={tempData.basic_info.phone || ""}
                      onChange={(value) => updateBasicInfo("phone", value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <Label htmlFor="city" className="mb-2 block">
                      City
                    </Label>
                    <Input
                      id="city"
                      value={tempData.basic_info.location?.city || ""}
                      onChange={(e) =>
                        updateBasicLocation("city", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className="mb-2 block">
                      State
                    </Label>
                    <Input
                      id="state"
                      value={tempData.basic_info.location?.state || ""}
                      onChange={(e) =>
                        updateBasicLocation("state", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="country" className="mb-2 block">
                      Country
                    </Label>
                    <Input
                      id="country"
                      value={tempData.basic_info.location?.country || ""}
                      onChange={(e) =>
                        updateBasicLocation("country", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="linkedin" className="mb-2 block">
                    LinkedIn URL
                  </Label>
                  <Input
                    id="linkedin"
                    value={tempData.basic_info.linkedin_url || ""}
                    onChange={(e) =>
                      updateBasicInfo("linkedin_url", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="github" className="mb-2 block">
                    GitHub URL
                  </Label>
                  <Input
                    id="github"
                    value={tempData.basic_info.github_url || ""}
                    onChange={(e) =>
                      updateBasicInfo("github_url", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="portfolio" className="mb-2 block">
                    Portfolio URL
                  </Label>
                  <Input
                    id="portfolio"
                    value={tempData.basic_info.portfolio_url || ""}
                    onChange={(e) =>
                      updateBasicInfo("portfolio_url", e.target.value)
                    }
                  />
                </div>
              </div>
            )}

            {editingSection === "experience" && editIndex >= 0 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="mb-2 block">
                    Job Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={tempData.work_experience[editIndex]?.title || ""}
                    onChange={(e) =>
                      updateExperience(editIndex, "title", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="company" className="mb-2 block">
                      Company <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="company"
                      value={tempData.work_experience[editIndex]?.company || ""}
                      onChange={(e) =>
                        updateExperience(editIndex, "company", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="exp_location" className="mb-2 block">
                      Location
                    </Label>
                    <Input
                      id="exp_location"
                      value={
                        tempData.work_experience[editIndex]?.location || ""
                      }
                      onChange={(e) =>
                        updateExperience(editIndex, "location", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="start_date" className="mb-2 block">
                      Start Date <span className="text-destructive">*</span>
                    </Label>
                    <DatePicker
                      value={
                        tempData.work_experience[editIndex]?.start_date || ""
                      }
                      onChange={(value) =>
                        updateExperience(editIndex, "start_date", value)
                      }
                      placeholder="Select start date"
                      monthYearOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date" className="mb-2 block">
                      End Date / Present{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <DatePicker
                      value={
                        tempData.work_experience[editIndex]?.end_date || ""
                      }
                      onChange={(value) =>
                        updateExperience(editIndex, "end_date", value)
                      }
                      placeholder="Select end date"
                      monthYearOnly
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description" className="mb-2 block">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={
                      tempData.work_experience[editIndex]?.description || ""
                    }
                    onChange={(e) =>
                      updateExperience(editIndex, "description", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label className="mb-2 block">
                    Achievements (one per line)
                  </Label>
                  <Textarea
                    rows={4}
                    value={
                      tempData.work_experience[editIndex]?.achievements?.join(
                        "\n"
                      ) || ""
                    }
                    onChange={(e) =>
                      updateExperience(
                        editIndex,
                        "achievements",
                        e.target.value.split("\n").filter(Boolean)
                      )
                    }
                  />
                </div>
              </div>
            )}

            {editingSection === "education" && editIndex >= 0 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="institution" className="mb-2 block">
                    Institution <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="institution"
                    value={tempData.education[editIndex]?.institution || ""}
                    onChange={(e) =>
                      updateEducation(editIndex, "institution", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="degree" className="mb-2 block">
                      Degree <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="degree"
                      value={tempData.education[editIndex]?.degree || ""}
                      onChange={(e) =>
                        updateEducation(editIndex, "degree", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="field_of_study" className="mb-2 block">
                      Field of Study <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="field_of_study"
                      value={
                        tempData.education[editIndex]?.field_of_study || ""
                      }
                      onChange={(e) =>
                        updateEducation(
                          editIndex,
                          "field_of_study",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <Label htmlFor="edu_start" className="mb-2 block">
                      Start Date <span className="text-destructive">*</span>
                    </Label>
                    <DatePicker
                      value={tempData.education[editIndex]?.start_date || ""}
                      onChange={(value) =>
                        updateEducation(editIndex, "start_date", value)
                      }
                      placeholder="Select start date"
                      monthYearOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="edu_end" className="mb-2 block">
                      End Date / Ongoing{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <DatePicker
                      value={tempData.education[editIndex]?.end_date || ""}
                      onChange={(value) =>
                        updateEducation(editIndex, "end_date", value)
                      }
                      placeholder="Select end date"
                      monthYearOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="grade" className="mb-2 block">
                      Grade/GPA
                    </Label>
                    <Input
                      id="grade"
                      value={tempData.education[editIndex]?.grade || ""}
                      onChange={(e) =>
                        updateEducation(editIndex, "grade", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {editingSection === "skills" && (
              <div className="space-y-4">
                {tempData.skills.map((skill: ResumeSkill, idx: number) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <Label className="mb-2 block">Skill Name</Label>
                      <Input
                        placeholder="Skill name"
                        value={skill.name}
                        onChange={(e) =>
                          updateSkill(idx, "name", e.target.value)
                        }
                      />
                    </div>
                    <div className="w-48">
                      <Label className="mb-2 block">Level</Label>
                      <Select
                        value={skill.level}
                        onValueChange={(value) =>
                          updateSkill(idx, "level", value)
                        }
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">
                            Intermediate
                          </SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                          <SelectItem value="Expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteSkill(idx)}
                      className="mt-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addSkill}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Skill
                </Button>
              </div>
            )}

            {editingSection === "projects" && editIndex >= 0 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="proj_title" className="mb-2 block">
                    Project Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="proj_title"
                    value={tempData.projects[editIndex]?.title || ""}
                    onChange={(e) =>
                      updateProject(editIndex, "title", e.target.value)
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="proj_role" className="mb-2 block">
                    Your Role <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="proj_role"
                    value={tempData.projects[editIndex]?.role || ""}
                    onChange={(e) =>
                      updateProject(editIndex, "role", e.target.value)
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="proj_desc" className="mb-2 block">
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="proj_desc"
                    rows={4}
                    value={tempData.projects[editIndex]?.description || ""}
                    onChange={(e) =>
                      updateProject(editIndex, "description", e.target.value)
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="proj_tech" className="mb-2 block">
                    Technologies
                  </Label>
                  <MultiSelect
                    value={tempData.projects[editIndex]?.technologies || []}
                    onChange={(value) =>
                      updateProject(editIndex, "technologies", value)
                    }
                    placeholder="Add technologies..."
                  />
                </div>
                <div>
                  <Label htmlFor="proj_link" className="mb-2 block">
                    Project Link
                  </Label>
                  <Input
                    id="proj_link"
                    value={tempData.projects[editIndex]?.link || ""}
                    onChange={(e) =>
                      updateProject(editIndex, "link", e.target.value)
                    }
                  />
                </div>
              </div>
            )}

            {editingSection === "certifications" && editIndex >= 0 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cert_name" className="mb-2 block">
                    Certification Name
                  </Label>
                  <Input
                    id="cert_name"
                    value={tempData.certifications[editIndex]?.name || ""}
                    onChange={(e) =>
                      updateCertification(editIndex, "name", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="cert_issuer" className="mb-2 block">
                    Issuer
                  </Label>
                  <Input
                    id="cert_issuer"
                    value={tempData.certifications[editIndex]?.issuer || ""}
                    onChange={(e) =>
                      updateCertification(editIndex, "issuer", e.target.value)
                    }
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="cert_issue" className="mb-2 block">
                      Issue Date
                    </Label>
                    <DatePicker
                      value={
                        tempData.certifications[editIndex]?.issue_date || ""
                      }
                      onChange={(value) =>
                        updateCertification(editIndex, "issue_date", value)
                      }
                      placeholder="Select issue date"
                      monthYearOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="cert_expiry" className="mb-2 block">
                      Expiry Date
                    </Label>
                    <DatePicker
                      value={
                        tempData.certifications[editIndex]?.expiry_date || ""
                      }
                      onChange={(value) =>
                        updateCertification(editIndex, "expiry_date", value)
                      }
                      placeholder="Select expiry date"
                      monthYearOnly
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="cert_url" className="mb-2 block">
                    Credential URL
                  </Label>
                  <Input
                    id="cert_url"
                    value={
                      tempData.certifications[editIndex]?.credential_url || ""
                    }
                    onChange={(e) =>
                      updateCertification(
                        editIndex,
                        "credential_url",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            )}

            {editingSection === "languages" && (
              <div className="space-y-4">
                {tempData.languages.map((lang: ResumeLanguage, idx: number) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <Label className="mb-2 block">Language</Label>
                      <Input
                        placeholder="Language"
                        value={lang.language}
                        onChange={(e) =>
                          updateLanguage(idx, "language", e.target.value)
                        }
                      />
                    </div>
                    <div className="w-48">
                      <Label className="mb-2 block">Proficiency</Label>
                      <Select
                        value={lang.proficiency}
                        onValueChange={(value) =>
                          updateLanguage(idx, "proficiency", value)
                        }
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Select proficiency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Elementary">Elementary</SelectItem>
                          <SelectItem value="Limited Working">
                            Limited Working
                          </SelectItem>
                          <SelectItem value="Professional Working">
                            Professional Working
                          </SelectItem>
                          <SelectItem value="Full Professional">
                            Full Professional
                          </SelectItem>
                          <SelectItem value="Native">Native</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteLanguage(idx)}
                      className="mt-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addLanguage}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Language
                </Button>
              </div>
            )}

            {editingSection === "interests" && (
              <div className="space-y-4">
                {tempData.interests.map(
                  (interest: ResumeInterest, idx: number) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        placeholder="Interest"
                        value={interest.name || ""}
                        onChange={(e) => updateInterest(idx, e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (!tempData) return;
                          const updatedInterests = tempData.interests.filter(
                            (_: any, i: number) => i !== idx
                          );
                          const updated = {
                            ...tempData,
                            interests: updatedInterests,
                          };
                          setTempData(updated);
                          setHasUnsavedChanges(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addInterest}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Interest
                </Button>
              </div>
            )}
          </div>

          <div className="sticky bottom-0 left-0 right-0 border-t bg-background p-4 flex flex-col gap-2 mt-auto">
            {sheetError && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    {sheetError.includes(",") ? (
                      <ul className="list-disc list-inside space-y-1">
                        {sheetError.split(",").map((error, idx) => (
                          <li key={idx}>{error.trim()}</li>
                        ))}
                      </ul>
                    ) : (
                      <span>{sheetError}</span>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeEditSheet}>
                Close
              </Button>
              <Button
                onClick={saveSheetData}
                disabled={
                  saving || !hasUnsavedChanges || !checkMandatoryFieldsFilled()
                }
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/20">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  if (!parsedData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              Build Your Profile
            </h1>
            <p className="mt-2 text-muted-foreground">
              Get started by uploading your resume or entering your details
              manually
            </p>
          </div>

          <Card className="overflow-hidden">
            {parsing ? (
              <div className="flex min-h-[400px] flex-col items-center justify-center gap-6 p-12">
                <div className="relative">
                  <Loader2 className="h-16 w-16 animate-spin text-primary" />
                  <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold">
                    Parsing your resume...
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Our AI is extracting and structuring your information
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-8">
                <div className="grid gap-6 md:grid-cols-2">
                  <div
                    className={`group cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-all ${
                      isDragging
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-muted/30"
                    }`}
                    onClick={() =>
                      document.getElementById("resume-upload")?.click()
                    }
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                    }}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className="rounded-full bg-primary/10 p-4 transition-transform group-hover:scale-110">
                        <Upload className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Upload Resume</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          AI will parse your resume automatically
                        </p>
                      </div>
                      <Badge variant="outline" className="mt-2">
                        PDF or DOCX • Max 5MB
                      </Badge>
                    </div>
                    <input
                      id="resume-upload"
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={uploading}
                    />
                  </div>

                  <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 text-center transition-all hover:border-primary/50 hover:bg-muted/30">
                    <div className="flex flex-col items-center gap-4">
                      <div className="rounded-full bg-primary/10 p-4">
                        <Pencil className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Manual Entry</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Fill in your details section by section
                        </p>
                      </div>
                      <Button onClick={startManualEntry} className="mt-2">
                        Start Building
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="border-t bg-destructive/10 px-6 py-4">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  const {
    basic_info,
    work_experience,
    education,
    skills,
    projects,
    certifications,
    languages,
    interests,
  } = parsedData;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-primary/5 to-background py-8">
      {parsing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="p-12">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold">
                  Parsing your resume...
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Our AI is extracting and structuring your information
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-6">
        {error && (
          <Card className="mb-6 border-destructive bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Card className="group overflow-hidden border-0 shadow-xl transition-all duration-300 hover:shadow-2xl pt-0">
              <div className="relative h-24 overflow-hidden bg-gradient-to-r from-primary via-primary/80 to-primary/60">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
              </div>
              <div className="relative px-6 pb-6 -mt-2">
                <div className="absolute -top-12 left-6 flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-background bg-gradient-to-br from-primary via-primary to-primary/70 text-2xl font-bold text-white shadow-2xl ring-4 ring-primary/20 transition-transform duration-300 group-hover:scale-105">
                  {basic_info.first_name?.[0]}
                  {basic_info.last_name?.[0]}
                </div>
                <div className="ml-32 pt-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-3xl font-bold leading-none tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                        {basic_info.full_name ||
                          `${basic_info.first_name} ${basic_info.last_name}`}
                      </h2>
                      {basic_info.summary && (
                        <p className="mt-2 text-base text-muted-foreground leading-relaxed">
                          {basic_info.summary}
                        </p>
                      )}
                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {basic_info.location?.city && (
                          <span className="flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1.5 transition-colors hover:bg-muted">
                            <MapPin className="h-4 w-4" />
                            {basic_info.location.city},{" "}
                            {basic_info.location.country}
                          </span>
                        )}
                        {basic_info.linkedin_url && (
                          <a
                            href={basic_info.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1.5 transition-colors hover:bg-muted"
                          >
                            <Linkedin className="h-4 w-4" />
                            LinkedIn
                          </a>
                        )}
                        {basic_info.email && (
                          <span className="flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1.5 transition-colors hover:bg-muted">
                            <Mail className="h-4 w-4" />
                            {basic_info.email}
                          </span>
                        )}
                        {basic_info.phone && (
                          <span className="flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1.5 transition-colors hover:bg-muted">
                            <Phone className="h-4 w-4" />
                            {basic_info.phone}
                          </span>
                        )}
                      </div>
                      <div className="mt-4 flex gap-2">
                        {basic_info.linkedin_url && (
                          <a
                            href={basic_info.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Badge
                              variant="outline"
                              className="cursor-pointer transition-all hover:bg-primary/10 hover:scale-105 hover:shadow-md"
                            >
                              <Linkedin className="mr-1 h-3 w-3" />
                              LinkedIn
                            </Badge>
                          </a>
                        )}
                        {basic_info.github_url && (
                          <a
                            href={basic_info.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Badge
                              variant="outline"
                              className="cursor-pointer transition-all hover:bg-primary/10 hover:scale-105 hover:shadow-md"
                            >
                              <Github className="mr-1 h-3 w-3" />
                              GitHub
                            </Badge>
                          </a>
                        )}
                        {basic_info.portfolio_url && (
                          <a
                            href={basic_info.portfolio_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Badge
                              variant="outline"
                              className="cursor-pointer transition-all hover:bg-primary/10 hover:scale-105 hover:shadow-md"
                            >
                              <Globe className="mr-1 h-3 w-3" />
                              Portfolio
                            </Badge>
                          </a>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditSheet("basic")}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="group p-6 border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">
                    Experience
                  </h3>
                  {work_experience.length === 0 && (
                    <Badge
                      variant="outline"
                      className="border-amber-500/50 bg-amber-50 text-amber-700 dark:bg-amber-950/20 font-medium"
                    >
                      Empty
                    </Badge>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={addExperience}>
                  <Plus className="mr-1 h-4 w-4" />
                  Add
                </Button>
              </div>
              {work_experience.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-amber-500/50 bg-amber-50/50 p-8 text-center dark:bg-amber-950/20">
                  <AlertCircle className="h-8 w-8 text-amber-600" />
                  <p className="mt-2 text-sm font-medium text-amber-600">
                    No work experience added
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addExperience}
                    className="mt-4"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add Your First Experience
                  </Button>
                </div>
              ) : (
                <div className="space-y-0">
                  {[...work_experience]
                    .sort((a, b) => {
                      const parseDate = (dateStr: string | null) => {
                        if (!dateStr) return new Date(0);
                        if (dateStr === "Present") return new Date();
                        const [month, year] = dateStr.split("/");
                        return new Date(parseInt(year), parseInt(month) - 1);
                      };
                      const dateA = parseDate(a.start_date);
                      const dateB = parseDate(b.start_date);
                      return dateB.getTime() - dateA.getTime();
                    })
                    .map((exp, idx) => (
                      <div
                        key={idx}
                        className="group/item relative border-l-2 border-primary/30 pl-8 pb-6 last:pb-0 transition-all hover:border-primary/60"
                      >
                        <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-primary bg-background shadow-lg shadow-primary/20 transition-all group-hover/item:scale-125 group-hover/item:shadow-primary/40" />
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-bold text-lg">{exp.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {exp.company} • {exp.location}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {exp.start_date} -{" "}
                              {exp.currently_working ? "Present" : exp.end_date}
                            </p>
                            {exp.description && (
                              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                {exp.description}
                              </p>
                            )}
                            {exp.achievements &&
                              exp.achievements.length > 0 && (
                                <ul className="mt-2 space-y-1 text-sm">
                                  {exp.achievements?.map(
                                    (achievement: string, i: number) => (
                                      <li key={i} className="flex gap-2">
                                        <span className="text-primary">•</span>
                                        <span>{achievement}</span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              )}
                          </div>
                          <div className="flex gap-1 opacity-0 transition-all duration-200 group-hover/item:opacity-100">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditSheet("experience", idx)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteExperience(idx)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </Card>

            <Card className="group p-6 border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">
                    Education
                  </h3>
                  {education.length === 0 && (
                    <Badge
                      variant="outline"
                      className="border-amber-500 text-amber-600"
                    >
                      Empty
                    </Badge>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={addEducation}>
                  <Plus className="mr-1 h-4 w-4" />
                  Add
                </Button>
              </div>
              {education.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-amber-500/50 bg-amber-50/50 p-8 text-center dark:bg-amber-950/20">
                  <AlertCircle className="h-8 w-8 text-amber-600" />
                  <p className="mt-2 text-sm font-medium text-amber-600">
                    No education added
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addEducation}
                    className="mt-4"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add Your First Education
                  </Button>
                </div>
              ) : (
                <div className="space-y-0">
                  {education.map((edu: ResumeEducation, idx: number) => (
                    <div
                      key={idx}
                      className="group/item relative border-l-2 border-primary/30 pl-8 pb-6 last:pb-0 transition-all hover:border-primary/60"
                    >
                      <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-primary bg-background shadow-lg shadow-primary/20 transition-all group-hover/item:scale-125 group-hover/item:shadow-primary/40" />
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-lg">{edu.degree}</h4>
                          <p className="text-sm text-muted-foreground font-medium">
                            {edu.institution} • {edu.field_of_study}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {edu.start_date} - {edu.end_date}
                            {edu.grade && ` • ${edu.grade}`}
                          </p>
                        </div>
                        <div className="flex gap-1 opacity-0 transition-all duration-200 group-hover/item:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditSheet("education", idx)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteEducation(idx)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="group p-6 border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Code className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">Skills</h3>
                  {skills.length === 0 && (
                    <Badge
                      variant="outline"
                      className="border-amber-500 text-amber-600"
                    >
                      Empty
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditSheet("skills")}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              {skills.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-amber-500/50 bg-amber-50/50 p-8 text-center dark:bg-amber-950/20">
                  <AlertCircle className="h-8 w-8 text-amber-600" />
                  <p className="mt-2 text-sm font-medium text-amber-600">
                    No skills added
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditSheet("skills")}
                    className="mt-4"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add Your Skills
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill: ResumeSkill, idx: number) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="px-3 py-1.5 transition-all hover:scale-105 hover:shadow-md cursor-default"
                    >
                      {skill.name}
                      {skill.level && ` • ${skill.level}`}
                    </Badge>
                  ))}
                </div>
              )}
            </Card>

            <Card className="group p-6 border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">Projects</h3>
                  {projects.length === 0 && (
                    <Badge
                      variant="outline"
                      className="border-amber-500 text-amber-600"
                    >
                      Empty
                    </Badge>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={addProject}>
                  <Plus className="mr-1 h-4 w-4" />
                  Add
                </Button>
              </div>
              {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-amber-500/50 bg-amber-50/50 p-8 text-center dark:bg-amber-950/20">
                  <AlertCircle className="h-8 w-8 text-amber-600" />
                  <p className="mt-2 text-sm font-medium text-amber-600">
                    No projects added
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addProject}
                    className="mt-4"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add Your First Project
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map((project: ResumeProject, idx: number) => (
                    <div
                      key={idx}
                      className="group/item rounded-xl border border-border/50 bg-gradient-to-br from-card to-muted/20 p-4 transition-all hover:shadow-md hover:border-primary/30"
                    >
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">{project.title}</h4>
                        {project.role && (
                          <p className="text-sm text-muted-foreground">
                            {project.role}
                          </p>
                        )}
                        {project.description && (
                          <p className="mt-1 text-sm">{project.description}</p>
                        )}
                        {project.technologies &&
                          project.technologies.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {project.technologies?.map(
                                (tech: string, i: number) => (
                                  <Badge
                                    key={i}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {tech}
                                  </Badge>
                                )
                              )}
                            </div>
                          )}
                      </div>
                      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditSheet("projects", idx)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteProject(idx)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="group p-6 border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">
                    Certifications
                  </h3>
                  {certifications.length === 0 && (
                    <Badge
                      variant="outline"
                      className="border-amber-500 text-amber-600"
                    >
                      Empty
                    </Badge>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={addCertification}>
                  <Plus className="mr-1 h-4 w-4" />
                  Add
                </Button>
              </div>
              {certifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-amber-500/50 bg-amber-50/50 p-8 text-center dark:bg-amber-950/20">
                  <AlertCircle className="h-8 w-8 text-amber-600" />
                  <p className="mt-2 text-sm font-medium text-amber-600">
                    No certifications added
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addCertification}
                    className="mt-4"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add Your First Certification
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {certifications.map(
                    (cert: ResumeCertification, idx: number) => (
                      <div
                        key={idx}
                        className="group/item rounded-xl border border-border/50 bg-gradient-to-br from-card to-muted/20 p-4 transition-all hover:shadow-md hover:border-primary/30"
                      >
                        <div className="flex-1">
                          <h4 className="font-bold text-lg">{cert.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {cert.issuer} • {cert.issue_date}
                          </p>
                        </div>
                        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditSheet("certifications", idx)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteCertification(idx)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="group p-6 border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Languages className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">
                      Languages
                    </h3>
                    {languages.length === 0 && (
                      <Badge
                        variant="outline"
                        className="border-amber-500 text-amber-600"
                      >
                        Empty
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditSheet("languages")}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
                {languages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-amber-500/50 bg-amber-50/50 p-8 text-center dark:bg-amber-950/20">
                    <AlertCircle className="h-8 w-8 text-amber-600" />
                    <p className="mt-2 text-sm font-medium text-amber-600">
                      No languages added
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditSheet("languages")}
                      className="mt-4"
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Add Your First Language
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {languages.map((lang: ResumeLanguage, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{lang.language}</span>
                        <span className="text-muted-foreground">
                          {lang.proficiency}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="group p-6 border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Heart className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">
                      Interests
                    </h3>
                    {interests.length === 0 && (
                      <Badge
                        variant="outline"
                        className="border-amber-500 text-amber-600"
                      >
                        Empty
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditSheet("interests")}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
                {interests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-amber-500/50 bg-amber-50/50 p-8 text-center dark:bg-amber-950/20">
                    <AlertCircle className="h-8 w-8 text-amber-600" />
                    <p className="mt-2 text-sm font-medium text-amber-600">
                      No interests added
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditSheet("interests")}
                      className="mt-4"
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Add Your First Interest
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {interests.map((interest: ResumeInterest, idx: number) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="px-3 py-1.5 transition-all hover:scale-105 hover:shadow-md cursor-default"
                      >
                        {interest.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="p-6 sticky top-20 border-0 shadow-xl bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-8 w-1 rounded-full bg-gradient-to-b from-primary to-primary/50" />
                <h3 className="text-xl font-bold tracking-tight">
                  Profile Status
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">Completion</span>
                    <span className="text-sm font-bold text-primary">
                      {completionPercentage}%
                    </span>
                  </div>
                  <Progress
                    value={completionPercentage}
                    className="h-3 bg-muted/50"
                  />
                  {completionPercentage < 100 ? (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-amber-600 font-medium">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span className="font-medium">
                          Complete your profile
                        </span>
                      </div>
                      {missingItems.length > 0 && (
                        <div className="ml-6 space-y-1">
                          <p className="text-xs text-muted-foreground font-medium">
                            Pending:
                          </p>
                          <ul className="space-y-1">
                            {missingItems.map((item, idx) => (
                              <li
                                key={idx}
                                className="text-xs text-muted-foreground flex items-center gap-1.5"
                              >
                                <span className="h-1 w-1 rounded-full bg-amber-500 flex-shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Profile complete!</span>
                    </div>
                  )}
                </div>
                <Separator />
                <div className="space-y-3">
                  {resumeFilename && (
                    <div className="text-sm">
                      <p className="text-muted-foreground mb-1">
                        Current Resume:
                      </p>
                      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                        <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="truncate font-medium">
                          {resumeFilename}
                        </span>
                      </div>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      document.getElementById("resume-reupload-direct")?.click()
                    }
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Re-upload Resume
                  </Button>
                  <input
                    id="resume-reupload-direct"
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploading}
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {renderEditSheet()}
    </div>
  );
}
