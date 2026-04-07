import { RolesPageContent } from './roles-content'

export default function Page({
  params,
}: {
  params: Promise<{ schoolId: string }>
}) {
  return (
    <RolesPageContentWrapper params={params} />
  )
}

async function RolesPageContentWrapper({ params }: { params: Promise<{ schoolId: string }> }) {
  const { schoolId } = await params
  return <RolesPageContent schoolId={schoolId} />
}
