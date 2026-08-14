import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui'
import { ArrowRight } from 'lucide-react'

const LINKS = [
  { to: '/interior/dashboard', label: 'Dashboard' },
  { to: '/interior/projects', label: 'Projects' },
  { to: '/interior/modules', label: 'Design Modules' },
  { to: '/interior/map', label: 'Site Map' },
  { to: '/interior/vision', label: 'AI Vision' },
]

export default function InteriorHome() {
  const navigate = useNavigate()
  return (
    <div className="space-y-6">
      <header className="dashboard-command-bar">
        <div>
          <p className="dashboard-eyebrow">Design workspace</p>
          <h1>Interior Design</h1>
          <p className="text-muted text-sm mt-1">Projects, design boards, materials, and site operations.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {LINKS.map((l) => (
            <Button key={l.to} onClick={() => navigate(l.to)}>
              {l.label} <ArrowRight className="w-4 h-4" />
            </Button>
          ))}
        </div>
      </header>
    </div>
  )
}