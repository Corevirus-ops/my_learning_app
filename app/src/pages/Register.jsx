import {useSelector, useDispatch} from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {useState, useEffect} from 'react';
import { setUser } from '../components/userSlice';
import './Auth.css';

export default function Register() {
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
        password: '',
        confirmPassword: ''
    });

    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        try {
            setError('');
            const response = await fetch(`${import.meta.env.VITE_SERVER}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                }),
                credentials: 'include'
            });
            const data = await response.json();
            console.log(data)
            if (data && data.token && data.user) {
                localStorage.setItem('token', data.token);
                dispatch(setUser(data.user));
                setError('');
                navigate('/');
            } else {
                setError(data?.message || data?.errors || 'Invalid registration response');
            }
        } catch (error) {
            console.error(error.message);
            setError(error.message);
        }
    };


    return (
        <form className="auth-form register-form" onSubmit={handleSubmit}>
            <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
            />
            <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
            />
            <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
            />
            <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
            />
            {error && typeof error === 'string' && error.length > 0 && <p style={{ color: 'red' }}>{error}</p>}
            {error && typeof error !== 'string' && Array.isArray(error) && error.map((err, index) => (
                <p key={index} style={{ color: 'red' }}>{err.msg}</p>
            ))}
            <button type="submit">Register</button>
            <button type="button" onClick={() => navigate('/login')}>Login</button>
        </form>
    );
}