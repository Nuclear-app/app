import React from "react";
import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";
import { SignUpForm } from "@/components/signup-form";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="w-full flex items-center h-full justify-center">
        <FormMessage message={searchParams} />
      </div>
    );
  }
  return (
    <div className="min-w-full min-h-screen flex items-center justify-center">
      <SignUpForm />
    </div>
  )
}
