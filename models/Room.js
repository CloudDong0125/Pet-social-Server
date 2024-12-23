const mongoose = require("mongoose");
//查询mongoose文档后发现，findOneAndUpdate()内部会使用findAndModify驱动，驱动在新版mongoose即将被废弃，所以弹出警告
mongoose.set("useFindAndModify", false);
const schema = new mongoose.Schema({
  content: String,
  icon: String,
  pettype: String,
  petname:String,
  userid:String, //发送者的名称
  user:Object, //发送人的名称
  time:String,
  num: [{
      name:String
  }],
  comments: [
    //   { send: Object, 
    //     accept: Object,
    //     content:String
    //  }
    ],
  imgs: [
    {
      image: String,
      url: String,
    },
  ],
});
module.exports = mongoose.model("Room", schema);
