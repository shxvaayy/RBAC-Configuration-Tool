import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AssignPermissionsManager } from '@/components/assign-permissions-manager'

export default async function AssignPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <AssignPermissionsManager />
}

