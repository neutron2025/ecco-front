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
    const [newPowAddr, setNewPowAddr] = useState('');
    const [isSettingPowAddr, setIsSettingPowAddr] = useState(false);

    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState(null);
    

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
    const handleWarrantsClick = () => {
        if (userData && userData.powaddr) {
            navigate('/warrants', { state: { powaddr: userData.powaddr ,pow:userData.pow } });
        } else {
            navigate('/warrants');
        }
    };



    const handleSetPowAddr = async () => {
        if (!newPowAddr) {
            alert('请输入有效的权证地址');
            return;
        }
        try {
            const response = await fetch(`${apiUrl}/api/user/pow-addr`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${storedToken}`
                },
                body: JSON.stringify({ powaddr: newPowAddr })
            });

            if (!response.ok) {
                throw new Error('设置权证地址失败');
            }

            const data = await response.json();
            alert(data.message);
            setIsSettingPowAddr(false);
            // 更新用户数据以显示新的权证地址
            await fetchUserData(storedToken);
        } catch (error) {
            console.error('设置权证地址时出错:', error);
            alert('设置权证地址失败，请稍后重试');
        }
    };

    const handleWithdraw = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/transfer-scl`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${storedToken}`
                },
                body: JSON.stringify({ amount: withdrawAmount })
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            alert('提现成功: ' + data.message);
            setIsWithdrawModalOpen(false);
            // 刷新用户数据
            await fetchUserData(storedToken);
        } catch (error) {
            alert('提现失败: ' + error.message);
        }
    };



    return (

      <div>
        {isLoggedIn? (
          <>
            <Header isLoggedIn={isLoggedIn} setIsLoginModalOpen={() => {}}  />

            <h2>用户信息</h2>
    
            <p className="flex items-center">
              <img src={`${process.env.PUBLIC_URL}/favicon.ico`} className="w-4 h-4 ml-2 mr-1" />
              (权证)Power: {userData.pow}
              <button 
                    // onClick={() => setIsWithdrawModalOpen(true)}
                    onClick={() => {
                        if (!userData.powaddr) {
                            alert('请先设置钱包地址');
                        } else {
                            setIsWithdrawModalOpen(true);
                        }
                    }}
                    className="ml-4 bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                >
                    提现到钱包
                </button>

            </p>
                        {/* 提现模态框 */}
                        {isWithdrawModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg">
                        <h2 className="text-xl mb-4">提取权证到钱包</h2>
                        <p className="text-xs text-gray-500 mb-4 break-all leading-tight">
                            {userData.powaddr || '未设置'}
                        </p>
    
                        <input
                            type="number"
                            placeholder="每次提现数量最少218个"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(parseFloat(e.target.value))}
                            className="border rounded px-2 py-1 mb-4 w-full"
                            required
                        />
                        <div className="flex justify-end">
                            <button 
                                onClick={handleWithdraw}
                                className="bg-green-500 text-white px-4 py-2 rounded mr-2 hover:bg-green-600"
                            >
                                确认
                            </button>
                            <button 
                                onClick={() => setIsWithdrawModalOpen(false)}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                            >
                                取消
                            </button>
                            </div>
                    </div>
                </div>
            )}






            {/* <p className=" ml-2 flex text-sm text-gray-500 items-center">钱包地址: {userData.powaddr || '未设置'}</p> */}
            <div className="ml-2 flex flex-wrap items-center">
                <p className="whitespace-nowrap">钱包地址:</p> 
                <p className="text-sm text-gray-500 ml-1">
                    {userData.powaddr || '未设置'}
                </p>
            </div>
            {!isSettingPowAddr ? (
                    <button 
                        onClick={() => setIsSettingPowAddr(true)}
                        className="ml-4 bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                    >
                        设置地址
                    </button>
                ) : (
                    <div className="ml-1">
                        <input 
                            type="text" 
                            value={newPowAddr}
                            onChange={(e) => setNewPowAddr(e.target.value)}
                            placeholder="权证地址,即是您的Solana区块链钱包地址"
                            className="border rounded px-1 py-1 mr-1 text-sm w-96 flex-grow"
                        />
                        <button 
                            onClick={handleSetPowAddr}
                            className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600 mr-2"
                        >
                            确认
                        </button>
                        <button 
                            onClick={() => setIsSettingPowAddr(false)}
                            className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                        >
                            取消
                        </button>
                    </div>
                )}


 
                <button 
                onClick={handleOrdersClick}
                className="bg-blue-500 text-white ml-16 px-4 py-2 rounded my-4 hover:bg-blue-600"
            >
                我的订单
            </button>
                <button 
                onClick={handleWarrantsClick}
                className="bg-blue-500 text-white mx-4 px-4 py-2 rounded my-4 hover:bg-blue-600"
            >
                我的权证
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