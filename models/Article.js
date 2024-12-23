const mongoose = require("mongoose");
//查询mongoose文档后发现，findOneAndUpdate()内部会使用findAndModify驱动，驱动在新版mongoose即将被废弃，所以弹出警告
mongoose.set("useFindAndModify", false);
const schema = new mongoose.Schema(
  {
    title: String,
    //分类
    categories: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Category", //关联到Categroy这个表
      },
    ],
    body: String,
  },
  {
    //时间戳：增加一个特殊标记，能够自动获取时间
    timestamps: true,
  }
);
module.exports = mongoose.model("Article", schema);
