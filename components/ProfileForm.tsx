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

const labelClass = "block text-sm font-semibold leading-5 text-gray-700";
const inputClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-950 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";
const textareaClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm leading-6 text-gray-950 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";
const checkboxClass = "h-4 w-4 shrink-0 accent-emerald-600";

function optionChecked(values: string[] | undefined, option: string) {
  return values?.includes(option) ?? false;
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
    <form action={formAction}>
      <input name="redirectTo" type="hidden" value={redirectTo} />

      <div className="max-w-7xl mx-auto p-8 space-y-12">
        <section
          className="grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-gray-200 pb-12"
          id="profile-applicant"
        >
          <div className="md:col-span-1">
            <h2 className="text-lg font-semibold text-gray-900">Applicant</h2>
            <p className="text-sm text-gray-500 mt-1">
              Basic legal and organization details.
            </p>
          </div>

          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
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
              <div className="flex min-h-[42px] items-center rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm leading-6 text-gray-600">
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
          className="grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-gray-200 pb-12"
          id="profile-location"
        >
          <div className="md:col-span-1">
            <h2 className="text-lg font-semibold text-gray-900">
              Applicant location
            </h2>
            <p className="text-sm text-gray-500 mt-1">Primary location.</p>
          </div>

          <div className="md:col-span-3 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className={labelClass} htmlFor="country">
                  Country
                </label>
                <input
                  className={inputClass}
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
                  className={inputClass}
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
                  className={inputClass}
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
              <p className="text-xs leading-5 text-gray-500">
                One or two sentences about the work this applicant does.
              </p>
            </div>
          </div>
        </section>

        <section
          className="grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-gray-200 pb-12"
          id="profile-program"
        >
          <div className="md:col-span-1">
            <h2 className="text-lg font-semibold text-gray-900">
              Program areas
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Categories that describe the applicant.
            </p>
          </div>

          <div className="md:col-span-3 space-y-8">
            <fieldset className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <legend className={labelClass}>Focus areas</legend>
                <span className="text-xs font-semibold text-gray-500">
                  {profile?.focusAreas.length ?? 0} selected
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6">
                {focusAreas.map((option) => (
                  <label className="flex items-center gap-3" key={option}>
                    <input
                      className={checkboxClass}
                      defaultChecked={optionChecked(
                        profile?.focusAreas,
                        option,
                      )}
                      name="focusAreas"
                      type="checkbox"
                      value={option}
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <legend className={labelClass}>Populations served</legend>
                <span className="text-xs font-semibold text-gray-500">
                  {profile?.populationsServed.length ?? 0} selected
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6">
                {populations.map((option) => (
                  <label className="flex items-center gap-3" key={option}>
                    <input
                      className={checkboxClass}
                      defaultChecked={optionChecked(
                        profile?.populationsServed,
                        option,
                      )}
                      name="populationsServed"
                      type="checkbox"
                      value={option}
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <legend className={labelClass}>Project types</legend>
                <span className="text-xs font-semibold text-gray-500">
                  {profile?.projectTypes.length ?? 0} selected
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6">
                {projectTypes.map((option) => (
                  <label className="flex items-center gap-3" key={option}>
                    <input
                      className={checkboxClass}
                      defaultChecked={optionChecked(
                        profile?.projectTypes,
                        option,
                      )}
                      name="projectTypes"
                      type="checkbox"
                      value={option}
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </section>

        <section
          className="grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-gray-200 pb-12"
          id="profile-registrations"
        >
          <div className="md:col-span-1">
            <h2 className="text-lg font-semibold text-gray-900">
              Registrations and funding
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Common eligibility markers used during grant review.
            </p>
          </div>

          <div className="md:col-span-3 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6">
              {[
                {
                  defaultChecked: profile?.hasFiscalSponsor ?? false,
                  label: "Has fiscal sponsor",
                  name: "hasFiscalSponsor",
                },
                {
                  defaultChecked: profile?.hasEin ?? false,
                  label: "Has an EIN",
                  name: "hasEin",
                },
                {
                  defaultChecked: profile?.hasSamRegistration ?? false,
                  label: "Has SAM.gov registration",
                  name: "hasSamRegistration",
                },
                {
                  defaultChecked: profile?.hasUei ?? false,
                  label: "Has a UEI",
                  name: "hasUei",
                },
                {
                  defaultChecked: profile?.canProvideMatchFunds ?? false,
                  label: "Can provide matching funds",
                  name: "canProvideMatchFunds",
                },
              ].map((option) => (
                <label className="flex items-center gap-3" key={option.name}>
                  <input
                    className={checkboxClass}
                    defaultChecked={option.defaultChecked}
                    name={option.name}
                    type="checkbox"
                  />
                  <span className="text-sm text-gray-700">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>

            <div className="max-w-sm space-y-2">
              <label className={labelClass} htmlFor="minimumUsefulAward">
                Minimum award amount to consider
              </label>
              <input
                className={inputClass}
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
                ? "rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
                : "rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
            }
          >
            {state.message}
          </p>
        ) : null}

        <div className="sticky bottom-0 z-20 flex items-center justify-between gap-4 border-t border-gray-200 bg-white/95 px-5 py-3 shadow-[0_-8px_18px_rgba(15,23,42,0.06)] backdrop-blur">
          <p className="text-sm text-gray-600">
            Profile changes stay local until saved.
          </p>
          <button
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-emerald-700 bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={pending}
            type="submit"
          >
            {pending ? "Saving..." : "Save profile"}
          </button>
        </div>
      </div>
    </form>
  );
}
