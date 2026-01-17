"use client";

import { useState, useEffect, useCallback, useMemo, ChangeEvent } from "react";
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

  const handleFileSelection = useCallback(async (file: File) => {
    // Security: Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const allowedExtensions = ['.pdf', '.docx'];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      setError("Please upload a PDF or DOCX file only.");
      return;
    }

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
  }, []);

  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFileSelection(file);
  }, [handleFileSelection]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelection(file);
  }, [handleFileSelection]);

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

    const sectionTitles: Record<string, string> = {
      basic: "Basic Information",
      experience: "Work Experience",
      education: "Education",
      skills: "Skills",
      projects: "Projects",
      certifications: "Certifications",
      languages: "Languages",
      interests: "Interests",
    };

    return (
      <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
        <SheetContent className="w-full sm:max-w-xl flex flex-col overflow-hidden">
          <SheetHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-border/50">
            <SheetTitle className="text-lg font-semibold">
              {sectionTitles[editingSection] || `Edit ${editingSection}`}
            </SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground">
              Update your {editingSection} details below
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
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
          </div>

          {/* Fixed footer */}
          <div className="flex-shrink-0 px-6 py-4 border-t border-border/50 bg-background">
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={closeEditSheet} size="sm">
                Cancel
              </Button>
              <Button
                onClick={saveSheetData}
                disabled={
                  saving || !hasUnsavedChanges || !checkMandatoryFieldsFilled()
                }
                size="sm"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
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
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-4 pb-12">
        <div className="mx-auto max-w-3xl px-6">
          {/* Header with back navigation */}
          <div className="mb-8">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
              aria-label="Go back to dashboard"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Let's Build Your Profile
            </h1>
            <p className="mt-2 text-muted-foreground max-w-lg">
              A complete profile helps our AI create personalized interview questions tailored to your experience.
            </p>
          </div>

          {/* Quick tips for new users */}
          <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Quick Tip</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Upload your resume for instant AI parsing, or start fresh with manual entry. You can always edit later.
                </p>
              </div>
            </div>
          </div>

          <Card className="overflow-hidden border-border/60">
            {parsing ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center gap-5 p-10">
                <div className="relative">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold">
                    Analyzing your resume...
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This usually takes 5-10 seconds
                  </p>
                </div>
                <div className="w-48">
                  <Progress value={66} className="h-1.5" />
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Upload Resume Option - Recommended */}
                  <button
                    type="button"
                    className={`group relative cursor-pointer rounded-xl border-2 p-6 text-left transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
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
                    aria-label="Upload your resume file"
                  >
                    {/* Recommended badge */}
                    <div className="absolute -top-2.5 left-4">
                      <Badge className="bg-emerald-500 text-white text-[10px] px-2 py-0.5">
                        Recommended
                      </Badge>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-primary/10 p-3 transition-transform group-hover:scale-105">
                        <Upload className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">Upload Resume</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          AI extracts your info instantly
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground/70">
                          PDF or DOCX • Max 5MB
                        </p>
                      </div>
                    </div>
                    <input
                      id="resume-upload"
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={uploading}
                      aria-hidden="true"
                    />
                  </button>

                  {/* Manual Entry Option */}
                  <button
                    type="button"
                    className="group rounded-xl border-2 border-border p-6 text-left transition-all hover:border-primary/50 hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    onClick={startManualEntry}
                    aria-label="Enter your details manually"
                  >
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-secondary p-3 transition-transform group-hover:scale-105">
                        <Pencil className="h-6 w-6 text-secondary-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">Start Fresh</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Enter details step by step
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground/70">
                          Great if you don't have a resume
                        </p>
                      </div>
                    </div>
                  </button>
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
    <div className="relative min-h-screen bg-gradient-to-br from-background via-primary/5 to-background pt-4 pb-12">
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
        {/* Header with back navigation and progress */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold tracking-tight">Your Profile</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Keep your profile updated for better interview personalization
            </p>
          </div>
          
          {/* Completion indicator */}
          <div className="flex items-center gap-3 bg-card/80 border border-border/60 rounded-lg px-4 py-2.5">
            <div className="flex items-center gap-2">
              {completionPercentage === 100 ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary">{completionPercentage}</span>
                </div>
              )}
              <span className="text-sm font-medium">
                {completionPercentage === 100 ? "Profile Complete" : `${completionPercentage}% Complete`}
              </span>
            </div>
            <Progress value={completionPercentage} className="w-24 h-2" />
          </div>
        </div>

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
                      {/* Contact info - compact row */}
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                        {basic_info.location?.city && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            {basic_info.location.city}{basic_info.location.country ? `, ${basic_info.location.country}` : ""}
                          </span>
                        )}
                        {basic_info.email && (
                          <span className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5" />
                            {basic_info.email}
                          </span>
                        )}
                        {basic_info.phone && (
                          <span className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5" />
                            {basic_info.phone}
                          </span>
                        )}
                      </div>
                      {/* Social links - only show if any exist */}
                      {(basic_info.linkedin_url || basic_info.github_url || basic_info.portfolio_url) && (
                        <div className="mt-3 flex gap-2">
                          {basic_info.linkedin_url && (
                            <a
                              href={basic_info.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="View LinkedIn profile"
                            >
                              <Badge
                                variant="outline"
                                className="cursor-pointer transition-all hover:bg-primary/10 hover:scale-105"
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
                              aria-label="View GitHub profile"
                            >
                              <Badge
                                variant="outline"
                                className="cursor-pointer transition-all hover:bg-primary/10 hover:scale-105"
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
                              aria-label="View portfolio website"
                            >
                              <Badge
                                variant="outline"
                                className="cursor-pointer transition-all hover:bg-primary/10 hover:scale-105"
                              >
                                <Globe className="mr-1 h-3 w-3" />
                                Portfolio
                              </Badge>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditSheet("basic")}
                      className="flex-shrink-0"
                      aria-label="Edit basic information"
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1.5" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">
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
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 p-6 text-center">
                  <Briefcase className="h-8 w-8 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Add your work history to personalize interviews
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addExperience}
                    className="mt-3"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add Experience
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

            <Card className="p-6 border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">
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
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 p-6 text-center">
                  <GraduationCap className="h-8 w-8 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Add your educational background
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addEducation}
                    className="mt-3"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add Education
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

            <Card className="p-6 border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Code className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Skills</h3>
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
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 p-6 text-center">
                  <Code className="h-8 w-8 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Add your technical and soft skills
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditSheet("skills")}
                    className="mt-3"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add Skills
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill: ResumeSkill, idx: number) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="px-3 py-1.5"
                    >
                      {skill.name}
                      {skill.level && ` • ${skill.level}`}
                    </Badge>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-6 border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Projects</h3>
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
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 p-6 text-center">
                  <FileText className="h-8 w-8 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Showcase your best projects
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addProject}
                    className="mt-3"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add Project
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

            <Card className="p-6 border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">
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
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 p-6 text-center">
                  <Award className="h-8 w-8 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Add your certifications and credentials
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addCertification}
                    className="mt-3"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add Certification
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
              <Card className="p-6 border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Languages className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">
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
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      No languages added yet
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditSheet("languages")}
                      className="mt-2"
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Add Language
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {languages.map((lang: ResumeLanguage, idx: number) => (
                      <Badge key={idx} variant="secondary" className="px-3 py-1.5">
                        {lang.name || lang.language}
                        {lang.proficiency && <span className="ml-1 text-muted-foreground">• {lang.proficiency}</span>}
                      </Badge>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="p-6 border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Heart className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">
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
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      No interests added yet
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditSheet("interests")}
                      className="mt-2"
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Add Interest
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {interests.map((interest: ResumeInterest, idx: number) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="px-3 py-1.5"
                      >
                        {interest.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* Sidebar - sticky container */}
          <div className="relative">
            <div className="sticky top-20 space-y-4">
              {/* Quick Actions Card */}
              <Card className="p-5 border-border/50 bg-card shadow-sm">
                <h3 className="text-sm font-medium text-foreground mb-4">
                  Quick Actions
                </h3>
                
                <div className="space-y-3">
                  {/* Resume upload */}
                  <div className="p-3 rounded-lg bg-muted/40">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 p-2 rounded-md bg-primary/10">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {resumeFilename || "No resume"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {resumeFilename ? "Click to replace" : "Upload to auto-fill"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      onClick={() =>
                        document.getElementById("resume-reupload-direct")?.click()
                      }
                      disabled={uploading}
                    >
                      <Upload className="mr-1.5 h-3.5 w-3.5" />
                      {resumeFilename ? "Replace" : "Upload Resume"}
                    </Button>
                    <input
                      id="resume-reupload-direct"
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={uploading}
                      aria-hidden="true"
                    />
                  </div>

                  {/* Missing items - only show if incomplete */}
                  {completionPercentage < 100 && missingItems.length > 0 && (
                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30">
                      <p className="text-xs font-medium text-amber-800 dark:text-amber-300 mb-2">
                        To complete your profile:
                      </p>
                      <ul className="space-y-1">
                        {missingItems.slice(0, 4).map((item, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2"
                          >
                            <span className="h-1 w-1 rounded-full bg-amber-500 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                        {missingItems.length > 4 && (
                          <li className="text-xs text-amber-600 dark:text-amber-500 pl-3">
                            +{missingItems.length - 4} more
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Success state */}
                  {completionPercentage === 100 && (
                    <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                          Profile complete!
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Help text - inline instead of separate card */}
                  <p className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                    Click <strong>Edit</strong> on any section to update. Changes save automatically.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {renderEditSheet()}
    </div>
  );
}
