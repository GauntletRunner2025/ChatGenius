const users = [
  { id: 1, name: 'Alice', status: 'online' },
  { id: 2, name: 'Bob', status: 'offline' },
  { id: 3, name: 'Charlie', status: 'away' },
  { id: 4, name: 'David', status: 'online' },
  { id: 5, name: 'Eve', status: 'online' },
]

export default function RightSidebar() {
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
  )
}

