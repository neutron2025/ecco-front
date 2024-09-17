

import React, { useState, useEffect,useContext  } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { AuthContext } from './AuthContext';
const apiUrl = process.env.REACT_APP_API_URL;


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
              await queryAutoOrders(token);
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
          const response = await fetch(`${apiUrl}/api/userinfo`, {
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
            const response = await fetch(`${apiUrl}/api/cart/`, {
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
        const response = await fetch(`${apiUrl}/api/cart/`, {
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

    //自动验证订单
    const queryAutoOrders = async (token) => {
        try {
            console.log("queryAutoOrders")
            const response = await fetch(`${apiUrl}/api/query-auto`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.updated_orders && data.updated_orders.length > 0) {
                // 如果有更新的订单，可能需要刷新用户数据以显示新的Pow值
                await fetchUserData(token);
            }
        } catch (error) {
            console.error('自动查询订单时出错:', error);
        }
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

    const handleOrdersClick = () => {
        navigate('/orders');
    };
    return (

      <div>
        {isLoggedIn? (
          <>
            <Header isLoggedIn={isLoggedIn} setIsLoginModalOpen={() => {}}  />



            <h2>用户信息</h2>
    
            <p className="flex items-center">
              <img src={`${process.env.PUBLIC_URL}/favicon.ico`} className="w-4 h-4 mr-2" />
              Power: {userData.Pow}
            </p>
            <p>Power Address: {userData.PowAddress}</p>
 
                       <button 
                        onClick={handleOrdersClick}
                        className="bg-blue-500 text-white px-4 py-2 rounded mt-4 hover:bg-blue-600"
                    >
                        我的订单
                    </button>
            
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
                                        <span className="ml-2">颜色: {item.Size || '未指定'}</span>
                                        <span className="ml-2">尺寸: {item.Color || '未指定'}</span>
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