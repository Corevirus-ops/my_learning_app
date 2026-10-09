import { Link } from 'react-router-dom';
import {useSelector} from 'react-redux';

export default function NavBar() {
    const user = useSelector((state) => state.user.user);
    return (
        <nav>
            <h1>My Learning App</h1>
            <ul>
                <li><Link to="/overview">Overview</Link></li>
                <li><Link to="/learning-list">Learning List</Link></li>
                <li><Link to="/learning-history">Learning History</Link></li>
                <li><Link to="/skills-insights">Skills & Insights</Link></li>
            </ul>
            <Link to="/settings">Settings</Link>
            {user && <p>Welcome, {user.name}!</p>}
        </nav>
    );
}