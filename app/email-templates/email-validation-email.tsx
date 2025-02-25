import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export const ValidationEmail = (props: { url: string }) => (
  <Html>
    <Head />
    <Preview>Verify your email address</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Text style={heading}>Verify Your Email Address</Text>
          <Hr style={hr} />
          <Text style={paragraph}>
            Thanks for signing up! Please click the button below to verify your
            email address:
          </Text>
          <Section style={buttonContainer}>
            <Button
              style={{
                ...button,
                padding: "12px 20px",
              }}
              href={props.url}
            >
              Verify Email Address
            </Button>
          </Section>
          <Text style={paragraph}>
            If the button doesn't work, you can also copy and paste this link
            into your browser:
          </Text>
          <Text style={link}>{props.url}</Text>
          <Hr style={hr} />
          <Text style={footer}>
            If you didn't request this email, you can safely ignore it.
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
  textAlign: "center" as const,
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "24px 0",
};

const button = {
  backgroundColor: "#5469d4",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
};

const link = {
  color: "#5469d4",
  fontSize: "14px",
  textAlign: "center" as const,
  wordBreak: "break-all" as const,
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
};

export default ValidationEmail;
