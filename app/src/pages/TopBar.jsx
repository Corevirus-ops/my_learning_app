import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CourseSearch from '../components/topbar/CourseSearch';
import LearningNotifications from '../components/topbar/LearningNotifications';
import './TopBar.css';
export default function TopBar() {
    const user = useSelector((state) => state.user.user);
    const navigate = useNavigate();

    const handleAddLearningLink = () => {
        navigate('/learning-list');
    };
    return (
        <header className="topbar">
            {user && (
                <div className="topbar-inner">
                    <CourseSearch />
                    <div className="topbar-actions">
                        <LearningNotifications />
                        <button className="primary-button" onClick={handleAddLearningLink}>Add learning link <span aria-hidden="true">→</span></button>
                    </div>
                </div>
            )}
            {!user && (
                <div className="topbar-inner topbar-guest">
                    <span className="guest-label">A little progress, every day.</span>
                    <button className="primary-button" onClick={() => navigate('/login')}>Sign in to start <span aria-hidden="true">→</span></button>
                </div>
            )}
        </header>
    )
}