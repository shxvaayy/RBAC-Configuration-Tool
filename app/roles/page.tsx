import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RolesManager } from '@/components/roles-manager'

export default async function RolesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <RolesManager />
}

