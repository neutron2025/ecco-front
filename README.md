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
PORT=2000 npm start

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
### 编译成静态文件，部署给nginx 
```

npm run build:prod   
然后 将build中的前端文件配置到nginx 路径，详见后端readme
```