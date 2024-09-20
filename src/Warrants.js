import React, { useState, useEffect } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
import Header from './Header';

const Warrants = () => {
    const [warrantsData, setWarrantsData] = useState({ warrants: [], total: 0, page: 1, limit: 5 });
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL;
    const storedToken = localStorage.getItem('jwtToken');
    const location = useLocation();
    const powaddr = location.state?.powaddr || '';

    const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
    const [redeemingWarrant, setRedeemingWarrant] = useState(null);
    const [transactionHash, setTransactionHash] = useState('');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');
    


    const fetchWarrants = async (page = 1) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${apiUrl}/api/onepay?page=${page}&limit=${warrantsData.limit}`, {
                headers: {
                    'Authorization': `Bearer ${storedToken}`
                }
            });
            if (!response.ok) {
                throw new Error('获取权证失败');
            }
            const data = await response.json();
            setWarrantsData(data);
        } catch (error) {
            console.error('获取权证时出错:', error);
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        fetchWarrants();
    }, []);

    const handlePageChange = (newPage) => {
        fetchWarrants(newPage);
    };

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

    const handleRedeem = (warrant) => {
        if (!powaddr) {
            setIsRedeemModalOpen(true);
            setRedeemingWarrant({
                id: warrant.id,
                message: '请先设置权证钱包地址后再进行赎回操作。',
                isError: true
            });
            return;
        }
        
        // 如果有 powaddr，继续赎回逻辑
        console.log(`赎回权证 ID: ${warrant.id}`);
        const redeemValue = calculateWarrantValue(warrant.created_at, warrant.total_price);
        console.log(redeemValue);
        console.log(warrant.total_price);
        console.log(warrant.created_at);
        setIsRedeemModalOpen(true);
        setRedeemingWarrant({
            id: warrant.id,
            redeemValue,
            message: `赎回后此权证单作废，共获得 ¥${redeemValue}。确定要赎回吗？`,
            isError: false
        });
        setIsRedeemModalOpen(true);
    };
    const confirmRedeem = () => {
        setIsRedeemModalOpen(false);
        setIsConfirmModalOpen(true);
    };

    const handleSubmitTransaction = () => {
        // 这里处理提交交易哈希的逻辑
        console.log('提交交易哈希:', transactionHash);
        // 调用后端 API 进行赎回操作
        // redeemWarrant(redeemingWarrant.id, redeemingWarrant.redeemValue, transactionHash);
        setIsConfirmModalOpen(false);
        // 重置状态
        setTransactionHash('');
        setRedeemingWarrant(null);
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopySuccess('已复制到剪贴板');
            setTimeout(() => setCopySuccess(''), 2000); // 2秒后清除提示
        } catch (err) {
            setCopySuccess('复制失败，请手动复制');
        }
    };

    const redeemWarrant = async (warrantId, redeemValue) => {
        try {
            const response = await fetch(`${apiUrl}/api/redeem-warrant`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${storedToken}`
                },
                body: JSON.stringify({ 
                    warrant_id: warrantId,
                    redeem_value: redeemValue
                })
            });
    
            if (!response.ok) {
                throw new Error('赎回请求失败');
            }
    
            const data = await response.json();
            alert('赎回成功: ' + data.message);
            // 刷新权证列表
            // fetchWarrants();
        } catch (error) {
            alert('赎回失败: ' + error.message);
        }
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
                                        onClick={() => handleRedeem(warrant)}
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
 {/* ... 权证列表 ... */}
 <div className="mt-4 flex justify-between items-center">
                    <div>
                        <p>总权证数: {warrantsData.total}</p>
                        <p>当前页: {warrantsData.page}</p>
                        <p>每页显示: {warrantsData.limit}</p>
                    </div>
                    <div className="flex space-x-2">
                        <button 
                            onClick={() => handlePageChange(warrantsData.page - 1)}
                            disabled={warrantsData.page === 1}
                            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                        >
                            上一页
                        </button>
                        <button 
                            onClick={() => handlePageChange(warrantsData.page + 1)}
                            disabled={warrantsData.page * warrantsData.limit >= warrantsData.total}
                            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                        >
                            下一页
                        </button>
                    </div>
                </div>


            </div>



        {/* 赎回确认模态框 */}
        {isRedeemModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg">
                        <p className={`text-lg mb-4 ${redeemingWarrant.isError ? 'text-red-500' : ''}`}>
                            {redeemingWarrant.message}
                        </p>
                        {!redeemingWarrant.isError && (
                            <div className="flex justify-end">
                                <button 
                                    onClick={() => setIsRedeemModalOpen(false)}
                                    className="bg-red-500 text-white px-4 py-2 rounded mr-2 hover:bg-red-600"
                                >
                                    取消
                                </button>
                                <button 
                                    onClick={confirmRedeem}
                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                >
                                    确认赎回
                                </button>
                            </div>
                        )}
                        {redeemingWarrant.isError && (
                            <div className="flex justify-end">
                                <button 
                                    onClick={() => setIsRedeemModalOpen(false)}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    确定
                                </button>
                            </div>
                        )}
                    </div>
                </div>
        )}


        {/* 交易确认模态框 */}
        {isConfirmModalOpen && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">确认赎回交易</h2>
            <p className="mb-4">
                将权证提现到你的钱包，然后将权证从你的钱包发送到下面地址，并提交交易哈希后确认提交。
            </p>
            <p className="mb-4 font-semibold text-red-500 text-xs">
                转账地址: G1RHAJh5x4AAjLEgFAe8wgJcENfwk3nzSm3uWYWcLxnk
            </p>
            <button 
                onClick={() => copyToClipboard('G1RHAJh5x4AAjLEgFAe8wgJcENfwk3nzSm3uWYWcLxnk')}
                className="text-blue-500 text-xs hover:text-blue-700 mt-1"
            >
                点击此处复制转账地址
            </button>
            {copySuccess && <p className="text-xs text-green-500 mt-2">{copySuccess}</p>}
            <textarea
                value={transactionHash}
                onChange={(e) => setTransactionHash(e.target.value)}
                placeholder="请输入交易哈希"
                className="w-full p-2 border rounded mb-4"
                rows="3"
            />
            <div className="flex justify-end">
                <button 
                    onClick={() => setIsConfirmModalOpen(false)}
                    className="bg-red-500 text-white px-4 py-2 rounded mr-2 hover:bg-red-600"
                >
                    取消
                </button>
                <button 
                    onClick={handleSubmitTransaction}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                    确认提交
                </button>
            </div>
            </div>
    </div>
        )}






        </div>
    );
};

export default Warrants;