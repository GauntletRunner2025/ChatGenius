import { Link, useAuth, UserCircleIcon } from '../imports/components/header.imports';

const HEADER_CLASSNAME = "bg-gray-900 border-b border-gray-700/50";
const CONTAINER_CLASSNAME = "max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center";
const TITLE_CLASSNAME = "text-2xl font-bold text-gray-200";
const LINK_CLASSNAME = "flex items-center px-3 py-2 text-gray-400 hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-700/50";
const ICON_CLASSNAME = "h-6 w-6 mr-2";

export const Header = () => {
  const { user } = useAuth();

  return (
    <header className={HEADER_CLASSNAME}>
      <div className={CONTAINER_CLASSNAME}>
        <h1 className={TITLE_CLASSNAME}>ChatGenius</h1>
        {user && (
          <Link
            to="/profile"
            className={LINK_CLASSNAME}
          >
            <UserCircleIcon className={ICON_CLASSNAME} />
            <span>Profile</span>
          </Link>
        )}
      </div>
    </header>
  );
};