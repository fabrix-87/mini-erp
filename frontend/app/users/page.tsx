'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { getUsers } from '../../lib/api/modules/user';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  UserDetail?: { firstName: string; lastName: string; phone?: string; city?: string };
}

export default function Users() {
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (err) {
        setError('Failed to fetch users: ' + err);
      }
    };
    fetchUsers();
  }, []);

  if (authUser?.role !== 'admin') return <p className="text-destructive">Access denied</p>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-destructive">{error}</p>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.username}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell><Badge variant={u.role === 'admin' ? 'secondary' : 'default'}>{u.role}</Badge></TableCell>
                  <TableCell>{u.UserDetail ? `${u.UserDetail.firstName} ${u.UserDetail.lastName}` : '-'}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant="destructive" size="sm" className="ml-2">Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}