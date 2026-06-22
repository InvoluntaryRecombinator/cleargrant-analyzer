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

const sectionLinks = [
  ["Applicant", "#profile-applicant"],
  ["Location", "#profile-location"],
  ["Program areas", "#profile-program"],
  ["Registrations", "#profile-registrations"],
] as const;

function optionChecked(values: string[] | undefined, option: string) {
  return values?.includes(option) ?? false;
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
      <legend className="sr-only">{label}</legend>
      <div className="flex items-center justify-between gap-3">
        <p className="form-label">{label}</p>
        <span className="text-xs font-semibold text-slate-500">
          {values?.length ?? 0} selected
        </span>
      </div>
      <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2 xl:grid-cols-3">
        {options.map((option) => (
          <label className="compact-check-row" key={option}>
            <input
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
    <label className="compact-check-row">
      <input defaultChecked={defaultChecked} name={name} type="checkbox" />
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
    <form action={formAction} className="profile-settings-form">
      <input name="redirectTo" type="hidden" value={redirectTo} />

      <div className="settings-layout">
        <aside className="settings-rail" aria-label="Profile sections">
          <p className="text-xs font-bold uppercase text-slate-500">Sections</p>
          <nav className="mt-3 grid gap-1">
            {sectionLinks.map(([label, href]) => (
              <a className="settings-rail-link" href={href} key={href}>
                {label}
              </a>
            ))}
          </nav>
        </aside>

        <div className="settings-content">
          <section className="settings-section" id="profile-applicant">
            <div className="settings-section-header">
              <div>
                <h2 className="section-heading">Applicant</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Basic legal and organization details used in each review.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="form-label" htmlFor="applicantType">
                  Applicant type
                </label>
                <select
                  className="form-input"
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
                  <label className="form-label" htmlFor="organizationName">
                    Organization name
                  </label>
                  <input
                    className="form-input"
                    defaultValue={profile?.organizationName ?? ""}
                    id="organizationName"
                    name="organizationName"
                    type="text"
                  />
                </div>
              ) : (
                <div className="rounded-md border border-gray-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600">
                  Organization fields are hidden for individual applicants.
                </div>
              )}

              {!isIndividual ? (
                <>
                  <div className="space-y-2">
                    <label className="form-label" htmlFor="legalStatus">
                      Legal status
                    </label>
                    <select
                      className="form-input"
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
                    <label className="form-label" htmlFor="taxStatus">
                      Tax status
                    </label>
                    <select
                      className="form-input"
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

          <section className="settings-section" id="profile-location">
            <div className="settings-section-header">
              <div>
                <h2 className="section-heading">Applicant location</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Use the applicant&apos;s primary location. Project service
                  areas can be handled separately later.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="form-label" htmlFor="country">
                  Country
                </label>
                <input
                  className="form-input"
                  defaultValue={profile?.country ?? "United States"}
                  id="country"
                  name="country"
                  type="text"
                />
              </div>

              <div className="space-y-2">
                <label className="form-label" htmlFor="state">
                  State
                </label>
                <input
                  className="form-input"
                  defaultValue={profile?.state ?? ""}
                  id="state"
                  name="state"
                  type="text"
                />
              </div>

              <div className="space-y-2">
                <label className="form-label" htmlFor="city">
                  City
                </label>
                <input
                  className="form-input"
                  defaultValue={profile?.city ?? ""}
                  id="city"
                  name="city"
                  type="text"
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <label className="form-label" htmlFor="missionStatement">
                Brief description of applicant work
              </label>
              <textarea
                className="form-input min-h-24 resize-y"
                defaultValue={profile?.missionStatement ?? ""}
                id="missionStatement"
                name="missionStatement"
                placeholder="Example: Provides after-school STEM programs for middle-school students in San Luis Obispo County."
              />
              <p className="text-xs leading-5 text-slate-500">
                One or two sentences about the work this applicant does.
              </p>
            </div>
          </section>

          <section className="settings-section" id="profile-program">
            <div className="settings-section-header">
              <div>
                <h2 className="section-heading">Program areas</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Select the categories that commonly describe the applicant.
                </p>
              </div>
            </div>

            <div className="grid gap-5">
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

          <section className="settings-section" id="profile-registrations">
            <div className="settings-section-header">
              <div>
                <h2 className="section-heading">Registrations and funding</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Common eligibility markers used during grant review.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2 xl:grid-cols-3">
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

            <div className="mt-4 max-w-sm space-y-2">
              <label className="form-label" htmlFor="minimumUsefulAward">
                Minimum award amount to consider
              </label>
              <input
                className="form-input"
                defaultValue={profile?.minimumUsefulAward ?? ""}
                id="minimumUsefulAward"
                min={0}
                name="minimumUsefulAward"
                placeholder="25000"
                type="number"
              />
            </div>
          </section>

          {state.message ? (
            <p
              className={
                state.ok
                  ? "notice border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "notice notice-warning"
              }
            >
              {state.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="settings-save-bar">
        <p className="text-sm text-slate-600">
          Profile changes stay local until saved.
        </p>
        <button className="primary-button" disabled={pending} type="submit">
          {pending ? "Saving..." : "Save profile"}
        </button>
      </div>
    </form>
  );
}
