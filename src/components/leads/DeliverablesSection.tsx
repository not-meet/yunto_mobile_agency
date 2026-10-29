import type { UseMutationResult } from '@tanstack/react-query';
import { useState } from 'react';

import { AddDeliverablesSheet } from '@/components/campaigns/AddDeliverablesSheet';
import { EditDeliverableSheet } from '@/components/campaigns/EditDeliverableSheet';
import { DeliverablesCard } from '@/components/leads/DeliverablesCard';
import type {
  AddDeliverablesInput,
  Deliverable,
  UpdateDeliverableInput,
} from '@/services/leadsService';
import { showToast } from '@/utils/notifications';

// The Deliverables card with its add and edit sheets, on a lead or its campaign. The caller passes
// that screen's mutations; a campaign's deliverables count `total` pieces instead of `quantity`.

type Item = Omit<Deliverable, 'quantity'> & { quantity?: number; total?: number; done?: number };

interface DeliverablesSectionProps {
  deliverables: Item[];
  add: UseMutationResult<unknown, Error, AddDeliverablesInput>;
  update: UseMutationResult<
    unknown,
    Error,
    { deliverableId: string; input: UpdateDeliverableInput }
  >;
  remove: UseMutationResult<unknown, Error, string>;
}

export function DeliverablesSection({
  deliverables,
  add,
  update,
  remove,
}: DeliverablesSectionProps) {
  const [adding, setAdding] = useState(false);
  // Kept after the edit sheet closes so it fades out intact.
  const [editing, setEditing] = useState<Deliverable | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  // Re-keys the sheets per opening, so they start from the deliverable as it is, or empty.
  const [sheetKey, setSheetKey] = useState(0);

  const openAdd = () => {
    add.reset();
    setSheetKey((key) => key + 1);
    setAdding(true);
  };

  const openEdit = (item: Item) => {
    update.reset();
    remove.reset();
    setEditing({ ...item, quantity: item.quantity ?? item.total ?? 1 });
    setSheetKey((key) => key + 1);
    setEditOpen(true);
  };

  return (
    <>
      <DeliverablesCard deliverables={deliverables} onAdd={openAdd} onEdit={openEdit} />
      <AddDeliverablesSheet
        key={`add-${sheetKey}`}
        visible={adding}
        onClose={() => setAdding(false)}
        onAdd={(input) =>
          add.mutate(input, {
            onSuccess: () => {
              setAdding(false);
              showToast('Deliverables added');
            },
          })
        }
        busy={add.isPending}
        error={add.isError ? 'Couldn’t add the deliverables. Please try again.' : null}
      />
      <EditDeliverableSheet
        key={`edit-${sheetKey}`}
        visible={editOpen}
        onClose={() => setEditOpen(false)}
        deliverable={editing}
        onSave={(input) => {
          if (!editing) return;
          update.mutate(
            { deliverableId: editing.id, input },
            {
              onSuccess: () => {
                setEditOpen(false);
                showToast('Deliverable updated');
              },
            },
          );
        }}
        onRemove={() => {
          if (!editing) return;
          remove.mutate(editing.id, {
            onSuccess: () => {
              setEditOpen(false);
              showToast(`${editing.title} removed`);
            },
          });
        }}
        saving={update.isPending}
        removing={remove.isPending}
        error={
          update.isError
            ? 'Couldn’t save this deliverable. Please try again.'
            : remove.isError
              ? 'Couldn’t remove this deliverable. Please try again.'
              : null
        }
      />
    </>
  );
}
