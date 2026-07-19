import React, { useEffect } from 'react'
import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, X, Check, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import api from '../services/api';

const CATEGORIES = ['Produce', 'Dairy', 'Meat', 'Grains', 'Spices', 'Beverages', 'Other'];

function ShoppingList() {

    const [items, setItems] = useState([]);
    const [groupedItems, setGroupedItems] = useState({});
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true);

        const fetchShoppingList = async() => {
            try {

            const response = await api.get("/shopping-list/grouped");
            setItems(response.data.data)
            
        } catch (error) {
            toast.error("failed loading shopping list")
        }finally{
            setLoading(false)
        }
        }

        fetchShoppingList();
    },[])


  return (
    <div>ShoppingList</div>
  )
}

export default ShoppingList