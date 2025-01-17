import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserCircleIcon } from '@heroicons/react/24/outline';

export const Header = () => {
  const { user } = useAuth();

  return (
    <header className="bg-gray-900 border-b border-gray-700/50">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-200">ChatGenius</h1>
        {user && (
          <Link
            to="/profile"
            className="flex items-center px-3 py-2 text-gray-400 hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-700/50"
          >
            <UserCircleIcon className="h-6 w-6 mr-2" />
            <span>Profile</span>
          </Link>
        )}
      </div>
    </header>
  );
}; 