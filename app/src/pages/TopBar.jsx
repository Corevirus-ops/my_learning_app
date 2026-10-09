import {useState} from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
        <section>
            {user && (
                <div>
                    <input type="search" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    <button onClick={handleSearch}>Search</button>
                    <button>Notifications</button>
                    <button onClick={handleAddLearningLink}>Add Learning Link</button>
                </div>
            )}
            {!user && (
                <div>
                    <button onClick={() => navigate('/login')}>Add Learning Link</button>
                </div>
            )}
        </section>
    )
}