"use client";

import { Button } from "@/components/ui";

/**
 * Domain-specific sync job retry form.
 * src/modules/admin/actions.ts дотор operatorRetryJobAction нэмж,
 * энэ component-г шинэчилнэ.
 */
export function OperatorRetrySyncForm({ jobId }: { jobId: string }) {
  return (
    <form className="ui-form-inline">
      <input type="hidden" name="jobId" value={jobId} />
      <Button type="button" variant="secondary" size="sm" disabled>
        Retry (domain action needed)
      </Button>
    </form>
  );
}
