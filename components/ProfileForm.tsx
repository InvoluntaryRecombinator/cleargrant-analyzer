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

const labelClass = "form-label";
const inputClass = "form-input profile-input";
const compactInputClass = "form-input profile-input-sm";
const textareaClass = "form-input profile-textarea";
const checkRowClass = "check-row";

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
    <div className="profile-section-intro">
      <h2 className="section-heading">{title}</h2>
      <p className="profile-section-description">{description}</p>
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
    <fieldset className="profile-checkbox-group">
      <div className="profile-checkbox-header">
        <legend className={labelClass}>{label}</legend>
        <span className="profile-selected-count">
          {values?.length ?? 0} selected
        </span>
      </div>
      <div className="profile-checkbox-grid">
        {options.map((option) => (
          <label className={checkRowClass} key={option}>
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
    <label className={checkRowClass}>
      <input
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
      className="profile-form form-panel"
    >
      <input name="redirectTo" type="hidden" value={redirectTo} />

      <section
        className="form-section profile-section"
        id="profile-applicant"
      >
        <SectionIntro
          title="Applicant"
          description="Basic legal and organization details used in each review."
        />

        <div className="profile-section-content profile-field-grid profile-field-grid-two">
          <div className="profile-field">
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
            <div className="profile-field">
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
            <div className="profile-hidden-note">
              Organization fields are hidden for individual applicants.
            </div>
          )}

          {!isIndividual ? (
            <>
              <div className="profile-field">
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

              <div className="profile-field">
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
        className="form-section profile-section"
        id="profile-location"
      >
        <SectionIntro
          title="Applicant location"
          description="Use the applicant's primary location. Project service areas can be handled separately later."
        />

        <div className="profile-section-content profile-stack">
          <div className="profile-field-grid profile-field-grid-three">
            <div className="profile-field">
              <label className={labelClass} htmlFor="country">
                Country
              </label>
              <input
                className={compactInputClass}
                defaultValue={profile?.country ?? "United States"}
                id="country"
                name="country"
                type="text"
              />
            </div>

            <div className="profile-field">
              <label className={labelClass} htmlFor="state">
                State
              </label>
              <input
                className={compactInputClass}
                defaultValue={profile?.state ?? ""}
                id="state"
                name="state"
                type="text"
              />
            </div>

            <div className="profile-field">
              <label className={labelClass} htmlFor="city">
                City
              </label>
              <input
                className={compactInputClass}
                defaultValue={profile?.city ?? ""}
                id="city"
                name="city"
                type="text"
              />
            </div>
          </div>

          <div className="profile-field">
            <label className={labelClass} htmlFor="missionStatement">
              Brief description of applicant work
            </label>
            <textarea
              className={textareaClass}
              defaultValue={profile?.missionStatement ?? ""}
              id="missionStatement"
              name="missionStatement"
              placeholder="Example: Provides after-school STEM programs for middle-school students in San Luis Obispo County."
            />
            <p className="profile-help">
              One or two sentences about the work this applicant does.
            </p>
          </div>
        </div>
      </section>

      <section
        className="form-section profile-section"
        id="profile-program"
      >
        <SectionIntro
          title="Program areas"
          description="Select the categories that commonly describe the applicant."
        />

        <div className="profile-section-content profile-group-stack">
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
        className="form-section profile-section"
        id="profile-registrations"
      >
        <SectionIntro
          title="Registrations and funding"
          description="Common eligibility markers used during grant review."
        />

        <div className="profile-section-content profile-stack">
          <div className="profile-checkbox-grid">
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

          <div className="profile-field profile-amount-field">
            <label className={labelClass} htmlFor="minimumUsefulAward">
              Minimum award amount to consider
            </label>
            <input
              className={compactInputClass}
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
              ? "profile-notice notice notice-success"
              : "profile-notice notice notice-warning"
          }
        >
          {state.message}
        </p>
      ) : null}

      <div className="profile-savebar">
        <p className="profile-save-note">
          Profile changes stay local until saved.
        </p>
        <button
          className="primary-button"
          disabled={pending}
          type="submit"
        >
          {pending ? "Saving..." : "Save profile"}
        </button>
      </div>
    </form>
  );
}
