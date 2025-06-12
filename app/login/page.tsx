import { LoginForm } from "@/components/login-form"
import { Suspense } from "react"

export default function LoginPage() {
   return (
      <div className="flex h-screen items-center justify-center bg-muted p-6">
         <div className="w-full max-w-sm md:max-w-3xl">
            <Suspense fallback={<div>Loading...</div>}>
               <LoginForm />
            </Suspense>
         </div>
      </div>
   )
}
