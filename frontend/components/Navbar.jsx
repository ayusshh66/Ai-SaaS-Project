import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChefHat, Home, UtensilsCrossed, Calendar, ShoppingCart, Settings, LogOut } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const navLinkStyles = ({ isActive }) => 
        `flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg ${isActive ? 'text-orange-600 bg-orange-50' : 'text-gray-600 hover:bg-gray-50'}`;

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2 text-xl font-semibold"><ChefHat className="text-orange-500" />eMOM</Link>
                
                {user ? (
                    <div className="flex items-center gap-4">
                        <NavLink to="/dashboard" className={navLinkStyles}><Home className="w-4" />Dashboard</NavLink>
                        <NavLink to="/pantry" className={navLinkStyles}><UtensilsCrossed className="w-4" />Pantry</NavLink>
                        <button onClick={() => { logout(); navigate('/login'); }} className="text-gray-600 hover:text-red-600"><LogOut className="w-4" /></button>
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-gray-600 font-medium">Login</Link>
                        <Link to="/signup" className="bg-orange-500 text-white px-4 py-2 rounded-lg">Sign Up</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};
export default Navbar;