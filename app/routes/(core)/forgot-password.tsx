import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useForgetPasswordMutation } from "@/query/core/mutations/auth";

const forgotPasswordSchema = z.object({
  email: z.string().email().nonempty(),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export const Route = createFileRoute("/(core)/forgot-password")({
  component: RouteComponent,
});

function RouteComponent() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const forgetPasswordMutation = useForgetPasswordMutation();

  const form = useForm<ForgotPasswordForm>({
    defaultValues: {
      email: "",
    },

    onSubmit: async ({ value }) => {
      {
        try {
          await forgetPasswordMutation.mutateAsync({
            email: value.email,
            redirectTo: "/reset-password",
          });
        } catch (error) {
          console.error(error);
        } finally {
          setIsSubmitted(true);
        }
        setIsSubmitted(true);
      }
    },
  });

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Email Sent</h1>
            <p className="text-gray-500">
              Please check your email for password reset instructions.
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <Link
              to="/login"
              className="text-sm text-gray-600 transition-colors hover:text-gray-800"
            >
              Back to login
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Forgot Password</h1>
          <p className="text-gray-500">Enter your email to continue</p>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <form.Field
              name="email"
              validators={{
                onChange: forgotPasswordSchema.shape.email,
              }}
            >
              {(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="email@example.com"
                  />{" "}
                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-2 text-sm text-red-600">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <div className="mt-6 flex flex-col items-center gap-2">
              <Button type="submit" className="w-full">
                Request Password Reset
              </Button>
              <Link
                to="/login"
                className="text-sm text-gray-600 transition-colors hover:text-gray-800"
              >
                Back to login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
