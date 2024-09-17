import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import Header from './Header';
const apiUrl = process.env.REACT_APP_API_URL;

const Orders = () => {
    const { isLoggedIn, handleLogout } = useContext(AuthContext);
    const [ordersData, setOrdersData] = useState({ orders: [], total: 0, page: 1, limit: 10 });
    const [isLoading, setIsLoading] = useState(true);
    const storedToken = localStorage.getItem('jwtToken');
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/');
            return;
        }
    }, [isLoggedIn, navigate]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/onepay`, {
                    headers: {
                        Authorization: `Bearer ${storedToken}`
                    }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setOrdersData(data);
            } catch (error) {
                console.error('获取订单信息时出错:', error);
                handleLogout();
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, [storedToken, handleLogout]);

    if (isLoading) {
        return <div>加载中...</div>;
    }
    const orders = ordersData.orders || [];

    return (
        <div>
            <Header isLoggedIn={isLoggedIn} setIsLoginModalOpen={() => {}} />
            <h2 className="text-2xl font-bold mb-4">我的订单</h2>
            {orders.length === 0 ? (
                <p>您没有任何订单。</p>
            ) : (
                <>
                    <ul className="space-y-4">
                        {orders.map((order) => (
                            <li key={order.id} className="border p-4 rounded-lg shadow">
                                <p className="font-semibold">订单ID: {order.id}</p>
                                <p>总价: ¥{order.total_price}</p>
                                <p>支付状态: {order.payment_status || '未知'}</p>
                                <p>创建时间: {order.created_at !== "0001-01-01T00:00:00Z" ? new Date(order.created_at).toLocaleString() : '未知'}</p>
                                <h4 className="font-semibold mt-2">订单项目:</h4>
                                {order.items && order.items.length > 0 ? (
                                    <ul className="list-disc list-inside">
                                        {order.items.map((item, index) => (
                                            <li key={index}>
                                                商品ID: {item.product_ref}, 
                                                数量: {item.quantity}, 
                                                尺寸: {item.size}, 
                                                颜色: {item.color}, 
                                                价格: ¥{item.price}, 
                                                发货状态: {item.shipping_status}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>无订单项目信息</p>
                                )}
                            </li>
                        ))}
                    </ul>
                    <div className="mt-4">
                        <p>总订单数: {ordersData.total}</p>
                        <p>当前页: {ordersData.page}</p>
                        <p>每页显示: {ordersData.limit}</p>
                    </div>
                </>
            )}
        </div>
    );
};

export default Orders;