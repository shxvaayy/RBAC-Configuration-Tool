import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NaturalLanguageConfigurator } from '@/components/natural-language-configurator'

export default async function NaturalLanguagePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <NaturalLanguageConfigurator />
}

