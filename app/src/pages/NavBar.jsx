import { Link, NavLink } from 'react-router-dom';
import {useSelector, useDispatch} from 'react-redux';
import { setUser } from '../components/userSlice';
import { useLearningSummary } from '../hooks/useLearningSummary';
import './NavBar.css';

export default function NavBar() {
    const user = useSelector((state) => state.user.user);
    const dispatch = useDispatch();
    const { summary } = useLearningSummary();
    const streak = summary?.current_streak || 0;

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
                    <strong>{streak > 0 ? `${streak}-day streak` : 'Start a streak'}</strong>
                    <p>{summary?.active_today ? 'You made progress today. Keep your rhythm going.' : streak ? 'Make progress on a course today to keep your streak.' : 'Update a course today to start your streak.'}</p>
                    {summary && <small>{summary.active_days_this_week} of {summary.weekly_active_goal} active days this week</small>}
                </section>
                <NavLink className={({ isActive }) => `nav-link settings-link${isActive ? ' nav-link-active' : ''}`} to="/settings"><span aria-hidden="true">⚙</span>Settings</NavLink>
                {user && <div className="profile-row">
                    <span className="avatar">{user.username?.slice(0, 2).toUpperCase() || 'AM'}</span>
                    <span className="profile-copy"><strong>{user.username || 'Learner'}</strong><small>{user.email}</small></span>
                    <button className="logout-button" onClick={handleLogout} aria-label="Log out" title="Log out">↗</button>
                </div>}
            </div>
        </nav>
    );
}