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
import OpenAI from 'openai'

export function NaturalLanguageConfigurator() {
  const [command, setCommand] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const supabase = createClient()

  const parseCommand = async () => {
    if (!command.trim()) {
      toast.error('Please enter a command')
      return
    }

    // Check for OpenAI key first (preferred), then Gemini
    const openAIKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
    const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    
    if (!openAIKey && !geminiKey) {
      toast.error('No AI API key found. Please add NEXT_PUBLIC_OPENAI_API_KEY or NEXT_PUBLIC_GEMINI_API_KEY to Vercel environment variables.')
      return
    }
    
    // Validate OpenAI key format if provided
    if (openAIKey && !openAIKey.startsWith('sk-')) {
      toast.error('Invalid OpenAI API key format. Keys should start with "sk-".')
      return
    }
    
    // Validate Gemini key format if provided
    if (geminiKey && !geminiKey.startsWith('AIza')) {
      toast.error('Invalid Gemini API key format. Keys should start with "AIza".')
      return
    }

    setIsProcessing(true)

    try {
      let result
      let text = ''
      
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

      // Try OpenAI first (if available), then Gemini
      if (openAIKey) {
        try {
          const openai = new OpenAI({
            apiKey: openAIKey,
            dangerouslyAllowBrowser: true // Required for client-side usage
          })
          
          const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'You are an RBAC configuration assistant. Return only valid JSON.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 500
          })
          
          text = completion.choices[0]?.message?.content || ''
          console.log('OpenAI response received')
        } catch (openaiError: any) {
          console.error('OpenAI error:', openaiError)
          // Fallback to Gemini if OpenAI fails
          if (!geminiKey) {
            throw openaiError
          }
        }
      }
      
      // Use Gemini if OpenAI not available or failed
      if (!text && geminiKey) {
        const genAI = new GoogleGenerativeAI(geminiKey)
        
        // Try different models in order
        const modelsToTry = [
          'gemini-1.5-flash-latest',
          'gemini-1.5-pro-latest', 
          'gemini-1.5-flash',
          'gemini-1.5-pro',
          'gemini-pro'
        ]
        let lastError
        
        for (const modelName of modelsToTry) {
          try {
            const model = genAI.getGenerativeModel({ model: modelName })
            const result = await model.generateContent(prompt)
            const response = await result.response
            text = response.text()
            console.log('Gemini response received from:', modelName)
            break // Success
          } catch (e: any) {
            lastError = e
            if (e.message?.includes('404') || e.message?.includes('not found') || e.message?.includes('is not found')) {
              continue // Try next model
            } else {
              throw e // Other errors
            }
          }
        }
        
        if (!text) {
          throw new Error(`No working Gemini model found. Last error: ${lastError?.message || 'Unknown'}`)
        }
      }
      
      if (!text) {
        throw new Error('No AI response received. Please check your API keys.')
      }

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
      console.error('=== Gemini API Error Details ===')
      console.error('Error:', error)
      console.error('Error message:', error.message)
      console.error('Error code:', error.code)
      console.error('API Key present:', !!process.env.NEXT_PUBLIC_GEMINI_API_KEY)
      console.error('API Key length:', process.env.NEXT_PUBLIC_GEMINI_API_KEY?.length)
      console.error('API Key preview:', process.env.NEXT_PUBLIC_GEMINI_API_KEY?.substring(0, 10) + '...')
      console.error('===============================')
      
      // Provide helpful error message for different error types
      const errorMsg = error.message || error.toString() || ''
      
      if (errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('401') || errorMsg.includes('Unauthorized') || errorMsg.includes('INVALID_API_KEY')) {
        toast.error('Invalid API key. Please verify: 1) API key in Vercel matches Google AI Studio, 2) Variable name is NEXT_PUBLIC_GEMINI_API_KEY, 3) Redeploy after adding variable.')
      } else if (errorMsg.includes('not found') || errorMsg.includes('404') || errorMsg.includes('is not found')) {
        toast.error('Gemini model not available. Your API key may not have access. Check Google AI Studio for model availability.')
      } else if (errorMsg.includes('quota') || errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
        toast.error('API quota exceeded. Check your Google AI Studio quota limits.')
      } else {
        toast.error(`Error: ${errorMsg || 'Unknown error'}. Check browser console (F12) for details.`)
      }
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

