import {Routes, Route} from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setUser, fetchUser } from './components/userSlice';
import { useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';


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

  const handleLogout = () => {
    dispatch(setUser(null));
    localStorage.removeItem('token');
  };

  return (
    <>
     <Routes>
       <Route path="/" element={<h1>Hello {user ? user.username : "World"}<button onClick={handleLogout}>Logout</button></h1>} />
       <Route path="/login" element={<Login />} />
       <Route path="/register" element={<Register />} />
     </Routes>
    </>
  )
}

export default App
