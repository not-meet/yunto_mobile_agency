import type { UseMutationResult } from '@tanstack/react-query';
import { useState } from 'react';

import { BrandMessageCard } from '@/components/leads/BrandMessageCard';
import { RequirementsSheet } from '@/components/leads/RequirementsSheet';
import type { BrandRequirements, SetRequirementsInput } from '@/services/leadsService';
import { showToast } from '@/utils/notifications';

// The Brand Requirements card with its edit sheet, on a lead or its campaign. The caller passes
// that screen's save mutation.

interface RequirementsSectionProps {
  message: string | null;
  requirements: BrandRequirements;
  save: UseMutationResult<unknown, Error, SetRequirementsInput>;
}

export function RequirementsSection({ message, requirements, save }: RequirementsSectionProps) {
  const [editing, setEditing] = useState(false);
  // Re-keys the sheet per opening, so it starts from the requirements as they are.
  const [sheetKey, setSheetKey] = useState(0);

  const openEdit = () => {
    save.reset();
    setSheetKey((key) => key + 1);
    setEditing(true);
  };

  return (
    <>
      <BrandMessageCard message={message} requirements={requirements} onEdit={openEdit} />
      <RequirementsSheet
        key={sheetKey}
        visible={editing}
        onClose={() => setEditing(false)}
        initial={requirements}
        onSave={(input) =>
          save.mutate(input, {
            onSuccess: () => {
              setEditing(false);
              showToast('Requirements updated');
            },
          })
        }
        busy={save.isPending}
        error={save.isError ? 'Couldn’t save the requirements. Please try again.' : null}
      />
    </>
  );
}
