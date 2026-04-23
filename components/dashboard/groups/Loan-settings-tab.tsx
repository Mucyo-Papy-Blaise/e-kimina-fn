"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api/error-utils";
import {
  useLoanConfigQuery,
  useUpsertLoanConfigMutation,
} from "@/lib/query/groups-queries";
import { ApiError } from "@/lib/query/query-client";
import {
  formValuesToUpsertRequest,
  loanConfigFormFieldSchema,
  loanConfigToFormValues,
  type LoanConfigFormFieldValues,
} from "@/types/loan-config-schema";
import { LoanSettingsForm } from "./Loan-settings-form";

type LoanSettingsTabProps = {
  groupId: string;
  /** Group must be verified for the loan config API. */
  isVerified: boolean;
  /** `GROUP_ADMIN` and `TREASURER` can PUT; members can still GET (read-only). */
  canEdit: boolean;
};

const DEFAULT_FORM: LoanConfigFormFieldValues = {
  interestRate: "",
  repaymentPeriodDays: "",
  allowExceedContribution: false,
  maxLoanMultiplier: "",
  allowPartialPayments: true,
  penaltyRate: "",
  gracePeriodDays: "0",
};

export function LoanSettingsTab({
  groupId,
  isVerified,
  canEdit,
}: LoanSettingsTabProps) {
  const loanQuery = useLoanConfigQuery(groupId, isVerified);

  if (!isVerified) {
    return (
      <p className="text-sm text-text-muted">
        Loan settings are available after this group is verified.
      </p>
    );
  }

  if (loanQuery.isLoading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center gap-2 text-text-muted">
        <Loader2 className="size-5 animate-spin" />
        Loading loan settings...
      </div>
    );
  }

  if (loanQuery.isError) {
    return (
      <div className="rounded-(--radius) border border-border bg-secondary px-4 py-6 text-sm text-text">
        {loanQuery.error instanceof ApiError && loanQuery.error.status === 403
          ? "You cannot view loan settings for this group."
          : (loanQuery.error?.message ?? "Could not load loan settings.")}
      </div>
    );
  }

  // At this point loanQuery.data is LoanConfig | null | undefined.
  // undefined means the query is still in a pending/placeholder state —
  // treat it the same as "no config yet" and show the empty default form.
  const data = loanQuery.data ?? null;
  const initialForm: LoanConfigFormFieldValues =
    data === null ? DEFAULT_FORM : loanConfigToFormValues(data);

  return (
    <>
      {!canEdit && (
        <p className="mb-4 text-sm text-text-muted">
          You can view this group&apos;s loan policy. Only a group admin or
          treasurer can change it.
        </p>
      )}
      <LoanSettingsEditor
        key={groupId}
        groupId={groupId}
        initialForm={initialForm}
        readOnly={!canEdit}
      />
    </>
  );
}

type LoanSettingsEditorProps = {
  groupId: string;
  initialForm: LoanConfigFormFieldValues;
  readOnly: boolean;
};

function LoanSettingsEditor({
  groupId,
  initialForm,
  readOnly,
}: LoanSettingsEditorProps) {
  const upsert = useUpsertLoanConfigMutation();
  const [form, setForm] = useState<LoanConfigFormFieldValues>(initialForm);

  const onChange = <K extends keyof LoanConfigFormFieldValues>(
    key: K,
    value: LoanConfigFormFieldValues[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    const parsed = loanConfigFormFieldSchema.safeParse(form);
    if (!parsed.success) {
      const first =
        Object.values(parsed.error.flatten().fieldErrors).find(
          (a) => a?.[0],
        )?.[0] ?? "Check your inputs";
      toast.error(first);
      return;
    }

    let body: ReturnType<typeof formValuesToUpsertRequest>;
    try {
      body = formValuesToUpsertRequest(parsed.data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Invalid values");
      return;
    }

    try {
      const result = await upsert.mutateAsync({ groupId, body });
      setForm(loanConfigToFormValues(result));
      toast.success("Loan settings saved");
    } catch (e) {
      toast.error(
        e instanceof ApiError || e instanceof Error
          ? getApiErrorMessage(e)
          : "Save failed",
      );
    }
  };

  return (
    <LoanSettingsForm
      form={form}
      onChange={onChange}
      onSave={() => void handleSave()}
      isSaving={upsert.isPending}
      readOnly={readOnly}
    />
  );
}
