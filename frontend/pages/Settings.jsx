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

    const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
    }
    if (passwordData.newPassword.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
    }

    setSaving(true);
    try {
        await api.put('/users/change-password', {
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
        });
        toast.success('Password changed successfully');
        // i dont want to store their password in frontend
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
        toast.error('Failed to change password');
    } finally {
        setSaving(false);
    }
    };

    const handleDeleteAccount = async() => {
        if(!confirm("Are you sure you want to delete the account forever?")) return;

        const confirmation = prompt(`type "DELETE" to confirm account deletion`);
        if(confirmation !== "DELETE"){
            toast.error("Account deletion cancelled ")
        }

        toast.success("Account has been deleted");
        logout();
        navigate("/login")
    }

    

  return (
    <div>Settings</div>
  )
}

export default Settings