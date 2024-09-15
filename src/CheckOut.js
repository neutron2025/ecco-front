import React, { useState, useEffect,useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import AddressInfo from './AddressInfo';
import QRCode from 'qrcode';
const apiUrl = process.env.REACT_APP_API_URL;
const Checkout = () => {
    const [cartItems, setCartItems] = useState([]);
    const { isLoggedIn } = useContext(AuthContext);
    const navigate = useNavigate();
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [qrCode, setQrCode] = useState(null);
    const [showQrCode, setShowQrCode] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [orderData, setOrderData] = useState(null); 
    const [error, setError] = useState(null);
    const [addressData, setAddressData] = useState(null);

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/');
            return;
        }
        fetchCartItems();
    }, [isLoggedIn, navigate]);
    // 获取购物车信息
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
    // 选择地址
    const handleAddressSelect = (addressId) => {
        setSelectedAddressId(addressId);
        // 可以在这里执行其他操作，比如更新订单信息等
        console.log('Selected order address ID:', selectedAddressId);
    };
    // 确认订单
    const handleConfirmOrder = async () => {
        if (!selectedAddressId) {
            alert('请选择收货地址');
            return;
        }

        const token = localStorage.getItem('jwtToken');
        if (!token) {
            console.error('Token not found');
            navigate('/');
            return;
        }

        try {
            console.log(selectedAddressId)
            const response = await fetch(`${apiUrl}/api/orders/create`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    address_item_ref: selectedAddressId,
                })
                
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('订单创建成功:', data.order.id);
            setOrderId(data.order.id);

            // 清空购物车（前端状态）
            setCartItems([]);

            // 处理支付宝当面付的支付二维码
            if (data.qr_code) {
                setQrCode(data.qr_code);
                setShowQrCode(true);
                console.log('支付二维码:', data.qr_code);
            } else {
                console.error('未收到支付二维码');
            }
        } catch (error) {
            // console.log(selectedAddressId)
            console.error('创建订单时出错:', error);
            alert('创建订单失败，请重试');
            return;
        }

    };

    // 添加返回函数
    const handleGoBack = () => {
        navigate(-1); // 返回上一页
    };

    // 获取订单数据
    useEffect(() => {
        if (orderId) {
            fetchOrderData();
        }
    }, [orderId]);
    const fetchOrderData = async () => {
        if (!orderId) return;

        const token = localStorage.getItem('jwtToken');
        if (!token) {
            console.error('未找到令牌');
            navigate('/');
            return;
        }
        try {
            const response = await fetch(`${apiUrl}/api/onepay/${orderId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP错误！状态: ${response.status}`);
            }

            const data = await response.json();
            console.log('订单数据:', data);
            setOrderData(data);
        } catch (error) {
            setError(error.message);
            console.error('获取订单数据时出错:', error);
        }
    };

    // 获取地址
    useEffect(() => {
        fetchAddressById();
    }, [selectedAddressId]);
    //获取地址
    const fetchAddressById = async () => {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            console.error('未找到令牌');
            navigate('/');
            return;
        }
        console.log("selectedAddressId--"+selectedAddressId)
        try {
            const response = await fetch(`${apiUrl}/api/address/${selectedAddressId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP错误！状态: ${response.status}`);
            }   
            const data = await response.json();
            setAddressData(data);
            console.log("addressData--"+data)

        } catch (error) {
            console.error('获取地址数据时出错:', error);
            setError(error.message);
        }
    };

    // 在组件内部添加这个函数
    const formatAddress = (addressData) => {
        if (!addressData) {
            return '无可用地址';
        }
        return `${addressData.state}, ${addressData.city}, ${addressData.street} ${addressData.zip_code}`;

    };
    const formatcontact = (addressData) => {
        if (!addressData) {
            return '无可用地址';
        }
        return ` ${addressData.last_name}${addressData.first_name}, ${addressData.phone}`;

    };

// 生成二维码
    const qrCodeRef = useRef(null);
    useEffect(() => {
        if (qrCode && qrCodeRef.current) {
            QRCode.toCanvas(qrCodeRef.current, qrCode, {
                width: 256,
                height: 256,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            }, function (error) {
                if (error) console.error('生成二维码时出错:', error);
            });
        }
    }, [qrCode]);

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold mb-4">结算页面</h1>
                <button 
                    onClick={handleGoBack}
                     className="bg-gray-500 text-white px-3 mr-4 py-2 rounded hover:bg-gray-600"
                >
                    返回
                </button>
            </div>
            {cartItems.length === 0 ? (
            <div>
                <h2 className="text-xl font-bold mb-2">订单数据</h2>
                <p>订单时间: {orderData ? orderData.created_at : ' '}</p>
                <p>订单ID: {orderData ? orderData.order_id : ' '}</p>
                {/* <p>收货地址: {addressData ? formatAddress(addressData) : '加载中...'}</p> */}
                <div className="container bg-cyan-500 p-2 rounded-lg">
                    <p>收货地址: {addressData ? formatAddress(addressData) : '加载中...'}</p>
                    <p>联系方式: {addressData ? formatcontact(addressData) : '加载中...'}</p>
                </div>
                <p>订单状态: {orderData ? orderData.status : ' '} | 总价: {orderData ? orderData.total_price : ' '}</p>
            </div>
              
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
            {qrCode ? (
                <div className="mt-4 flex flex-col items-center">
                    <h2 className="text-xl font-bold mb-4">请扫描二维码完成支付</h2>
                    <div className="border-4 border-blue-500 p-2 rounded-lg shadow-lg">
                        <canvas ref={qrCodeRef}></canvas>
                    </div>
                    <p className="mt-4 text-sm text-gray-600">二维码已生成，请使用支付宝扫描</p>
                </div>
            ) : (
                <p className="mt-4 text-lg text-gray-600">正在生成支付二维码，请稍候...</p>
            )}
        </div>
    );
};

export default Checkout;