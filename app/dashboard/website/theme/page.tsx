'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { parseThemeConfig } from '@/lib/theme-engine'

const FONTS = ['Plus Jakarta Sans', 'Space Grotesk', 'Manrope', 'Fraunces']

const PALETTES = [
  {
    label: 'Ocean Campus',
    primary: '#3f6df2',
    secondary: '#1fa086',
    accent: '#f1c75b',
    background: '#f4f7ff',
    surface: '#ffffff',
    foreground: '#1f2940',
    muted: '#60708f',
    gradientFrom: '#d6e4ff',
    gradientTo: '#dff7ec',
  },
  {
    label: 'Sunrise Academy',
    primary: '#d66b2f',
    secondary: '#a34c77',
    accent: '#f2d58a',
    background: '#fff7f0',
    surface: '#ffffff',
    foreground: '#31243a',
    muted: '#7b6a78',
    gradientFrom: '#ffe1cf',
    gradientTo: '#f8d9ef',
  },
  {
    label: 'Forest Hall',
    primary: '#286657',
    secondary: '#5d7d3d',
    accent: '#d8b36d',
    background: '#f3f7f2',
    surface: '#ffffff',
    foreground: '#233129',
    muted: '#5d6f63',
    gradientFrom: '#dbe9da',
    gradientTo: '#edf4cf',
  },
]

function resolvePreviewFont(font: string) {
  switch (font) {
    case 'Space Grotesk':
      return 'var(--font-space-grotesk), sans-serif'
    case 'Fraunces':
      return 'var(--font-fraunces), serif'
    case 'Manrope':
      return 'var(--font-manrope), sans-serif'
    case 'Plus Jakarta Sans':
    default:
      return 'var(--font-plus-jakarta), sans-serif'
  }
}

export default function ThemeCustomizer() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [school, setSchool] = useState<any>(null)
  const [theme, setTheme] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchSchool = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('school_id')
        .eq('id', user.id)
        .single()

      if (!profile) return

      const { data: schoolData } = await supabase
        .from('schools')
        .select('*')
        .eq('id', profile.school_id)
        .single()

      setSchool(schoolData)
      setTheme(parseThemeConfig(schoolData?.theme_config))
      setLoading(false)
    }

    fetchSchool()
  }, [])

  const handleThemeChange = (field: string, value: string) => {
    setTheme((prev: any) => ({
      ...prev,
      [field]: value,
    }))
  }

  const applyPalette = (palette: (typeof PALETTES)[number]) => {
    setTheme((prev: any) => ({
      ...prev,
      ...palette,
    }))
  }

  const handleSave = async () => {
    setSaving(true)

    const { error } = await supabase
      .from('schools')
      .update({ theme_config: theme })
      .eq('id', school.id)

    setSaving(false)

    if (!error) {
      router.refresh()
    }
  }

  if (loading || !theme) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div className="hero-panel grid-pattern overflow-hidden rounded-[2rem] border border-white/55 p-6 md:p-8">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/72 px-4 py-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            Website personalization
          </div>
          <h1 className="text-4xl font-semibold">Theme Customizer</h1>
          <p className="text-lg leading-8 text-muted-foreground">
            Shape the public website with richer branding controls, softer surfaces, and stronger typography pairings.
          </p>
        </div>
      </div>

      <Card className="surface-card">
        <CardHeader>
          <CardTitle>Palette Presets</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {PALETTES.map((palette) => (
            <button
              key={palette.label}
              type="button"
              onClick={() => applyPalette(palette)}
              className="rounded-[1.4rem] border border-white/55 bg-white/74 p-4 text-left transition hover:-translate-y-0.5"
            >
              <div className="flex gap-2">
                {[palette.primary, palette.secondary, palette.accent].map((color) => (
                  <span
                    key={color}
                    className="h-8 w-8 rounded-full border border-black/6"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <p className="mt-4 font-semibold text-foreground">{palette.label}</p>
            </button>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr_1.05fr]">
        <Card className="surface-card">
          <CardHeader>
            <CardTitle>Core Colors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ColorField label="Primary" value={theme.primary} onChange={(value) => handleThemeChange('primary', value)} />
            <ColorField label="Secondary" value={theme.secondary} onChange={(value) => handleThemeChange('secondary', value)} />
            <ColorField label="Accent" value={theme.accent} onChange={(value) => handleThemeChange('accent', value)} />
            <ColorField label="Foreground" value={theme.foreground} onChange={(value) => handleThemeChange('foreground', value)} />
            <ColorField label="Muted Text" value={theme.muted} onChange={(value) => handleThemeChange('muted', value)} />
          </CardContent>
        </Card>

        <Card className="surface-card">
          <CardHeader>
            <CardTitle>Atmosphere</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ColorField label="Background" value={theme.background} onChange={(value) => handleThemeChange('background', value)} />
            <ColorField label="Surface" value={theme.surface} onChange={(value) => handleThemeChange('surface', value)} />
            <ColorField label="Gradient From" value={theme.gradientFrom} onChange={(value) => handleThemeChange('gradientFrom', value)} />
            <ColorField label="Gradient To" value={theme.gradientTo} onChange={(value) => handleThemeChange('gradientTo', value)} />

            <div className="grid gap-2">
              <Label htmlFor="borderRadius">Border Radius (rem)</Label>
              <Input
                id="borderRadius"
                type="number"
                step="0.25"
                value={theme.borderRadius}
                onChange={(e) => handleThemeChange('borderRadius', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="surface-card">
          <CardHeader>
            <CardTitle>Typography</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FontField
              id="primaryFont"
              label="Body Font"
              value={theme.primaryFont}
              onChange={(value) => handleThemeChange('primaryFont', value)}
            />
            <FontField
              id="headingFont"
              label="Heading Font"
              value={theme.headingFont}
              onChange={(value) => handleThemeChange('headingFont', value)}
            />
          </CardContent>
        </Card>
      </div>

      <Card className="surface-card">
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="overflow-hidden rounded-[2rem] border p-6 md:p-8"
            style={{
              background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})`,
              borderColor: `${theme.primary}22`,
              color: theme.foreground,
            }}
          >
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-4" style={{ fontFamily: resolvePreviewFont(theme.primaryFont) }}>
                <div
                  className="inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]"
                  style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}
                >
                  Preview for {school?.name}
                </div>
                <h2
                  className="text-4xl font-semibold"
                  style={{ fontFamily: resolvePreviewFont(theme.headingFont) }}
                >
                  A website that feels branded from the first glance.
                </h2>
                <p className="max-w-2xl text-base leading-8" style={{ color: theme.muted }}>
                  Your school can communicate with a more polished public identity while staying easy to edit.
                </p>
                <button
                  type="button"
                  className="rounded-xl px-5 py-3 font-semibold text-white shadow-[0_18px_36px_-20px_rgba(15,23,42,0.45)]"
                  style={{ backgroundColor: theme.primary }}
                >
                  Learn More
                </button>
              </div>

              <div
                className="rounded-[1.6rem] border p-5"
                style={{
                  backgroundColor: theme.surface,
                  borderColor: `${theme.primary}18`,
                  borderRadius: `${theme.borderRadius}rem`,
                }}
              >
                <p className="text-sm uppercase tracking-[0.22em]" style={{ color: theme.muted }}>
                  Campus highlight
                </p>
                <p className="mt-3 text-3xl font-semibold" style={{ color: theme.foreground }}>
                  Admissions open for the new academic session.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button size="lg" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Theme'}
      </Button>
    </div>
  )
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <div className="flex gap-3">
        <Input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-11 w-20 p-1" />
        <Input type="text" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  )
}

function FontField({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-xl border border-border bg-white/72 px-4 text-sm shadow-[0_10px_24px_-18px_rgba(15,23,42,0.45)] outline-none"
      >
        {FONTS.map((font) => (
          <option key={font} value={font}>
            {font}
          </option>
        ))}
      </select>
    </div>
  )
}
