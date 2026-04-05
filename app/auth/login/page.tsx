'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle2, GraduationCap } from 'lucide-react'
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

const highlights = [
  'Academic operations, finance, HR, and communication in one workspace.',
  'Branded public website and portals for parents and students.',
  'A cleaner dashboard designed to reduce friction for school teams.',
]

export default function Page() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push('/dashboard')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-svh px-6 py-8 md:px-10">
      <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hero-panel grid-pattern hidden rounded-[2rem] border border-white/55 p-8 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.45)] lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/50 bg-white/70 px-4 py-2 text-sm font-medium text-foreground">
              <GraduationCap className="h-4 w-4 text-primary" />
              SchoolMgmt Workspace
            </div>
            <h1 className="mt-8 max-w-xl text-5xl font-semibold tracking-[-0.05em] text-foreground">
              Welcome back to a calmer school operations flow.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
              Sign in to manage your school with a more polished dashboard, stronger hierarchy, and a branded experience across every surface.
            </p>
          </div>

          <div className="section-shell max-w-xl">
            <div className="space-y-4">
              {highlights.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-secondary" />
                  <p className="text-sm leading-7 text-foreground/85">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <Card className="w-full max-w-lg border-white/65 bg-white/82">
            <CardHeader className="space-y-4">
              <div className="inline-flex w-fit items-center rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Admin Access
              </div>
              <div className="space-y-2">
                <CardTitle className="text-3xl">Login</CardTitle>
                <CardDescription className="text-base leading-7">
                  Enter your school administrator credentials to continue.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
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
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && (
                  <div className="rounded-2xl border border-destructive/15 bg-destructive/8 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Enter Dashboard'}
                  {!isLoading && <ArrowRight className="h-4 w-4" />}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/auth/sign-up"
                    className="font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    Sign up
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
