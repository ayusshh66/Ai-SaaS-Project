import { Link, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChefHat, Home, UtensilsCrossed, Calendar, ShoppingCart, Settings, LogOut } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinkStyles = ({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            isActive
                ? 'text-orange-600 bg-orange-50 font-semibold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`;

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                        <ChefHat className="w-7 h-7 text-orange-500" />
                        <span>AI Recipe Generator</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-1">
                        <NavLink to="/dashboard" className={navLinkStyles}>
                            <Home className="w-4 h-4" />
                            <span>Dashboard</span>
                        </NavLink>
                        <NavLink to="/pantry" className={navLinkStyles}>
                            <UtensilsCrossed className="w-4 h-4" />
                            <span>Pantry</span>
                        </NavLink>
                        <NavLink to="/generate" className={navLinkStyles}>
                            <ChefHat className="w-4 h-4" />
                            <span>Generate</span>
                        </NavLink>
                        <NavLink to="/recipes" className={navLinkStyles}>
                            <UtensilsCrossed className="w-4 h-4" />
                            <span>Recipes</span>
                        </NavLink>
                        <NavLink to="/meal-plan" className={navLinkStyles}>
                            <Calendar className="w-4 h-4" />
                            <span>Meal Plan</span>
                        </NavLink>
                        <NavLink to="/shopping-list" className={navLinkStyles}>
                            <ShoppingCart className="w-4 h-4" />
                            <span>Shopping</span>
                        </NavLink>
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center gap-3">
                        <Link
                            to="/settings"
                            className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        >
                            <Settings className="w-5 h-5" />
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};
    
export default Navbar;