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

}

export default ShoppingList;