import {Routes, Route} from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setUser, clearUser, fetchUser } from './components/userSlice';
import { useEffect } from 'react';

function App() {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();


  useEffect(() => {
    const tokenData = localStorage.getItem('token');
    if (tokenData && !user) {
      const data = dispatch(fetchUser(tokenData));
      console.log(data);
    }

  }, [])

  return (
    <>
     <Routes>
       <Route path="/" element={<h1>Hello {user ? user.username : "World"}</h1>} />
     </Routes>
    </>
  )
}

export default App
