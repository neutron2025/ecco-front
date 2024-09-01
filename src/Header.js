
import React,{useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const Header = () => {
  const { isLoggedIn, setIsLoginModalOpen } = useContext(AuthContext);


    const navigate = useNavigate();

    const handlePersonalClick = () => {
      if (isLoggedIn) {
        navigate('/userinfo');
      } else {
        setIsLoginModalOpen(true);
      }
    };


  return (
    <header className="bg-gray-800 p-4 flex justify-between items-center">
        <h1 className="text-white">Product Gallery</h1>
      {isLoggedIn? (
        <button className="bg-gray-300 text-black rounded-md px-4 py-2" onClick={handlePersonalClick}>Personal</button>
      ) : (

        <button className="text-white" onClick={handlePersonalClick}>Login</button>

      )}
    </header>
    
  );
};

export default Header;

