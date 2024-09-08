import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import AddressInfo from './AddressInfo';
const apiUrl = process.env.REACT_APP_API_URL;
const Checkout = () => {
    const [cartItems, setCartItems] = useState([]);
    const { isLoggedIn } = useContext(AuthContext);
    const navigate = useNavigate();
    const [selectedAddressId, setSelectedAddressId] = useState(null);

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/');
            return;
        }
        fetchCartItems();
    }, [isLoggedIn, navigate]);

    const fetchCartItems = async () => {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            console.error('Token not found');
            navigate('/');
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/api/cart/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
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

    const handleAddressSelect = (addressId) => {
        setSelectedAddressId(addressId);
        // 可以在这里执行其他操作，比如更新订单信息等
        console.log('Selected order address ID:', addressId);
    };

    const handleConfirmOrder = async () => {
        // 这里添加确认订单的逻辑 提交订单
        alert('订单已确认，即将进行支付');
        // 可以在这里添加导航到支付页面的逻辑
        // 支付成功后，修改订单状态
        // 支付成功后，清空购物车,
        // 支付成功后，增加用户积分
        // 支付成功后，跳转到订单页面
    };

    // 添加返回函数
    const handleGoBack = () => {
        navigate(-1); // 返回上一页
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">结算页面</h1>
            <button 
                    onClick={handleGoBack}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                    返回
                </button>
            {cartItems.length === 0 ? (
                <p>购物车为空</p>
            ) : (
                <>
                    <ul className="mb-4">
                        {cartItems.map((item, index) => (
                            <li key={index} className="mb-2">
                                <span>产品ID: {item.ProductRef}</span>
                                <span className="ml-2">尺寸: {item.Size || '未指定'}</span>
                                <span className="ml-2">颜色: {item.Color || '未指定'}</span>
                                <span className="ml-2">数量: {item.Quantity}</span>
                            </li>
                        ))}
                    </ul>
                    <AddressInfo onAddressSelect={handleAddressSelect} />
                    <button 
                        onClick={handleConfirmOrder }
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                        确认支付
                    </button>
                </>
            )}
        </div>
    );
};

export default Checkout;