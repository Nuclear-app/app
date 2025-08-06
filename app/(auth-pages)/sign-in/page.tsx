import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { GalleryVerticalEnd } from "lucide-react"
import { LoginForm } from "@/components/login-form"
import Image from 'next/image'


export default async function Login(props: { searchParams: Promise<Message> }) {
   const searchParams = await props.searchParams;
   return ( 
      <div className="min-w-full min-h-screen flex items-center justify-center gap-2 p-4">
            <LoginForm />
      </div>
   )
}


