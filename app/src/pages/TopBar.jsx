import {useState} from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './TopBar.css';
export default function TopBar() {
    const user = useSelector((state) => state.user.user);
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const handleSearch = () => {
        // Implement search functionality here
        console.log('Searching for:', search);
    };

    const handleAddLearningLink = () => {
        navigate('/learning-list');
    };
    return (
        <header className="topbar">
            {user && (
                <div className="topbar-inner">
                    <label className="search-box">
                        <span aria-hidden="true">⌕</span>
                        <input type="search" aria-label="Search links, notes, and skills" placeholder="Search links, notes, skills..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                        <kbd>⌘ K</kbd>
                    </label>
                    <div className="topbar-actions">
                        <button className="notification-button" aria-label="Notifications" title="Notifications">♧<i /></button>
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