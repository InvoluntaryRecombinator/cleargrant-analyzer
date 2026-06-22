"use client";

import { useActionState, useState } from "react";

import { saveProfile, type ProfileFormState } from "@/app/actions/profile";

export type ProfileFormValues = {
  applicantType: string;
  organizationName: string | null;
  legalStatus: string | null;
  taxStatus: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  missionStatement: string | null;
  focusAreas: string[];
  populationsServed: string[];
  projectTypes: string[];
  hasFiscalSponsor: boolean | null;
  hasEin: boolean | null;
  hasSamRegistration: boolean | null;
  hasUei: boolean | null;
  canProvideMatchFunds: boolean | null;
  minimumUsefulAward: number | null;
};

type ProfileFormProps = {
  profile: ProfileFormValues | null;
  mode: "onboarding" | "edit";
};

const initialState: ProfileFormState = {};

const applicantTypes = [
  "Nonprofit organization",
  "Grassroots organization",
  "Individual applicant",
  "Fiscal sponsor-supported project",
  "Public agency",
  "Education institution",
];

const legalStatuses = [
  "501(c)(3) nonprofit",
  "Fiscally sponsored project",
  "Unincorporated association",
  "Public agency",
  "School or university",
  "Individual",
];

const taxStatuses = [
  "501(c)(3)",
  "501(c)(4)",
  "Government entity",
  "Educational institution",
  "No tax-exempt status",
];

const focusAreas = [
  "Arts and culture",
  "Community development",
  "Education",
  "Environment",
  "Health",
  "Housing",
  "Workforce development",
  "Youth services",
];

const populations = [
  "Children and youth",
  "Older adults",
  "Immigrants and refugees",
  "Low-income communities",
  "Rural communities",
  "People with disabilities",
  "Veterans",
];

const projectTypes = [
  "General operating support",
  "Program delivery",
  "Capital project",
  "Research or evaluation",
  "Capacity building",
  "Emergency response",
];

const labelClass = "block text-sm font-semibold leading-5 text-slate-700";
const inputClass =
  "w-full max-w-md rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15";
const textareaClass =
  "w-full max-w-2xl rounded-md border border-gray-300 bg-white px-3 py-2 text-sm leading-6 text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15";
const checkRowClass =
  "flex min-h-9 items-center gap-x-2 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm leading-5 text-slate-700 transition hover:border-teal-300 hover:bg-slate-50 has-[:checked]:border-teal-300 has-[:checked]:bg-teal-50/60 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-teal-600/15";
const checkboxClass = "h-4 w-4 shrink-0 accent-teal-700";

function optionChecked(values: string[] | undefined, option: string) {
  return values?.includes(option) ?? false;
}

function SectionIntro({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-stone-200 bg-stone-50 px-4 py-3 md:col-span-1">
      <h2 className="text-base font-semibold text-slate-950">{title}</h2>
      <p className="mt-1 max-w-xs text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function CheckboxGroup({
  label,
  name,
  options,
  values,
}: {
  label: string;
  name: string;
  options: string[];
  values: string[] | undefined;
}) {
  return (
    <fieldset className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <legend className={labelClass}>{label}</legend>
        <span className="text-xs font-semibold text-slate-500">
          {values?.length ?? 0} selected
        </span>
      </div>
      <div className="grid max-w-4xl grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
        {options.map((option) => (
          <label className={checkRowClass} key={option}>
            <input
              className={checkboxClass}
              defaultChecked={optionChecked(values, option)}
              name={name}
              type="checkbox"
              value={option}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function CapacityCheckbox({
  defaultChecked,
  name,
  label,
}: {
  defaultChecked: boolean;
  name: string;
  label: string;
}) {
  return (
    <label className={checkRowClass}>
      <input
        className={checkboxClass}
        defaultChecked={defaultChecked}
        name={name}
        type="checkbox"
      />
      <span>{label}</span>
    </label>
  );
}

export function ProfileForm({ profile, mode }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(
    saveProfile,
    initialState,
  );
  const [applicantType, setApplicantType] = useState(
    profile?.applicantType ?? applicantTypes[0],
  );
  const isIndividual = applicantType === "Individual applicant";
  const redirectTo = mode === "onboarding" ? "/matrix" : "";

  return (
    <form
      action={formAction}
      className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
    >
      <input name="redirectTo" type="hidden" value={redirectTo} />

      <section
        className="grid grid-cols-1 gap-4 border-b border-gray-200 px-5 py-5 md:grid-cols-3 md:gap-8"
        id="profile-applicant"
      >
        <SectionIntro
          title="Applicant"
          description="Basic legal and organization details used in each review."
        />

        <div className="grid max-w-4xl gap-4 md:col-span-2 md:grid-cols-2">
          <div className="space-y-2">
            <label className={labelClass} htmlFor="applicantType">
              Applicant type
            </label>
            <select
              className={inputClass}
              id="applicantType"
              name="applicantType"
              onChange={(event) => setApplicantType(event.target.value)}
              value={applicantType}
            >
              {applicantTypes.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>

          {!isIndividual ? (
            <div className="space-y-2">
              <label className={labelClass} htmlFor="organizationName">
                Organization name
              </label>
              <input
                className={inputClass}
                defaultValue={profile?.organizationName ?? ""}
                id="organizationName"
                name="organizationName"
                type="text"
              />
            </div>
          ) : (
            <div className="flex min-h-[4.25rem] max-w-md items-center rounded-md border border-gray-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600">
              Organization fields are hidden for individual applicants.
            </div>
          )}

          {!isIndividual ? (
            <>
              <div className="space-y-2">
                <label className={labelClass} htmlFor="legalStatus">
                  Legal status
                </label>
                <select
                  className={inputClass}
                  defaultValue={profile?.legalStatus ?? ""}
                  id="legalStatus"
                  name="legalStatus"
                >
                  <option value="">Select status</option>
                  {legalStatuses.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className={labelClass} htmlFor="taxStatus">
                  Tax status
                </label>
                <select
                  className={inputClass}
                  defaultValue={profile?.taxStatus ?? ""}
                  id="taxStatus"
                  name="taxStatus"
                >
                  <option value="">Select status</option>
                  {taxStatuses.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </div>
            </>
          ) : null}
        </div>
      </section>

      <section
        className="grid grid-cols-1 gap-4 border-b border-gray-200 px-5 py-5 md:grid-cols-3 md:gap-8"
        id="profile-location"
      >
        <SectionIntro
          title="Applicant location"
          description="Use the applicant's primary location. Project service areas can be handled separately later."
        />

        <div className="space-y-4 md:col-span-2">
          <div className="grid max-w-4xl gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className={labelClass} htmlFor="country">
                Country
              </label>
              <input
                className="w-full max-w-sm rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                defaultValue={profile?.country ?? "United States"}
                id="country"
                name="country"
                type="text"
              />
            </div>

            <div className="space-y-2">
              <label className={labelClass} htmlFor="state">
                State
              </label>
              <input
                className="w-full max-w-sm rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                defaultValue={profile?.state ?? ""}
                id="state"
                name="state"
                type="text"
              />
            </div>

            <div className="space-y-2">
              <label className={labelClass} htmlFor="city">
                City
              </label>
              <input
                className="w-full max-w-sm rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                defaultValue={profile?.city ?? ""}
                id="city"
                name="city"
                type="text"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelClass} htmlFor="missionStatement">
              Brief description of applicant work
            </label>
            <textarea
              className={`${textareaClass} min-h-24 resize-y`}
              defaultValue={profile?.missionStatement ?? ""}
              id="missionStatement"
              name="missionStatement"
              placeholder="Example: Provides after-school STEM programs for middle-school students in San Luis Obispo County."
            />
            <p className="text-xs leading-5 text-slate-500">
              One or two sentences about the work this applicant does.
            </p>
          </div>
        </div>
      </section>

      <section
        className="grid grid-cols-1 gap-4 border-b border-gray-200 px-5 py-5 md:grid-cols-3 md:gap-8"
        id="profile-program"
      >
        <SectionIntro
          title="Program areas"
          description="Select the categories that commonly describe the applicant."
        />

        <div className="grid gap-5 md:col-span-2">
          <CheckboxGroup
            label="Focus areas"
            name="focusAreas"
            options={focusAreas}
            values={profile?.focusAreas}
          />

          <CheckboxGroup
            label="Populations served"
            name="populationsServed"
            options={populations}
            values={profile?.populationsServed}
          />

          <CheckboxGroup
            label="Project types"
            name="projectTypes"
            options={projectTypes}
            values={profile?.projectTypes}
          />
        </div>
      </section>

      <section
        className="grid grid-cols-1 gap-4 border-b border-gray-200 px-5 py-5 md:grid-cols-3 md:gap-8"
        id="profile-registrations"
      >
        <SectionIntro
          title="Registrations and funding"
          description="Common eligibility markers used during grant review."
        />

        <div className="space-y-4 md:col-span-2">
          <div className="grid max-w-4xl grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
            <CapacityCheckbox
              defaultChecked={profile?.hasFiscalSponsor ?? false}
              label="Has fiscal sponsor"
              name="hasFiscalSponsor"
            />
            <CapacityCheckbox
              defaultChecked={profile?.hasEin ?? false}
              label="Has an EIN"
              name="hasEin"
            />
            <CapacityCheckbox
              defaultChecked={profile?.hasSamRegistration ?? false}
              label="Has SAM.gov registration"
              name="hasSamRegistration"
            />
            <CapacityCheckbox
              defaultChecked={profile?.hasUei ?? false}
              label="Has a UEI"
              name="hasUei"
            />
            <CapacityCheckbox
              defaultChecked={profile?.canProvideMatchFunds ?? false}
              label="Can provide matching funds"
              name="canProvideMatchFunds"
            />
          </div>

          <div className="max-w-sm space-y-2">
            <label className={labelClass} htmlFor="minimumUsefulAward">
              Minimum award amount to consider
            </label>
            <input
              className="w-full max-w-sm rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
              defaultValue={profile?.minimumUsefulAward ?? ""}
              id="minimumUsefulAward"
              min={0}
              name="minimumUsefulAward"
              placeholder="25000"
              type="number"
            />
          </div>
        </div>
      </section>

      {state.message ? (
        <p
          className={
            state.ok
              ? "mx-5 mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
              : "mx-5 mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
          }
        >
          {state.message}
        </p>
      ) : null}

      <div className="sticky bottom-0 z-20 flex items-center justify-between gap-4 border-t border-gray-200 bg-white/95 px-5 py-3 shadow-[0_-8px_18px_rgba(15,23,42,0.06)] backdrop-blur">
        <p className="text-sm text-slate-600">
          Profile changes stay local until saved.
        </p>
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-md border border-teal-700 bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? "Saving..." : "Save profile"}
        </button>
      </div>
    </form>
  );
}
