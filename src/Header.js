
import React,{useContext } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const Header = () => {
  const { isLoggedIn, setIsLoginModalOpen ,handleLogout} = useContext(AuthContext);


    const navigate = useNavigate();
    const location = useLocation();

    const handlePersonalClick = () => {
      if (isLoggedIn) {
        navigate('/userinfo');
      } else {
        setIsLoginModalOpen(true);
      }
    };

  const handleGoBack = () => {
    navigate(-1);
  };

     // 检查当前是否在产品详情页面
  const isProductDetailPage = location.pathname.startsWith('/product/') || location.pathname === '/userinfo'|| location.pathname === '/orders'||location.pathname === '/warrants';
  const isOrdersPage = location.pathname === '/orders'||location.pathname === '/warrants';
  const isUserInfoPage = location.pathname === '/userinfo';

  return (
    <header className="bg-gray-800 p-4 flex justify-between items-center">
         <div className="flex items-center">
        {isProductDetailPage && (
          <button
            onClick={handleGoBack}
            className="bg-gray-500 text-white px-3 mr-4 py-2 rounded hover:bg-gray-600"
          >
            返回
          </button>
        )}
        <h1 className="text-white">Product Gallery</h1>
      </div>
      {/* {isLoggedIn? (
        <button className="bg-gray-300 text-black rounded-md px-4 py-2" onClick={handlePersonalClick}>Personal</button>
      ) : (

        <button className="text-white" onClick={handlePersonalClick}>Login</button>

      )} */}
            {/* {!isOrdersPage && (
        isLoggedIn ? (
          <button className="bg-gray-300 text-black rounded-md px-4 py-2" onClick={handlePersonalClick}>
            Personal
          </button>
        ) : (
          <button className="text-white" onClick={handlePersonalClick}>
            Login
          </button>
        )
      )} */}
            {!isOrdersPage && (
        isLoggedIn ? (
          isUserInfoPage ? (
            <button className="bg-red-500 text-white rounded-md px-4 py-2" onClick={handleLogout}>
              登出
            </button>
          ) : (
            <button className="bg-gray-300 text-black rounded-md px-4 py-2" onClick={handlePersonalClick}>
              Personal
            </button>
          )
        ) : (
          <button className="text-white" onClick={handlePersonalClick}>
            登录
          </button>
        )
      )}
    </header>
    
  );
};

export default Header;

