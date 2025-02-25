import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Shield, Trash } from "lucide-react";
import { z } from "zod";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRevokeUserSessionsMutation } from "@/query/core/mutations/admin";
import { listUserSessionsOptions } from "@/query/core/options/admin";

const userSessionsSearchSchema = z.object({
  search: z.string().catch(""),
  page: z.coerce.number().min(1).catch(1),
  limit: z.coerce.number().min(1).catch(10),
  sortBy: z.enum(["createdAt", "expiresAt", "ipAddress"]).catch("createdAt"),
  sortDirection: z.enum(["asc", "desc"]).catch("desc"),
});

export const Route = createFileRoute(
  "/(core)/_admin/_layout-default/admin/$userId/user-sessions",
)({
  component: UserSessionsComponent,
  validateSearch: userSessionsSearchSchema,
});

function SessionsTable({
  data,
  search,
  navigate,
}: {
  data: any;
  search: z.infer<typeof userSessionsSearchSchema>;
  navigate: (opts: { search: any }) => void;
}) {
  const columnHelper = createColumnHelper<any>();
  const revokeUserSessionsMutation = useRevokeUserSessionsMutation();

  const columns = [
    columnHelper.accessor("ipAddress", {
      header: () => (
        <Button
          variant="ghost"
          onClick={() =>
            navigate({
              search: {
                ...search,
                sortBy: "ipAddress",
                sortDirection:
                  search.sortBy === "ipAddress" &&
                  search.sortDirection === "asc"
                    ? "desc"
                    : "asc",
              },
            })
          }
        >
          IP Address
          {search.sortBy === "ipAddress" && (
            <span>{search.sortDirection === "asc" ? " ↑" : " ↓"}</span>
          )}
        </Button>
      ),
      cell: (info) => <span className="font-mono">{info.getValue()}</span>,
    }),
    columnHelper.accessor("userAgent", {
      header: "User Agent",
      cell: (info) => {
        const userAgent = info.getValue();
        const truncatedUserAgent =
          userAgent.length > 20 ? `${userAgent.slice(0, 20)}...` : userAgent;

        return (
          <span
            className="cursor-help text-xs text-muted-foreground"
            title={userAgent}
          >
            {truncatedUserAgent}
          </span>
        );
      },
    }),
    columnHelper.accessor("createdAt", {
      header: () => (
        <Button
          variant="ghost"
          onClick={() =>
            navigate({
              search: {
                ...search,
                sortBy: "createdAt",
                sortDirection:
                  search.sortBy === "createdAt" &&
                  search.sortDirection === "asc"
                    ? "desc"
                    : "asc",
              },
            })
          }
        >
          Created
          {search.sortBy === "createdAt" && (
            <span>{search.sortDirection === "asc" ? " ↑" : " ↓"}</span>
          )}
        </Button>
      ),
      cell: (info) => (
        <span className="font-mono">
          {new Date(info.getValue()).toLocaleString()}
        </span>
      ),
    }),
    columnHelper.accessor("expiresAt", {
      header: () => (
        <Button
          variant="ghost"
          onClick={() =>
            navigate({
              search: {
                ...search,
                sortBy: "expiresAt",
                sortDirection:
                  search.sortBy === "expiresAt" &&
                  search.sortDirection === "asc"
                    ? "desc"
                    : "asc",
              },
            })
          }
        >
          Expires
          {search.sortBy === "expiresAt" && (
            <span>{search.sortDirection === "asc" ? " ↑" : " ↓"}</span>
          )}
        </Button>
      ),
      cell: (info) => {
        const expiresAt = new Date(info.getValue());
        const isExpired = expiresAt < new Date();
        return (
          <Badge variant={isExpired ? "destructive" : "default"}>
            {expiresAt.toLocaleString()}
          </Badge>
        );
      },
    }),
    columnHelper.accessor("impersonatedBy", {
      header: "Impersonated",
      cell: (info) => {
        const impersonatedBy = info.getValue();
        return impersonatedBy ? (
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="secondary">
                <Shield className="mr-1 h-3 w-3" />
                Impersonated
              </Badge>
            </TooltipTrigger>
            <TooltipContent>Impersonated by: {impersonatedBy}</TooltipContent>
          </Tooltip>
        ) : null;
      },
    }),

    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (props) => (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Trash className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Revoke Session</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to revoke this session? The user will be
                logged out immediately.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  revokeUserSessionsMutation.mutate({
                    sessionToken: props.row.original.id,
                  });
                }}
              >
                Revoke
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ),
    }),
  ];

  const table = useReactTable({
    data: data.sessions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="text-center">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2 py-4">
        <div className="flex items-center gap-2">
          <Select
            value={search.limit.toString()}
            onValueChange={(value) =>
              navigate({
                search: { ...search, limit: parseInt(value), page: 1 },
              })
            }
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">Items per page</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigate({
                search: { ...search, page: Math.max(1, search.page - 1) },
              })
            }
            disabled={search.page === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigate({
                search: { ...search, page: search.page + 1 },
              })
            }
            disabled={data.sessions.length < search.limit}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

function UserSessionsComponent() {
  const { userId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data } = useQuery(
    listUserSessionsOptions({
      userId,
      searchValue: search.search,
      limit: search.limit,
      offset: (search.page - 1) * search.limit,
      sortBy: search.sortBy as "createdAt" | "expiresAt" | "ipAddress",
      sortDirection: search.sortDirection as "asc" | "desc",
    }),
  );

  return (
    <div className="flex flex-col gap-4 p-8">
      <Card>
        <CardHeader>
          <CardTitle>User Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search sessions..."
              value={search.search}
              onChange={(e) =>
                navigate({
                  search: { ...search, search: e.target.value, page: 1 },
                })
              }
            />
          </div>
          <SessionsTable data={data} search={search} navigate={navigate} />
        </CardContent>
      </Card>
    </div>
  );
}
