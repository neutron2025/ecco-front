import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import Header from './Header';
const apiUrl = process.env.REACT_APP_API_URL;

const Orders = () => {
    const { isLoggedIn, handleLogout } = useContext(AuthContext);
    const [ordersData, setOrdersData] = useState({ orders: [], total: 0, page: 1, limit: 5 });
    const [isLoading, setIsLoading] = useState(true);
    const storedToken = localStorage.getItem('jwtToken');
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/');
            return;
        }
    }, [isLoggedIn, navigate]);

    const fetchOrders = async (page = 1) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${apiUrl}/api/onepay?page=${page}&limit=${ordersData.limit}`, {
                headers: {
                    Authorization: `Bearer ${storedToken}`
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (!data || !data.orders) {
                console.error('获取的订单数据无效');
                setOrdersData(prev => ({ ...prev, orders: [], total: 0 }));
                return;
            }

            const paidOrders = data.orders.filter(order => order.payment_status === '已支付');

            setOrdersData(prev => ({
                ...prev,
                orders: paidOrders,
                total: data.total,
                page: data.page
            }));
        } catch (error) {
            console.error('获取订单信息时出错:', error);
            setOrdersData(prev => ({ ...prev, orders: [], total: 0 }));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [storedToken]);

    const handlePageChange = (newPage) => {
        fetchOrders(newPage);
    };

    if (isLoading) {
        return <div>加载中...</div>;
    }

    const getOrderStatusColor = (order) => {
        if (order.payment_status === '已支付') {
            const allItemsShipped = order.items.every(item => item.shipping_status !== '待发货');
            return allItemsShipped ? 'bg-green-100' : 'bg-orange-200';
        }
        return 'border-gray-300';
    };

    return (
        <div>
            <Header isLoggedIn={isLoggedIn} setIsLoginModalOpen={() => {}} />
            <div className="container mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold mb-4">我的订单</h2>
                {ordersData.orders.length === 0 ? (
                    <p>此处只显示已支付订单，您没有任何有效订单。</p>
                ) : (
                    <>
                        <ul className="space-y-4">
                            {ordersData.orders.map((order) => (
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
                        <div className="mt-4 flex justify-between items-center">
                            <div>
                                <p>总订单数: {ordersData.total}</p>
                                <p>当前页: {ordersData.page}</p>
                                <p>每页显示: {ordersData.limit}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button 
                                    onClick={() => handlePageChange(ordersData.page - 1)}
                                    disabled={ordersData.page === 1}
                                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                                >
                                    上一页
                                </button>
                                <button 
                                    onClick={() => handlePageChange(ordersData.page + 1)}
                                    disabled={ordersData.page * ordersData.limit >= ordersData.total}
                                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                                >
                                    下一页
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Orders;