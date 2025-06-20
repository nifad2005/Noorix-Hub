
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ROLES, ROOT_EMAIL, type UserRole } from "@/config/roles";
import { Loader2, AlertCircle, Users as UsersIcon, ShieldCheck, UserCheck, UserCog } from "lucide-react";

interface DisplayUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: UserRole;
}

export default function ManageUsersPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [users, setUsers] = useState<DisplayUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (currentUser?.role !== ROLES.ROOT) {
        toast({ title: "Access Denied", description: "You do not have permission to view this page.", variant: "destructive" });
        router.push("/dashboard");
      } else {
        fetchUsers();
      }
    }
  }, [currentUser, authLoading, router, toast]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    setError(null);
    try {
      const response = await fetch("/api/users/list");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError((err as Error).message);
      toast({ title: "Error fetching users", description: (err as Error).message, variant: "destructive" });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (userId === currentUser?.id && newRole !== ROLES.ROOT) {
        toast({ title: "Action Not Allowed", description: "ROOT user cannot change their own role.", variant: "destructive" });
        return;
    }
    setUpdatingRoleId(userId);
    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || "Failed to update role");
      }
      toast({ title: "Role Updated", description: `User's role has been changed to ${newRole}.` });
      setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error("Error updating role:", err);
      toast({ title: "Error updating role", description: (err as Error).message, variant: "destructive" });
    } finally {
      setUpdatingRoleId(null);
    }
  };
  
  const getInitials = (name?: string | null) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  };

  if (authLoading || (!authLoading && currentUser?.role !== ROLES.ROOT)) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-headline flex items-center">
                <UserCog className="mr-3 h-8 w-8 text-primary" /> User Role Management
            </CardTitle>
            <CardDescription>View users and assign ADMIN or USER roles. The ROOT role is fixed.</CardDescription>
          </CardHeader>
        </Card>

        {isLoadingUsers && (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <Card className="border-destructive bg-destructive/10">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center">
                <AlertCircle className="mr-2 h-5 w-5" /> Error Loading Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive">{error}</p>
              <Button onClick={fetchUsers} variant="destructive" className="mt-2">Try again</Button>
            </CardContent>
          </Card>
        )}

        {!isLoadingUsers && !error && users.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <UsersIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground">No other users found.</p>
            </CardContent>
          </Card>
        )}

        {!isLoadingUsers && !error && users.length > 0 && (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Current Role</TableHead>
                    <TableHead className="text-right w-[180px]">Change Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={user.image || undefined} alt={user.name || user.email || "User"} />
                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.name || "N/A"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === ROLES.ROOT ? 'bg-red-100 text-red-800' :
                            user.role === ROLES.ADMIN ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                         }`}>
                            {user.role === ROLES.ROOT ? <ShieldCheck className="mr-1 h-3.5 w-3.5"/> :
                             user.role === ROLES.ADMIN ? <UserCheck className="mr-1 h-3.5 w-3.5"/> : null}
                            {user.role}
                         </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {user.email === ROOT_EMAIL ? (
                          <span className="text-sm text-muted-foreground italic">Cannot change ROOT</span>
                        ) : (
                          <Select
                            value={user.role}
                            onValueChange={(newRole) => handleRoleChange(user.id, newRole as UserRole)}
                            disabled={updatingRoleId === user.id}
                          >
                            <SelectTrigger className="w-auto h-9 text-xs">
                              <SelectValue placeholder="Change role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={ROLES.ADMIN}>ADMIN</SelectItem>
                              <SelectItem value={ROLES.USER}>USER</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                         {updatingRoleId === user.id && <Loader2 className="inline-block ml-2 h-4 w-4 animate-spin" />}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
}
