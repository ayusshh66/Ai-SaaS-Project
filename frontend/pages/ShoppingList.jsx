import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, X, Check, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import api from '../services/api';

const ShoppingList = () => {
    const [groupedItems, setGroupedItems] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadShoppingList();
    }, []);

    const loadShoppingList = async () => {
        setLoading(true);
        try {
            const response = await api.get('/shopping-list/grouped');
            setGroupedItems(response.data.data);
        } catch (error) {
            console.error("Error loading list:", error);
            toast.error('Failed to load shopping list');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleChecked = async (item) => {
        try {
            await api.patch(`/shopping-list/update/${item.id}`, { 
                is_checked: !item.is_checked 
            });
            loadShoppingList();
        } catch (error) {
            toast.error('Failed to update item');
        }
    };

    const handleDeleteItem = async (id) => {
        if (!confirm('Remove this item?')) return;
        try {
            await api.delete(`/shopping-list/delete/${id}`);
            loadShoppingList();
            toast.success('Item removed');
        } catch (error) {
            toast.error('Failed to remove item');
        }
    };

    const handleAddToPantry = async () => {
        if (!confirm('Add all checked items to pantry?')) return;
        try {
            await api.post('/shopping-list/move-to-pantry');
            toast.success('Items moved to pantry!');
            loadShoppingList();
        } catch (error) {
            toast.error('Failed to move items to pantry');
        }
    };

    const totalCount = groupedItems.reduce((acc, group) => acc + group.items.length, 0);
    const checkedCount = groupedItems.reduce((acc, group) => acc + group.items.filter(i => i.is_checked).length, 0);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Shopping List</h1>
                    <p className="text-gray-600 mt-2">
                        {totalCount > 0 ? `${checkedCount} of ${totalCount} items checked` : 'Your shopping list is empty'}
                    </p>
                </div>

                <div className="flex flex-wrap gap-3 mb-6">
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-sm"
                    >
                        <Plus className="w-5 h-5" /> Add New Item
                    </button>
                    
                    {checkedCount > 0 && (
                        <button 
                            onClick={handleAddToPantry}
                            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-sm"
                        >
                            <ShoppingCart className="w-5 h-5" /> Move to Pantry ({checkedCount})
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="text-center py-20 text-orange-600">Loading list...</div>
                ) : groupedItems.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-orange-200">
                        <p className="text-gray-500">Your shopping list is empty.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {groupedItems.map((group) => (
                            <div key={group.category} className="bg-white rounded-2xl border border-orange-100 overflow-hidden shadow-sm">
                                <div className="bg-orange-50 px-6 py-4 border-b border-orange-100 font-bold text-orange-800 uppercase tracking-wider text-sm">
                                    {group.category}
                                </div>
                                <div className="divide-y divide-orange-50">
                                    {group.items.map((item) => (
                                        <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-orange-50/50 transition-colors">
                                            <button 
                                                onClick={() => handleToggleChecked(item)} 
                                                className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${item.is_checked ? 'bg-orange-500 border-orange-500' : 'border-gray-300 hover:border-orange-400'}`}
                                            >
                                                {item.is_checked && <Check className="w-4 h-4 text-white" />}
                                            </button>
                                            <div className="flex-1">
                                                <p className={`font-medium ${item.is_checked ? 'line-through text-gray-400' : 'text-gray-900'}`}>{item.ingredient_name}</p>
                                                <p className="text-sm text-gray-500">{item.quantity} {item.unit}</p>
                                            </div>
                                            <button onClick={() => handleDeleteItem(item.id)} className="text-gray-400 hover:text-orange-600 p-2">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))} 
                    </div>
                )}
            </div>

            {showAddModal && (
                <AddItemModal 
                    onClose={() => setShowAddModal(false)} 
                    onSuccess={() => { loadShoppingList(); setShowAddModal(false); }} 
                />
            )}
        </div>
    );
};

const AddItemModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        ingredient_name: '',
        quantity: '',
        unit: 'pieces',
        category: 'Other'
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/shopping-list/create', {
                ...formData,
                quantity: parseFloat(formData.quantity)
            });
            toast.success('Item added to shopping list');
            onSuccess();
        } catch (error) {
            toast.error('Failed to add item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Add New Item</h2>
                    <button onClick={onClose}><X className="text-gray-400 hover:text-orange-600" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" 
                        placeholder="Item Name" 
                        required 
                        onChange={e => setFormData({...formData, ingredient_name: e.target.value})} 
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" className="p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Qty" required onChange={e => setFormData({...formData, quantity: e.target.value})} />
                        <select className="p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" onChange={e => setFormData({...formData, unit: e.target.value})}>
                            <option value="pieces">Pieces</option>
                            <option value="kg">kg</option>
                            <option value="l">Liters</option>
                        </select>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold transition-all">
                        {loading ? 'Adding...' : 'Add to List'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ShoppingList;