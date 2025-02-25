import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { queryClient } from "@/query/client";
import { useSetActiveOrganizationMutation } from "@/query/core/mutations/auth";
import { useCreateOrganizationMutation } from "@/query/core/mutations/organization";

export const Route = createFileRoute("/(core)/_auth/_layout-default/create-org")({
  component: CreateOrganizationComponent,
});

function CreateOrganizationComponent() {
  const navigate = useNavigate();

  const createOrgFormSchema = z.object({
    organization: z.object({
      name: z.string().min(1, "Organization name is required"),
      slug: z.string().min(1, "Slug is required"),
      logo: z.union([
        z.string().url("Logo must be a valid URL"),
        z.literal(""),
      ]),
    }),
  });

  const createOrganizationMutation = useCreateOrganizationMutation();
  const setActiveOrganizationMutation = useSetActiveOrganizationMutation();

  const form = useForm({
    defaultValues: {
      organization: {
        name: "",
        slug: "",
        logo: "",
      },
    } as z.input<typeof createOrgFormSchema>,
    onSubmit: async ({ value }) => {
      const submitValue = createOrgFormSchema.parse(value);
      const createdOrganization = await createOrganizationMutation.mutateAsync(
        submitValue.organization,
        {
          onSuccess: async () => {
            toast.success("Organization created successfully");
          },
          onError: () => {
            toast.error("Failed to create organization");
          },
        },
      );

      if (createdOrganization) {
        await setActiveOrganizationMutation.mutateAsync(createdOrganization.id);
      }
      queryClient.invalidateQueries({
        queryKey: [],
      });
      navigate({ to: "/" });
    },
    validators: {
      onChange: createOrgFormSchema,
    },
  });

  return (
    <div className="flex flex-col gap-4 p-8">
      <Card>
        <CardHeader>
          <h1 className="mb-4 text-2xl font-bold">Create Organization</h1>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="max-w-xl space-y-4"
          >
            <form.Field name="organization.name">
              {(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Organization Name *
                  </label>
                  <Input
                    id={field.name}
                    type="text"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Enter organization name"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-2 text-sm text-red-600">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
            <form.Field name="organization.slug">
              {(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Slug *
                  </label>
                  <Input
                    id={field.name}
                    type="text"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Enter slug"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-2 text-sm text-red-600">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
            <form.Field name="organization.logo">
              {(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Logo URL (Optional)
                  </label>
                  <Input
                    id={field.name}
                    type="text"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Enter logo URL"
                  />
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
                <div className="flex space-x-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!canSubmit}
                  >
                    {isSubmitting ? "..." : "Create Organization"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate({ to: "/" })}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
