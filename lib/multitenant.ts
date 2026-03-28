import { createClient } from '@/lib/supabase/server'

export async function getSchoolBySubdomain(subdomain: string) {
  const supabase = await createClient()
  
  // Try to find by subdomain first
  const { data: school } = await supabase
    .from('schools')
    .select('*')
    .eq('subdomain', subdomain)
    .single()

  return school
}

export async function getSchoolByDomain(domain: string) {
  const supabase = await createClient()
  
  // Try to find by custom domain
  const { data: school } = await supabase
    .from('schools')
    .select('*')
    .eq('website_domain', domain)
    .single()

  return school
}

export function extractSubdomainFromHost(host: string): string | null {
  // Remove port if exists
  const hostWithoutPort = host.split(':')[0]
  
  // Get parts
  const parts = hostWithoutPort.split('.')
  
  // If it's localhost or IP, return null
  if (hostWithoutPort === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostWithoutPort)) {
    return null
  }
  
  // If more than 2 parts, first part is subdomain
  if (parts.length > 2) {
    return parts[0]
  }
  
  return null
}

export async function getSchoolFromRequest(headers: any) {
  const host = headers.get('host') || ''
  
  // Try subdomain first
  const subdomain = extractSubdomainFromHost(host)
  if (subdomain) {
    const school = await getSchoolBySubdomain(subdomain)
    if (school) return school
  }
  
  // Try custom domain
  const school = await getSchoolByDomain(host)
  if (school) return school
  
  return null
}
