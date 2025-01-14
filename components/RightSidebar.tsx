import { useEffect, useState } from 'react';

export default function RightSidebar() {
  interface User {
    id: number;
    name: string;
    status: 'online' | 'away' | 'offline';
  }

  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    };

    fetchUsers();
  }, []);

  return (
    <div className="w-64 bg-gray-100 p-4 border-l">
      <h2 className="text-xl font-semibold mb-4">Users</h2>
      <ul>
        {users.map(user => (
          <li key={user.id} className="mb-2 flex items-center">
            <span className={`h-2 w-2 rounded-full mr-2 ${
              user.status === 'online' ? 'bg-green-500' :
              user.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
            }`}></span>
            {user.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

