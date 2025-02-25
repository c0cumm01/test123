import { queryClient } from "@/query/client";
import { $acceptInvitation } from "@/server/functions/core/organization";

export async function acceptInvitation(invitationId: string) {
  try {
    const response = await $acceptInvitation({
      data: { invitation: invitationId },
    });
    if (!response) {
      throw new Error("Failed to accept invitation");
    }
    queryClient.invalidateQueries({ queryKey: [] });

    return true;
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return false;
  }
}
