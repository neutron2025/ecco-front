import { data } from 'autoprefixer';
import React, { useState, useEffect } from 'react';
const apiUrl = process.env.REACT_APP_API_URL;
const AddressInfo = ({ onAddressSelect }) => {
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [newAddress, setNewAddress] = useState({
        phone: '',
        firstName: '',
        lastName: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
    });

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${apiUrl}/api/address`,{
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
                }
            });
            if (response.status === 404) {
                console.log(response.message);
                setAddresses([]);
                setError(response.message);
            }
            else if (!response.ok) {
                throw new Error('获取地址失败');
            }
            const data = await response.json();
            console.log('Fetched addresses:', data); // 添加日志
            if (Array.isArray(data)) {
                setAddresses(data);
                const defaultAddress = data.find(addr => addr.is_default);
                if (defaultAddress) {
                    setSelectedAddressId(defaultAddress.ID);
                    onAddressSelect(defaultAddress.ID);
                }
            } else {
                setAddresses([]);
            }
        } catch (error) {
            console.error('获取地址失败:', error);
            setError('获取地址失败，请稍后重试');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddressSelect = (addressId) => {
        setSelectedAddressId(addressId);
        onAddressSelect(addressId);
        console.log('Selected address ID:', addressId);
    };

    const handleNewAddressChange = (e) => {
        setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
    };

    const handleSaveAddress = async () => {
        try {
            const url = editingAddressId
                ? `${apiUrl}/api/address/${editingAddressId}`
                : `${apiUrl}/api/address`;
            
            const method = editingAddressId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
                },
                body: JSON.stringify(newAddress),
            });

            if (!response.ok) {
                throw new Error(editingAddressId ? '更新地址失败' : '添加新地址失败');
            }

            const data = await response.json();
            await fetchAddresses(); // 重新获取地址列表

            setSelectedAddressId(data.ID);
            if (typeof onAddressSelect === 'function') {
                onAddressSelect(data.ID);
            }

            setShowNewAddressForm(false);
            setEditingAddressId(null);
            setNewAddress({ phone: '', first_name: '', last_name: '', street: '', city: '', state: '', zip_code: '' });
        } catch (error) {
            console.error(editingAddressId ? '更新地址失败:' : '添加新地址失败:', error);
            setError(editingAddressId ? '更新地址失败，请稍后重试' : '添加新地址失败，请稍后重试');
        }
    };

    const handleDeleteAddress = async (addressId) => {
        try {
            const response = await fetch(`${apiUrl}/api/address/${addressId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
                },
            });
            if (!response.ok) {
                throw new Error('删除地址失败');
            }
            await fetchAddresses(); // 重新获取地址列表
        } catch (error) {
            console.error('删除地址失败:', error);
            setError('删除地址失败，请稍后重试');
        }
    };

    const handleEditAddress = (address) => {
        setNewAddress(address);
        setEditingAddressId(address.ID);
        setShowNewAddressForm(true);
    };

    if (isLoading) {
        return <div>加载中...</div>;
    }

    if (error) {
        return <div>错误: {error}</div>;
    }

    
    return (
        <div className="address-info">
            <h3>收货信息</h3>
            {error && <div className="error-message">{error}</div>}
            {isLoading ? (
                <div>加载中...</div>
            ) : addresses.length === 0 ? (
                <p>暂无地址信息，请添加新地址。</p>
            ) : (
                addresses.map(address => (
                    <div key={address.ID} className="address-item">
                        <input
                            type="radio"
                            id={`address-${address.ID}`}
                            name="address"
                            checked={selectedAddressId === address.ID}
                            onChange={() => handleAddressSelect(address.ID)}
                        />
                        <label htmlFor={`address-${address.ID}`}>
                            {address.first_name} {address.last_name}, {address.phone}
                            <br />
                            {address.street}, {address.city}, {address.state} {address.zip_code}
                        </label>
                        <button onClick={() => handleEditAddress(address)}>编辑</button>
                        <button onClick={() => handleDeleteAddress(address.ID)}>删除</button>
                    </div>
                ))
            )}
             {!showNewAddressForm ? (
                <button onClick={() => {
                    setEditingAddressId(null);
                    setNewAddress({ phone: '', first_name: '', last_name: '', street: '', city: '', state: '', zip_code: '' });
                    setShowNewAddressForm(true);
                }}>
                    添加新地址
                </button>
            ) : (
                <div className="new-address-form">
                    <input name="first_name" placeholder="名" value={newAddress.first_name} onChange={handleNewAddressChange} />
                    <input name="last_name" placeholder="姓" value={newAddress.last_name} onChange={handleNewAddressChange} />
                    <input name="phone" placeholder="电话" value={newAddress.phone} onChange={handleNewAddressChange} />
                    <input name="street" placeholder="街道地址" value={newAddress.street} onChange={handleNewAddressChange} />
                    <input name="city" placeholder="城市" value={newAddress.city} onChange={handleNewAddressChange} />
                    <input name="state" placeholder="省/州" value={newAddress.state} onChange={handleNewAddressChange} />
                    <input name="zip_code" placeholder="邮编" value={newAddress.zip_code} onChange={handleNewAddressChange} />
                    <button onClick={handleSaveAddress}>
                        {editingAddressId ? '更新地址' : '保存新地址'}
                    </button>
                    <button onClick={() => {
                        setShowNewAddressForm(false);
                        setEditingAddressId(null);
                        setNewAddress({ phone: '', first_name: '', last_name: '', street: '', city: '', state: '', zip_code: '' });
                    }}>取消</button>
                </div>
            )}
        </div>
    );

  
};

export default AddressInfo;
