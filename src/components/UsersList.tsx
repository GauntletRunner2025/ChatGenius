import { useAuth } from '../contexts/AuthContext';

interface User {
  id: string;
  email: string;
  online?: boolean;
}

export function UsersList() {
  const { user: currentUser } = useAuth();

  if (!currentUser) {
    return null;
  }

  const users: User[] = [
    { id: currentUser.id, email: currentUser.email || '', online: true },
    // Add more users as needed
  ];

  return (
    <div className="w-64 bg-gray-50 border-l border-gray-200 p-4">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Users</h2>
      <ul className="space-y-2">
        {users.map((user) => (
          <li
            key={user.id}
            className="flex items-center gap-2 text-sm text-gray-700"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                user.online ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
            {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
}