import React, { useState, useEffect } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
import Header from './Header';

const Warrants = () => {
    const [warrantsData, setWarrantsData] = useState({ warrants: [], total: 0, page: 1, limit: 10 });
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL;
    const storedToken = localStorage.getItem('jwtToken');
    const location = useLocation();
    const powaddr = location.state?.powaddr || '';

    useEffect(() => {
        const fetchWarrants = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${apiUrl}/api/onepay`, {
                    headers: {
                        'Authorization': `Bearer ${storedToken}`
                    }
                });
                if (!response.ok) {
                    throw new Error('获取权证失败');
                }
                const data = await response.json();

                if (!data || !data.orders) {
                    console.error('获取的权证数据无效');
                    setWarrantsData({ warrants: [], total: 0, page: 1, limit: 10 });
                    return;
                }

                setWarrantsData(data);
            } catch (error) {
                console.error('获取权证时出错:', error);
                setWarrantsData({ warrants: [], total: 0, page: 1, limit: 10 });
            } finally {
                setIsLoading(false);
            }
        };

        fetchWarrants();
    }, [apiUrl, storedToken]);


    if (isLoading) {
        return <div>加载中...</div>;
    }

    const warrant = warrantsData.orders || [];

    const calculateExpiryDate = (createdAt) => {
        if (!createdAt) {
            return '未知';
        }
        const issueDate = new Date(createdAt);
        const expiryDate = new Date(issueDate.getTime() + 270 * 24 * 60 * 60 * 1000);
        return expiryDate.toLocaleDateString();
    };
    const getWarrantStatus = (paymentStatus) => {
        return paymentStatus === '已支付' ? '增值中' : paymentStatus;
    };

    const calculateDaysDifference = (startDate, endDate) => {
        // 将日期转换为 UTC 时间，去除时区影响
        const start = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const end = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    
        // 计算差异并转换为天数
        return Math.floor((end - start) / (1000 * 60 * 60 * 24));
    };
    
    const calculateWarrantValue = (createdAt, totalPrice) => {
        if (!createdAt) return '0.00';
        const issueDate = new Date(createdAt);
        const currentDate = new Date();
        const daysDifference = calculateDaysDifference(issueDate, currentDate);
        const valueMultiplier = Math.min(daysDifference / 270, 1);
        return (totalPrice * valueMultiplier).toFixed(2);
    };

    const calculateDailyIncrease = (createdAt, totalPrice) => {
        const dailyRate = totalPrice / 270;
        return dailyRate.toFixed(2);
    };

    const handleRedeem = (warrantId) => {
        if (!powaddr) {
            alert('请先设置权证钱包地址后再进行赎回操作。');
            // 可以在这里添加导航到设置权证地址的页面的逻辑
            return;
        }
        
        // 如果有 powaddr，继续赎回逻辑
        console.log(`赎回权证 ID: ${warrantId}`);
        // 这里添加实际的赎回逻辑
    };

    return (
        <div>
            <Header />
                    <h1 className="text-2xl font-bold">我的权证</h1>
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">

                </div>
                {warrant.length === 0 ? (
                    <p>您还没有任何权证。</p>
                ) : (
                    <ul className="space-y-4">
                        {warrant.map((warrant) => (
                            <li key={warrant.id} className="bg-white shadow rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-semibold">可赎权证：{warrant.total_price}</h2>
                                    <p className="text-lg text-blue-600 font-semibold">
                                        权证价值：¥{calculateWarrantValue(warrant.created_at, warrant.total_price)}
                                    </p>
                                </div>
                                <p className="text-gray-600 text-sm">权证单ID: {warrant.id}</p>
           
                               <div className="flex justify-between text-sm items-center text-gray-600">
                                <p>发行日期: {new Date(warrant.created_at).toLocaleDateString()}</p>
                                <p>到期日期: {calculateExpiryDate(warrant.created_at)}</p>
                            </div>

                                <div className="flex justify-between items-center mt-2">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <p className="mr-4">状态: {getWarrantStatus(warrant.payment_status)}</p>
                                        <p>今日增值: ¥{calculateDailyIncrease(warrant.created_at, warrant.total_price)}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleRedeem(warrant.id)}
                                        className="bg-green-500 text-white px-4 py-1 rounded text-sm hover:bg-green-600"
                                    >
                                        赎回
                                    </button>
                                </div>
                                {/* 可以根据需要添加更多字段 */}
                            </li>
                        ))}
                    </ul>
                )}
                <div className="mt-4">
                    <p>总权证数: {warrantsData.total}</p>
                    <p>当前页: {warrantsData.page}</p>
                    <p>每页显示: {warrantsData.limit}</p>
                </div>
            </div>
        </div>
    );
};

export default Warrants;