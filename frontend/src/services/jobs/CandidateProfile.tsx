import { useState } from 'react'
import { Save } from 'lucide-react'
import { EMPTY_CANDIDATE_PROFILE, normalizeSkills, validateCandidateProfile } from './candidateApplication'
import type { CandidateProfile as Profile, CandidateProfileErrors } from './candidateApplication'
import { CandidateProfileFields, ResumeControl } from './CandidateProfileFields'
import JobsShell from './JobsShell'
import { useCandidateApplications } from './useCandidateApplications'

export default function CandidateProfile() {
  const { state, persistenceError, saveProfile, saveResume } = useCandidateApplications()
  const [profile, setProfile] = useState<Profile>(() => state.profile ?? EMPTY_CANDIDATE_PROFILE)
  const [errors, setErrors] = useState<CandidateProfileErrors>({})

  function handleSave() {
    const next = { ...profile, skills: normalizeSkills(profile.skills) }
    const nextErrors = validateCandidateProfile(next)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    saveProfile(next)
    setProfile(next)
  }

  return (
    <JobsShell>
      <main className="jobs-main">
        <header className="jobs-page-head"><p className="jobs-eyebrow">Your identity</p><h1>Candidate profile</h1><p>Keep your details ready so every application takes only a minute.</p></header>
        <section className="candidate-panel">
          <CandidateProfileFields profile={profile} errors={errors} onProfileChange={setProfile} />
          <ResumeControl resume={state.resume} error={null} onResume={saveResume} />
          {persistenceError && <p className="candidate-persistence-error" role="alert">{persistenceError}</p>}
          <div className="candidate-actions">
            <button className="candidate-save" type="button" onClick={handleSave}><Save aria-hidden="true" /> Save profile</button>
          </div>
        </section>
      </main>
    </JobsShell>
  )
}