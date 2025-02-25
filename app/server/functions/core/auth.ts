import { createServerFn } from "@tanstack/start";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { authMiddleware } from "@/middleware/auth";
import { getWebRequest, setCookie, getCookie, getHeaders } from "@tanstack/start/server";

export const $getSessionAndUser = createServerFn({ method: "GET" }).handler(
  async () => {
    const webRequest = getWebRequest();
    const cookie = getCookie('better-auth.session_token');
    if (!webRequest?.headers) {
      throw new Error("No headers");
    }
    const session = await auth.api.getSession({
      headers: new Headers({
        cookie: `better-auth.session_token=${cookie}`
      })
    });

    let organization = null;
    if (session?.session) {
      organization = await auth.api.getFullOrganization({
        headers: new Headers({
          cookie: `better-auth.session_token=${cookie}`
        })
      });
    }

    return {
      session: session?.session,
      user: session?.user,
      organization: organization,
    };
  },
);


export const $signUp = createServerFn({ method: "POST" })
  .validator(
    z.object({
      name: z.string().min(1),
      email: z.string().min(1),
      password: z.string().min(1),
      callbackURL: z.string().min(1),
    }),
  )
  .handler(async ({ context, data }) => {
    const cookie = getCookie('better-auth.session_token');

    await auth.api.signUpEmail({
      headers: new Headers({
        cookie: `better-auth.session_token=${cookie}`
      }),
      body: {
        name: data.name,
        email: data.email,
        password: data.password,
        callbackURL: data.callbackURL,
      },
    });
  });

export const $forgetPassword = createServerFn({ method: "POST" })
  .validator(
    z.object({
      email: z.string().min(1),
      redirectTo: z.string().min(1),
    }),
  )
  .handler(async ({ context, data }) => {
    const cookie = getCookie('better-auth.session_token');

    await auth.api.forgetPassword({
      headers: new Headers({
        cookie: `better-auth.session_token=${cookie}`
      }),
      body: {
        email: data.email,
        redirectTo: "/reset-password",
      },
    });
  });

export const $resetPassword = createServerFn({ method: "POST" })
  .validator(
    z.object({
      newPassword: z.string().min(1),
      token: z.string().min(1),
    }),
  )
  .handler(async ({ context, data }) => {
    const cookie = getCookie('better-auth.session_token');

    await auth.api.resetPassword({
      headers: new Headers({
        cookie: `better-auth.session_token=${cookie}`
      }),
      body: {
        newPassword: data.newPassword,
        token: data.token,
      },
    });
  });

export const $signIn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      email: z.string().min(1),
      password: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const cookie = getCookie('better-auth.session_token');

    const response = await auth.api.signInEmail({
      headers: new Headers({
        cookie: `better-auth.session_token=${cookie}`
      }),
      body: {
        email: data.email,
        password: data.password,
      },
      asResponse: true,
    });
    
    const sessionToken = response.headers.get('set-cookie')
    if (sessionToken) {
      const sessionTokenCookie = sessionToken.split(';')[0]
      const sessionTokenValue = sessionTokenCookie.split('=')[1]
      setCookie('better-auth.session_token', sessionTokenValue, {
        httpOnly: true,
        secure: true,
      })
    }
    return {
      success: true,
    };
  });

export const $signOut = createServerFn({ method: "POST" }).handler(
  async ({ context, data }) => {
    const cookie = getCookie('better-auth.session_token');

    await auth.api.signOut({
      headers: new Headers({
        cookie: `better-auth.session_token=${cookie}`
      }),
    });
  },
);

/** ORG */
export const $getUsersOrganizations = createServerFn({ method: "GET" }).handler(
  async () => {
    const cookie = getCookie('better-auth.session_token');
    
    const organizations = await auth.api.listOrganizations({
      headers: new Headers({
        cookie: `better-auth.session_token=${cookie}`
      }),
    });
    return organizations;
  },
);

export const $setActiveOrganization = createServerFn({ method: "POST" })
  .validator(z.object({ organizationId: z.string().nullable() }))
  .handler(async ({ data }) => {
    const cookie = getCookie('better-auth.session_token');

    const organization = await auth.api.setActiveOrganization({
      headers: new Headers({
        cookie: `better-auth.session_token=${cookie}`
      }),
      body: {
        organizationId: data.organizationId,
      },
    });
    return organization;
  });

export const $getActiveOrganization = createServerFn({ method: "GET" }).handler(
  async () => {
    const cookie = getCookie('better-auth.session_token');
    
    const organization = await auth.api.getFullOrganization({
      headers: new Headers({
        cookie: `better-auth.session_token=${cookie}`
      }),
    });
    return organization;
  },
);

export const $getActiveOrganizationMembers = createServerFn({
  method: "GET",
}).handler(async () => {
  const cookie = getCookie('better-auth.session_token');
  
  const activeOrganization = await auth.api.getFullOrganization({
    headers: new Headers({
      cookie: `better-auth.session_token=${cookie}`
    }),
  });

  if (!activeOrganization) {
    throw new Error("Active organization not found");
  }

  type MemberInfo = {
    id: string;
    organizationId: string;
    email: string;
    role: string;
    status: string;
    createdAt?: Date;
    user?: any;
    expiresAt?: Date;
    inviterId?: string;
  };

  const emailMap = new Map<string, MemberInfo>();

  for (const member of activeOrganization.members) {
    emailMap.set(member.user.email, {
      id: member.id,
      organizationId: member.organizationId,
      email: member.user.email,
      role: member.role,
      status: "active",
      createdAt: member.createdAt,
      user: member.user,
    });
  }

  for (const invitation of activeOrganization.invitations) {
    const existingEntry = emailMap.get(invitation.email);
    if (
      !existingEntry ||
      (invitation.expiresAt &&
        (!existingEntry.expiresAt ||
          invitation.expiresAt > existingEntry.expiresAt) &&
        existingEntry.status !== "active")
    ) {
      emailMap.set(invitation.email, {
        id: invitation.id,
        organizationId: invitation.organizationId,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        inviterId: invitation.inviterId,
        expiresAt: invitation.expiresAt,
      });
    }
  }

  const members = Array.from(emailMap.values());

  return members;
});

export const $getUserRoleForOrganization = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const userId = context.userId;
    const cookie = getCookie('better-auth.session_token');
    
    const organization = await auth.api.getFullOrganization({
      headers: new Headers({
        cookie: `better-auth.session_token=${cookie}`
      }),
    });

    if (!organization) {
      return null;
    }

    const member = organization.members.find(
      (member) => member.userId === userId,
    );

    if (!member) {
      return null;
    }

    return member.role;
  });


