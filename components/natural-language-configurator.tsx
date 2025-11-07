'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { AuthButton } from './auth-button'
import { GoogleGenerativeAI } from '@google/generative-ai'

export function NaturalLanguageConfigurator() {
  const [command, setCommand] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const supabase = createClient()

  const parseCommand = async () => {
    if (!command.trim()) {
      toast.error('Please enter a command')
      return
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (!apiKey) {
      toast.error('Gemini API key not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your environment variables.')
      return
    }

    setIsProcessing(true)

    try {
      // Initialize Gemini
      const genAI = new GoogleGenerativeAI(apiKey)
      
      // Try different model names (some APIs may have different model availability)
      let model
      const modelNames = ['gemini-1.5-pro', 'gemini-pro', 'gemini-1.5-flash']
      
      // Try to get a working model
      for (const modelName of modelNames) {
        try {
          model = genAI.getGenerativeModel({ model: modelName })
          break
        } catch (e) {
          // Try next model
          continue
        }
      }
      
      if (!model) {
        // Fallback to gemini-pro
        model = genAI.getGenerativeModel({ model: 'gemini-pro' })
      }

      // Create a prompt that helps the AI understand RBAC operations
      const prompt = `You are an RBAC (Role-Based Access Control) configuration assistant. Parse the following user command and return a JSON object with the action to perform.

Available actions:
1. CREATE_PERMISSION - Create a new permission
2. CREATE_ROLE - Create a new role
3. ASSIGN_PERMISSION - Assign a permission to a role
4. REMOVE_PERMISSION - Remove a permission from a role
5. DELETE_PERMISSION - Delete a permission
6. DELETE_ROLE - Delete a role

User command: "${command}"

Return ONLY a valid JSON object in this format:
{
  "action": "ACTION_NAME",
  "permissionName": "permission name if applicable",
  "permissionDescription": "description if applicable",
  "roleName": "role name if applicable",
  "permissionToAssign": "permission name to assign/remove if applicable"
}

If the command is unclear or cannot be mapped to one of these actions, return:
{
  "action": "UNKNOWN",
  "error": "explanation of why the command is unclear"
}

Examples:
- "Create a new permission called publish content" -> {"action": "CREATE_PERMISSION", "permissionName": "publish content", "permissionDescription": "", "roleName": "", "permissionToAssign": ""}
- "Give the role Content Editor the permission to edit articles" -> {"action": "ASSIGN_PERMISSION", "permissionName": "", "permissionDescription": "", "roleName": "Content Editor", "permissionToAssign": "edit articles"}
- "Create a new role called Administrator" -> {"action": "CREATE_ROLE", "permissionName": "", "permissionDescription": "", "roleName": "Administrator", "permissionToAssign": ""}

Now parse this command: "${command}"`

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Could not parse AI response')
      }

      const parsed = JSON.parse(jsonMatch[0])

      if (parsed.action === 'UNKNOWN') {
        toast.error(parsed.error || 'Could not understand the command')
        return
      }

      // Execute the action
      await executeAction(parsed)

    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Failed to process command')
    } finally {
      setIsProcessing(false)
    }
  }

  const executeAction = async (parsed: any) => {
    try {
      switch (parsed.action) {
        case 'CREATE_PERMISSION': {
          const { error } = await supabase
            .from('permissions')
            .insert([{
              name: parsed.permissionName.toLowerCase().replace(/\s+/g, '_'),
              description: parsed.permissionDescription || null,
            }])

          if (error) throw error
          toast.success(`Permission "${parsed.permissionName}" created successfully`)
          break
        }

        case 'CREATE_ROLE': {
          const { error } = await supabase
            .from('roles')
            .insert([{ name: parsed.roleName }])

          if (error) throw error
          toast.success(`Role "${parsed.roleName}" created successfully`)
          break
        }

        case 'ASSIGN_PERMISSION': {
          // First, get the role and permission IDs
          const [roleRes, permissionRes] = await Promise.all([
            supabase.from('roles').select('id').eq('name', parsed.roleName).single(),
            supabase.from('permissions').select('id').ilike('name', `%${parsed.permissionToAssign.toLowerCase().replace(/\s+/g, '_')}%`).limit(1),
          ])

          if (roleRes.error || !roleRes.data) {
            throw new Error(`Role "${parsed.roleName}" not found`)
          }

          if (permissionRes.error || !permissionRes.data || permissionRes.data.length === 0) {
            throw new Error(`Permission "${parsed.permissionToAssign}" not found`)
          }

          const { error } = await supabase
            .from('role_permissions')
            .insert([{
              role_id: roleRes.data.id,
              permission_id: permissionRes.data[0].id,
            }])

          if (error) {
            if (error.code === '23505') {
              toast.info(`Permission "${parsed.permissionToAssign}" is already assigned to "${parsed.roleName}"`)
            } else {
              throw error
            }
          } else {
            toast.success(`Permission "${parsed.permissionToAssign}" assigned to "${parsed.roleName}" successfully`)
          }
          break
        }

        case 'REMOVE_PERMISSION': {
          const [roleRes, permissionRes] = await Promise.all([
            supabase.from('roles').select('id').eq('name', parsed.roleName).single(),
            supabase.from('permissions').select('id').ilike('name', `%${parsed.permissionToAssign.toLowerCase().replace(/\s+/g, '_')}%`).limit(1),
          ])

          if (roleRes.error || !roleRes.data) {
            throw new Error(`Role "${parsed.roleName}" not found`)
          }

          if (permissionRes.error || !permissionRes.data || permissionRes.data.length === 0) {
            throw new Error(`Permission "${parsed.permissionToAssign}" not found`)
          }

          const { error } = await supabase
            .from('role_permissions')
            .delete()
            .eq('role_id', roleRes.data.id)
            .eq('permission_id', permissionRes.data[0].id)

          if (error) throw error
          toast.success(`Permission "${parsed.permissionToAssign}" removed from "${parsed.roleName}" successfully`)
          break
        }

        case 'DELETE_PERMISSION': {
          const { error } = await supabase
            .from('permissions')
            .delete()
            .ilike('name', `%${parsed.permissionName.toLowerCase().replace(/\s+/g, '_')}%`)

          if (error) throw error
          toast.success(`Permission "${parsed.permissionName}" deleted successfully`)
          break
        }

        case 'DELETE_ROLE': {
          const { error } = await supabase
            .from('roles')
            .delete()
            .eq('name', parsed.roleName)

          if (error) throw error
          toast.success(`Role "${parsed.roleName}" deleted successfully`)
          break
        }

        default:
          toast.error('Unknown action')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to execute action')
      throw error
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Natural Language Configuration</h1>
              <p className="text-muted-foreground">Configure RBAC using plain English</p>
            </div>
          </div>
          <AuthButton />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI-Powered Configuration
            </CardTitle>
            <CardDescription>
              Type commands in natural language to manage roles and permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Enter your command</label>
              <Textarea
                placeholder="Example: Give the role 'Content Editor' the permission to 'edit articles'"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                rows={4}
                disabled={isProcessing}
              />
            </div>

            <Button
              onClick={parseCommand}
              disabled={isProcessing || !command.trim()}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Execute Command
                </>
              )}
            </Button>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Example Commands:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Create a new permission called &quot;publish content&quot;</li>
                <li>Give the role &quot;Content Editor&quot; the permission to &quot;edit articles&quot;</li>
                <li>Create a new role called &quot;Administrator&quot;</li>
                <li>Remove the permission &quot;delete users&quot; from &quot;Support Agent&quot;</li>
                <li>Delete the permission &quot;view dashboard&quot;</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

