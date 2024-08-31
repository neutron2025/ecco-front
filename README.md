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