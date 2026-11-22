import { Suspense } from "react";
import AuthForm from "./AuthForm";

export const metadata = {
  title: "Sign In",
  description: "Sign in to your MentorLagbe account to manage applications, tuitions and bookmarks.",
};

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="container-x grid min-h-[600px] place-items-center py-16">
          <div className="w-full max-w-md space-y-4">
            <div className="skeleton h-10 w-48" />
            <div className="skeleton h-5 w-full" />
            <div className="skeleton h-12 w-full" />
            <div className="skeleton h-12 w-full" />
            <div className="skeleton h-12 w-full" />
          </div>
        </div>
      }
    >
      <AuthForm mode="sign-in" />
    </Suspense>
  );
}
