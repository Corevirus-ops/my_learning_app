import { Link, NavLink } from 'react-router-dom';
import {useSelector, useDispatch} from 'react-redux';
import { setUser } from '../components/userSlice';
import './NavBar.css';

export default function NavBar() {
    const user = useSelector((state) => state.user.user);
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(setUser(null));
        localStorage.removeItem('token');
    };
    return (
        <nav className="sidebar" aria-label="Main navigation">
            <Link className="brand" to="/">
                <span className="brand-mark" aria-hidden="true">▤</span>
                <span><strong>My Learning</strong><small>Personal learning tracker</small></span>
            </Link>
            <ul className="nav-links">
                <li><NavLink end className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`} to="/"><span aria-hidden="true">⌂</span>Overview</NavLink></li>
                <li><NavLink className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`} to="/learning-list"><span aria-hidden="true">▤</span>Learning list</NavLink></li>
                <li><NavLink className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`} to="/learning-history"><span aria-hidden="true">◷</span>Learning history</NavLink></li>
                <li><NavLink className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`} to="/skills-insights"><span aria-hidden="true">▥</span>Skills &amp; insights</NavLink></li>
            </ul>
            <div className="sidebar-bottom">
                <section className="streak-card">
                    <span className="streak-icon" aria-hidden="true">✦</span>
                    <strong>7 day streak</strong>
                    <p>Make progress on any item today to keep it going.</p>
                </section>
                <Link className="nav-link settings-link" to="/settings"><span aria-hidden="true">⚙</span>Settings</Link>
                {user && <div className="profile-row">
                    <span className="avatar">{user.username?.slice(0, 2).toUpperCase() || 'AM'}</span>
                    <span className="profile-copy"><strong>{user.username || 'Learner'}</strong><small>{user.email}</small></span>
                    <button className="logout-button" onClick={handleLogout} aria-label="Log out" title="Log out">↗</button>
                </div>}
            </div>
        </nav>
    );
}