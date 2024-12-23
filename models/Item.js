const mongoose = require('mongoose')
//查询mongoose文档后发现，findOneAndUpdate()内部会使用findAndModify驱动，驱动在新版mongoose即将被废弃，所以弹出警告
mongoose.set('useFindAndModify', false)
const schema = new mongoose.Schema({
    name:String,
    icon:String,
    pettype:String,
    old:String,
    userid:String,
})
module.exports = mongoose.model('Item',schema)