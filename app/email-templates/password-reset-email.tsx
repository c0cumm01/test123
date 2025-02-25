import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export const PasswordResetEmail = (props: { url: string }) => (
  <Html>
    <Head />
    <Preview>Reset your password</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Text style={heading}>Password Reset Request</Text>
          <Hr style={hr} />
          <Text style={paragraph}>
            We received a request to reset your password. If you didn't make
            this request, you can safely ignore this email.
          </Text>
          <Text style={paragraph}>
            To reset your password, click the button below:
          </Text>
          <Section style={buttonContainer}>
            <Link href={props.url} style={button}>
              Reset Password
            </Link>
          </Section>
          <Text style={paragraph}>
            Or copy and paste this URL into your browser:
            <br />
            <Link href={props.url} style={link}>
              {props.url}
            </Link>
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            This password reset link will expire in 1 hour. If you need to reset
            your password after that, please request a new reset link.
          </Text>
          <Text style={footer}>
            This email was sent automatically by Sedrino
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const box = {
  padding: "0 48px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const heading = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
};

const paragraph = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "30px 0",
};

const button = {
  backgroundColor: "#4F46E5",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 30px",
  cursor: "pointer",
};

const link = {
  color: "#4F46E5",
  textDecoration: "underline",
  fontSize: "14px",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
  marginTop: "20px",
};
