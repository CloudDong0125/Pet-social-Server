const mongoose = require('mongoose')
//查询mongoose文档后发现，findOneAndUpdate()内部会使用findAndModify驱动，驱动在新版mongoose即将被废弃，所以弹出警告
mongoose.set('useFindAndModify', false)
const schema = new mongoose.Schema({
    name:String,
    parent:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Category" //关联到Categroy这个表
    }
})
schema.virtual('newsList',{
    localField:'_id',
    foreignField:'categories',
    justOne:false,
    ref:'Article'   
})

module.exports = mongoose.model('Category',schema)