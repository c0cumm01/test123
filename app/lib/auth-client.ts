import { $getSessionAndUser } from "@/server/functions/core/auth";

let cachedSession: any = null;
let cachedUser: any = null;

export async function getSessionAndUser() {
  // Only check cache if we're in the browser
  if (typeof window !== "undefined" && cachedSession && cachedUser) {
    return { session: cachedSession, user: cachedUser };
  }

  const { session, user } = await $getSessionAndUser();

  // Cache the results if in browser
  if (typeof window !== "undefined") {
    cachedSession = session;
    cachedUser = user;
  }

  return { session, user };
}
