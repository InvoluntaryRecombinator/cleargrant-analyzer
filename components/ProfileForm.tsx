"use client";

import { useActionState, useMemo, useState } from "react";

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
    <fieldset className="space-y-3">
      <legend className="form-label">{label}</legend>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
        {options.map((option) => (
          <label
            className="check-row flex min-h-11 items-center gap-2 rounded-md border border-stone-200 bg-[#fffdf8] px-3 py-2 text-sm leading-5 text-slate-700 transition hover:border-teal-200 hover:bg-teal-50/40"
            key={option}
          >
            <input
              className="h-4 w-4 shrink-0 accent-teal-700"
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

export function ProfileForm({ profile, mode }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(
    saveProfile,
    initialState,
  );
  const [applicantType, setApplicantType] = useState(
    profile?.applicantType ?? applicantTypes[0],
  );
  const isIndividual = applicantType === "Individual applicant";
  const redirectTo = mode === "onboarding" ? "/dashboard" : "";

  const sectionLabel = useMemo(
    () =>
      mode === "onboarding"
        ? "Create applicant profile"
        : "Update applicant profile",
    [mode],
  );

  return (
    <form action={formAction} className="profile-form">
      <input name="redirectTo" type="hidden" value={redirectTo} />

      <section className="grid gap-5 border-b border-stone-200 p-5">
        <div>
          <p className="eyebrow">Step 1</p>
          <h2 className="section-heading">{sectionLabel}</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
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
          ) : null}

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

      <section className="grid gap-5 border-b border-stone-200 p-5">
        <div>
          <p className="eyebrow">Step 2</p>
          <h2 className="section-heading">Location and mission</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
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

        <div className="space-y-2">
          <label className="form-label" htmlFor="missionStatement">
            Mission or project focus
          </label>
          <textarea
            className="form-input min-h-28 resize-y"
            defaultValue={profile?.missionStatement ?? ""}
            id="missionStatement"
            name="missionStatement"
          />
        </div>
      </section>

      <section className="grid gap-6 border-b border-stone-200 p-5">
        <div>
          <p className="eyebrow">Step 3</p>
          <h2 className="section-heading">Program fit</h2>
        </div>

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
      </section>

      <section className="grid gap-5 p-5">
        <div>
          <p className="eyebrow">Step 4</p>
          <h2 className="section-heading">Operational capacity</h2>
        </div>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
          <label className="check-row flex min-h-11 items-center gap-2 rounded-md border border-stone-200 bg-[#fffdf8] px-3 py-2 text-sm leading-5 text-slate-700 transition hover:border-teal-200 hover:bg-teal-50/40">
            <input
              className="h-4 w-4 shrink-0 accent-teal-700"
              defaultChecked={profile?.hasFiscalSponsor ?? false}
              name="hasFiscalSponsor"
              type="checkbox"
            />
            <span>Fiscal sponsor available</span>
          </label>
          <label className="check-row flex min-h-11 items-center gap-2 rounded-md border border-stone-200 bg-[#fffdf8] px-3 py-2 text-sm leading-5 text-slate-700 transition hover:border-teal-200 hover:bg-teal-50/40">
            <input
              className="h-4 w-4 shrink-0 accent-teal-700"
              defaultChecked={profile?.hasEin ?? false}
              name="hasEin"
              type="checkbox"
            />
            <span>EIN available</span>
          </label>
          <label className="check-row flex min-h-11 items-center gap-2 rounded-md border border-stone-200 bg-[#fffdf8] px-3 py-2 text-sm leading-5 text-slate-700 transition hover:border-teal-200 hover:bg-teal-50/40">
            <input
              className="h-4 w-4 shrink-0 accent-teal-700"
              defaultChecked={profile?.hasSamRegistration ?? false}
              name="hasSamRegistration"
              type="checkbox"
            />
            <span>SAM registration available</span>
          </label>
          <label className="check-row flex min-h-11 items-center gap-2 rounded-md border border-stone-200 bg-[#fffdf8] px-3 py-2 text-sm leading-5 text-slate-700 transition hover:border-teal-200 hover:bg-teal-50/40">
            <input
              className="h-4 w-4 shrink-0 accent-teal-700"
              defaultChecked={profile?.hasUei ?? false}
              name="hasUei"
              type="checkbox"
            />
            <span>UEI available</span>
          </label>
          <label className="check-row flex min-h-11 items-center gap-2 rounded-md border border-stone-200 bg-[#fffdf8] px-3 py-2 text-sm leading-5 text-slate-700 transition hover:border-teal-200 hover:bg-teal-50/40">
            <input
              className="h-4 w-4 shrink-0 accent-teal-700"
              defaultChecked={profile?.canProvideMatchFunds ?? false}
              name="canProvideMatchFunds"
              type="checkbox"
            />
            <span>Can provide matching funds</span>
          </label>
        </div>

        <div className="max-w-sm space-y-2">
          <label className="form-label" htmlFor="minimumUsefulAward">
            Minimum useful award
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

      <div className="form-footer">
        <button className="primary-button" disabled={pending} type="submit">
          {pending ? "Saving..." : "Save profile"}
        </button>
      </div>
    </form>
  );
}
