"use client";

import { FormEvent, useState, ChangeEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import styles from "./ResumeIntake.module.css";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

type ResumeLocation = {
  city: string;
  state: string;
  country: string;
};

type ResumeBasicInfo = {
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

type ResumeWorkExperience = {
  job_title: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string;
  currently_working: boolean;
  description: string;
  achievements: string[];
};

type ResumeEducation = {
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  grade: string;
  location: string;
};

type ResumeSkill = {
  name: string;
  level: string;
  category: string;
};

type ResumeProject = {
  title: string;
  description: string;
  technologies: string[];
  role: string;
  link: string;
};

type ResumeCertification = {
  name: string;
  issuer: string;
  issue_date: string;
  expiry_date: string;
  credential_id: string;
  credential_url: string;
};

type ResumeLanguage = {
  language: string;
  proficiency: string;
};

type ResumePublication = {
  title: string;
  publisher: string;
  publication_date: string;
  url: string;
};

type ResumeAward = {
  title: string;
  issuer: string;
  date: string;
  description: string;
};

type ParsedResume = {
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

type ResumeWizardStep = "profile" | "career" | "strengths" | "extras";

type ResumeIntakeProps = {
  apiUrl?: string;
  onSubmitParsed?: (data: ParsedResume) => void;
  onResumeUploaded?: () => void;
};

export function ResumeIntake({
  apiUrl,
  onSubmitParsed,
  onResumeUploaded,
}: ResumeIntakeProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedResume | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [step, setStep] = useState<ResumeWizardStep>("profile");
  const [stepError, setStepError] = useState<string | null>(null);

  const steps: ResumeWizardStep[] = [
    "profile",
    "career",
    "strengths",
    "extras",
  ];
  const stepIndex = steps.indexOf(step);
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === steps.length - 1;

  function hasBlankWorkExperienceItems(data: ParsedResume) {
    return data.work_experience.some((item) => {
      return (
        !item.job_title.trim() &&
        !item.company.trim() &&
        !item.location.trim() &&
        !item.start_date.trim() &&
        !item.end_date.trim() &&
        !item.description.trim() &&
        item.achievements.length === 0
      );
    });
  }

  function hasBlankEducationItems(data: ParsedResume) {
    return data.education.some((item) => {
      return (
        !item.institution.trim() &&
        !item.degree.trim() &&
        !item.field_of_study.trim() &&
        !item.start_date.trim() &&
        !item.end_date.trim() &&
        !item.grade.trim() &&
        !item.location.trim()
      );
    });
  }

  function hasBlankSkillItems(data: ParsedResume) {
    return data.skills.some((item) => {
      return !item.name.trim() && !item.level.trim() && !item.category.trim();
    });
  }

  function hasBlankProjectItems(data: ParsedResume) {
    return data.projects.some((item) => {
      return (
        !item.title.trim() &&
        !item.description.trim() &&
        item.technologies.length === 0 &&
        !item.role.trim() &&
        !item.link.trim()
      );
    });
  }

  function hasBlankCertificationItems(data: ParsedResume) {
    return data.certifications.some((item) => {
      return (
        !item.name.trim() &&
        !item.issuer.trim() &&
        !item.issue_date.trim() &&
        !item.expiry_date.trim() &&
        !item.credential_id.trim() &&
        !item.credential_url.trim()
      );
    });
  }

  function hasBlankLanguageItems(data: ParsedResume) {
    return data.languages.some((item) => {
      return !item.language.trim() && !item.proficiency.trim();
    });
  }

  function hasBlankPublicationItems(data: ParsedResume) {
    return data.publications.some((item) => {
      return (
        !item.title.trim() &&
        !item.publisher.trim() &&
        !item.publication_date.trim() &&
        !item.url.trim()
      );
    });
  }

  function hasBlankAwardItems(data: ParsedResume) {
    return data.awards.some((item) => {
      return (
        !item.title.trim() &&
        !item.issuer.trim() &&
        !item.date.trim() &&
        !item.description.trim()
      );
    });
  }

  function hasBlankInterestItems(data: ParsedResume) {
    return data.interests.some((item) => !item.trim());
  }

  function hasBlankItemsForStep(currentStep: ResumeWizardStep) {
    if (!parsed) return false;

    if (currentStep === "career") {
      return (
        hasBlankWorkExperienceItems(parsed) || hasBlankEducationItems(parsed)
      );
    }

    if (currentStep === "strengths") {
      return hasBlankSkillItems(parsed) || hasBlankProjectItems(parsed);
    }

    if (currentStep === "extras") {
      return (
        hasBlankCertificationItems(parsed) ||
        hasBlankLanguageItems(parsed) ||
        hasBlankPublicationItems(parsed) ||
        hasBlankAwardItems(parsed) ||
        hasBlankInterestItems(parsed)
      );
    }

    return false;
  }

  function goToStep(next: ResumeWizardStep) {
    const nextIndex = steps.indexOf(next);

    if (parsed && nextIndex > stepIndex && hasBlankItemsForStep(step)) {
      setStepError(
        "Remove or fill all empty rows in this step before moving on."
      );
      return;
    }

    setStepError(null);
    setStep(next);
  }

  function goToNextStep() {
    if (isLastStep) return;

    if (parsed && hasBlankItemsForStep(step)) {
      setStepError(
        "Remove or fill all empty rows in this step before moving on."
      );
      return;
    }

    setStepError(null);
    setStep(steps[stepIndex + 1]);
  }

  function goToPreviousStep() {
    if (isFirstStep) return;
    setStep(steps[stepIndex - 1]);
  }

  function handleFileSelection(file: File) {
    setStatus(null);
    setStatusError(null);
    setParsed(null);

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError(
        `File size exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(
          1
        )}MB)`
      );
      setFileName(null);
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    setFileName(file.name);
    setSelectedFile(file);
    setFileError(null);

    if (file.type === "application/pdf") {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setFileName(null);
      setSelectedFile(null);
      setPreviewUrl(null);
      setFileError(null);
      return;
    }

    handleFileSelection(file);
  }

  async function handleUpload(event: FormEvent) {
    event.preventDefault();

    const input = document.getElementById(
      "resume-upload-input"
    ) as HTMLInputElement | null;

    const file = selectedFile ?? input?.files?.[0] ?? null;

    if (!file) {
      setFileError("Please select a resume file first.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError("File is too large. Maximum size is 5MB.");
      return;
    }

    setUploading(true);
    setStatus("Parsing your resume with AI...");
    setStatusError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        setStatusError("You must be signed in to upload a resume.");
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const baseUrl =
        apiUrl ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

      const response = await fetch(`${baseUrl}/api/resume`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        let message = "Failed to upload resume.";
        try {
          const errorBody = (await response.json()) as { message?: string };
          if (errorBody?.message) {
            message = errorBody.message;
          }
        } catch {
          // ignore JSON parse errors
        }
        setStatusError(message);
        setUploading(false);
        return;
      }

      const body = (await response.json()) as {
        resume?: unknown;
        parsed?: ParsedResume;
      };

      if (body.parsed) {
        const parsedResume: ParsedResume = {
          ...body.parsed,
          last_updated: body.parsed.last_updated ?? new Date().toISOString(),
        };
        setParsed(parsedResume);
        setStatus("Resume parsed. Review and refine the details below.");
      } else {
        setStatus(
          "Resume uploaded successfully. Parsing will complete shortly."
        );
      }

      onResumeUploaded?.();
    } catch (error) {
      console.error("Resume upload error:", error);
      setStatusError("An unexpected error occurred while uploading resume.");
    } finally {
      setUploading(false);
    }
  }

  function handleChangeBasic<K extends keyof ResumeBasicInfo>(
    field: K,
    value: ResumeBasicInfo[K]
  ) {
    if (!parsed) return;
    setParsed({
      ...parsed,
      basic_info: { ...parsed.basic_info, [field]: value },
    });
  }

  function handleChangeBasicLocation<K extends keyof ResumeLocation>(
    field: K,
    value: ResumeLocation[K]
  ) {
    if (!parsed) return;
    setParsed({
      ...parsed,
      basic_info: {
        ...parsed.basic_info,
        location: { ...parsed.basic_info.location, [field]: value },
      },
    });
  }

  function handleChangeWorkExperience<K extends keyof ResumeWorkExperience>(
    index: number,
    field: K,
    value: ResumeWorkExperience[K]
  ) {
    if (!parsed) return;
    const work = [...parsed.work_experience];
    work[index] = { ...work[index], [field]: value };
    setParsed({ ...parsed, work_experience: work });
  }

  function handleAddWorkExperience() {
    if (!parsed) return;
    const blank: ResumeWorkExperience = {
      job_title: "",
      company: "",
      location: "",
      start_date: "",
      end_date: "",
      currently_working: false,
      description: "",
      achievements: [],
    };
    setParsed({
      ...parsed,
      work_experience: [...parsed.work_experience, blank],
    });
  }

  function handleRemoveWorkExperience(index: number) {
    if (!parsed) return;
    setParsed({
      ...parsed,
      work_experience: parsed.work_experience.filter((_, i) => i !== index),
    });
  }

  function handleChangeEducation<K extends keyof ResumeEducation>(
    index: number,
    field: K,
    value: ResumeEducation[K]
  ) {
    if (!parsed) return;
    const education = [...parsed.education];
    education[index] = { ...education[index], [field]: value };
    setParsed({ ...parsed, education });
  }

  function handleAddEducation() {
    if (!parsed) return;
    const blank: ResumeEducation = {
      institution: "",
      degree: "",
      field_of_study: "",
      start_date: "",
      end_date: "",
      grade: "",
      location: "",
    };
    setParsed({ ...parsed, education: [...parsed.education, blank] });
  }

  function handleRemoveEducation(index: number) {
    if (!parsed) return;
    setParsed({
      ...parsed,
      education: parsed.education.filter((_, i) => i !== index),
    });
  }

  function handleChangeSkill<K extends keyof ResumeSkill>(
    index: number,
    field: K,
    value: ResumeSkill[K]
  ) {
    if (!parsed) return;
    const skills = [...parsed.skills];
    skills[index] = { ...skills[index], [field]: value };
    setParsed({ ...parsed, skills });
  }

  function handleAddSkill() {
    if (!parsed) return;
    const blank: ResumeSkill = { name: "", level: "", category: "" };
    setParsed({ ...parsed, skills: [...parsed.skills, blank] });
  }

  function handleRemoveSkill(index: number) {
    if (!parsed) return;
    setParsed({
      ...parsed,
      skills: parsed.skills.filter((_, i) => i !== index),
    });
  }

  function handleChangeProject<K extends keyof ResumeProject>(
    index: number,
    field: K,
    value: ResumeProject[K]
  ) {
    if (!parsed) return;
    const projects = [...parsed.projects];
    projects[index] = { ...projects[index], [field]: value };
    setParsed({ ...parsed, projects });
  }

  function handleAddProject() {
    if (!parsed) return;
    const blank: ResumeProject = {
      title: "",
      description: "",
      technologies: [],
      role: "",
      link: "",
    };
    setParsed({ ...parsed, projects: [...parsed.projects, blank] });
  }

  function handleRemoveProject(index: number) {
    if (!parsed) return;
    setParsed({
      ...parsed,
      projects: parsed.projects.filter((_, i) => i !== index),
    });
  }

  function handleChangeCertification<K extends keyof ResumeCertification>(
    index: number,
    field: K,
    value: ResumeCertification[K]
  ) {
    if (!parsed) return;
    const certifications = [...parsed.certifications];
    certifications[index] = { ...certifications[index], [field]: value };
    setParsed({ ...parsed, certifications });
  }

  function handleAddCertification() {
    if (!parsed) return;
    const blank: ResumeCertification = {
      name: "",
      issuer: "",
      issue_date: "",
      expiry_date: "",
      credential_id: "",
      credential_url: "",
    };
    setParsed({
      ...parsed,
      certifications: [...parsed.certifications, blank],
    });
  }

  function handleRemoveCertification(index: number) {
    if (!parsed) return;
    setParsed({
      ...parsed,
      certifications: parsed.certifications.filter((_, i) => i !== index),
    });
  }

  function handleChangeLanguage<K extends keyof ResumeLanguage>(
    index: number,
    field: K,
    value: ResumeLanguage[K]
  ) {
    if (!parsed) return;
    const languages = [...parsed.languages];
    languages[index] = { ...languages[index], [field]: value };
    setParsed({ ...parsed, languages });
  }

  function handleAddLanguage() {
    if (!parsed) return;
    const blank: ResumeLanguage = { language: "", proficiency: "" };
    setParsed({ ...parsed, languages: [...parsed.languages, blank] });
  }

  function handleRemoveLanguage(index: number) {
    if (!parsed) return;
    setParsed({
      ...parsed,
      languages: parsed.languages.filter((_, i) => i !== index),
    });
  }

  function handleChangePublication<K extends keyof ResumePublication>(
    index: number,
    field: K,
    value: ResumePublication[K]
  ) {
    if (!parsed) return;
    const publications = [...parsed.publications];
    publications[index] = { ...publications[index], [field]: value };
    setParsed({ ...parsed, publications });
  }

  function handleAddPublication() {
    if (!parsed) return;
    const blank: ResumePublication = {
      title: "",
      publisher: "",
      publication_date: "",
      url: "",
    };
    setParsed({
      ...parsed,
      publications: [...parsed.publications, blank],
    });
  }

  function handleRemovePublication(index: number) {
    if (!parsed) return;
    setParsed({
      ...parsed,
      publications: parsed.publications.filter((_, i) => i !== index),
    });
  }

  function handleChangeAward<K extends keyof ResumeAward>(
    index: number,
    field: K,
    value: ResumeAward[K]
  ) {
    if (!parsed) return;
    const awards = [...parsed.awards];
    awards[index] = { ...awards[index], [field]: value };
    setParsed({ ...parsed, awards });
  }

  function handleAddAward() {
    if (!parsed) return;
    const blank: ResumeAward = {
      title: "",
      issuer: "",
      date: "",
      description: "",
    };
    setParsed({ ...parsed, awards: [...parsed.awards, blank] });
  }

  function handleRemoveAward(index: number) {
    if (!parsed) return;
    setParsed({
      ...parsed,
      awards: parsed.awards.filter((_, i) => i !== index),
    });
  }

  function handleChangeInterest(index: number, value: string) {
    if (!parsed) return;
    const interests = [...parsed.interests];
    interests[index] = value;
    setParsed({ ...parsed, interests });
  }

  function handleAddInterest() {
    if (!parsed) return;
    setParsed({ ...parsed, interests: [...parsed.interests, ""] });
  }

  function handleRemoveInterest(index: number) {
    if (!parsed) return;
    setParsed({
      ...parsed,
      interests: parsed.interests.filter((_, i) => i !== index),
    });
  }

  function handleSubmitParsed(event: FormEvent) {
    event.preventDefault();
    if (!parsed) return;
    onSubmitParsed?.(parsed);
  }

  const hasParsed = !!parsed;

  const profileComplete =
    !!parsed &&
    parsed.basic_info.first_name.trim() &&
    parsed.basic_info.last_name.trim() &&
    parsed.basic_info.email.trim() &&
    parsed.basic_info.phone.trim() &&
    parsed.basic_info.location.city.trim() &&
    parsed.basic_info.location.country.trim() &&
    parsed.basic_info.summary.trim();

  const careerComplete =
    !!parsed &&
    parsed.work_experience.length > 0 &&
    parsed.education.length > 0;

  const strengthsComplete = !!parsed && parsed.skills.length > 0;

  const extrasComplete =
    !!parsed &&
    (parsed.certifications.length > 0 ||
      parsed.languages.length > 0 ||
      parsed.publications.length > 0 ||
      parsed.awards.length > 0 ||
      parsed.interests.length > 0);

  return (
    <section className={styles.root}>
      <div className={styles.shell}>
        {!hasParsed && (
          <div
            className={`${styles.uploadCard} ${
              uploading ? styles.uploadCardParsing : ""
            }`}
          >
            <div className={styles.uploadHeader}>
              <h2>Upload Resume</h2>
            </div>

            <form onSubmit={handleUpload} className={styles.uploadBody}>
              <div className={styles.fileStage}>
                {!selectedFile ? (
                  <>
                    <div
                      className={`${styles.dropzone} ${
                        uploading || isDragging ? styles.dropzoneActive : ""
                      }`}
                      onClick={() =>
                        document.getElementById("resume-upload-input")?.click()
                      }
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const files = e.dataTransfer.files;
                        if (files.length > 0) {
                          const file = files[0];
                          handleFileSelection(file);
                        }
                      }}
                    >
                      <div className={styles.dropzoneIcon}>📄</div>
                      <p className={styles.dropzoneLabel}>
                        Drop your resume here or click to browse
                      </p>
                      <p className={styles.dropzoneHint}>
                        PDF or DOCX • Max 5MB
                      </p>
                    </div>
                    <input
                      id="resume-upload-input"
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleFileChange}
                      className={styles.hiddenInput}
                      disabled={uploading}
                    />
                    {fileError && (
                      <p className={styles.fileError}>{fileError}</p>
                    )}
                  </>
                ) : (
                  <div className={styles.filePreviewCard}>
                    <div className={styles.filePreviewHeader}>
                      <div className={styles.filePreviewHeaderMain}>
                        <p className={styles.fileName}>{fileName}</p>
                        <p className={styles.fileMeta}>
                          Ready to parse. We&apos;ll turn this into a structured
                          profile.
                        </p>
                      </div>
                      <div className={styles.filePreviewActions}>
                        <Button
                          type="button"
                          variant="outline"
                          className={styles.changeFileButton}
                          onClick={() =>
                            document
                              .getElementById("resume-upload-input")
                              ?.click()
                          }
                          disabled={uploading}
                        >
                          Change file
                        </Button>
                        <Button
                          type="submit"
                          disabled={uploading}
                          className={styles.compactButton}
                        >
                          {uploading ? "Parsing..." : "Upload & parse"}
                        </Button>
                      </div>
                    </div>
                    <div className={styles.filePreviewBody}>
                      {previewUrl && selectedFile.type === "application/pdf" ? (
                        <iframe
                          src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                          className={styles.fileFrame}
                          title="Resume preview"
                        />
                      ) : (
                        <div className={styles.filePreviewFallback}>
                          <div className={styles.fileIcon}>
                            <span>CV</span>
                          </div>
                          <p className={styles.fileMeta}>
                            Preview unavailable for this file type, but
                            it&apos;s ready for parsing.
                          </p>
                        </div>
                      )}
                    </div>
                    <input
                      id="resume-upload-input"
                      type="file"
                      accept=".pdf,.doc,.docx,.rtf,.txt"
                      className={styles.hiddenInput}
                      onChange={handleFileChange}
                    />
                  </div>
                )}
              </div>

              {uploading && (
                <div className={styles.parsingOverlay}>
                  <div className={styles.parsingOverlayGlow} />
                  <Spinner className="h-6 w-6 text-white" />
                  <p className={styles.parsingOverlayText}>
                    Reading your resume with AI...
                  </p>
                </div>
              )}
            </form>
          </div>
        )}

        {hasParsed && parsed && (
          <form onSubmit={handleSubmitParsed} className={styles.parsedShell}>
            <div className={styles.parsedHeader}>
              <div>
                <h2>Review parsed profile</h2>
                <p>
                  Edit any field below before we use this profile for
                  interviews.
                </p>
              </div>
            </div>

            <div className={styles.parsedTabsRow}>
              <Tabs
                value={step}
                onValueChange={(value) => goToStep(value as ResumeWizardStep)}
              >
                <TabsList>
                  <TabsTrigger value="profile">
                    <span className={styles.tabLabel}>
                      Profile
                      {profileComplete && (
                        <span className={styles.tabDot} aria-hidden="true" />
                      )}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="career">
                    <span className={styles.tabLabel}>
                      Career
                      {careerComplete && (
                        <span className={styles.tabDot} aria-hidden="true" />
                      )}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="strengths">
                    <span className={styles.tabLabel}>
                      Strengths
                      {strengthsComplete && (
                        <span className={styles.tabDot} aria-hidden="true" />
                      )}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="extras">
                    <span className={styles.tabLabel}>
                      Extras
                      {extrasComplete && (
                        <span className={styles.tabDot} aria-hidden="true" />
                      )}
                    </span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {stepError && <p className={styles.stepError}>{stepError}</p>}

            <div className={styles.parsedGrid}>
              {step === "profile" && (
                <section className={styles.sectionCard}>
                  <h3 className={styles.sectionTitle}>Basic information</h3>
                  <div className={styles.fieldGrid}>
                    <div>
                      <p className={styles.fieldLabel}>
                        First name
                        <span className={styles.fieldRequired}>*</span>
                      </p>
                      <Input
                        value={parsed.basic_info.first_name}
                        onChange={(e) =>
                          handleChangeBasic("first_name", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <p className={styles.fieldLabel}>
                        Last name<span className={styles.fieldRequired}>*</span>
                      </p>
                      <Input
                        value={parsed.basic_info.last_name}
                        onChange={(e) =>
                          handleChangeBasic("last_name", e.target.value)
                        }
                      />
                    </div>
                    <div className={styles.fieldFull}>
                      <p className={styles.fieldLabel}>Headline / full name</p>
                      <Input
                        value={parsed.basic_info.full_name}
                        onChange={(e) =>
                          handleChangeBasic("full_name", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <p className={styles.fieldLabel}>
                        Email<span className={styles.fieldRequired}>*</span>
                      </p>
                      <Input
                        type="email"
                        value={parsed.basic_info.email}
                        onChange={(e) =>
                          handleChangeBasic("email", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <p className={styles.fieldLabel}>
                        Phone<span className={styles.fieldRequired}>*</span>
                      </p>
                      <Input
                        value={parsed.basic_info.phone}
                        onChange={(e) =>
                          handleChangeBasic("phone", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <p className={styles.fieldLabel}>LinkedIn</p>
                      <Input
                        value={parsed.basic_info.linkedin}
                        onChange={(e) =>
                          handleChangeBasic("linkedin", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <p className={styles.fieldLabel}>GitHub</p>
                      <Input
                        value={parsed.basic_info.github}
                        onChange={(e) =>
                          handleChangeBasic("github", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <p className={styles.fieldLabel}>Portfolio</p>
                      <Input
                        value={parsed.basic_info.portfolio}
                        onChange={(e) =>
                          handleChangeBasic("portfolio", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <p className={styles.fieldLabel}>
                        City<span className={styles.fieldRequired}>*</span>
                      </p>
                      <Input
                        value={parsed.basic_info.location.city}
                        onChange={(e) =>
                          handleChangeBasicLocation("city", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <p className={styles.fieldLabel}>State</p>
                      <Input
                        value={parsed.basic_info.location.state}
                        onChange={(e) =>
                          handleChangeBasicLocation("state", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <p className={styles.fieldLabel}>
                        Country<span className={styles.fieldRequired}>*</span>
                      </p>
                      <Input
                        value={parsed.basic_info.location.country}
                        onChange={(e) =>
                          handleChangeBasicLocation("country", e.target.value)
                        }
                      />
                    </div>
                    <div className={styles.fieldFull}>
                      <p className={styles.fieldLabel}>
                        Summary<span className={styles.fieldRequired}>*</span>
                      </p>
                      <Textarea
                        className={styles.textarea}
                        value={parsed.basic_info.summary}
                        onChange={(e) =>
                          handleChangeBasic("summary", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </section>
              )}

              {step === "strengths" && (
                <section className={styles.sectionCard}>
                  <h3 className={styles.sectionTitle}>Skills</h3>
                  {parsed.skills.length > 0 ? (
                    <div className={styles.arrayList}>
                      {parsed.skills.map((skill, index) => (
                        <div key={index} className={styles.arrayItem}>
                          <div className={styles.fieldGrid}>
                            <div>
                              <p className={styles.fieldLabel}>Name</p>
                              <Input
                                value={skill.name}
                                onChange={(e) =>
                                  handleChangeSkill(
                                    index,
                                    "name",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div>
                              <p className={styles.fieldLabel}>Category</p>
                              <Input
                                value={skill.category}
                                onChange={(e) =>
                                  handleChangeSkill(
                                    index,
                                    "category",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div>
                              <p className={styles.fieldLabel}>Level</p>
                              <Input
                                value={skill.level}
                                onChange={(e) =>
                                  handleChangeSkill(
                                    index,
                                    "level",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div className={styles.itemFooterRow}>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handleRemoveSkill(index)}
                              className={styles.compactButton}
                            >
                              Remove skill
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.arrayEmpty}>
                      No skills yet. Add the technologies you want us to
                      optimise interviews for.
                    </p>
                  )}
                  <div className={styles.itemFooterRow}>
                    <Button
                      type="button"
                      variant="outline"
                      className={styles.compactButton}
                      onClick={handleAddSkill}
                    >
                      Add skill
                    </Button>
                  </div>
                </section>
              )}

              {step === "career" && (
                <section className={styles.sectionCard}>
                  <h3 className={styles.sectionTitle}>Experience</h3>
                  {parsed.work_experience.length > 0 ? (
                    <div className={styles.arrayList}>
                      {parsed.work_experience.map((role, index) => (
                        <div key={index} className={styles.arrayItem}>
                          <div className={styles.fieldGrid}>
                            <div>
                              <p className={styles.fieldLabel}>Job title</p>
                              <Input
                                value={role.job_title}
                                onChange={(e) =>
                                  handleChangeWorkExperience(
                                    index,
                                    "job_title",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div>
                              <p className={styles.fieldLabel}>Company</p>
                              <Input
                                value={role.company}
                                onChange={(e) =>
                                  handleChangeWorkExperience(
                                    index,
                                    "company",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div>
                              <p className={styles.fieldLabel}>Location</p>
                              <Input
                                value={role.location}
                                onChange={(e) =>
                                  handleChangeWorkExperience(
                                    index,
                                    "location",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div>
                              <p className={styles.fieldLabel}>Start date</p>
                              <Input
                                value={role.start_date}
                                onChange={(e) =>
                                  handleChangeWorkExperience(
                                    index,
                                    "start_date",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div>
                              <p className={styles.fieldLabel}>End date</p>
                              <Input
                                value={role.end_date}
                                onChange={(e) =>
                                  handleChangeWorkExperience(
                                    index,
                                    "end_date",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className={styles.fieldFull}>
                              <p className={styles.fieldLabel}>Description</p>
                              <Textarea
                                className={styles.textarea}
                                value={role.description}
                                onChange={(e) =>
                                  handleChangeWorkExperience(
                                    index,
                                    "description",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className={styles.fieldFull}>
                              <p className={styles.fieldLabel}>
                                Achievements (one per line)
                              </p>
                              <Textarea
                                className={styles.textarea}
                                value={role.achievements.join("\n")}
                                onChange={(e) =>
                                  handleChangeWorkExperience(
                                    index,
                                    "achievements",
                                    e.target.value
                                      .split("\n")
                                      .map((v) => v.trim())
                                      .filter(Boolean)
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div className={styles.itemFooterRow}>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handleRemoveWorkExperience(index)}
                              className={styles.compactButton}
                            >
                              Remove role
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.arrayEmpty}>
                      No work experience added yet.
                    </p>
                  )}
                  <div className={styles.itemFooterRow}>
                    <Button
                      type="button"
                      variant="outline"
                      className={styles.compactButton}
                      onClick={handleAddWorkExperience}
                    >
                      Add role
                    </Button>
                  </div>
                </section>
              )}

              {step === "career" && (
                <section className={styles.sectionCard}>
                  <h3 className={styles.sectionTitle}>Education</h3>
                  {parsed.education.length > 0 ? (
                    <div className={styles.arrayList}>
                      {parsed.education.map((edu, index) => (
                        <div key={index} className={styles.arrayItem}>
                          <div className={styles.fieldGrid}>
                            <div>
                              <p className={styles.fieldLabel}>Institution</p>
                              <Input
                                value={edu.institution}
                                onChange={(e) =>
                                  handleChangeEducation(
                                    index,
                                    "institution",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div>
                              <p className={styles.fieldLabel}>Degree</p>
                              <Input
                                value={edu.degree}
                                onChange={(e) =>
                                  handleChangeEducation(
                                    index,
                                    "degree",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div>
                              <p className={styles.fieldLabel}>
                                Field of study
                              </p>
                              <Input
                                value={edu.field_of_study}
                                onChange={(e) =>
                                  handleChangeEducation(
                                    index,
                                    "field_of_study",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div>
                              <p className={styles.fieldLabel}>Location</p>
                              <Input
                                value={edu.location}
                                onChange={(e) =>
                                  handleChangeEducation(
                                    index,
                                    "location",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div>
                              <p className={styles.fieldLabel}>Start date</p>
                              <Input
                                value={edu.start_date}
                                onChange={(e) =>
                                  handleChangeEducation(
                                    index,
                                    "start_date",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div>
                              <p className={styles.fieldLabel}>End date</p>
                              <Input
                                value={edu.end_date}
                                onChange={(e) =>
                                  handleChangeEducation(
                                    index,
                                    "end_date",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className={styles.fieldFull}>
                              <p className={styles.fieldLabel}>Grade</p>
                              <Input
                                value={edu.grade}
                                onChange={(e) =>
                                  handleChangeEducation(
                                    index,
                                    "grade",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div className={styles.itemFooterRow}>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handleRemoveEducation(index)}
                              className={styles.compactButton}
                            >
                              Remove education
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.arrayEmpty}>No education added yet.</p>
                  )}
                  <div className={styles.itemFooterRow}>
                    <Button
                      type="button"
                      variant="outline"
                      className={styles.compactButton}
                      onClick={handleAddEducation}
                    >
                      Add education
                    </Button>
                  </div>
                </section>
              )}

              {step === "strengths" && (
                <section className={styles.sectionCard}>
                  <h3 className={styles.sectionTitle}>Projects</h3>
                  {parsed.projects.length > 0 ? (
                    <div className={styles.arrayList}>
                      {parsed.projects.map((project, index) => (
                        <div key={index} className={styles.arrayItem}>
                          <div className={styles.fieldGrid}>
                            <div>
                              <p className={styles.fieldLabel}>Title</p>
                              <Input
                                value={project.title}
                                onChange={(e) =>
                                  handleChangeProject(
                                    index,
                                    "title",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div>
                              <p className={styles.fieldLabel}>Role</p>
                              <Input
                                value={project.role}
                                onChange={(e) =>
                                  handleChangeProject(
                                    index,
                                    "role",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div>
                              <p className={styles.fieldLabel}>Technologies</p>
                              <Input
                                value={project.technologies.join(", ")}
                                onChange={(e) =>
                                  handleChangeProject(
                                    index,
                                    "technologies",
                                    e.target.value
                                      .split(",")
                                      .map((v) => v.trim())
                                      .filter(Boolean)
                                  )
                                }
                              />
                            </div>
                            <div>
                              <p className={styles.fieldLabel}>Link</p>
                              <Input
                                value={project.link}
                                onChange={(e) =>
                                  handleChangeProject(
                                    index,
                                    "link",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className={styles.fieldFull}>
                              <p className={styles.fieldLabel}>Description</p>
                              <Textarea
                                className={styles.textarea}
                                value={project.description}
                                onChange={(e) =>
                                  handleChangeProject(
                                    index,
                                    "description",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div className={styles.itemFooterRow}>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handleRemoveProject(index)}
                              className={styles.compactButton}
                            >
                              Remove project
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.arrayEmpty}>No projects added yet.</p>
                  )}
                  <div className={styles.itemFooterRow}>
                    <Button
                      type="button"
                      variant="outline"
                      className={styles.compactButton}
                      onClick={handleAddProject}
                    >
                      Add project
                    </Button>
                  </div>
                </section>
              )}

              {step === "extras" && (
                <section className={styles.sectionCard}>
                  <h3 className={styles.sectionTitle}>Certifications</h3>
                  {parsed.certifications.length > 0 ? (
                    <div className={styles.arrayList}>
                      {parsed.certifications.map((cert, index) => (
                        <div key={index} className={styles.arrayItem}>
                          <div className={styles.fieldGrid}>
                            <div>
                              <p className={styles.fieldLabel}>Name</p>
                              <Input
                                value={cert.name}
                                onChange={(e) =>
                                  handleChangeCertification(
                                    index,
                                    "name",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div>
                              <p className={styles.fieldLabel}>Issuer</p>
                              <Input
                                value={cert.issuer}
                                onChange={(e) =>
                                  handleChangeCertification(
                                    index,
                                    "issuer",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div>
                              <p className={styles.fieldLabel}>Issue date</p>
                              <Input
                                value={cert.issue_date}
                                onChange={(e) =>
                                  handleChangeCertification(
                                    index,
                                    "issue_date",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div>
                              <p className={styles.fieldLabel}>Expiry date</p>
                              <Input
                                value={cert.expiry_date}
                                onChange={(e) =>
                                  handleChangeCertification(
                                    index,
                                    "expiry_date",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className={styles.fieldFull}>
                              <p className={styles.fieldLabel}>Credential ID</p>
                              <Input
                                value={cert.credential_id}
                                onChange={(e) =>
                                  handleChangeCertification(
                                    index,
                                    "credential_id",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className={styles.fieldFull}>
                              <p className={styles.fieldLabel}>
                                Credential URL
                              </p>
                              <Input
                                value={cert.credential_url}
                                onChange={(e) =>
                                  handleChangeCertification(
                                    index,
                                    "credential_url",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div className={styles.itemFooterRow}>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handleRemoveCertification(index)}
                              className={styles.compactButton}
                            >
                              Remove certification
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.arrayEmpty}>
                      No certifications added yet.
                    </p>
                  )}
                  <div className={styles.itemFooterRow}>
                    <Button
                      type="button"
                      variant="outline"
                      className={styles.compactButton}
                      onClick={handleAddCertification}
                    >
                      Add certification
                    </Button>
                  </div>
                </section>
              )}

              {step === "extras" && (
                <section className={styles.sectionCard}>
                  <h3 className={styles.sectionTitle}>Languages</h3>
                  {parsed.languages.length > 0 ? (
                    <div className={styles.arrayList}>
                      {parsed.languages.map((lang, index) => (
                        <div key={index} className={styles.arrayItem}>
                          <div className={styles.fieldGrid}>
                            <div>
                              <p className={styles.fieldLabel}>Language</p>
                              <Input
                                value={lang.language}
                                onChange={(e) =>
                                  handleChangeLanguage(
                                    index,
                                    "language",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div>
                              <p className={styles.fieldLabel}>Proficiency</p>
                              <Input
                                value={lang.proficiency}
                                onChange={(e) =>
                                  handleChangeLanguage(
                                    index,
                                    "proficiency",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div className={styles.itemFooterRow}>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handleRemoveLanguage(index)}
                              className={styles.compactButton}
                            >
                              Remove language
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.arrayEmpty}>No languages added yet.</p>
                  )}
                  <div className={styles.itemFooterRow}>
                    <Button
                      type="button"
                      variant="outline"
                      className={styles.compactButton}
                      onClick={handleAddLanguage}
                    >
                      Add language
                    </Button>
                  </div>
                </section>
              )}

              {step === "extras" && (
                <section className={styles.sectionCard}>
                  <h3 className={styles.sectionTitle}>Publications</h3>
                  {parsed.publications.length > 0 ? (
                    <div className={styles.arrayList}>
                      {parsed.publications.map((pub, index) => (
                        <div key={index} className={styles.arrayItem}>
                          <div className={styles.fieldGrid}>
                            <div>
                              <p className={styles.fieldLabel}>Title</p>
                              <Input
                                value={pub.title}
                                onChange={(e) =>
                                  handleChangePublication(
                                    index,
                                    "title",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div>
                              <p className={styles.fieldLabel}>Publisher</p>
                              <Input
                                value={pub.publisher}
                                onChange={(e) =>
                                  handleChangePublication(
                                    index,
                                    "publisher",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div>
                              <p className={styles.fieldLabel}>
                                Publication date
                              </p>
                              <Input
                                value={pub.publication_date}
                                onChange={(e) =>
                                  handleChangePublication(
                                    index,
                                    "publication_date",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className={styles.fieldFull}>
                              <p className={styles.fieldLabel}>URL</p>
                              <Input
                                value={pub.url}
                                onChange={(e) =>
                                  handleChangePublication(
                                    index,
                                    "url",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div className={styles.itemFooterRow}>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handleRemovePublication(index)}
                              className={styles.compactButton}
                            >
                              Remove publication
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.arrayEmpty}>
                      No publications added yet.
                    </p>
                  )}
                  <div className={styles.itemFooterRow}>
                    <Button
                      type="button"
                      variant="outline"
                      className={styles.compactButton}
                      onClick={handleAddPublication}
                    >
                      Add publication
                    </Button>
                  </div>
                </section>
              )}

              {step === "extras" && (
                <section className={styles.sectionCard}>
                  <h3 className={styles.sectionTitle}>Awards</h3>
                  {parsed.awards.length > 0 ? (
                    <div className={styles.arrayList}>
                      {parsed.awards.map((award, index) => (
                        <div key={index} className={styles.arrayItem}>
                          <div className={styles.fieldGrid}>
                            <div>
                              <p className={styles.fieldLabel}>Title</p>
                              <Input
                                value={award.title}
                                onChange={(e) =>
                                  handleChangeAward(
                                    index,
                                    "title",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div>
                              <p className={styles.fieldLabel}>Issuer</p>
                              <Input
                                value={award.issuer}
                                onChange={(e) =>
                                  handleChangeAward(
                                    index,
                                    "issuer",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div>
                              <p className={styles.fieldLabel}>Date</p>
                              <Input
                                value={award.date}
                                onChange={(e) =>
                                  handleChangeAward(
                                    index,
                                    "date",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className={styles.fieldFull}>
                              <p className={styles.fieldLabel}>Description</p>
                              <Textarea
                                className={styles.textarea}
                                value={award.description}
                                onChange={(e) =>
                                  handleChangeAward(
                                    index,
                                    "description",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div className={styles.itemFooterRow}>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handleRemoveAward(index)}
                              className={styles.compactButton}
                            >
                              Remove award
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.arrayEmpty}>No awards added yet.</p>
                  )}
                  <div className={styles.footerRow}>
                    <Button
                      type="button"
                      variant="outline"
                      className={styles.compactButton}
                      onClick={handleAddAward}
                    >
                      Add award
                    </Button>
                  </div>
                </section>
              )}

              {step === "extras" && (
                <section className={styles.sectionCard}>
                  <h3 className={styles.sectionTitle}>Interests</h3>
                  {parsed.interests.length > 0 ? (
                    <div className={styles.arrayList}>
                      {parsed.interests.map((interest, index) => (
                        <div key={index} className={styles.arrayItem}>
                          <Input
                            value={interest}
                            onChange={(e) =>
                              handleChangeInterest(index, e.target.value)
                            }
                          />
                          <div className={styles.itemFooterRow}>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handleRemoveInterest(index)}
                              className={styles.compactButton}
                            >
                              Remove interest
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.arrayEmpty}>No interests added yet.</p>
                  )}
                  <div className={styles.itemFooterRow}>
                    <Button
                      type="button"
                      variant="outline"
                      className={styles.compactButton}
                      onClick={handleAddInterest}
                    >
                      Add interest
                    </Button>
                  </div>
                </section>
              )}
            </div>

            <div className={styles.footerRow}>
              {!isFirstStep && (
                <Button
                  type="button"
                  variant="outline"
                  className={styles.compactButton}
                  onClick={goToPreviousStep}
                >
                  Back
                </Button>
              )}

              {!isLastStep && (
                <Button
                  type="button"
                  className={styles.compactButton}
                  onClick={goToNextStep}
                >
                  Next
                </Button>
              )}

              {isLastStep && (
                <Button
                  type="submit"
                  disabled={!parsed}
                  className={styles.compactButton}
                >
                  Save parsed profile
                </Button>
              )}
            </div>
            <p className={styles.footerNote}>
              You&apos;re always in control. We never overwrite your data
              without your confirmation.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
