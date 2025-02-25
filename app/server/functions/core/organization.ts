import { createServerFn } from "@tanstack/start";
import { getWebRequest } from "vinxi/http";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { authMiddleware } from "@/middleware/auth";

export const $createOrganization = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(
        z.object({
            name: z.string().min(1),
            slug: z.string().min(1),
            logo: z.string().optional(),
        }),
    )
    .handler(async ({ context, data }) => {
        const rv = await auth.api.createOrganization({
            body: {
                name: data.name,
                slug: data.slug,
                userId: context.userId,
                logo: data.logo,
            },
        });
        return rv;
    });

export const $acceptInvitation = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(
        z.object({
            invitation: z.string().min(1),
        }),
    )
    .handler(async ({ context, data }) => {
        const webRequest = getWebRequest();

        const invitationHandlers = {
            default: async () => {
                const rv = await auth.api.acceptInvitation({
                    headers: webRequest.headers,
                    body: {
                        invitationId: data.invitation,
                    },
                });
                return rv;
            },
        };

        const invitationType = data.invitation
            ? ((data.invitation.split("-")[0] +
                "-") as keyof typeof invitationHandlers)
            : "default";
        const handler = invitationHandlers[invitationType] ||
            invitationHandlers.default;
        return await handler();
    });

export const $organizationInviteMember = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(
        z.object({
            email: z.string().min(1),
            role: z.enum(["member", "owner", "admin"]),
        }),
    )
    .handler(async ({ context, data }) => {
        const webRequest = getWebRequest();

        auth.api.createInvitation({
            headers: webRequest.headers,
            body: {
                email: data.email,
                role: data.role,
            },
        });
    });

export const $changeMemberRole = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(
        z.object({
            memberId: z.string().min(1),
            newRole: z.enum(["member", "owner", "admin"]),
        }),
    )
    .handler(async ({ context, data }) => {
        const webRequest = getWebRequest();

        await auth.api.updateMemberRole({
            headers: webRequest.headers,
            body: {
                memberId: data.memberId,
                role: data.newRole,
            },
        });
    });

export const $removeMember = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(
        z.object({
            memberId: z.string().min(1),
        }),
    )
    .handler(async ({ context, data }) => {
        const webRequest = getWebRequest();

        await auth.api.removeMember({
            headers: webRequest.headers,
            body: {
                memberIdOrEmail: data.memberId,
            },
        });
    });
export const $revokeInvitation = createServerFn({ method: "POST" })
    .validator(
        z.object({
            invitationId: z.string(),
        }),
    )
    .handler(async ({ data }) => {
        const webRequest = getWebRequest();
        const revokedInvitation = await auth.api.cancelInvitation({
            headers: webRequest.headers,
            body: {
                invitationId: data.invitationId,
            },
        });
        return revokedInvitation;
    });
