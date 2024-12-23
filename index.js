//引用express
const express = require("express")
//定义一个实例
const app = express()

app.set('secret','s1d25d54') // 秘钥

//引用中间件
app.use(require('cors')()); // 跨域中间件
app.use(express.json());    
 
app.use('/uploads',express.static(__dirname + '/uploads'))   //静态托管文件


require("./plugins/db")(app); // 连接数据库
require("./routes/admin")(app); // 路由

require("./routes/web")(app); // 路由
require("./routes/demo")(app); // 路由


//启动
app.listen(3000, () => {
  console.log('http://localhost:3000');
});
