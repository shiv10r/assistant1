import { Card, CardHeader, CardTitle, CardContent, Badge } from '../../components/ui'
import { GraduationCap } from 'lucide-react'

export default function SchoolHome() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" /> School Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="warning">Coming soon</Badge>
          <p className="text-muted text-sm mt-4">
            Students, classes, fees and attendance modules are planned for this workspace.
            The hub is ready — this service will light up in a later phase.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}