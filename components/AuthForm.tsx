"use client";

import { useActionState } from "react";

import type { AuthFormState } from "@/app/actions/auth";

type AuthFormProps = {
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  buttonLabel: string;
};

const initialState: AuthFormState = {};

export function AuthForm({ action, buttonLabel }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label className="form-label" htmlFor="email">
          Email
        </label>
        <input
          className="form-input"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="form-label" htmlFor="password">
          Password
        </label>
        <input
          className="form-input"
          id="password"
          name="password"
          type="password"
          autoComplete={
            buttonLabel.toLowerCase().includes("create")
              ? "new-password"
              : "current-password"
          }
          minLength={6}
          required
        />
      </div>

      {state.message ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {state.message}
        </p>
      ) : null}

      <button className="primary-button w-full" disabled={pending} type="submit">
        {pending ? "Working..." : buttonLabel}
      </button>
    </form>
  );
}
