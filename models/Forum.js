const mongoose = require("mongoose");
//查询mongoose文档后发现，findOneAndUpdate()内部会使用findAndModify驱动，驱动在新版mongoose即将被废弃，所以弹出警告
mongoose.set("useFindAndModify", false);
const schema = new mongoose.Schema(
  {
    type: String,
    detail: String,
    title: String,
    user: Object, //发送人的名称
    want: [
      {
        name: String,
      },
    ],
    comments: [
      {
        send: Object,
        accept: Object,
        content: String,
        createtime:String,
        floor:String, 
        comments: [
          {
            send: Object,
            accept: Object,
            content: String,
            createtime: String, 
            number:String,
            floor:String, 
          },
        ],
      },
    ],
    imgs: [
      {
        image: String,
        url: String,
      },
    ],
  },
  {
    //时间戳：增加一个特殊标记，能够自动获取时间
    timestamps: true,
  }
);
module.exports = mongoose.model("Forum", schema);
