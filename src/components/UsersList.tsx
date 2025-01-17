import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

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
    <div className="w-64 bg-gray-900 border-l border-gray-700/50 p-4">
      <h2 className="text-lg font-medium text-gray-200 mb-4">Users</h2>
      <ul className="space-y-1">
        {users.map((user) => (
          <li key={user.id}>
            <Link
              to={`/profile/${user.id}`}
              className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded transition-colors"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  user.online ? 'bg-green-500' : 'bg-gray-500'
                }`}
              />
              <span className="truncate">
                {user.email}
                {user.id === currentUser.id && ' (You)'}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}