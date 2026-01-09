import React from "react";
import { SignupForm } from "@/components/ui/signupform";

export default function Signup() {
  return (
    <div className="min-h-screen w-full bg-neutral-950 relative flex flex-col items-center justify-center">
      <SignupForm />
    </div>
  );
}