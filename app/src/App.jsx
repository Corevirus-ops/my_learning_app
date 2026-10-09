import {Routes, Route} from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setUser, fetchUser } from './components/userSlice';
import { useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home'; 
import NavBar from './pages/NavBar';



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
    <div>
     <NavBar />
      <section>
     <Routes>
       <Route path="/" element={<Home />} />
       <Route path="/login" element={<Login />} />
       <Route path="/register" element={<Register />} />
     </Routes>
      </section>
    </div>
  )
}

export default App
