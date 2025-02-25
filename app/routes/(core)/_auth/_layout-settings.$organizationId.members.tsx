import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getGroupedRowModel,
  getSortedRowModel,
  GroupingState,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useChangeMemberRoleMutation,
  useRemoveMemberMutation,
  useRevokeInvitationMutation,
} from "@/query/core/mutations/organization";
import { activeOrganizationMembersOptions } from "@/query/core/options/auth";

const organizationMembersSearchSchema = z.object({
  search: z.string().catch(""),
  sortBy: z.enum(["email", "role"]).catch("email"),
  sortDirection: z.enum(["asc", "desc"]).catch("desc"),
  filterValue: z.string().catch("all"),
});

export const Route = createFileRoute(
  "/(core)/_auth/_layout-settings/$organizationId/members",
)({
  component: OrganizationMembersComponent,
  validateSearch: organizationMembersSearchSchema,
});

function OrganizationMembersTable({
  members,
  search,
  ownerCount,
  navigate,
}: {
  members: Array<{
    id: string;
    organizationId: string;
    email: string;
    role: string;
    status: string;
    createdAt?: Date;
    user?: any;
    expiresAt?: Date;
    inviterId?: string;
  }>;
  search: z.infer<typeof organizationMembersSearchSchema>;
  ownerCount: number;
  navigate: (opts: { search: any }) => void;
}) {
  const updateRoleMutation = useChangeMemberRoleMutation();
  const removeMemberMutation = useRemoveMemberMutation();
  const revokeInvitationMutation = useRevokeInvitationMutation();
  const columnHelper = createColumnHelper<any>();

  const [grouping, setGrouping] = useState<GroupingState>(["status"]);
  const columns = [
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
          Name / Email
          {search.sortBy === "email" && (
            <span>{search.sortDirection == "asc" ? " ↑" : " ↓"}</span>
          )}
        </Button>
      ),
      cell: (info) => (
        <div className="flex items-center gap-2">
          <Avatar>
            {info.row.original.user?.image ? (
              <AvatarImage src={info.row.original.user.image} />
            ) : (
              <AvatarFallback>
                {info.row.original.email[0].toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">
              {info.row.original.user?.name || info.row.original.email}
            </span>
            {info.row.original.user?.name && (
              <span className="text-sm text-muted-foreground">
                {info.row.original.email}
              </span>
            )}
          </div>
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
          value={info.row.original.role}
          onValueChange={(value) =>
            updateRoleMutation.mutate({
              memberId: info.row.original.id,
              newRole: value as "member" | "admin" | "owner",
            })
          }
          disabled={
            info.row.original.status !== "active" ||
            (info.row.original.role === "owner" && ownerCount < 2)
          }
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="owner">Owner</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="member">Member</SelectItem>
          </SelectContent>
        </Select>
      ),
    }),
    columnHelper.accessor("status", {
      header: () => <></>,
      cell: (info) => <></>,
      enableGrouping: true,
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: (props) => (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {props.row.original.status == "active" && (
              <DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger onClick={(e) => e.stopPropagation()}>
                    Remove Member
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove member</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove this member? This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() =>
                          removeMemberMutation.mutate({
                            memberId: props.row.original.id,
                          })
                        }
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuItem>
            )}
            {props.row.original.status == "pending" && (
              <DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger onClick={(e) => e.stopPropagation()}>
                    Revoke Invitation
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Invitation</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to revoke this invitation? This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() =>
                          revokeInvitationMutation.mutate({
                            invitationId: props.row.original.id,
                          })
                        }
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  ];

  const table = useReactTable({
    data: members,
    columns,
    state: {
      grouping,

      columnVisibility: {
        status: false,
      },
    },
    onGroupingChange: setGrouping,
    getGroupedRowModel: getGroupedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableGrouping: true,
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getGroupedRowModel().rows.map((row) => (
          <React.Fragment key={row.id}>
            {row.getIsGrouped() && (
              <TableRow className="bg-muted/50">
                <TableCell colSpan={columns.length} className="p-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">
                      {row.getValue("status")}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({row.subRows.length}{" "}
                      {row.subRows.length === 1 ? "member" : "members"})
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {row.getIsGrouped() ? (
              row.subRows.map((subRow) => (
                <TableRow key={subRow.id}>
                  {subRow.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            )}
          </React.Fragment>
        ))}
      </TableBody>
    </Table>
  );
}

function OrganizationMembersComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: members } = useQuery(activeOrganizationMembersOptions());

  const ownerCount = useMemo(() => {
    if (!members) return 0;
    return members.filter((member) => member.role === "owner").length;
  }, [members]);

  // maybe this could be done in tanstack idk
  const filteredData = useMemo(() => {
    if (!members) return [];

    const groupedMembers = members.reduce<Record<string, typeof members>>(
      (acc, member) => {
        const status = member.status;
        if (!acc[status]) {
          acc[status] = [];
        }
        acc[status].push(member);
        return acc;
      },
      {},
    );

    const processedGroups = Object.values(groupedMembers).map((group) => {
      const sortedGroup = group.sort((a, b) => {
        const fieldA = a[search.sortBy]?.toLowerCase();
        const fieldB = b[search.sortBy]?.toLowerCase();
        if (fieldA < fieldB) return search.sortDirection === "asc" ? -1 : 1;
        if (fieldA > fieldB) return search.sortDirection === "asc" ? 1 : -1;
        return 0;
      });

      return sortedGroup.filter((member) => {
        const matchesSearch = Object.keys(search).every((key) => {
          if (key === "search" && search[key] !== "") {
            return (
              member.email.toLowerCase().includes(search[key].toLowerCase()) ||
              member.user?.name
                ?.toLowerCase()
                .includes(search[key].toLowerCase())
            );
          }
          if (key === "filterValue" && search[key] !== "all") {
            return member.role === search[key];
          }
          return true;
        });

        return matchesSearch;
      });
    });

    return processedGroups.flat();
  }, [members, search]);

  return (
    <div className="flex flex-col gap-4 p-8">
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-4">
            <Input
              placeholder="Search members..."
              value={search.search}
              onChange={(e) =>
                navigate({
                  search: { ...search, search: e.target.value },
                })
              }
            />

            <Select
              value={search.filterValue}
              onValueChange={(value) =>
                navigate({
                  search: { ...search, filterValue: value },
                })
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <OrganizationMembersTable
            members={filteredData || []}
            search={search}
            ownerCount={ownerCount}
            navigate={navigate}
          />
        </CardContent>
      </Card>
    </div>
  );
}
