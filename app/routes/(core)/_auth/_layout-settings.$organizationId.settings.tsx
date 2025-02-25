import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { activeOrganizationOptions } from "@/query/core/options/auth";

export const Route = createFileRoute(
  "/(core)/_auth/_layout-settings/$organizationId/settings",
)({
  component: CreateOrganizationComponent,
});

function CreateOrganizationComponent() {
  const navigate = useNavigate();

  const { data: activeOrganization } = useQuery(activeOrganizationOptions());
  return (
    <div className="flex flex-col gap-4 p-8">
      <Card>
        <CardHeader>
          <h1 className="mb-4 text-2xl font-bold">
            {activeOrganization?.name} Settings
          </h1>
        </CardHeader>
        <CardContent></CardContent>
      </Card>
    </div>
  );
}
