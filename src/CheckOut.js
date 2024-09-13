import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import AddressInfo from './AddressInfo';
import AlipayQRCode from './AlipayQRCode';
const apiUrl = process.env.REACT_APP_API_URL;
const Checkout = () => {
    const [cartItems, setCartItems] = useState([]);
    const { isLoggedIn } = useContext(AuthContext);
    const navigate = useNavigate();
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [qrCode, setQrCode] = useState(null);
    const [showQrCode, setShowQrCode] = useState(false);

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
        console.log('Selected order address ID:', selectedAddressId);
    };



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
            console.log('订单创建成功:', data);

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
        return(
            <>
         {showQrCode && qrCode && <AlipayQRCode qrCodeUrl={qrCode} />}
            </>
        )

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
            {showQrCode && (
                <div className="mt-4">
                    <h2 className="text-xl font-bold mb-2">请扫描二维码完成支付</h2>
                    <img src={qrCode} alt="支付二维码" className="mx-auto" />
                </div>
            )}
        </div>
    );
};

export default Checkout;