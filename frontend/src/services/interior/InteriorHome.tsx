import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui'
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
      <Card>
        <CardHeader>
          <CardTitle>Interior Design</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted text-sm mb-4">Your projects, design boards, materials and site operations live here.</p>
          <div className="flex flex-wrap gap-3">
            {LINKS.map((l) => (
              <Button key={l.to} onClick={() => navigate(l.to)}>
                {l.label} <ArrowRight className="w-4 h-4" />
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}