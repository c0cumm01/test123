import { Resend } from "resend";

import { ValidationEmail } from "@/email-templates/email-validation-email.tsx";
import { OrganizationInvitation } from "@/email-templates/organization-invitation-email";
import { PasswordResetEmail } from "@/email-templates/password-reset-email";

const resend = new Resend(process.env.RESEND_API_KEY ?? "NO_API_KEY");
const appOrigin = process.env.APP_ORIGIN ?? "NO_APP_ORIGIN";
const emailFrom = process.env.EMAIL_FROM ?? "NO_EMAIL_FROM";
const authEndpoint = `${appOrigin}/api/auth`;

export function sendVerificationEmail(
  userEmail: string,
  verificationUrl: string,
) {
  return resend.emails.send({
    from: emailFrom!,
    to: userEmail,
    subject: "Please Verify Your Email!",
    react: <ValidationEmail url={`${authEndpoint}${verificationUrl}`} />,
  });
}

export function sendPasswordResetEmail(userEmail: string, resetUrl: string) {
  return resend.emails.send({
    from: emailFrom!,
    to: userEmail,
    subject: "Password Reset Request!",
    react: <PasswordResetEmail url={`${authEndpoint}${resetUrl}`} />,
  });
}

export function sendOrganizationInvitation({
  email,
  invitedByUsername,
  invitedByEmail,
  organizationName,
  inviteLink,
}: {
  email: string;
  invitedByUsername: string;
  invitedByEmail: string;
  organizationName: string;
  inviteLink: string;
}) {
  return resend.emails.send({
    from: emailFrom!,
    to: email,
    subject: `${invitedByUsername} has invited you to join ${organizationName}`,
    react: (
      <OrganizationInvitation
        email={email}
        invitedByUsername={invitedByUsername}
        invitedByEmail={invitedByEmail}
        organizationName={organizationName}
        inviteLink={`${appOrigin}${inviteLink}`}
      />
    ),
  });
}
