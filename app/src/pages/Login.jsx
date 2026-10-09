import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {useSelector, useDispatch} from 'react-redux';
import { setUser } from '../components/userSlice';
import './Auth.css';
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
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setError('');
        setIsSubmitting(true);
        try {
            const identifier = formData.useEmail
                ? { email: formData.email.trim() }
                : { username: formData.username.trim() };
            const response = await fetch(`${import.meta.env.VITE_SERVER}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...identifier, password: formData.password }),
                credentials: 'include'
            });

            const data = await response.json().catch(() => null);
            if (!response.ok) {
                const validationMessage = Array.isArray(data?.errors)
                    ? data.errors.map((item) => item.msg).filter(Boolean).join(' ')
                    : '';
                setError(data?.message || validationMessage || 'Login failed. Check your details and try again.');
                return;
            }
            if (data?.token && data?.user) {
                localStorage.setItem('token', data.token);
                dispatch(setUser(data.user));
                navigate('/');
            } else {
                setError('The server returned an invalid login response.');
            }
        } catch {
            setError('Unable to reach the server. Check your connection and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleIdentifierModeChange = (e) => {
        setFormData((current) => ({
            ...current,
            username: '',
            email: '',
            useEmail: e.target.checked,
        }));
    };

    return (
        <form className="auth-form login-form" onSubmit={handleSubmit} aria-busy={isSubmitting}>
            <h1>Welcome back</h1>
            <div className="auth-field">
                <label className="auth-label" htmlFor="login-identifier">
                    {formData.useEmail ? 'Email' : 'Username'}
                </label>
                <input
                    id="login-identifier"
                    type={formData.useEmail ? 'email' : 'text'}
                    name={formData.useEmail ? 'email' : 'username'}
                    autoComplete={formData.useEmail ? 'email' : 'username'}
                    value={formData.useEmail ? formData.email : formData.username}
                    onChange={(e) => setFormData((current) => ({
                        ...current,
                        [e.target.name]: e.target.value,
                    }))}
                    required
                />
            </div>
            <label className="auth-toggle" htmlFor="use-email">
                <input
                    id="use-email"
                    type="checkbox"
                    checked={formData.useEmail}
                    onChange={handleIdentifierModeChange}
                />
                Use email address
            </label>
            <div className="auth-field">
                <label className="auth-label" htmlFor="login-password">Password</label>
                <input
                    id="login-password"
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={(e) => setFormData((current) => ({ ...current, password: e.target.value }))}
                    required
                />
            </div>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in...' : 'Login'}
            </button>
            <button type="button" onClick={() => navigate('/register')}>Don't Have an Account? Register</button>
        </form>
    )
}