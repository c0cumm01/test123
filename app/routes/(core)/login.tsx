import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodSearchValidator } from "@tanstack/router-zod-adapter";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSignInMutation } from "@/query/core/mutations/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginForm = z.infer<typeof loginSchema>;

const loginSearchSchema = z.object({
  invitation: z.string().optional(),
});

export const Route = createFileRoute("/(core)/login")({
  component: RouteComponent,
  validateSearch: zodSearchValidator(loginSearchSchema),
});

function RouteComponent() {
  const navigate = useNavigate();
  const signInMutation = useSignInMutation();
  let search = Route.useSearch();
  search = search?.invitation ? search : {};

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<LoginForm>({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      try {
        await signInMutation.mutateAsync({
          email: value.email,
          password: value.password,
        });
        if (search.invitation) {
          navigate({
            to: "/",
            search: {
              invitation: search.invitation,
            },
          });
        } else {
          navigate({ to: "/" });
        }
      } catch (error) {
        console.error(error);
        setErrorMessage("Invalid username or password");
      }
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Login</h1>
          <p className="text-gray-500">Enter your credentials to continue</p>
        </CardHeader>

        <CardContent>
          {errorMessage && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}

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
                onChange: loginSchema.shape.email,
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

            <form.Field
              name="password"
              validators={{
                onChange: loginSchema.shape.password,
              }}
            >
              {(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <Input
                    id={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="********"
                  />{" "}
                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-2 text-sm text-red-600">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <div className="mt-6 flex flex-col items-center gap-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!canSubmit}
                  >
                    {isSubmitting ? "..." : "Sign in"}
                  </Button>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-gray-600 transition-colors hover:text-gray-800"
                  >
                    Forgot password?
                  </Link>
                  <Link
                    to="/register"
                    search={search}
                    className="text-sm text-gray-600 transition-colors hover:text-gray-800"
                  >
                    Need an account? Register
                  </Link>
                </div>
              )}
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
