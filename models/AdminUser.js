const mongoose = require ('mongoose')
//查询mongoose文档后发现，findOneAndUpdate()内部会使用findAndModify驱动，驱动在新版mongoose即将被废弃，所以弹出警告
mongoose.set('useFindAndModify', false)

const schema = new mongoose.Schema({
    username:String,
    password:{
        type:String,
        select:false,
        set(val){ // 自定义改一下再保存
            return require('bcryptjs').hashSync(val,10)   //在需要加密的模块中引入bcryptjs库 
        }
    },
    userType:String,//"adminUser"是管理员，"webUser"是用户  
    icon:String,
    old:String,
    pettype:String,
    lock:String

})

module.exports = mongoose.model('AdminUse',schema)