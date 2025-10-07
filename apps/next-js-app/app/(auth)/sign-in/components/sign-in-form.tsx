"use client"

// React
import { useState } from "react"

// Zod
import { z } from "zod"

// React Hook Form
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

// Lucide Icons
import {
  Mail as MailIcon,
  CircleAlert as CircleAlertIcon,
  CircleCheck as CircleCheckIcon
} from "lucide-react"

// UI Components
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

// API Handler
import { apiHandler } from "@/lib/api-handler"

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type SignInFormValues = z.infer<typeof signInSchema>

export function SignInForm() {
  const [isSigningIn, setIsSigningIn] = useState(false)

  const [alertState, setAlertState] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(data: SignInFormValues) {
    // Clear previous alerts
    setAlertState({ type: null, message: '' })
    setIsSigningIn(true)

    try {
      const response = await apiHandler.post('/api/users/sign-in', data)

      if (response.error) {
        setAlertState({
          type: 'error',
          message: response.error
        })
      } else {
        setAlertState({
          type: 'success',
          message: (response.data as any)?.message || 'Sign in successful!'
        })
      }
    } finally {
      setIsSigningIn(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {alertState.type === 'error' && (
          <div className="rounded-md border border-red-500/50 px-4 py-3 text-red-600">
            <p className="text-sm">
              <CircleAlertIcon
                className="me-3 -mt-0.5 inline-flex opacity-60"
                size={16}
                aria-hidden="true"
              />
              {alertState.message}
            </p>
          </div>
        )}

        {alertState.type === 'success' && (
          <div className="rounded-md border border-emerald-500/50 px-4 py-3 text-emerald-600">
            <p className="text-sm">
              <CircleCheckIcon
                className="me-3 -mt-0.5 inline-flex opacity-60"
                size={16}
                aria-hidden="true"
              />
              {alertState.message}
            </p>
          </div>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSigningIn}>
          {isSigningIn ? (
            <>
              <Spinner className="size-4" />
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>
    </Form>
  )
}
