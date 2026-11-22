"use client";

import { useTransition } from "react";
import { ConfirmButton } from "@/components/ConfirmButton";
import { Icon } from "@/components/Icon";
import { deleteEvent } from "@/lib/actions";

export function DeleteEvent({ id }: { id: string }) {
  const [, start] = useTransition();
  return (
    <ConfirmButton label="Șterge programul" confirmText="Sigur? Șterge" onConfirm={() => start(() => deleteEvent(id))}>
      <Icon name="trash" />
      Șterge
    </ConfirmButton>
  );
}
