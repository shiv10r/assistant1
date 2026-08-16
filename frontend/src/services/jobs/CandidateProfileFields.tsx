import { useRef, useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import { FileText, Upload } from 'lucide-react'
import { validateResume } from './candidateApplication'
import type { CandidateProfile, CandidateProfileErrors, ResumeMetadata } from './candidateApplication'

type CandidateProfileFieldsProps = {
  readonly profile: CandidateProfile
  readonly errors: CandidateProfileErrors
  readonly onProfileChange: (next: CandidateProfile) => void
}

type FieldProps = {
  readonly id: string
  readonly label: string
  readonly error: string | undefined
  readonly children: ReactNode
}

function Field({ id, label, error, children }: FieldProps) {
  return (
    <div className="candidate-field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <p className="candidate-field-error" id={`${id}-error`}>{error}</p>}
    </div>
  )
}

export function CandidateProfileFields({ profile, errors, onProfileChange }: CandidateProfileFieldsProps) {
  function update(field: keyof CandidateProfile, value: string) {
    onProfileChange({ ...profile, [field]: value })
  }

  function updateSkills(value: string) {
    onProfileChange({ ...profile, skills: value.split(',').map((item) => item.trim()) })
  }

  const describedBy = (id: string, error: string | undefined) => (error ? `${id}-error` : undefined)

  return (
    <div className="candidate-form-grid">
      <Field id="candidate-fullName" label="Full name" error={errors.fullName}>
        <input id="candidate-fullName" value={profile.fullName} autoComplete="name" aria-describedby={describedBy('candidate-fullName', errors.fullName)} onChange={(event: ChangeEvent<HTMLInputElement>) => update('fullName', event.target.value)} />
      </Field>
      <Field id="candidate-email" label="Email address" error={errors.email}>
        <input id="candidate-email" type="email" value={profile.email} autoComplete="email" aria-describedby={describedBy('candidate-email', errors.email)} onChange={(event: ChangeEvent<HTMLInputElement>) => update('email', event.target.value)} />
      </Field>
      <Field id="candidate-phone" label="Phone number" error={errors.phone}>
        <input id="candidate-phone" type="tel" value={profile.phone} autoComplete="tel" aria-describedby={describedBy('candidate-phone', errors.phone)} onChange={(event: ChangeEvent<HTMLInputElement>) => update('phone', event.target.value)} />
      </Field>
      <Field id="candidate-location" label="Location" error={errors.location}>
        <input id="candidate-location" value={profile.location} autoComplete="address-level2" aria-describedby={describedBy('candidate-location', errors.location)} onChange={(event: ChangeEvent<HTMLInputElement>) => update('location', event.target.value)} />
      </Field>
      <Field id="candidate-headline" label="Professional headline" error={errors.headline}>
        <input id="candidate-headline" value={profile.headline} aria-describedby={describedBy('candidate-headline', errors.headline)} onChange={(event: ChangeEvent<HTMLInputElement>) => update('headline', event.target.value)} />
      </Field>
      <Field id="candidate-skills" label="Skills" error={errors.skills}>
        <input id="candidate-skills" value={profile.skills.join(', ')} aria-describedby={describedBy('candidate-skills', errors.skills)} onChange={(event: ChangeEvent<HTMLInputElement>) => updateSkills(event.target.value)} />
        <p className="candidate-field-hint">Separate skills with commas.</p>
      </Field>
      <Field id="candidate-experience" label="Experience summary" error={errors.experienceSummary}>
        <textarea id="candidate-experience" rows={4} value={profile.experienceSummary} aria-describedby={describedBy('candidate-experience', errors.experienceSummary)} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => update('experienceSummary', event.target.value)} />
      </Field>
    </div>
  )
}

type ResumeControlProps = {
  readonly resume: ResumeMetadata | null
  readonly error: string | null
  readonly onResume: (metadata: ResumeMetadata) => void
}

function formatSize(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
  return `${Math.round(bytes / 1_000)} KB`
}

export function ResumeControl({ resume, error, onResume }: ResumeControlProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [localError, setLocalError] = useState<string | null>(null)
  const shownError = localError ?? error

  function handleFile(file: File | undefined) {
    if (!file) return
    const result = validateResume({ name: file.name, type: file.type, size: file.size }, new Date().toISOString())
    if (result.kind === 'invalid') {
      setLocalError(result.message)
      return
    }
    setLocalError(null)
    onResume(result.resume)
  }

  return (
    <div className="candidate-resume">
      <h2>Resume</h2>
      <button className="candidate-resume-button" type="button" onClick={() => inputRef.current?.click()}>
        <Upload aria-hidden="true" /> {resume ? 'Replace resume' : 'Upload resume'}
      </button>
      <input ref={inputRef} className="candidate-resume-input" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event: ChangeEvent<HTMLInputElement>) => handleFile(event.target.files?.[0])} />
      {resume ? (
        <p className="candidate-resume-meta"><FileText aria-hidden="true" /> {resume.name} · {formatSize(resume.sizeBytes)} · selected {new Date(resume.selectedAt).toLocaleDateString()}</p>
      ) : (
        <p className="candidate-resume-empty">No resume selected yet.</p>
      )}
      {shownError && <p className="candidate-field-error">{shownError}</p>}
      <p className="candidate-resume-note">Only the file name, type and size are saved in this browser. Secure document transfer connects with the backend later.</p>
    </div>
  )
}