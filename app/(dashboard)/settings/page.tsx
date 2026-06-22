import { SettingsForm } from "@/components/SettingsForm";
import { requireUser } from "@/lib/auth";
import { getOpenAiKeyStatus } from "@/lib/openaiKeyVault";

export default async function SettingsPage() {
  const user = await requireUser();
  const keyStatus = await getOpenAiKeyStatus(user.id);

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-teal-100 bg-teal-50 px-6 py-6 shadow-sm">
        <div>
          <p className="eyebrow">Workspace settings</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
            Settings
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Manage account-level analyzer configuration.
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="section-heading">OpenAI API Key</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Enter your OpenAI API key to power the analyzer. Keys are encrypted
            with AES-256-GCM before being saved.
          </p>
        </div>
        <div className="px-5 py-5">
          <SettingsForm initialStatus={keyStatus} />
        </div>
      </section>
    </div>
  );
}
