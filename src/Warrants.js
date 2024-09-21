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
    const pow = location.state?.pow || 0;
    const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
    const [redeemingWarrant, setRedeemingWarrant] = useState(null);
    const [transactionHash, setTransactionHash] = useState('');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');

    const [isAlipayRedeemMode, setIsAlipayRedeemMode] = useState(false);
    const [alipayName, setAlipayName] = useState('');
    const [alipayAccount, setAlipayAccount] = useState('');
  
    

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

    const calculateExpiryDate = (warrant) => {
        if (warrant.is_redeemed) {
            return '已到期';
        }
        if (!warrant.created_at) {
            return '未知';
        }
        const issueDate = new Date(warrant.created_at);
        const expiryDate = new Date(issueDate.getTime() + 270 * 24 * 60 * 60 * 1000);
        return expiryDate.toLocaleDateString();
    };
    const getWarrantStatus = (warrant) => {
        if (warrant.is_redeemed) {
            return '已赎回';
        } else if (warrant.payment_status === '已支付') {
            return '增值中';
        } else {
            return warrant.payment_status;
        }
    };

    const calculateDaysDifference = (startDate, endDate) => {
        // 将日期转换为 UTC 时间，去除时区影响
        const start = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const end = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    
        // 计算差异并转换为天数
        return Math.floor((end - start) / (1000 * 60 * 60 * 24));
    };
    
    const calculateWarrantValue = (warrant) => {
        if (warrant.is_redeemed) {
            return '0.00'; // 已赎回的权证价值为 0
        }
        if (!warrant.created_at) {
            return '0.00';
        }
        const issueDate = new Date(warrant.created_at);
        const currentDate = new Date();
        const daysDifference = calculateDaysDifference(issueDate, currentDate);
        const valueMultiplier = Math.min(daysDifference / 270, 1);
        return (warrant.total_price * valueMultiplier).toFixed(2);
    };

    const calculateDailyIncrease = (warrant) => {
        if (warrant.is_redeemed) {
            return '0.00'; // 已赎回的权证没有每日增值
        }
        const dailyRate = warrant.total_price / 270;
        return dailyRate.toFixed(2);
    };

    //赎回 按钮
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
            total_price: warrant.total_price,
            redeemValue,
            message: `赎回后此权证单作废，共获得 ¥${redeemValue}。是否继续？`,
            isError: false
        });
        setIsRedeemModalOpen(true);
    };

    const handleAlipayRedeem = () => {
        // 这里添加支付宝赎回的逻辑
        console.log('进行支付宝赎回');
        setIsAlipayRedeemMode(true);
        // 不关闭模态框，而是切换到支付宝赎回模式
    };
//支付宝赎回
    const handleAlipayRedeemSubmit = async () => {
        // 验证输入
        if (!alipayName.trim() || !alipayAccount.trim()) {
            // 如果没有使用 toast，可以使用 alert 或设置一个错误状态来显示错误信息
            alert('请填写姓名和支付宝账号');
            return; // 终止函数执行
        }
            // 验证 POW 数量
        if (redeemingWarrant.total_price > pow) {
            alert(`您的 Pow 数量不足，最少需要 ${redeemingWarrant.total_price} Pow 才能进行赎回操作`);
            return;
        }
        try {
            const response = await fetch(`${apiUrl}/api/redemption-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${storedToken}`
                },
                body: JSON.stringify({
                    order_id: redeemingWarrant.id,
                    alipay_username: alipayName.trim(),
                    alipay_account: alipayAccount.trim(),
                    wallet_address: '',
                    hash: ''
                })
            });
    
            if (!response.ok) {
                throw new Error('赎回请求失败');
            }
    
            const data = await response.json();
            console.log('支付宝赎回成功:', data);
            
            // 关闭模态框和重置状态
            setIsRedeemModalOpen(false);
            setIsConfirmModalOpen(false);
            setIsAlipayRedeemMode(false);
            setAlipayName('');
            setAlipayAccount('');

            // 重新获取最新的权证数据
            await fetchWarrants();
            alert('支付宝赎回申请已提交');

            // toast.success('支付宝赎回申请已提交');
            } catch (error) {
                console.error('支付宝赎回失败:', error);
                // 可以添加错误提示
                // toast.error('支付宝赎回申请失败，请重试');
            }
    };

    const confirmRedeem = () => {
        setIsRedeemModalOpen(false);
        setIsConfirmModalOpen(true);
    };
//链上赎回
    const handleSubmitTransaction = async () => {
        if (!powaddr) {
            setIsRedeemModalOpen(true);
            setRedeemingWarrant({
                id: warrant.id,
                message: '请先设置权证钱包地址后再进行赎回操作。',
                isError: true
            });
            return;
        }   
        if (!transactionHash.trim()) {
            alert('请输入交易哈希');
            return;
        }
        // 这里处理提交交易哈希的逻辑
        console.log('提交交易哈希:', transactionHash);
        // 调用后端 API 进行赎回操作
        try {
            const response = await fetch(`${apiUrl}/api/redemption-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${storedToken}`
                },
                body: JSON.stringify({
                    order_id: redeemingWarrant.id,
                    alipay_username: '',
                    alipay_account: '',
                    wallet_address: powaddr, // 假设 powaddr 是存储钱包地址的变量
                    hash: transactionHash.trim()
                })
            });
    
            if (!response.ok) {
                throw new Error('赎回请求失败');
            }
    
            const data = await response.json();
            console.log('链上赎回成功:', data);
            
    
            // 关闭模态框和重置状态
            setIsConfirmModalOpen(false);
            setTransactionHash('');
            setRedeemingWarrant(null);
             // 重新获取最新的权证数据
            await fetchWarrants();
            alert('链上赎回申请已提交');
            
            // 可以添加成功提示
            // toast.success('链上赎回申请已提交');
        } catch (error) {
            console.error('链上赎回失败:', error);
            // 可以添加错误提示
            // toast.error('链上赎回申请失败，请重试');
        }
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
               
                {warrant.length === 0 ||warrant.filter(w => w.payment_status === '已支付').length === 0 ? (  
                    <p>您还没有任何权证。</p>
                ) : (
                    <ul className="space-y-4">
                        {/* .filter(w => w.payment_status === '已支付') */}
                        {warrant.filter(w => w.payment_status === '已支付').map((warrant) => (
                            <li key={warrant.id} className="bg-white shadow rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-semibold">可赎权证：{warrant.is_redeemed ? '0' : warrant.total_price}</h2>
                                    <p className="text-lg text-blue-600 font-semibold">
                                        权证价值：¥{calculateWarrantValue(warrant)}
                                    </p>
                                </div>
                                <p className="text-gray-600 text-sm">权证单ID: {warrant.id}</p>
           
                               <div className="flex justify-between text-sm items-center text-gray-600">
                                <p>发行日期: {new Date(warrant.created_at).toLocaleDateString()}</p>
                                <p>到期日期: {calculateExpiryDate(warrant)}</p>
                                </div>

                                <div className="flex justify-between items-center mt-2">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <p className="mr-4">状态: {getWarrantStatus(warrant)}</p>
                                        <p>今日增值: ¥{calculateDailyIncrease(warrant)}</p>
                                    </div>
                                    <button 
                                        // onClick={() => handleRedeem(warrant)}
                                        // className="bg-green-500 text-white px-4 py-1 rounded text-sm hover:bg-green-600"
                                        onClick={() => !warrant.is_redeemed && handleRedeem(warrant)}
                                        className={`px-4 py-1 rounded text-sm ${
                                            warrant.is_redeemed 
                                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                                            : 'bg-green-500 text-white hover:bg-green-600 cursor-pointer'
                                        }`}
                                    >
                                        {warrant.is_redeemed ? '已赎回' : '赎回'}
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
                        {/* <p>总权证数: {warrantsData.total}</p> */}
                        <p>总权证数: {warrant.filter(w => w.payment_status === '已支付').length}</p>
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
                    {!isAlipayRedeemMode ? (
                        <>
                        
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
                                        继续赎回
                                    </button>
                                </div>
                            )}
                                
                            {redeemingWarrant.isError && (
                                <div className="flex justify-end items-center justify-between">
                                    <button 
                                        onClick={handleAlipayRedeem}
                                        className="text-blue-500 hover:text-blue-700 text-sm"
                                    >
                                        或者你也可以支付宝赎回
                                    </button>
                                    <button 
                                        onClick={() => setIsRedeemModalOpen(false)}
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                    >
                                        确定
                                    </button>
                                </div>
                            )}
                        </>
                        ) : (
                            <div className="alipay-redeem-form">
                                <h2 className="text-xl font-bold mb-4">支付宝赎回</h2>
                                <p className="mb-4">请确认你的姓名和支付宝账号：</p>
                                <input
                                    type="text"
                                    placeholder="姓名"
                                    value={alipayName}
                                    onChange={(e) => setAlipayName(e.target.value)}
                                    className="w-full p-2 mb-2 border rounded"
                                />
                                <input
                                    type="text"
                                    placeholder="支付宝账号"
                                    value={alipayAccount}
                                    onChange={(e) => setAlipayAccount(e.target.value)}
                                    className="w-full p-2 mb-4 border rounded"
                                />
                                <div className="flex justify-end">
                                    <button 
                                        onClick={() => setIsAlipayRedeemMode(false)}
                                        className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600"
                                    >
                                        返回
                                    </button>
                                    <button 
                                        onClick={handleAlipayRedeemSubmit}
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                    >
                                        确认提交
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
        )}


        {/* 交易确认模态框 */}
        {isConfirmModalOpen && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg max-w-md w-full">
        {!isAlipayRedeemMode ? (
            <>
            <h2 className="text-xl font-bold mb-4">确认赎回交易</h2>
            <p className="mb-4">
                将权证提现到你的钱包，然后将权证从你的钱包发送到下面地址，并提交交易哈希后确认提交。
            </p>
            <p className="mb-4 font-semibold text-red-500 text-xs">
                转账到此地址: G1RHAJh5x4AAjLEgFAe8wgJcENfwk3nzSm3uWYWcLxnk
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
                placeholder="输入从你钱包转入上面地址后生成的交易哈希,系统链上确认后,会将USDT自动转入您的钱包"
                className="w-full p-2 border rounded mb-4"
                rows="3"
            />
            <div className="flex justify-end justify-between">
                <button 
                onClick={handleAlipayRedeem}
                className="text-blue-500 hover:text-blue-700 text-sm"
                >
                或者你也可以支付宝赎回
                </button>   

                <div>
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
            </>
            ) : (
                <div className="alipay-redeem-form">
                                <h2 className="text-xl font-bold mb-4">支付宝赎回</h2>
                                <p className="mb-4">请确认你的姓名和支付宝账号：</p>
                                <input
                                    type="text"
                                    placeholder="姓名"
                                    value={alipayName}
                                    onChange={(e) => setAlipayName(e.target.value)}
                                    className="w-full p-2 mb-2 border rounded"
                                />
                                <input
                                    type="text"
                                    placeholder="支付宝账号"
                                    value={alipayAccount}
                                    onChange={(e) => setAlipayAccount(e.target.value)}
                                    className="w-full p-2 mb-4 border rounded"
                                />
                                 <div className="flex justify-end">
                                    <button 
                                        onClick={() => setIsAlipayRedeemMode(false)}
                                        className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600"
                                    >
                                        返回
                                    </button>
                                    <button 
                                        onClick={handleAlipayRedeemSubmit}
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                    >
                                        确认提交
                                    </button>
                                </div>
                            </div>
                        )}
            </div>

        
            
 
            
         
    </div>
        )}






        </div>
    );
};

export default Warrants;