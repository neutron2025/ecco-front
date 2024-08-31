import { data } from 'autoprefixer';
import React, { useState, useEffect } from 'react';

const UserInfo = ({isLoggedIn, setIsLoggedIn}) => {
    // 存储 Token 和登录时间戳的状态
    const [userData, setUserData] = useState(null);
    const storedToken = localStorage.getItem('jwtToken');
    const loginTimeStamp = localStorage.getItem('loginTimeStamp');


    useEffect(() => {
        // 检查 Token 是否过期，如果过期则跳转到登录页面
    if (storedToken && loginTimeStamp) {
        const currentTime = new Date().getTime();
        const elapsedTime = currentTime - parseInt(loginTimeStamp);
        if (elapsedTime >= 30 * 60 * 1000) {
          localStorage.clear()
          window.location.href = '/'; // 跳转到登录页面
        }
      }
  
      if (storedToken) {
        fetch('http://127.0.0.1:3000/userinfo', {
          headers: {
            Authorization: `Bearer ${storedToken}`
          }
        })
       .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
       .then(data => {
          setUserData(data);
          
          if(data.error){               //backend    "error": "Invalid or expired JWT"
            window.location.href = '/'; // 跳转到登录页面
          }
        })
       .catch(error => {
          console.error('Error fetching user info:', error);
        });
      }
    }, [storedToken,setIsLoggedIn]);

    const handleLogout = () => {
        localStorage.clear()
        window.location.href = '/';
    };

    //no token ,so cant get userData, solve the no userData situation
    if (!userData) {

        console.log("000000000")
        // localStorage.removeItem("isLoggedIn")
        // window.location.href = '/';
        // return <script>alert("Your login has already dated,login again.")</script>
        return <div>Your login has already dated,login again.</div>;
    }

    return (
        <div>
            <h2>User Information</h2>
            <p>ID: {userData.id}</p>
            <p>First Name: {userData.first_name}</p>
            <p>Last Name: {userData.last_name}</p>
            <p>Email: {userData.email}</p>
            <p>Phone: {userData.phone}</p>
            <p>Power: {userData.Pow}</p>
            <p>Power Address: {userData.PowAddress}</p>
            {/* <p>Admin Flag: {userData.permissions.admin_flag? 'Yes' : 'No'}</p> */}
            <p>Created At: {userData.created_at}</p>
            <p>Updated At: {userData.updated_at}</p>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default UserInfo;