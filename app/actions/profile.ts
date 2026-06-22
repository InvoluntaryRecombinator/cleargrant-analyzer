"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ensureAppUser, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type ProfileFormState = {
  message?: string;
  ok?: boolean;
};

function textValue(formData: FormData, name: string) {
  const value = String(formData.get(name) ?? "").trim();
  return value.length > 0 ? value : null;
}

function stringList(formData: FormData, name: string) {
  return formData
    .getAll(name)
    .map((value) => String(value).trim())
    .filter(Boolean);
}

function checkboxValue(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

function optionalInt(formData: FormData, name: string) {
  const rawValue = String(formData.get(name) ?? "").trim();

  if (!rawValue) {
    return null;
  }

  const value = Number.parseInt(rawValue, 10);
  return Number.isFinite(value) ? value : null;
}

export async function saveProfile(
  _state: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const user = await requireUser();
  await ensureAppUser(user);

  const applicantType = textValue(formData, "applicantType");
  const country = textValue(formData, "country");
  const state = textValue(formData, "state");
  const city = textValue(formData, "city");
  const focusAreas = stringList(formData, "focusAreas");
  const redirectTo = textValue(formData, "redirectTo");

  if (!applicantType) {
    return {
      message: "Choose an applicant type.",
    };
  }

  if (!country || !state || !city) {
    return {
      message: "Enter your country, state, and city.",
    };
  }

  if (focusAreas.length === 0) {
    return {
      message: "Select at least one focus area.",
    };
  }

  const minimumUsefulAward = optionalInt(formData, "minimumUsefulAward");
  const profileData = {
    applicantType,
    organizationName: textValue(formData, "organizationName"),
    legalStatus: textValue(formData, "legalStatus"),
    taxStatus: textValue(formData, "taxStatus"),
    country,
    state,
    city,
    missionStatement: textValue(formData, "missionStatement"),
    focusAreas,
    populationsServed: stringList(formData, "populationsServed"),
    projectTypes: stringList(formData, "projectTypes"),
    hasFiscalSponsor: checkboxValue(formData, "hasFiscalSponsor"),
    hasEin: checkboxValue(formData, "hasEin"),
    hasSamRegistration: checkboxValue(formData, "hasSamRegistration"),
    hasUei: checkboxValue(formData, "hasUei"),
    canProvideMatchFunds: checkboxValue(formData, "canProvideMatchFunds"),
    minimumUsefulAward,
  };

  await prisma.profile.upsert({
    where: {
      userId: user.id,
    },
    create: {
      userId: user.id,
      ...profileData,
      rawProfileJson: profileData,
    },
    update: {
      ...profileData,
      rawProfileJson: profileData,
    },
  });

  revalidatePath("/matrix");
  revalidatePath("/profile");
  revalidatePath("/onboarding");

  if (redirectTo) {
    redirect(redirectTo);
  }

  return {
    ok: true,
    message: "Profile saved.",
  };
}
