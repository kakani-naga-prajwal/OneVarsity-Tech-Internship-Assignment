import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

// Safe base64 decode helper
const safeAtob = (str) => {
  try {
    if (!str) return null;
    return atob(str);
  } catch (e) {
    console.warn('Failed to decode base64 string:', e);
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        } catch (err) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  useEffect(() => {
    const onLogout = () => setUser(null);
    window.addEventListener('auth-logout', onLogout);
    return () => window.removeEventListener('auth-logout', onLogout);
  }, []);

  const login = async (email, password) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user: userData } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return res.data;
    } catch (backendErr) {
      // Fallback to local/demo login if backend fails
      console.warn('Backend login failed, checking local users', backendErr);
      
      const stored = localStorage.getItem('ecommerce_users_db');
      const users = stored ? JSON.parse(stored) : [];
      
      const foundUser = users.find(u => {
        const decodedPassword = safeAtob(u.password_hash);
        return u.email === email && decodedPassword === password;
      });

      if (!foundUser) {
        throw new Error('Invalid email or password.');
      }

      // Create demo token and login locally
      const demoToken = `demo-token-${Date.now()}`;
      const userForStorage = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
        phone: foundUser.phone,
        nationality: foundUser.nationality,
        gender: foundUser.gender,
      };

      localStorage.setItem('token', demoToken);
      localStorage.setItem('user', JSON.stringify(userForStorage));
      setUser(userForStorage);

      return { token: demoToken, user: userForStorage };
    }
  };

  const register = async (name, email, password, role = 'customer', phone = '', nationality = '', gender = '') => {
    if (!name || !email || !password) {
      throw new Error('Name, email, and password are required');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    try {
      const payload = { name, email, password, role };
      
      try {
        // Try backend first
        const res = await api.post('/auth/register', payload);
        const { token, user: userData } = res.data;

        const enrichedUser = { 
          ...userData, 
          phone: phone || '', 
          nationality: nationality || '', 
          gender: gender || '' 
        };

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(enrichedUser));
        setUser(enrichedUser);
        return res.data;
      } catch (backendErr) {
        // Fallback to local/demo registration if backend fails
        console.warn('Backend registration failed, using demo mode', backendErr);
        
        // Check if email already exists locally
        const stored = localStorage.getItem('ecommerce_users_db');
        const users = stored ? JSON.parse(stored) : [];
        if (users.find(u => u.email === email)) {
          throw new Error('Email already registered.');
        }

        // Create local user
        const newUser = {
          id: `user-${Date.now()}`,
          name,
          email,
          password_hash: btoa(password), // simple base64 for demo
          role,
          phone: phone || '',
          nationality: nationality || '',
          gender: gender || '',
          created_at: new Date().toISOString(),
        };

        users.unshift(newUser);
        localStorage.setItem('ecommerce_users_db', JSON.stringify(users));

        // Create and store demo token
        const demoToken = `demo-token-${Date.now()}`;
        const userForStorage = {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          phone: newUser.phone,
          nationality: newUser.nationality,
          gender: newUser.gender,
        };

        localStorage.setItem('token', demoToken);
        localStorage.setItem('user', JSON.stringify(userForStorage));
        setUser(userForStorage);
        
        return { token: demoToken, user: userForStorage };
      }
    } catch (err) {
      throw new Error(err.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
