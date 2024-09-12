```
安装 Tailwind CSS
 npm install tailwindcss postcss autoprefixer

  配置 Tailwind CSS
  npx tailwindcss init

  -> tailwind.config.js

    module.exports = {
     content: ['./src/**/*.{js,jsx,ts,tsx}'],
     theme: {
       extend: {},
     },
     plugins: [],
   };

->styles.css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;

->index.js
  import './styles.css'; // 确保这里是正确引入 Tailwind CSS 的样式文件路径

```
start
```
PORT=2000 npm start   或者  npm start 

```


### git 操作
```
 1、添加远程仓库：
    git remote add upstream <上游仓库地址>
 2、获取上游仓库的最新更改：
    git fetch upstream
 3、将本地更改暂存和提交：
    git add .
    git commit -m "描述你的本地更改"
 4、进行合并（merge）或变基（rebase）操作
    git merge upstream/main 或者   git rebase upstream/main
 5、将本地仓库的更改推送到远程仓库：
    git push

```

### 本地nginx docker
```
docker stop nginx-cors
docker rm nginx-cors
docker build -t nginx-cors .
docker run -d -p 80:80 --name nginx-cors nginx-cors
```
### 本地nginx.conf
```
server {
    listen 80;
    server_name localhost;

    # 增加客户端请求体的最大允许大小
    client_max_body_size 20M;

    location /api/ {
        proxy_pass http://host.docker.internal:3000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # 增加代理请求体的最大允许大小
        proxy_max_temp_file_size 0;
        proxy_request_buffering off;

        # 预检请求处理
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'http://localhost:5000';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE';
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            add_header 'Content-Length' 0;
            return 204;
        }

        # 非预检请求的CORS设置
        add_header 'Access-Control-Allow-Origin' 'http://localhost:5000' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;
    }

        # 图片请求的处理
    location /upload/ {
        proxy_pass http://host.docker.internal:3000/upload/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # 图片的CORS设置
        add_header 'Access-Control-Allow-Origin' 'http://localhost:5000';
        add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS';
    }
}



```