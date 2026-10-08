import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {useSelector, useDispatch} from 'react-redux';
import { setUser } from '../components/userSlice';
export default function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user.user);

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        useEmail: false,
        password: ''
    });

    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
            try {
                setError('');
      const response = await fetch(`${import.meta.env.VITE_SERVER}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: formData.username && formData.username, email: formData.email && formData.email, password: formData.password && formData.password }),
        credentials: 'include'
      });
    
      const data = await response.json();
      console.log(data);
      if (data && data.token && data.user) {
        localStorage.setItem('token', data.token);
        dispatch(setUser(data.user));
        setError('');
        navigate('/');
      }
      else {
        setError(data?.message || data?.errors || 'Invalid login response');
      }
    
    } catch (error) {
      console.error(error.message);
      setError(error.message);
    }
  
    };
    return (
        <form onSubmit={handleSubmit}>
            {
                formData.useEmail ? (
                    <input
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                ) : <input
                        type="text"
                        placeholder="Username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
            }
            <label>
                <input
                    type="checkbox"
                    checked={formData.useEmail}
                    onChange={(e) => setFormData({ ...formData, useEmail: e.target.checked })}
                />
                Use Email
            </label>

            <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button type="submit">Login</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
    )
}