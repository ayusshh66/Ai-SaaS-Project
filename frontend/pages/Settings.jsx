import React, { useState, useEffect } from 'react'
import { User, Lock, Trash2, Save } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'];
const CUISINES = ['Any', 'Italian', 'Mexican', 'Indian', 'Chinese', 'Japanese', 'Thai', 'French', 'Mediterranean', 'American'];


function Settings() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true)
    const [ profile, setProfile] = useState({
        name : "",
        email : "",
    });
    const [preferences, setPreferences] = useState({
    dietary_restrictions: [],
    preferred_cuisines: [],
    default_servings: 2, 
    spice_level: 'medium',
    measurement_unit: 'metric',
    dailyCalories : 0,
    });

    useEffect(() => {
        fetchUserData();
    }, [])

    const fetchUserData = () => {
        setLoading(true);

        try {

            const response = await api.get("/users/profile");
            const {user, preferences : userPref} = response.data.data;

            setProfile({
                name : user.name,
                email : user.email,
            })

            if(userPref){
                setPreferences({
                    dietary_restrictions: userPref.dietaryRestrictions || [],
                    preferred_cuisines: userPref.preferredCuisines|| [],
                    default_servings: userPref.defaultServings|| 2, 
                    spice_level:userPref.spiceLevel || 'medium',
                    measurement_unit: 'metric',
                    dailyCalories : userPref.dailyCalories || 0
                })
            }
            
        } catch (error) {
            toast.error("failed to load user data")
        }finally{
            setLoading(false)
        }
    }

    const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
        // Create an object containing ONLY the changed fields
        const updates = {};
        if (changedUserName) updates.userName = changedUserName;
        if (changedPreferences) updates.preferences = changedPreferences;

        await api.patch('/users/update', updates);
        
        toast.success('Profile updated successfully');
    } catch (error) {
        toast.error('Failed to update profile');
    } finally {
        setSaving(false);
    }
};




  return (
    <div>Settings</div>
  )
}

export default Settings