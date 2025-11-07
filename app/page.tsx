import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AuthButton } from '@/components/auth-button'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Users, Link2, Sparkles } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">RBAC Configurator</h1>
            <p className="text-muted-foreground">Manage roles and permissions with ease</p>
          </div>
          <AuthButton />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Permissions
              </CardTitle>
              <CardDescription>
                Create and manage permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/permissions">
                <Button className="w-full">Manage Permissions</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Roles
              </CardTitle>
              <CardDescription>
                Create and manage roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/roles">
                <Button className="w-full">Manage Roles</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                Assign Permissions
              </CardTitle>
              <CardDescription>
                Link permissions to roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/assign">
                <Button className="w-full">Assign Permissions</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Natural Language
              </CardTitle>
              <CardDescription>
                Configure using plain English
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/natural-language">
                <Button className="w-full">Try It Out</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
