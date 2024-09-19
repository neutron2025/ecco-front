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
    const [paidOrders, setPaidOrders] = useState([]);

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

                // 检查data.orders是否存在
                if (!data || !data.orders) {
                    console.error('获取的订单数据无效');
                    setOrdersData({ orders: [], total: 0, page: 1, limit: 10 });
                    return;
                }

                // 直接使用从查询订单数据中获取的支付状态
                const checkedOrders = data.orders.map((order) => {
                    return { ...order, payment_status: order.payment_status || '未知' };
                });

                // 过滤出已支付的订单
                const paidOrders = checkedOrders.filter(order => order.payment_status === '已支付');

                setPaidOrders(paidOrders);
                setOrdersData({ ...data, orders: paidOrders });
            } catch (error) {
                console.error('获取订单信息时出错:', error);
                setOrdersData({ orders: [], total: 0, page: 1, limit: 10 });
                // handleLogout();
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

    const getOrderStatusColor = (orders) => {
        if (orders.payment_status === '已支付') {
            const allItemsShipped = orders.items.every(item => item.shipping_status !== '待发货');
            if (allItemsShipped) {
                return 'bg-green-100'; // 已支付已发货
            } else {
                return 'bg-orange-200'; // 已支付待发货
            }
        }
        return 'border-gray-300'; // 其他状态
    };

    return (
        <div>
            <Header isLoggedIn={isLoggedIn} setIsLoginModalOpen={() => {}} />
            <h2 className="text-2xl font-bold mb-4">我的订单</h2>
            {orders.length === 0 ? (
                <p>您没有任何有效订单。</p>
            ) : (
                <>
                    <ul className="space-y-4">
                        {orders.map((order) => (
                            <li key={order.id} className={`border p-4 rounded-lg shadow ${getOrderStatusColor(order)}`}>
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
                                                发货状态: {item.shipping_status},
                                                快递单号: {item.deliverid || ' '}
                                        
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