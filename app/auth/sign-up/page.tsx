'use client'

import Link from 'next/link'
import { ArrowRight, Building2, Palette, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

const launchBenefits = [
  {
    icon: Building2,
    title: 'Launch a full school workspace',
    description: 'Set up academics, communication, and finance under one account.',
  },
  {
    icon: Palette,
    title: 'Make the experience yours',
    description: 'Customize branding, website styling, and the overall visual feel.',
  },
  {
    icon: ShieldCheck,
    title: 'Start with secure structure',
    description: 'Your school data stays isolated with multi-tenant separation.',
  },
]

export default function Page() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [schoolSubdomain, setSchoolSubdomain] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (!schoolSubdomain.trim()) {
      setError('School subdomain is required')
      setIsLoading(false)
      return
    }

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
            school_name: schoolName || 'New School',
            school_subdomain: schoolSubdomain.toLowerCase().trim(),
          },
        },
      })

      if (signUpError) {
        console.error('[v0] Signup error:', signUpError)
        throw new Error(`Failed to create account: ${signUpError.message}`)
      }

      router.push('/auth/sign-up-success')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-svh px-6 py-8 md:px-10">
      <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <section className="section-shell flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Create your school
            </div>
            <h1 className="mt-8 max-w-md text-5xl font-semibold tracking-[-0.05em] text-foreground">
              Start with a branded platform your team will actually enjoy using.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-muted-foreground">
              Create your administrator account, reserve your subdomain, and unlock a polished school operations workspace in minutes.
            </p>
          </div>

          <div className="mt-10 space-y-4">
            {launchBenefits.map((item) => {
              const Icon = item.icon

              return (
                <div
                  key={item.title}
                  className="rounded-[1.35rem] border border-white/55 bg-white/70 p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">{item.title}</h2>
                      <p className="mt-1 text-sm leading-7 text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="flex items-center justify-center">
          <Card className="w-full max-w-2xl border-white/65 bg-white/82">
            <CardHeader className="space-y-3">
              <CardTitle className="text-3xl">Sign up</CardTitle>
              <CardDescription className="text-base leading-7">
                Create your school administrator account and reserve your branded workspace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="fullname">Full Name</Label>
                    <Input
                      id="fullname"
                      type="text"
                      placeholder="John Doe"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@school.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="school-name">School Name</Label>
                    <Input
                      id="school-name"
                      type="text"
                      placeholder="Lincoln High School"
                      required
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="school-subdomain">School Subdomain</Label>
                    <Input
                      id="school-subdomain"
                      type="text"
                      placeholder="lincoln-hs"
                      required
                      value={schoolSubdomain}
                      onChange={(e) => setSchoolSubdomain(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="repeat-password">Repeat Password</Label>
                    <Input
                      id="repeat-password"
                      type="password"
                      required
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-2xl border border-destructive/15 bg-destructive/8 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Create School Account'}
                  {!isLoading && <ArrowRight className="h-4 w-4" />}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link
                    href="/auth/login"
                    className="font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    Login
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
