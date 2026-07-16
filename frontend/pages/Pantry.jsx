import { useState, useEffect } from 'react';
import { Plus, Search, X, Calendar, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import api from '../services/api';

const CATEGORIES = ['Vegetables', 'Fruits', 'Dairy', 'Meat', 'Grains', 'Spices', 'Other'];

const Pantry = () => {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [expiringItems, setExpiringItems] = useState([]);
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchPantryItems();
        fetchExpiringItems();
    }, []);

    const fetchPantryItems = async() => {

        try {

            const response = await api.get('/pantry/');
            setItems(response.data.data);
            
        } catch (error) {
            toast.error("Failed to load pantry");
        }finally{
            setLoading(false)
        }

    }

    const fetchExpiringItems = async() => {

        try {

            const response = await api.get('/pantry/expiring-soon')
            setExpiringItems(response.data.data.items)
            
        } catch (error) {
            toast.error("Failed to load expiring items")
        }

    }   

    const handleDelete = async(id) =>{

        try {
            
            await api.delete(`/pantry/delete/${id}`);
            setItems(items.filter((item) => item.id !== id));
            toast.success("pantry deleted")

        } catch (error) {
            toast.error("Failed to delete pantry")
        }

    }

    useEffect(() => {
        filterItems();
    }, [items, searchQuery,selectedCategory])

    const filterItems = () => {
        let filtered = items;

        if(searchQuery){
            filtered = filtered.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        if(selectedCategory !== 'All'){
            filtered = filtered.filter((item) => item.category === selectedCategory)
        }

        setFilteredItems(filtered)
    }

    if (loading) {
     return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );
}

return (
    <><><div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Pantry</h1>
                    <p className="text-gray-600 mt-1">Manage your ingredients and track expiry dates</p>
                </div>
                <button
                    onClick
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Item
                </button>
            </div>

            {expiringItems.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                            <h3 className="font-medium text-amber-900">Items Expiring Soon</h3>
                            <p className="text-sm text-amber-700 mt-1">
                                {expiringItems.length} item{expiringItems.length > 1 ? 's' : ''} expiring within 7 days
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div><div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ingredients..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
        </div></><div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            <CategoryButton
                label="All"
                active={selectedCategory === 'All'}
                onClick={() => setSelectedCategory('All')} />
            {CATEGORIES.map(category => (
                <CategoryButton
                    key={category}
                    label={category}
                    active={selectedCategory === category}
                    onClick={() => setSelectedCategory(category)} />
            ))}
        </div></>
    
  );
}

const CategoryButton = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${active
            ? 'bg-emerald-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
    >
        {label}
    </button>
);


export default Pantry;