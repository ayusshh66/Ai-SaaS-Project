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
}







export default Pantry;