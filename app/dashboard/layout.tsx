import { AppSidebar } from '@/components/app-sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <main className="relative flex-1 overflow-auto">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(74,117,255,0.14),transparent_30%),radial-gradient(circle_at_20%_20%,rgba(34,165,141,0.12),transparent_24%),radial-gradient(circle_at_80%_80%,rgba(242,201,109,0.12),transparent_26%)]" />
        <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
          <div className="page-shell flex-1">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
