const mongoose = require("mongoose");
//查询mongoose文档后发现，findOneAndUpdate()内部会使用findAndModify驱动，驱动在新版mongoose即将被废弃，所以弹出警告
mongoose.set("useFindAndModify", false);
const schema = new mongoose.Schema({
  type: String,// 1"领养" ;2 "送养"
  detail: String,  //详情
  pettype: String,   //宠物类型
  petname: String,  //宠物名称
  user: Object, //发送人的名称
  time:String,  //时间
  
  want: [
    {
      name: String,
      
    },
  ],
  //回复，不设置死
  comments: [
    // { send: Object, accept: Object, content: String, type: String }
  ],
  imgs: [
    {
      image: String,
      url: String,
      
    },
  ],
});
module.exports = mongoose.model("Buy", schema);
