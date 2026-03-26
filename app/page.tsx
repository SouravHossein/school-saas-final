import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { BookOpen, Users, Zap, CheckCircle } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/95">
      {/* Header Navigation */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">SchoolMgmt</div>
          <nav className="flex gap-6">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Sign Up</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground text-balance">
            Manage Your School with Ease
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            A modern, multi-tenant school management system designed to help administrators organize classes, sections, and school data efficiently.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Link href="/auth/sign-up">
            <Button size="lg" className="text-base">
              Get Started Free
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button size="lg" variant="outline" className="text-base">
              Login to Your School
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Powerful Features</h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to manage your school efficiently
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<BookOpen className="w-10 h-10 text-primary" />}
            title="Manage Classes"
            description="Create and organize classes with teacher assignments and capacity management."
          />
          <FeatureCard
            icon={<Users className="w-10 h-10 text-primary" />}
            title="Organize Sections"
            description="Divide classes into sections and track student counts for better organization."
          />
          <FeatureCard
            icon={<Zap className="w-10 h-10 text-primary" />}
            title="Multi-Tenant Architecture"
            description="Fully isolated school data with secure, role-based access control."
          />
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-card/50 border-y border-border">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-4xl font-bold text-foreground mb-12">Why Choose SchoolMgmt?</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <BenefitItem title="Secure & Reliable" description="Enterprise-grade security with Row-Level Security policies" />
            <BenefitItem title="Easy to Use" description="Intuitive interface designed for administrators of all levels" />
            <BenefitItem title="Real-time Data" description="Instant updates across all school management features" />
            <BenefitItem title="Scalable" description="Grows with your school from one to hundreds of classes" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="pt-12 pb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Simplify School Management?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start your free account today and experience the difference
            </p>
            <Link href="/auth/sign-up">
              <Button size="lg" className="text-base">
                Create Your School Account
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 SchoolMgmt. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card>
      <CardHeader>
        <div className="mb-4">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

function BenefitItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
      <div>
        <h3 className="font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
