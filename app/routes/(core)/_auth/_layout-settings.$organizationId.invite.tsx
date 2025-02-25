import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrganizationInviteMemberMutation } from "@/query/core/mutations/organization";

export const Route = createFileRoute(
  "/(core)/_auth/_layout-settings/$organizationId/invite",
)({
  component: OrganizationInviteComponent,
});

function OrganizationInviteComponent() {
  const navigate = useNavigate();
  const { organizationId } = Route.useParams();
  const createOrgInviteFormSchema = z.object({
    organizationInvitation: z.object({
      email: z.string().min(1, "email is required"),
      role: z.string().min(1, "role is required"),
    }),
  });

  const organizationInviteMemberMutation =
    useOrganizationInviteMemberMutation();

  const form = useForm({
    defaultValues: {
      organizationInvitation: {
        email: "",
        role: "",
      },
    } as z.input<typeof createOrgInviteFormSchema>,
    onSubmit: async ({ value }) => {
      try {
        const submitValue = createOrgInviteFormSchema.parse(value);
        await organizationInviteMemberMutation.mutateAsync(
          {
            email: submitValue.organizationInvitation.email,
            role: submitValue.organizationInvitation.role as "member" | "admin",
          },
          {
            onSuccess: () => {
              navigate({
                to: "/$organizationId/members",
                params: {
                  organizationId: organizationId,
                },
              });
            },
          },
        );
      } catch (error) {
        console.error(error);
      }
    },
    validators: {
      onChange: createOrgInviteFormSchema,
    },
  });

  return (
    <div className="flex flex-col gap-4 p-8">
      <Card>
        <CardHeader>
          <h1 className="mb-4 text-2xl font-bold">
            Create Organization Invitation
          </h1>
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
            <form.Field name="organizationInvitation.email">
              {(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email *
                  </label>
                  <Input
                    id={field.name}
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Enter email"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-2 text-sm text-red-600">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
            <form.Field name="organizationInvitation.role">
              {(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Role *
                  </label>
                  <Select
                    value={field.state.value}
                    onValueChange={field.handleChange}
                  >
                    <SelectTrigger id={field.name}>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-2 text-sm text-red-600">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
            <div className="flex space-x-2">
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!canSubmit}
                  >
                    {isSubmitting ? "..." : "Invite member to organization"}
                  </Button>
                )}
              />

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  navigate({
                    to: "/$organizationId/members",
                    params: {
                      organizationId: organizationId,
                    },
                  })
                }
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
