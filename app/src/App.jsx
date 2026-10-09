import {Routes, Route} from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setUser, fetchUser } from './components/userSlice';
import { useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home'; 
import LearningList from './pages/LearningList';
import NavBar from './pages/NavBar';
import TopBar from './pages/TopBar';



function App() {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();


  useEffect(() => {
    const tokenData = localStorage.getItem('token');
    if (tokenData && !user) {
      dispatch(fetchUser()).then((action) => {
        if (action.payload) {
          dispatch(setUser(action.payload));
        }
      });
    }

  }, []);


  return (
    <div className="app-shell">
      <NavBar />
      <div className="app-main">
        <TopBar />
        <main className="page-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/learning-list" element={<LearningList />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
