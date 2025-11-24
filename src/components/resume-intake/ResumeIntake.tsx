"use client";

import { FormEvent, useState } from "react";
import { PrimaryButton } from "@/components/shared/primary-button";
import { TextInput } from "@/components/shared/text-input";
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

type ResumeIntakeProps = {
  apiUrl?: string;
  onSubmitParsed?: (data: ParsedResume) => void;
  onResumeUploaded?: () => void;
};

export function ResumeIntake({ apiUrl, onSubmitParsed, onResumeUploaded }: ResumeIntakeProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedResume | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFileSelection(file: File) {
    setStatus(null);
    setStatusError(null);
    setParsed(null);

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError(`File size exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB)`);
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

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
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

    const input = document.getElementById("resume-upload-input") as
      | HTMLInputElement
      | null;

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

    const dummyParsed: ParsedResume = {
      basic_info: {
        first_name: "Alex",
        last_name: "Doe",
        full_name: "Alex Doe · Senior Software Engineer",
        email: "alex.doe@example.com",
        phone: "+1 555 123 4567",
        linkedin: "https://linkedin.com/in/alex-doe",
        github: "https://github.com/alex-doe",
        portfolio: "https://alex-doe.dev",
        location: {
          city: "San Francisco",
          state: "CA",
          country: "USA",
        },
        summary:
          "Senior engineer with 7+ years of experience building interview platforms, developer tooling, and AI-assisted workflows.",
      },
      work_experience: [
        {
          job_title: "Senior Software Engineer",
          company: "TalentFlow Labs",
          location: "Remote / San Francisco, CA",
          start_date: "2021-03-01",
          end_date: "Present",
          currently_working: true,
          description:
            "Leading the core interview intelligence platform across web and realtime AI experiences.",
          achievements: [
            "Designed and shipped an AI-assisted resume intake pipeline used by hundreds of candidates.",
            "Improved interview completion rates by 18% via UX and system design improvements.",
          ],
        },
      ],
      education: [
        {
          institution: "State University of Computing",
          degree: "B.Tech",
          field_of_study: "Computer Science",
          start_date: "2014-08-01",
          end_date: "2018-05-01",
          grade: "8.4 / 10.0",
          location: "Bangalore, India",
        },
      ],
      skills: [
        { name: "TypeScript", level: "Expert", category: "Backend" },
        { name: "React", level: "Advanced", category: "Frontend" },
      ],
      projects: [
        {
          title: "Realtime Interview Simulator",
          description:
            "End-to-end platform for practicing system design and coding interviews with AI-powered feedback.",
          technologies: ["Next.js", "Node.js", "WebRTC", "PostgreSQL"],
          role: "Tech Lead",
          link: "https://devmock.ai/interviews",
        },
      ],
      certifications: [
        {
          name: "System Design Specialization",
          issuer: "Coursera / Meta",
          issue_date: "2020-06-01",
          expiry_date: "",
          credential_id: "META-SD-12345",
          credential_url: "https://example.com/cert/system-design",
        },
      ],
      languages: [
        { language: "English", proficiency: "Native" },
        { language: "Hindi", proficiency: "Professional" },
      ],
      publications: [
        {
          title: "Designing Interview Systems for Latency and Reliability",
          publisher: "Medium",
          publication_date: "2022-11-10",
          url: "https://medium.com/@alex-doe/interview-systems",
        },
      ],
      awards: [
        {
          title: "Outstanding Mentor Award",
          issuer: "TalentFlow Internal Awards",
          date: "2023-09-01",
          description:
            "Recognized for mentoring junior engineers and driving interview excellence.",
        },
      ],
      interests: ["System design", "Interviewing", "AI tooling", "Developer experience"],
      last_updated: new Date().toISOString(),
    };

    setTimeout(() => {
      setParsed(dummyParsed);
      setStatus("Resume parsed. Review and refine the details below.");
      setUploading(false);
      // Notify parent component that resume was uploaded successfully
      onResumeUploaded?.();
    }, 5000);
  }

  function handleChangeBasic<K extends keyof ResumeBasicInfo>(
    field: K,
    value: ResumeBasicInfo[K]
  ) {
    if (!parsed) return;
    setParsed({ ...parsed, basic_info: { ...parsed.basic_info, [field]: value } });
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

  function handleSubmitParsed(event: FormEvent) {
    event.preventDefault();
    if (!parsed) return;
    onSubmitParsed?.(parsed);
  }

  const hasParsed = !!parsed;

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
                        document
                          .getElementById("resume-upload-input")
                          ?.click()
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
                      <div className={styles.dropzoneIcon}>
                        📄
                      </div>
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
                        <button
                          type="button"
                          className={styles.changeFileButton}
                          onClick={() =>
                            document
                              .getElementById("resume-upload-input")
                              ?.click()
                          }
                          disabled={uploading}
                        >
                          Change file
                        </button>
                        <PrimaryButton
                          type="submit"
                          disabled={uploading}
                          className={styles.compactButton}
                        >
                          {uploading ? "Parsing..." : "Upload & parse"}
                        </PrimaryButton>
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
                            Preview unavailable for this file type, but it&apos;s
                            ready for parsing.
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
                  <div className={styles.parsingOverlaySpinner} />
                  <p className={styles.parsingOverlayText}>
                    Parsing your resume...
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
                  Edit any field below before we use this profile for interviews.
                </p>
              </div>
            </div>

            <div className={styles.parsedGrid}>
              <section className={styles.sectionCard}>
                <h3 className={styles.sectionTitle}>Basic information</h3>
                <div className={styles.fieldGrid}>
                  <div>
                    <p className={styles.fieldLabel}>First name</p>
                    <TextInput
                      value={parsed.basic_info.first_name}
                      onChange={(e) =>
                        handleChangeBasic("first_name", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <p className={styles.fieldLabel}>Last name</p>
                    <TextInput
                      value={parsed.basic_info.last_name}
                      onChange={(e) =>
                        handleChangeBasic("last_name", e.target.value)
                      }
                    />
                  </div>
                  <div className={styles.fieldFull}>
                    <p className={styles.fieldLabel}>Headline / full name</p>
                    <TextInput
                      value={parsed.basic_info.full_name}
                      onChange={(e) =>
                        handleChangeBasic("full_name", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <p className={styles.fieldLabel}>Email</p>
                    <TextInput
                      type="email"
                      value={parsed.basic_info.email}
                      onChange={(e) =>
                        handleChangeBasic("email", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <p className={styles.fieldLabel}>Phone</p>
                    <TextInput
                      value={parsed.basic_info.phone}
                      onChange={(e) =>
                        handleChangeBasic("phone", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <p className={styles.fieldLabel}>LinkedIn</p>
                    <TextInput
                      value={parsed.basic_info.linkedin}
                      onChange={(e) =>
                        handleChangeBasic("linkedin", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <p className={styles.fieldLabel}>GitHub</p>
                    <TextInput
                      value={parsed.basic_info.github}
                      onChange={(e) =>
                        handleChangeBasic("github", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <p className={styles.fieldLabel}>Portfolio</p>
                    <TextInput
                      value={parsed.basic_info.portfolio}
                      onChange={(e) =>
                        handleChangeBasic("portfolio", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <p className={styles.fieldLabel}>City</p>
                    <TextInput
                      value={parsed.basic_info.location.city}
                      onChange={(e) =>
                        handleChangeBasicLocation("city", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <p className={styles.fieldLabel}>State</p>
                    <TextInput
                      value={parsed.basic_info.location.state}
                      onChange={(e) =>
                        handleChangeBasicLocation("state", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <p className={styles.fieldLabel}>Country</p>
                    <TextInput
                      value={parsed.basic_info.location.country}
                      onChange={(e) =>
                        handleChangeBasicLocation("country", e.target.value)
                      }
                    />
                  </div>
                  <div className={styles.fieldFull}>
                    <p className={styles.fieldLabel}>Summary</p>
                    <textarea
                      className={styles.textarea}
                      value={parsed.basic_info.summary}
                      onChange={(e) =>
                        handleChangeBasic("summary", e.target.value)
                      }
                    />
                  </div>
                </div>
              </section>

              <section className={styles.sectionCard}>
                <h3 className={styles.sectionTitle}>Skills snapshot</h3>
                {parsed.skills.length > 0 ? (
                  <div className={styles.arrayList}>
                    {parsed.skills.map((skill, index) => (
                      <div key={index} className={styles.arrayItem}>
                        <div className={styles.arrayItemHeader}>
                          <span className={styles.arrayItemTitle}>
                            {skill.name}
                          </span>
                          <span className={styles.arrayItemMeta}>
                            {skill.category || "General"} • {skill.level || ""}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.arrayEmpty}>
                    No skills parsed yet. We&apos;ll infer these from your resume
                    once you upload it.
                  </p>
                )}
              </section>

              <section className={styles.sectionCard}>
                <h3 className={styles.sectionTitle}>Experience</h3>
                {parsed.work_experience.length > 0 ? (
                  <div className={styles.arrayList}>
                    {parsed.work_experience.map((role, index) => (
                      <div key={index} className={styles.arrayItem}>
                        <div className={styles.arrayItemHeader}>
                          <span className={styles.arrayItemTitle}>
                            {role.job_title} @ {role.company}
                          </span>
                          <span className={styles.arrayItemMeta}>
                            {role.location} • {role.start_date} →
                            {" "}
                            {role.currently_working ? "Present" : role.end_date}
                          </span>
                        </div>
                        <p className={styles.statusText}>{role.description}</p>
                        {role.achievements.length > 0 && (
                          <ul className={styles.arrayList}>
                            {role.achievements.map((item, i) => (
                              <li key={i} className={styles.statusText}>
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.arrayEmpty}>
                    No work experience parsed yet.
                  </p>
                )}
              </section>

              <section className={styles.sectionCard}>
                <h3 className={styles.sectionTitle}>Education</h3>
                {parsed.education.length > 0 ? (
                  <div className={styles.arrayList}>
                    {parsed.education.map((edu, index) => (
                      <div key={index} className={styles.arrayItem}>
                        <div className={styles.arrayItemHeader}>
                          <span className={styles.arrayItemTitle}>
                            {edu.degree} in {edu.field_of_study}
                          </span>
                          <span className={styles.arrayItemMeta}>
                            {edu.institution} • {edu.location}
                          </span>
                        </div>
                        <p className={styles.statusText}>
                          {edu.start_date} → {edu.end_date} • Grade: {edu.grade}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.arrayEmpty}>No education parsed yet.</p>
                )}
              </section>

              <section className={styles.sectionCard}>
                <h3 className={styles.sectionTitle}>Projects</h3>
                {parsed.projects.length > 0 ? (
                  <div className={styles.arrayList}>
                    {parsed.projects.map((project, index) => (
                      <div key={index} className={styles.arrayItem}>
                        <div className={styles.arrayItemHeader}>
                          <span className={styles.arrayItemTitle}>
                            {project.title}
                          </span>
                          <span className={styles.arrayItemMeta}>
                            {project.role} • {project.technologies.join(", ")}
                          </span>
                        </div>
                        <p className={styles.statusText}>{project.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.arrayEmpty}>No projects parsed yet.</p>
                )}
              </section>

              <section className={styles.sectionCard}>
                <h3 className={styles.sectionTitle}>Certifications</h3>
                {parsed.certifications.length > 0 ? (
                  <div className={styles.arrayList}>
                    {parsed.certifications.map((cert, index) => (
                      <div key={index} className={styles.arrayItem}>
                        <div className={styles.arrayItemHeader}>
                          <span className={styles.arrayItemTitle}>
                            {cert.name}
                          </span>
                          <span className={styles.arrayItemMeta}>
                            {cert.issuer}
                          </span>
                        </div>
                        <p className={styles.statusText}>
                          Issued: {cert.issue_date}
                          {cert.expiry_date && ` • Expires: ${cert.expiry_date}`}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.arrayEmpty}>
                    No certifications parsed yet.
                  </p>
                )}
              </section>

              <section className={styles.sectionCard}>
                <h3 className={styles.sectionTitle}>Languages</h3>
                {parsed.languages.length > 0 ? (
                  <div className={styles.arrayList}>
                    {parsed.languages.map((lang, index) => (
                      <div key={index} className={styles.arrayItem}>
                        <div className={styles.arrayItemHeader}>
                          <span className={styles.arrayItemTitle}>
                            {lang.language}
                          </span>
                          <span className={styles.arrayItemMeta}>
                            {lang.proficiency}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.arrayEmpty}>
                    No languages parsed yet.
                  </p>
                )}
              </section>

              <section className={styles.sectionCard}>
                <h3 className={styles.sectionTitle}>Publications</h3>
                {parsed.publications.length > 0 ? (
                  <div className={styles.arrayList}>
                    {parsed.publications.map((pub, index) => (
                      <div key={index} className={styles.arrayItem}>
                        <div className={styles.arrayItemHeader}>
                          <span className={styles.arrayItemTitle}>
                            {pub.title}
                          </span>
                          <span className={styles.arrayItemMeta}>
                            {pub.publisher} • {pub.publication_date}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.arrayEmpty}>
                    No publications parsed yet.
                  </p>
                )}
              </section>

              <section className={styles.sectionCard}>
                <h3 className={styles.sectionTitle}>Awards</h3>
                {parsed.awards.length > 0 ? (
                  <div className={styles.arrayList}>
                    {parsed.awards.map((award, index) => (
                      <div key={index} className={styles.arrayItem}>
                        <div className={styles.arrayItemHeader}>
                          <span className={styles.arrayItemTitle}>
                            {award.title}
                          </span>
                          <span className={styles.arrayItemMeta}>
                            {award.issuer} • {award.date}
                          </span>
                        </div>
                        <p className={styles.statusText}>{award.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.arrayEmpty}>No awards parsed yet.</p>
                )}
              </section>

              <section className={styles.sectionCard}>
                <h3 className={styles.sectionTitle}>Interests</h3>
                {parsed.interests.length > 0 ? (
                  <div className={styles.arrayList}>
                    {parsed.interests.map((interest, index) => (
                      <div key={index} className={styles.arrayItem}>
                        <span className={styles.arrayItemTitle}>{interest}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.arrayEmpty}>No interests parsed yet.</p>
                )}
              </section>
            </div>

            <div className={styles.footerRow}>
              <PrimaryButton
                type="submit"
                disabled={!parsed}
                fullWidth
                className={styles.compactButton}
              >
                Save parsed profile
              </PrimaryButton>
            </div>
            <p className={styles.footerNote}>
              You&apos;re always in control. We never overwrite your data without
              your confirmation.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}