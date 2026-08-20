import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, ArrowLeft } from 'lucide-react'
import { homeServicesApi } from '../homeServicesApi'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea, Select, Label } from '../../../components/ui'
import { useToast } from '../../../components/ui/Toast'

interface CategoryForm {
  name: string
  slug: string
  description: string
  icon: string
  color: string
  sortOrder: number
  isActive: boolean
}

const ICON_OPTIONS = [
  { value: 'home', label: 'Home' },
  { value: 'wrench', label: 'Wrench' },
  { value: 'paintbrush', label: 'Paintbrush' },
  { value: 'droplet', label: 'Droplet' },
  { value: 'sparkles', label: 'Sparkles' },
  { value: 'leaf', label: 'Leaf' },
  { value: 'shield', label: 'Shield' },
  { value: 'truck', label: 'Truck' },
  { value: 'hammer', label: 'Hammer' },
  { value: 'scissors', label: 'Scissors' },
  { value: 'flame', label: 'Flame' },
  { value: 'snowflake', label: 'Snowflake' },
]

const COLOR_OPTIONS = [
  { value: '#3B82F6', label: 'Blue' },
  { value: '#10B981', label: 'Emerald' },
  { value: '#F59E0B', label: 'Amber' },
  { value: '#EF4444', label: 'Red' },
  { value: '#8B5CF6', label: 'Violet' },
  { value: '#EC4899', label: 'Pink' },
  { value: '#06B6D4', label: 'Cyan' },
  { value: '#84CC16', label: 'Lime' },
]

export default function AddCategory() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<CategoryForm>({
    name: '',
    slug: '',
    description: '',
    icon: 'home',
    color: '#3B82F6',
    sortOrder: 0,
    isActive: true,
  })
  const [errors, setErrors] = useState<Partial<CategoryForm>>({})

  const validate = () => {
    const newErrors: Partial<CategoryForm> = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.slug.trim()) newErrors.slug = 'Slug is required'
    else if (!/^[a-z0-9-]+$/.test(form.slug)) newErrors.slug = 'Slug must be lowercase letters, numbers, and hyphens only'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      await homeServicesApi.createCategory(form)
      toast({ title: 'Category created successfully!', variant: 'success' })
      navigate('/home-services/categories')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create category'
      toast({ title: message, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof CategoryForm, value: string | number | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const generateSlug = () => {
    setForm(prev => ({
      ...prev,
      slug: prev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    }))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Add New Category</h1>
          <p className="text-muted text-sm">Create a new service category</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-primary">+</span> New Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={e => handleChange('name', e.target.value)}
                  onBlur={generateSlug}
                  placeholder="e.g., Plumbing, Electrical, Cleaning"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={e => handleChange('slug', e.target.value)}
                  placeholder="auto-generated from name"
                  className={errors.slug ? 'border-red-500' : ''}
                />
                {errors.slug && <p className="text-sm text-red-500 mt-1">{errors.slug}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                placeholder="Brief description of this category"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Icon *</Label>
                <Select
                  value={form.icon}
                  onValueChange={v => handleChange('icon', v)}
                >
                  {ICON_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Select>
              </div>

              <div>
                <Label>Color *</Label>
                <Select
                  value={form.color}
                  onValueChange={v => handleChange('color', v)}
                >
                  {COLOR_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value} style={{ backgroundColor: opt.value, color: 'white' }}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={form.sortOrder}
                  onChange={e => handleChange('sortOrder', parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>

              <div className="sm:col-span-2 flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={e => handleChange('isActive', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">Active</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-4 py-2 text-sm font-medium text-muted hover:text-text transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Cancel
              </button>
              <Button type="submit" disabled={loading} className="gap-2">
                <Loader2 className={`${loading ? 'animate-spin' : ''} w-4 h-4`} />
                {loading ? 'Creating...' : 'Create Category'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}