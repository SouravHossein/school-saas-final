import { RolesPageContent } from './roles-content'

export default function Page({
  searchParams,
}: {
  searchParams: { schoolId?: string }
}) {
  return <RolesPageContent schoolId={searchParams.schoolId || ''} />
}