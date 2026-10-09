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
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setError('');
        setIsSubmitting(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username.trim(),
                    email: formData.email.trim(),
                    password: formData.password,
                }),
                credentials: 'include'
            });
            const data = await response.json().catch(() => null);
            if (!response.ok) {
                const validationMessage = Array.isArray(data?.errors)
                    ? data.errors.map((item) => item.msg).filter(Boolean).join(' ')
                    : '';
                setError(data?.message || validationMessage || 'Registration failed. Please try again.');
                return;
            }
            if (data?.token && data?.user) {
                localStorage.setItem('token', data.token);
                dispatch(setUser(data.user));
                navigate('/');
            } else {
                setError('The server returned an invalid registration response.');
            }
        } catch {
            setError('Unable to reach the server. Check your connection and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <form className="auth-form register-form" onSubmit={handleSubmit} aria-busy={isSubmitting}>
            <h1>Create your account</h1>
            <div className="auth-field">
                <label className="auth-label" htmlFor="register-username">Username</label>
                <input
                    id="register-username"
                    type="text"
                    name="username"
                    autoComplete="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="auth-field">
                <label className="auth-label" htmlFor="register-email">Email</label>
                <input
                    id="register-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="auth-field">
                <label className="auth-label" htmlFor="register-password">Password</label>
                <input
                    id="register-password"
                    type="password"
                    name="password"
                    autoComplete="new-password"
                    minLength={6}
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="auth-field">
                <label className="auth-label" htmlFor="register-confirm-password">Confirm password</label>
                <input
                    id="register-confirm-password"
                    type="password"
                    name="confirmPassword"
                    autoComplete="new-password"
                    minLength={6}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                />
            </div>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating account...' : 'Register'}
            </button>
            <button type="button" onClick={() => navigate('/login')}>Already have an account? Login</button>
        </form>
    );
}