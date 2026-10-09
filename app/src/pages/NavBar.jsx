import { Link } from 'react-router-dom';
import {useSelector, useDispatch} from 'react-redux';
import { setUser } from '../components/userSlice';

export default function NavBar() {
    const user = useSelector((state) => state.user.user);
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(setUser(null));
        localStorage.removeItem('token');
    };
    return (
        <nav>
            <h1>My Learning App</h1>
            {user && ( <><ul>
                <li><Link to="/overview">Overview</Link></li>
                <li><Link to="/learning-list">Learning List</Link></li>
                <li><Link to="/learning-history">Learning History</Link></li>
                <li><Link to="/skills-insights">Skills & Insights</Link></li>
            </ul>
            <Link to="/settings">Settings</Link>
            <p>Welcome, {user.username}!</p>
             <p>{user.email}</p>
             <button onClick={handleLogout}>Logout</button> </>)}
        </nav>
    );
}