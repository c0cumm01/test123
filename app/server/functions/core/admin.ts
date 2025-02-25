import { createServerFn } from "@tanstack/start";
import { getWebRequest } from "vinxi/http";
import { z } from "zod";

import { auth } from "@/lib/auth";

export const $listAllUsers = createServerFn({ method: "GET" })
  .validator(
    z.object({
      searchValue: z.string().optional(),
      limit: z.number().optional(),
      offset: z.number().optional(),
      sortBy: z.string().optional(),
      sortDirection: z.string().optional(),
      filterField: z.string().optional(),
      filterOperator: z.string().optional(),
      filterValue: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const webRequest = getWebRequest();
    const users = await auth.api.listUsers({
      headers: webRequest.headers,
      query: {
        searchField: "email",
        searchOperator: "contains",
        searchValue: data.searchValue,
        limit: data.limit || 10,
        offset: data.offset || 0,
        sortBy: data.sortBy || "createdAt",
        sortDirection: (data.sortDirection as "asc" | "desc") || "desc",
        filterField: data.filterField || "role",
        filterOperator:
          (data.filterOperator as "eq" | "ne" | "lt" | "lte" | "gt" | "gte") ||
          "eq",
        filterValue: data.filterValue,
      },
    });

    return users;
  });

export const $setUserRole = createServerFn({ method: "POST" })
  .validator(
    z.object({
      userId: z.string(),
      role: z.enum(["user", "admin"]),
    }),
  )
  .handler(async ({ data }) => {
    const webRequest = getWebRequest();
    const updatedUser = await auth.api.setRole({
      headers: webRequest.headers,
      body: {
        userId: data.userId,
        role: data.role,
      },
    });
    return updatedUser;
  });

export const $banUser = createServerFn({ method: "POST" })
  .validator(
    z.object({
      userId: z.string(),
      banReason: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const webRequest = getWebRequest();
    const bannedUser = await auth.api.banUser({
      headers: webRequest.headers,
      body: {
        userId: data.userId,
        banReason: data.banReason,
      },
    });
    return bannedUser;
  });

export const $unbanUser = createServerFn({ method: "POST" })
  .validator(
    z.object({
      userId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const webRequest = getWebRequest();
    const unbannedUser = await auth.api.unbanUser({
      headers: webRequest.headers,
      body: {
        userId: data.userId,
      },
    });
    return unbannedUser;
  });

export const $removeUser = createServerFn({ method: "POST" })
  .validator(
    z.object({
      userId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const webRequest = getWebRequest();
    /**
     * cascade delete so no FK violations or soft delete TODO @mfrancis107 @c0cumm01
     */
    const removedUser = await auth.api.removeUser({
      headers: webRequest.headers,
      body: {
        userId: data.userId,
      },
    });
    return removedUser;
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
export const $listUserSessions = createServerFn({ method: "GET" })
  .validator(
    z.object({
      userId: z.string(),
      searchValue: z.string().optional(),
      limit: z.number().optional(),
      offset: z.number().optional(),
      sortBy: z.enum(["createdAt", "expiresAt", "ipAddress"]).optional(),
      sortDirection: z.enum(["asc", "desc"]).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const webRequest = getWebRequest();
    const userSessions = await auth.api.listUserSessions({
      headers: webRequest.headers,
      body: {
        userId: data.userId,
        searchValue: data.searchValue,
        limit: data.limit,
        offset: data.offset,
        sortBy: data.sortBy,
        sortDirection: data.sortDirection,
      },
    });
    return userSessions;
  });

export const $revokeUserSessions = createServerFn({ method: "POST" })
  .validator(
    z.object({
      sessionToken: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const webRequest = getWebRequest();
    const revokedSessions = await auth.api.revokeUserSession({
      headers: webRequest.headers,
      body: {
        sessionToken: data.sessionToken,
      },
    });
    return revokedSessions;
  });

export const $impersonateUser = createServerFn({ method: "POST" })
  .validator(
    z.object({
      userId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const webRequest = getWebRequest();
    const impersonatedUser = await auth.api.impersonateUser({
      headers: webRequest.headers,
      body: {
        userId: data.userId,
      },
      asResponse: true,
    });

    return impersonatedUser;
  });

export const $stopImpersonatingUser = createServerFn({
  method: "POST",
}).handler(async () => {
  const webRequest = getWebRequest();
  const stoppedImpersonating = await auth.api.stopImpersonating({
    headers: webRequest.headers,
    asResponse: true,
  });
  return stoppedImpersonating;
});
