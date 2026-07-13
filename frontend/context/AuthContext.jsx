import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // checks it user is logged in or nott
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if(token && user){
            setUser(JSON.parse(user))   
        }

        setLoading(false)

    }, []);

    const login = async (email, password) => {
        try {

            const response = await api.post('/api/users/login', {email, password});
            const {user, token} = response.data.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            setUser(user)

            return { success : true}
            
        } catch (error) {
            return {
                success : false,
                message : error.response?.data?.message || "login failed"
            }
        }
    };

}