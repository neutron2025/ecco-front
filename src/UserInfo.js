

import React, { useState, useEffect,useContext  } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { AuthContext } from './AuthContext';

const UserInfo = () => {

    const { isLoggedIn,setIsLoggedIn, handleLogout } = useContext(AuthContext);

    // 存储 Token 和登录时间戳的状态
    const [userData, setUserData] = useState(null);
    const storedToken = localStorage.getItem('jwtToken');
    const loginTimeStamp = localStorage.getItem('loginTimeStamp');
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    

    const navigate = useNavigate();


    useEffect(() => {
      const storedLoggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
      if (!storedLoggedInStatus) {
          navigate('/');
          return;
      }

        // 检查 Token 是否过期，如果过期则跳转到登录页面
    if (storedToken && loginTimeStamp) {
        const currentTime = new Date().getTime();
        const elapsedTime = currentTime - parseInt(loginTimeStamp);
        if (elapsedTime >= 30 * 60 * 1000 || !localStorage.getItem('isLoggedIn')){
          handleLogout();
          return;
        }
        fetchUserData(storedToken);
        fetchCartItems();
      }
    }, [navigate]);


    useEffect(() => {
        // 检查 Token 是否过期，如果过期则跳转到登录页面
        if (storedToken && loginTimeStamp) {
          const currentTime = new Date().getTime();
          const elapsedTime = currentTime - parseInt(loginTimeStamp);
          if (elapsedTime >= 30 * 60 * 1000) {
            handleLogout();
            return;
          }
        }
      
      const checkLoginStatus = async () => {
          const token = localStorage.getItem('jwtToken');
          if (token) {
              setIsLoggedIn(true);
              await fetchUserData(token);
              await fetchCartItems(token);
          } else {
              setIsLoggedIn(false);
              navigate('/');
          }
          setIsLoading(false);
      };

      checkLoginStatus();
  }, [navigate, setIsLoggedIn]);

    const fetchUserData = async (token) => {
      try {
          const response = await fetch('http://127.0.0.1:3000/api/userinfo', {
              headers: {
                  Authorization: `Bearer ${token}`
              }
          });
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          console.log(data)
          if (data.error) {
              handleLogout();
          } else {
              setUserData(data);
          }
      } catch (error) {
          console.error('获取用户信息时出错:', error);
          handleLogout();
      }
  };

  const fetchCartItems = async (token) => {
     token = localStorage.getItem('jwtToken');
    if (!token) {
        console.error('Token not found');
        handleLogout();
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:3000/api/cart/', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCartItems(data.CartItems || []);
    } catch (error) {
        console.error('获取购物车信息时出错:', error);
    }
};

const handleDeleteCartItem = async (productRef, size, color) => {
  try {
      const response = await fetch('http://127.0.0.1:3000/api/cart/', {
          method: 'Delete',
          headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
          },
          body: JSON.stringify({
              ProductRef: productRef,
              Size: size,
              Color: color
          })
      });
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      // 重新获取购物车列表
      fetchCartItems(localStorage.getItem('jwtToken'));
  } catch (error) {
      console.error('删除购物车项目时出错:', error);
  }
};

 // 添加结算函数
 const handleCheckout = () => {
  // 这里可以添加一些验证逻辑，例如检查购物车是否为空
  if (cartItems.length === 0) {
      alert('购物车为空，无法结算');
      return;
  }
  // 导航到结算页面
  navigate('/checkout');
};

const handleGoBack = () => {
  navigate(-1); // 返回上一页
};

if (isLoading) {
  return <div>加载中...</div>;
}

if (!isLoggedIn) {
  return <div>请登录以查看用户信息。</div>;
}


    //no token ,so cant get userData, solve the no userData situation
    if (!userData) {
        console.log("000000000")
        return <div>Your login has already dated,login again.</div>;
    }

    return (

      <div>
        {isLoggedIn? (
          <>
            <Header isLoggedIn={isLoggedIn} setIsLoginModalOpen={() => {}}  />
               {/* 添加返回按钮 */}
               <button 
                        onClick={handleGoBack}
                        className="back-button"
                        style={{
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                            padding: '5px 10px',
                            backgroundColor: '#f0f0f0',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        返回
                    </button>

            <h2>用户信息</h2>
            <p>ID: {userData.id}</p>
            <p>First Name: {userData.first_name}</p>
            <p>Last Name: {userData.last_name}</p>
            <p>Email: {userData.email}</p>
            <p>Phone: {userData.phone}</p>
            <p>Power: {userData.Pow}</p>
            <p>Power Address: {userData.PowAddress}</p>
            {/* <p>Admin Flag: {userData.permissions.admin_flag? 'Yes' : 'No'}</p> */}
            <p>Created At: {userData.created_at}</p>
            <p>Updated At: {userData.updated_at}</p>
            <button onClick={handleLogout}>Logout</button>
            <h2>购物车</h2>
            {cartItems.length === 0 ? (
                        <p>您的购物车是空的。</p>
                    ) : (
                      <div>
                                                <ul>
                            {cartItems.map((item, index) => (
                                <li key={index} className="flex justify-between items-center mb-2">
                                    <div>
                                        <span>产品ID: {item.ProductRef}</span>
                                        <span className="ml-2">尺寸: {item.Size || '未指定'}</span>
                                        <span className="ml-2">颜色: {item.Color || '未指定'}</span>
                                        <span className="ml-2">数量: {item.Quantity}</span>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteCartItem(item.ProductRef, item.Size, item.Color)}
                                        className="bg-red-500 text-white px-2 py-1 rounded"
                                    >
                                        删除
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={handleCheckout}
                            className="bg-blue-500 text-white px-4 py-2 rounded mt-4 hover:bg-blue-600"
                        >去结算</button>

                      </div>

                    )}

          </>
        ) : (
          <div>Please log in to view user information.</div>
        )}
      </div>

    );
};

export default UserInfo;

//用户信息，购物车，订单，快递查询，权证查询，