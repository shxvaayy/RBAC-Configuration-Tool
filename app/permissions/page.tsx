import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PermissionsManager } from '@/components/permissions-manager'

export default async function PermissionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <PermissionsManager />
}

