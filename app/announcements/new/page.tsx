import AnnouncementForm from '@/components/announcement-form'

export const metadata = {
  title: 'New Announcement',
  description: 'Create a new school announcement',
}

export default function NewAnnouncementPage() {
  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">New Announcement</h1>
        <p className="text-muted-foreground mt-1">
          Create a new announcement for your school
        </p>
      </div>
      <AnnouncementForm />
    </div>
  )
}
