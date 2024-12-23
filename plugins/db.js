module.exports = app => {
    const mongoose = require("mongoose")
    mongoose.connect('mongodb://127.0.0.1/Pet-social-server',{
    // mongoose.connect('mongodb://127.0.0.1/vue-node-mongodb2024', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })

    //数据库模块中引用一遍所有模型，防止报错npm i require-all插件
    require('require-all')(__dirname + '/../models') //引用全部的models下js


}