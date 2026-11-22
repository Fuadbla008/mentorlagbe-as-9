import { Suspense } from "react";
import AuthForm from "../sign-in/AuthForm";

export const metadata = {
  title: "Sign Up",
  description: "Create a free MentorLagbe account as a student or tutor and start learning or teaching today.",
};

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="container-x grid min-h-[600px] place-items-center py-16">
          <div className="w-full max-w-md space-y-4">
            <div className="skeleton h-10 w-56" />
            <div className="skeleton h-5 w-full" />
            <div className="skeleton h-12 w-full" />
            <div className="skeleton h-12 w-full" />
            <div className="skeleton h-24 w-full" />
          </div>
        </div>
      }
    >
      <AuthForm mode="sign-up" />
    </Suspense>
  );
}
