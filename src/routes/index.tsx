import { createFileRoute, redirect } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    if (process.env.NODE_ENV === "development") {
      throw redirect({
        to: '/app',
      })
    }
    
    const session = await authClient.getSession()
    if (session.data?.user) {
      throw redirect({
        to: '/app',
      })
    } else {
      throw redirect({
        to: '/login',
      })
    }
  },
})
