import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Ban, Trash2, Unlock, UserIcon } from "lucide-react";
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  useBanUserMutation,
  useImpersonateUserMutation,
  useRemoveUserMutation,
  useSetUserRoleMutation,
  useUnbanUserMutation,
} from "@/query/core/mutations/admin";
import { listAllUsersOptions } from "@/query/core/options/admin";

const usersSearchSchema = z.object({
  search: z.string().catch(""),
  page: z.coerce.number().min(1).catch(1),
  limit: z.coerce.number().min(1).catch(10),
  sortBy: z.enum(["name", "email", "role", "createdAt"]).catch("createdAt"),
  sortDirection: z.enum(["asc", "desc"]).catch("desc"),
  filterField: z.enum(["role", "banned"]).catch("role"),
  filterOperator: z.enum(["eq"]).catch("eq"),
  filterValue: z.string().catch("all"),
});

export const Route = createFileRoute("/(core)/_admin/_layout-default/admin/users")({
  component: UsersComponent,
  validateSearch: usersSearchSchema,
});

function BanUserDialog({
  user,
  open,
  onOpenChange,
}: {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [banReason, setBanReason] = useState("");
  const banUserMutation = useBanUserMutation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ban User</DialogTitle>
          <DialogDescription>
            Are you sure you want to ban {user.name}? This action can be
            reversed later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="Reason for ban..."
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={() => {
              banUserMutation.mutate({
                userId: user.id,
                banReason,
              });
              onOpenChange(false);
            }}
          >
            Ban User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UsersTable({
  data,
  search,
  navigate,
}: {
  data: any;
  search: z.infer<typeof usersSearchSchema>;
  navigate: (opts: { search: any }) => void;
}) {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const setUserRoleMutation = useSetUserRoleMutation();
  const deleteUserMutation = useRemoveUserMutation();
  const columnHelper = createColumnHelper<any>();
  const unbanUserMutation = useUnbanUserMutation();
  const impersonateUserMutation = useImpersonateUserMutation();

  const nav = useNavigate();

  const columns = [
    columnHelper.display({
      id: "impersonate",
      header: "",
      cell: (props) => (
        <div>
          <Button
            title="Impersonate User"
            onClick={async () => {
              await impersonateUserMutation.mutateAsync({
                userId: props.row.original.id,
              });
              nav({
                to: "/",
              });
            }}
          >
            Impersonate User
          </Button>
        </div>
      ),
    }),
    columnHelper.accessor("name", {
      header: () => (
        <Button
          variant="ghost"
          onClick={() =>
            navigate({
              search: {
                ...search,
                sortBy: "name",
                sortDirection:
                  search.sortBy === "name" && search.sortDirection === "asc"
                    ? "desc"
                    : "asc",
              },
            })
          }
        >
          Name
          {search.sortBy === "name" && (
            <span>{search.sortDirection === "asc" ? " ↑" : " ↓"}</span>
          )}
        </Button>
      ),
      cell: (info) => <span className="font-semibold">{info.getValue()}</span>,
    }),
    columnHelper.accessor("email", {
      header: () => (
        <Button
          variant="ghost"
          onClick={() =>
            navigate({
              search: {
                ...search,
                sortBy: "email",
                sortDirection:
                  search.sortBy === "email" && search.sortDirection === "asc"
                    ? "desc"
                    : "asc",
              },
            })
          }
        >
          Email
          {search.sortBy === "email" && (
            <span>{search.sortDirection === "asc" ? " ↑" : " ↓"}</span>
          )}
        </Button>
      ),
      cell: (info) => (
        <div className="flex flex-col">
          <span>
            {info.getValue()}
            {info.row.original.emailVerified && (
              <Badge variant="secondary" className="ml-2">
                Verified
              </Badge>
            )}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor("role", {
      header: () => (
        <Button
          variant="ghost"
          onClick={() =>
            navigate({
              search: {
                ...search,
                sortBy: "role",
                sortDirection:
                  search.sortBy === "role" && search.sortDirection === "asc"
                    ? "desc"
                    : "asc",
              },
            })
          }
        >
          Role
          {search.sortBy === "role" && (
            <span>{search.sortDirection == "asc" ? " ↑" : " ↓"}</span>
          )}
        </Button>
      ),
      cell: (info) => (
        <Select
          value={info.getValue()}
          onValueChange={async (newRole) => {
            await setUserRoleMutation.mutateAsync({
              userId: info.row.original.id,
              role: newRole as "user" | "admin",
            });
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      ),
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
          Joined
          {search.sortBy === "createdAt" && (
            <span>{search.sortDirection === "asc" ? " ↑" : " ↓"}</span>
          )}
        </Button>
      ),
      cell: (info) => (
        <span className="font-mono">
          {new Date(info.getValue()).toLocaleDateString()}
        </span>
      ),
    }),
    columnHelper.accessor("banned", {
      header: "Status",
      cell: (info) => (
        <div>
          {info.getValue() ? (
            <Badge variant="destructive">Banned</Badge>
          ) : (
            <Badge variant="default">Active</Badge>
          )}
        </div>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (props) => (
        <div>
          <Link
            to={"/admin/$userId/user-sessions"}
            params={{ userId: props.row.original.id }}
          >
            <Button variant="ghost" size="icon" title="View User Sessions">
              <UserIcon className="h-4 w-4" />
            </Button>
          </Link>
          {props.row.original.banned ? (
            <Button
              variant="ghost"
              size="icon"
              title="Unban User"
              onClick={() => {
                unbanUserMutation.mutate({
                  userId: props.row.original.id,
                });
              }}
            >
              <Unlock className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              title="Ban User"
              size="icon"
              onClick={() => {
                setSelectedUser(props.row.original);
                setBanDialogOpen(true);
              }}
            >
              <Ban className="h-4 w-4" />
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" title="Delete User">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete User</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this user? This action cannot
                  be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    deleteUserMutation.mutate({
                      userId: props.row.original.id,
                    })
                  }
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: data.users,
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
                {" "}
                {/* Added padding between rows */}
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="py-2 text-center">
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
            disabled={data.users.length < search.limit}
          >
            Next
          </Button>
        </div>
      </div>

      {selectedUser && (
        <BanUserDialog
          user={selectedUser}
          open={banDialogOpen}
          onOpenChange={setBanDialogOpen}
        />
      )}
    </div>
  );
}

function UsersComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const { data } = useQuery(
    listAllUsersOptions({
      searchValue: search.search,
      limit: search.limit,
      offset: (search.page - 1) * search.limit,
      sortBy: search.sortBy,
      sortDirection: search.sortDirection,
      filterField: search.filterField,
      filterOperator: search.filterOperator,
      filterValue: search.filterValue === "all" ? "" : search.filterValue,
    }),
  );

  return (
    <div className="flex flex-col gap-4 p-8">
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-4">
            <Input
              placeholder="Search users..."
              value={search.search}
              onChange={(e) =>
                navigate({
                  search: { ...search, search: e.target.value, page: 1 },
                })
              }
            />

            <Select
              value={search.filterValue}
              onValueChange={(value) =>
                navigate({
                  search: { ...search, filterValue: value, page: 1 },
                })
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <UsersTable data={data} search={search} navigate={navigate} />
        </CardContent>
      </Card>
    </div>
  );
}
