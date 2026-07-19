import React, { useState, useEffect } from 'react';
import { User, Lock, Trash2, Save, Utensils, Ruler, Flame, Scale } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'];
const CUISINES = ['Any', 'Italian', 'Mexican', 'Indian', 'Chinese', 'Japanese', 'Thai', 'French', 'Mediterranean', 'American'];

function Settings() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    const [profile, setProfile] = useState({ name: "", email: "" });
    const [preferences, setPreferences] = useState({
        dietary_restrictions: [],
        preferred_cuisines: [],
        default_servings: 2,
        spice_level: 'medium',
        measurement_unit: 'metric',
        dailyCalories: 0,
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '', newPassword: '', confirmPassword: ''
    });

    useEffect(() => { fetchUserData(); }, []);

    const fetchUserData = async () => {
        setLoading(true);
        try {
            const response = await api.get("/users/profile");
            const { user, preferences: userPref } = response.data.data;
            setProfile({ name: user.name, email: user.email });
            if (userPref) {
                setPreferences({
                    dietary_restrictions: userPref.dietaryRestrictions || [],
                    preferred_cuisines: userPref.preferredCuisines || [],
                    default_servings: userPref.defaultServings || 2,
                    spice_level: userPref.spiceLevel || 'medium',
                    measurement_unit: userPref.measurementUnit || 'metric',
                    dailyCalories: Number(userPref.dailyCalories) || 0
                });
            }
        } catch (error) { toast.error("Failed to load user data"); }
        finally { setLoading(false); }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.patch('/users/update', { userName: profile.name, preferences: preferences });
            toast.success('Profile updated successfully');
        } catch (error) { toast.error('Failed to update profile'); }
        finally { setSaving(false); }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Passwords do not match'); return;
        }
        setSaving(true);
        try {
            await api.put('/users/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Password changed successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) { toast.error('Failed to change password'); }
        finally { setSaving(false); }
    };

    const toggleDietary = (opt) => setPreferences(prev => ({
        ...prev, dietary_restrictions: prev.dietary_restrictions.includes(opt) ? prev.dietary_restrictions.filter(d => d !== opt) : [...prev.dietary_restrictions, opt]
    }));

    const toggleCuisine = (cui) => setPreferences(prev => ({
        ...prev, preferred_cuisines: prev.preferred_cuisines.includes(cui) ? prev.preferred_cuisines.filter(c => c !== cui) : [...prev.preferred_cuisines, cui]
    }));

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading settings...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-600">Manage your profile and kitchen preferences</p>
                </div>

                {/* Profile Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2"><User className="text-orange-500" /> Profile</h2>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <input className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} placeholder="Name" />
                        <input className="w-full p-3 border rounded-lg bg-gray-100" value={profile.email} disabled />
                        <button type="submit" className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 flex items-center gap-2"><Save size={18} /> Save Profile</button>
                    </form>
                </div>

                {/* Password Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2"><Lock className="text-orange-500" /> Change Password</h2>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <input type="password" placeholder="Current Password" className="w-full p-3 border rounded-lg" onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} />
                        <input type="password" placeholder="New Password" className="w-full p-3 border rounded-lg" onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} />
                        <input type="password" placeholder="Confirm New Password" className="w-full p-3 border rounded-lg" onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} />
                        <button type="submit" className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600">Change Password</button>
                    </form>
                </div>

                {/* Preferences Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2"><Utensils className="text-orange-500" /> Dietary Preferences</h2>
                    
                    <div className="space-y-6">
                        {/* Dietary Restrictions */}
                        <div>
                            <label className="block text-sm font-medium mb-3">Dietary Restrictions</label>
                            <div className="flex flex-wrap gap-2">
                                {DIETARY_OPTIONS.map(opt => (
                                    <button key={opt} onClick={() => toggleDietary(opt)} className={`px-4 py-2 rounded-lg ${preferences.dietary_restrictions.includes(opt) ? 'bg-orange-500 text-white' : 'bg-gray-100'}`}> {opt} </button>
                                ))}
                            </div>
                        </div>

                        {/* Cuisines */}
                        <div>
                            <label className="block text-sm font-medium mb-3">Preferred Cuisines</label>
                            <div className="flex flex-wrap gap-2">
                                {CUISINES.map(cui => (
                                    <button key={cui} onClick={() => toggleCuisine(cui)} className={`px-4 py-2 rounded-lg ${preferences.preferred_cuisines.includes(cui) ? 'bg-orange-500 text-white' : 'bg-gray-100'}`}> {cui} </button>
                                ))}
                            </div>
                        </div>

                        {/* Additional Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Default Servings: {preferences.default_servings}</label>
                                <input type="range" min="1" max="12" value={preferences.default_servings} onChange={e => setPreferences({...preferences, default_servings: parseInt(e.target.value)})} className="w-full accent-orange-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Daily Calorie Target</label>
                                    <input 
                                         type="number" 
                                         value={preferences.dailyCalories || ''} // Use empty string if 0, or just the number
                                         onChange={e => setPreferences({...preferences, dailyCalories: parseInt(e.target.value) || 0})} 
                                         className="w-full p-3 border rounded-lg" 
                                    />                            
                            </div>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <button onClick={() => {if(confirm("Delete account?")) logout();}} className="text-red-500 flex items-center gap-2 hover:text-red-700 font-medium">
                    <Trash2 size={18} /> Delete Account
                </button>
            </div>
        </div>
    );
}

export default Settings;