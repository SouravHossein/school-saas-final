import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const featureCards = [
  {
    icon: BookOpen,
    title: 'Academic operations that stay organized',
    description:
      'Run classes, sections, subjects, exams, and attendance from one calm control center.',
  },
  {
    icon: Users,
    title: 'Better communication across every role',
    description:
      'Announcements, messages, and portals keep administrators, teachers, parents, and students aligned.',
  },
  {
    icon: ShieldCheck,
    title: 'Multi-tenant structure built for trust',
    description:
      'Each school operates in its own secure space with role-based access and white-label flexibility.',
  },
]

const benefitItems = [
  'Launch quickly without sacrificing polish or control.',
  'Bring finance, HR, academics, and website management together.',
  'Offer a branded public site and family-facing portal from the same platform.',
  'Scale from a single campus to a growing school network.',
]

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[32rem] hero-panel opacity-90" />
      <div className="absolute inset-x-0 top-0 h-[32rem] grid-pattern opacity-20" />

      <header className="sticky top-0 z-50 border-b border-white/45 bg-background/72 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_18px_36px_-18px_rgba(74,117,255,0.75)]">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-lg font-semibold leading-none text-foreground">
                SchoolMgmt
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Modern School SaaS
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-3">
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild size="lg">
              <Link href="/auth/sign-up">
                Start Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-10">
        <section className="page-shell grid gap-10 lg:grid-cols-[1.25fr_0.85fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Built for schools that want clarity, not clutter
            </div>

            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.05em] text-foreground md:text-6xl">
                A better-looking school platform for operations, communication, and growth.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
                Manage academics, fees, HR, announcements, and your public website from a single beautifully branded workspace.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/auth/sign-up">
                  Create Your School Space
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/auth/login">Login to Dashboard</Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Metric title="Unified modules" value="12+" />
              <Metric title="Portal experiences" value="2" />
              <Metric title="Custom branding" value="Full" />
            </div>
          </div>

          <div className="section-shell hero-panel grid-pattern p-0">
            <div className="grid gap-5 p-6">
              <div className="rounded-[1.5rem] border border-white/55 bg-white/82 p-5 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.45)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">School Overview</p>
                    <h2 className="mt-2 text-2xl font-semibold">Your command center, reimagined</h2>
                  </div>
                  <div className="rounded-2xl bg-primary/12 p-3 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <PreviewPill label="Attendance" value="Live records" />
                  <PreviewPill label="Fee tracking" value="Collection insights" />
                  <PreviewPill label="Website theme" value="Custom branded" />
                  <PreviewPill label="Parent portal" value="Always connected" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white/45 bg-slate-950 p-5 text-white shadow-[0_24px_70px_-42px_rgba(15,23,42,0.78)]">
                  <p className="text-sm uppercase tracking-[0.22em] text-white/60">Daily flow</p>
                  <p className="mt-3 text-3xl font-semibold">Fewer tabs, faster decisions.</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/45 bg-white/82 p-5">
                  <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Experience</p>
                  <p className="mt-3 text-3xl font-semibold text-gradient">Refined UI + custom branding</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {featureCards.map((feature) => {
            const Icon = feature.icon

            return (
              <Card key={feature.title} className="surface-card border-white/60">
                <CardHeader className="space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-2xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base leading-7">
                      {feature.description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            )
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="section-shell space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              Why Teams Choose It
            </p>
            <h2 className="text-4xl font-semibold">Beautiful UI matters when people live in the software every day.</h2>
            <p className="text-lg leading-8 text-muted-foreground">
              The platform should help staff move faster, reduce training friction, and make your school feel distinctly yours.
            </p>
          </div>

          <div className="section-shell grid gap-4">
            {benefitItems.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-[1.25rem] border border-white/55 bg-white/65 px-4 py-4"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-secondary" />
                <p className="text-sm leading-7 text-foreground/88">{item}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-white/55 bg-white/70 px-4 py-4 shadow-[0_18px_50px_-36px_rgba(15,23,42,0.4)]">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  )
}

function PreviewPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-white/55 bg-white/72 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-medium text-foreground">{value}</p>
    </div>
  )
}
