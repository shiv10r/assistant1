import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, FileText, Send } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { EMPTY_CANDIDATE_PROFILE, normalizeSkills, validateCandidateProfile } from './candidateApplication'
import type { CandidateProfile, CandidateProfileErrors, ScreeningAnswer } from './candidateApplication'
import { CandidateProfileFields, ResumeControl } from './CandidateProfileFields'
import { findApplicationDraft, findCandidateApplication } from './candidateStore'
import { jobBySlug } from './jobsData'
import JobsShell from './JobsShell'
import { resolveScreeningQuestions } from './screeningQuestions'
import type { ScreeningQuestion } from './screeningQuestions'
import { useCandidateApplications } from './useCandidateApplications'

const STEPS = ['Profile', 'Resume', 'Questions', 'Review'] as const

function toAnswers(record: Record<string, string>): readonly ScreeningAnswer[] {
  return Object.entries(record).map(([questionId, value]) => ({ questionId, value }))
}

export default function JobApplicationFlow() {
  const { slug } = useParams()
  const job = slug ? jobBySlug(slug) : null
  const navigate = useNavigate()
  const { state, persistenceError, saveProfile, saveResume, saveDraft, submit } = useCandidateApplications()
  const draft = findApplicationDraft(state, slug ?? '')
  const existing = findCandidateApplication(state, slug ?? '')
  const questions = job ? resolveScreeningQuestions(job.screeningQuestions) : []

  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState<CandidateProfile>(() => state.profile ?? EMPTY_CANDIDATE_PROFILE)
  const [profileErrors, setProfileErrors] = useState<CandidateProfileErrors>({})
  const [resumeError, setResumeError] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    Object.fromEntries((draft?.answers ?? []).map((answer) => [answer.questionId, answer.value])),
  )
  const [missingQuestions, setMissingQuestions] = useState<readonly string[]>([])

  if (!job) {
    return <JobsShell><main className="jobs-main"><section className="jobs-empty"><h1>Job not found</h1><p>This role may have closed or moved.</p><Link to="/jobs/search">Browse current jobs</Link></section></main></JobsShell>
  }

  const currentJob = job

  function persistDraft() {
    saveDraft({ jobSlug: currentJob.slug, answers: toAnswers(answers), updatedAt: new Date().toISOString() })
  }

  function setAnswer(questionId: string, value: string) {
    setAnswers((current) => ({ ...current, [questionId]: value }))
    setMissingQuestions((current) => current.filter((id) => id !== questionId))
  }

  function goNext() {
    if (step === 0) {
      const normalized = { ...profile, skills: normalizeSkills(profile.skills) }
      const errors = validateCandidateProfile(normalized)
      setProfileErrors(errors)
      if (Object.keys(errors).length > 0) return
      setProfile(normalized)
      saveProfile(normalized)
      persistDraft()
      setStep(1)
      return
    }
    if (step === 1) {
      if (!state.resume) {
        setResumeError('Select a resume before continuing.')
        return
      }
      setResumeError(null)
      persistDraft()
      setStep(2)
      return
    }
    if (step === 2) {
      const missing = questions.filter((question) => question.required && !(answers[question.id] ?? '').trim()).map((question) => question.id)
      setMissingQuestions(missing)
      if (missing.length > 0) return
      persistDraft()
      setStep(3)
    }
  }

  function handleSubmit() {
    if (!state.resume) {
      setResumeError('Select a resume before submitting.')
      setStep(1)
      return
    }
    const result = submit({
      applicationId: `app-${Date.now()}`,
      jobSlug: currentJob.slug,
      company: currentJob.company,
      appliedDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      profile,
      resume: state.resume,
      answers: toAnswers(answers),
    })
    if (result.kind === 'submitted' || result.kind === 'duplicate') navigate('/jobs/applications')
  }

  const renderQuestion = (question: ScreeningQuestion) => {
    const id = `question-${question.id}`
    const invalid = missingQuestions.includes(question.id)
    if (question.type === 'yes-no') {
      return (
        <fieldset className={invalid ? 'candidate-question is-invalid' : 'candidate-question'} key={question.id}>
          <legend>{question.prompt}{question.required && <span aria-hidden="true"> *</span>}</legend>
          <div className="candidate-question-options">
            {['Yes', 'No'].map((option) => (
              <label key={option}><input type="radio" name={id} value={option} checked={answers[question.id] === option} onChange={() => setAnswer(question.id, option)} /> {option}</label>
            ))}
          </div>
          {invalid && <p className="candidate-field-error" id={`${id}-error`}>Answer this question to continue.</p>}
        </fieldset>
      )
    }
    return (
      <div className={invalid ? 'candidate-field is-invalid' : 'candidate-field'} key={question.id}>
        <label htmlFor={id}>{question.prompt}{question.required && <span aria-hidden="true"> *</span>}</label>
        <input id={id} value={answers[question.id] ?? ''} aria-describedby={invalid ? `${id}-error` : undefined} onChange={(event: ChangeEvent<HTMLInputElement>) => setAnswer(question.id, event.target.value)} />
        {invalid && <p className="candidate-field-error" id={`${id}-error`}>Answer this question to continue.</p>}
      </div>
    )
  }

  return (
    <JobsShell>
      <main className="jobs-main">
        <Link className="job-detail-back" to={`/jobs/${currentJob.slug}`}><ArrowLeft aria-hidden="true" /> Back to job</Link>
        <header className="jobs-page-head"><p className="jobs-eyebrow">Apply to {currentJob.company}</p><h1>{currentJob.title}</h1><p>Your progress is saved automatically as you move through each step.</p></header>

        {existing && (
          <p className="apply-already" role="status"><CheckCircle2 aria-hidden="true" /> You already applied for this role on {existing.appliedDate}. <Link to="/jobs/applications">View it in Applications</Link>.</p>
        )}

        <ol className="apply-steps" aria-label="Application progress">
          {STEPS.map((label, index) => (
            <li className={index < step ? 'is-complete' : index === step ? 'is-active' : ''} key={label}>
              <span>{index < step ? <CheckCircle2 aria-hidden="true" /> : index + 1}</span>{label}
            </li>
          ))}
        </ol>

        <section className="apply-panel">
          {step === 0 && (
            <>
              <h2>Your profile</h2>
              <CandidateProfileFields profile={profile} errors={profileErrors} onProfileChange={setProfile} />
            </>
          )}
          {step === 1 && (
            <>
              <h2>Your resume</h2>
              <ResumeControl resume={state.resume} error={resumeError} onResume={saveResume} />
              <p className="candidate-resume-note">The employer will see this resume with your submission.</p>
            </>
          )}
          {step === 2 && (
            <>
              <h2>Screening questions</h2>
              <div className="candidate-questions">{questions.map(renderQuestion)}</div>
            </>
          )}
          {step === 3 && (
            <>
              <h2>Review and submit</h2>
              <div className="apply-review">
                <section><h3>Role</h3><p><strong>{currentJob.title}</strong> · {currentJob.company} · {currentJob.location}</p></section>
                <section><h3>Profile</h3><p><strong>{profile.fullName}</strong> · {profile.headline}</p><p>{profile.email} · {profile.phone} · {profile.location}</p>{profile.skills.length > 0 && <p>Skills: {profile.skills.join(', ')}</p>}</section>
                <section><h3>Resume</h3><p><FileText aria-hidden="true" /> {state.resume?.name ?? 'No resume selected'}</p></section>
                <section><h3>Answers</h3><ul>{questions.map((question) => <li key={question.id}><span>{question.prompt}</span><strong>{answers[question.id] ?? '—'}</strong></li>)}</ul></section>
              </div>
            </>
          )}
          {persistenceError && <p className="candidate-persistence-error" role="alert">{persistenceError}</p>}
        </section>

        <div className="apply-footer">
          {step > 0 && (
            <button className="apply-back" type="button" onClick={() => setStep((current) => current - 1)}><ArrowLeft aria-hidden="true" /> Back</button>
          )}
          {step < 3 ? (
            <button className="apply-next" type="button" onClick={goNext}>Continue <ArrowRight aria-hidden="true" /></button>
          ) : existing ? (
            <Link className="apply-next" to="/jobs/applications">View application</Link>
          ) : (
            <button className="apply-next" type="button" onClick={handleSubmit}><Send aria-hidden="true" /> Submit application</button>
          )}
        </div>
      </main>
    </JobsShell>
  )
}