"use server";

import { redirect } from "next/navigation";

import { ensureAppUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = {
  message?: string;
};

function getCredentials(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return {
      error: "Enter an email and password.",
    };
  }

  if (password.length < 6) {
    return {
      error: "Password must be at least 6 characters.",
    };
  }

  return {
    email,
    password,
  };
}

export async function login(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const credentials = getCredentials(formData);

  if ("error" in credentials) {
    return {
      message: credentials.error,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.signInWithPassword(credentials);

  if (error || !user) {
    return {
      message: error?.message ?? "Unable to sign in with those credentials.",
    };
  }

  await ensureAppUser(user);

  redirect("/matrix");
}

export async function signup(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const credentials = getCredentials(formData);

  if ("error" in credentials) {
    return {
      message: credentials.error,
    };
  }

  const supabase = await createClient();
  const {
    data: { session, user },
    error,
  } = await supabase.auth.signUp(credentials);

  if (error || !user) {
    return {
      message: error?.message ?? "Unable to create this account.",
    };
  }

  if (!session) {
    return {
      message:
        "Account created. Check your email to confirm the account, then log in.",
    };
  }

  await ensureAppUser(user);

  redirect("/matrix");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
