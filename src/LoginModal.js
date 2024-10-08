import React,{useState} from "react";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const apiUrl = process.env.REACT_APP_API_URL;

const LoginModal = ({ onClose  , setIsLoggedIn }) => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [modalOpen, setModalOpen] = useState(false);


 
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        // 这里可以添加登录逻辑，例如向后端发送请求验证用户名和密码
        if (isRegistering) {
            // 注册逻辑
            console.log('Registering:', username, password);
            try {
                const response = await fetch(`${apiUrl}/api/signup`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ username, password }),
                });
          
                const data = await response.json();
                if (data.message){
                //   alert(data.message);
                  setErrorMessage(data.message);
                  console.log('Signup failed. Please try again.');
                } else {
                  onClose();
                  alert('Registration successful!');
                }
              } catch (error) {
                alert('An error occurred during signup. Please try again later.');
              }
            // onClose();
          } 
        else {
        // 登录逻辑
            try {
                const response = await fetch(`${apiUrl}/api/login`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json',},
                    body: JSON.stringify({ username, password }),
                });
            
            
                const data = await response.json();
                if(data.message!=null){
                    console.log(data.message)
                    setErrorMessage(data.message);
                    // alert(data.message || 'Login failed. Please try again.');
                }else if(data.token){
                    const token = data.token;
                   
                    // 将 token 存储到本地存储
                    localStorage.setItem('jwtToken', token);
                    // 保存登录状态到 localStorage
                    localStorage.setItem('isLoggedIn', true);

                    console.log('Login successful. Token:', token);
                    toast.success('Login successful!');
                    setIsLoggedIn(true); // 设置登录状态为已登录
                    onClose();
                    toast.success('Login successful!')
                     // 替换 alert，使用模态框组件
                     alert('Login successful!');
                    

                    
                    
                }
            }catch (error) {
                toast.error('An error occurred during login. Please try again later.');
            }
        
        }
        
      };
      
      return (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-100 p-6 rounded-md shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-semibold mb-4">
              {/* {isRegistering? 'Register' : 'Login'} */}
              {isRegistering? '注册' : '登录'}
            </h2>
            {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                {/* <label className="block text-gray-700 font-medium mb-1">Username:</label> */}
                <label className="block text-gray-700 font-medium mb-1">用户名:</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full border rounded-md p-2"
                  placeholder="电话号码或邮箱"
                />
              </div>
              <div className="mb-4">
                {/* <label className="block text-gray-700 font-medium mb-1">Password:</label> */}
                <label className="block text-gray-700 font-medium mb-1">密码:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border rounded-md p-2"
                  placeholder="密码"
                />
              </div>
              <div className="flex justify-between">
        
                <button type="submit" className="bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600">   
                    {/* {isRegistering? 'Register' : 'Login'}  */}
                    {isRegistering? '注册' : '登录'} 
                </button>
                <button type="button" onClick={onClose} className="border border-gray-400 rounded-md px-4 py-2 hover:bg-gray-200" >
                  {/* Cancel */}
                  取消
                </button>

              </div>
              {!isRegistering && (
                <p className="mt-4 text-gray-600">
                  {/* Don't have an account?{' '} */}
                  没有账号？
                  <span
                    className="text-blue-500 cursor-pointer"
                    onClick={() => setIsRegistering(true)}
                  >
                    {/* Register here. */}
                    在此注册
                  </span>
                </p>
              )}
              {isRegistering && (
                <p className="mt-4 text-gray-600">
                  {/* Already have an account?{' '} */}
                  已有账号？
                  <span
                    className="text-blue-500 cursor-pointer"
                    onClick={() => setIsRegistering(false)}
                  >
                    {/* Login instead. */}
                    在此登录
                  </span>
                </p>
              )}
            </form>
          </div>
        </div>
      );
    };

    
    export default LoginModal;