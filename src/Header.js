import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ isLoggedIn, setIsLoggedIn,setIsLoginModalOpen  }) => {


    const navigate = useNavigate();
    const handlePersonalClick = () => {
        navigate('/userinfo');
      };
 

    const handleLoginClick = () => {
        // 不要直接设置为已登录状态，而是触发打开登录模态框的逻辑
        setIsLoginModalOpen(true);
        };

  return (
    <header className="bg-gray-800 p-4 flex justify-between items-center">
        <h1 className="text-white">Product Gallery</h1>
      {isLoggedIn? (
        <button className="bg-gray-300 text-black rounded-md px-4 py-2" onClick={handlePersonalClick}>Personal</button>
      ) : (
        <button className="text-white" onClick={handleLoginClick}>Login</button>
      )}
    </header>
    
  );
};

export default Header;

    //  <header className="bg-gray-800 p-4 flex justify-between items-center">
    //     <h1 className="text-white">Product Gallery</h1>
    //     <button className="text-white" onClick={handleLoginClick}>Login</button>
    //   </header> 