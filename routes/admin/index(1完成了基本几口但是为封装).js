const {
  query
} = require("express");

module.exports = (app) => {
  const express = require("express");
  const router = express.Router({
    mergeParams: true,
  });
  //获取模型
  //const Category = require("../../models/Category");

  //增
  router.post("/", async (req, res) => {
    const model = await req.Model.create(req.body);
    res.send(model);
  });
  //改，编辑
  router.put("/:id", async (req, res) => {
    const model = await req.Model.findByIdAndUpdate(req.params.id, req.body);
    res.send(model);
  });

  //分类列表的获取
  router.get("/", async (req, res) => {
    const queryOptions = {};
    if (req.Model.modelName === "Category") {
      queryOptions.populate = "parent";
    }
    //字段查询：获取接口返回的参数
    let obj = {};
    if (req.query) {
      obj = req.query;
      //循环获取的参数，进行正常模糊匹配
      Object.keys(obj).forEach((key) => {
        obj[key] = new RegExp(obj[key]);
      });

      // if( obj["name"]){
      //   obj["name"]=new RegExp( obj["name"])

      // }
    }
    //让此模型代替category
    const items = await req.Model.find(obj).setOptions(queryOptions).limit(100);
    res.send(items);
  });

  //删除
  router.delete("/:id", async (req, res) => {
    await req.Model.findByIdAndDelete(req.params.id, req.body);
    res.send({
      success: true,
    });
  });

  //获取分类详情页
  router.get("/:id", async (req, res) => {
    const model = await req.Model.findById(req.params.id);
    res.send(model);
  });

  app.use(
    "/admin/api/rest/:resource",
    async (req, res, next) => {
        //定义模型名称（下载好inflection）  classify()转类名
        const modelName = require("inflection").classify(req.params.resource);

        //定义模型 req表示给请求对象挂载一个属性Model
        req.Model = require(`../../models/${modelName}`);

        next();
      },
      router
  );

  //上传图片
  const multer = require("multer");
  //中间件，上传的地址
  const upload = multer({
    dest: __dirname + "/../../uploads"
  });
  //此接口，将允许接收上传的文件
  app.post("/admin/api/upload", upload.single("file"), async (req, res) => {
    const file = req.file;
    file.url = `http://localhost:3000/uploads/${file.filename}`;
    res.send(file);
  });

  //-------------------------------------------
  //登入接口
  app.post("/admin/api/login", async (req, res) => {
    // res.send('ok')
    
    //定义一个结构赋值
    const { username, password } = req.body;
     
    //2-1.根据用户名找用户
    const AdminUser = require("../../models/AdminUser");
    const user = await AdminUser.findOne({
      username:username
    }).select("+password"); //+password  取出来中间件 ; findOne找一个
   
    //判断用户是否存在
    if (!user) {
      return res.status(422).send({
        message: "用户不存在",
      });
    }

     //2-2.校验密码
    const isValid = require("bcryptjs").compareSync(password, user.password);
    if (!isValid) {
      return res.status(422).send({
        message: "密码错误",
      });
    }
    
    //2-3返回token：需下载模块npm i jsonwebtoken
    const jwt = require("jsonwebtoken");
    const token = jwt.sign({
      id: user._id
    }, app.get("secret")); //签名：生成一个Token
    res.send({
      token
    }); //发回给前端
  });
};