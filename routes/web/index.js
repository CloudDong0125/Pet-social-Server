module.exports = (app) => {
  const router = require("express").Router();

  const Article = require("../../models/Article"); //引用需要的模型，文章里录入
  const Category = require("../../models/Category");
  // const Category = require("../../models/Category");


  //----------------------------CRUD 
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

  //分类列表的获取 -- 首页（轮播、小宠之星、圈）
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
    // //让此模型代替category
    // const items = await req.Model.find(obj).setOptions(queryOptions).limit(100);
    // res.send(items);

    try {
      //让此模型代替category
      const items = await req.Model.find(obj).setOptions(queryOptions).limit(100);
      res.status(200).send({
        code: 0,
        msg: '获取成功',
        data: items
      });
    } catch (err) {
      res.status(500).send({
        code: 500,
        msg: '获取失败',
        data: null
      });
    }
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
    console.log(req,'reqreqreqreqreq---')
    const model = await req.Model.findById(req.params.id);
    res.send(model);
  });

  app.use(
    "/web/api/rest/:resource",
    async (req, res, next) => {
        //定义模型名称（下载好inflection）  classify()转类名
        const modelName = require("inflection").classify(req.params.resource);

        //定义模型 req表示给请求对象挂载一个属性Model
        req.Model = require(`../../models/${modelName}`);

        next();
      },
      router
  );
  // =====================================================================

  //登入接口
  app.post("/web/api/login", async (req, res) => {
    //
    //定义一个结构赋值
    const {
      userType,
      password,
      username
    } = req.body;
    //1.根据用户名找用户
    const AdminUser = require("../../models/AdminUser");
    const user = await AdminUser.findOne({
      username
    }).select("password");
    //判断用户是否存在
    if (!user) {
      return res.status(422).send({
        success: false,
        message: "用户不存在",
      });
    }
    //2.校验密码
    const isValid = require("bcryptjs").compareSync(password, user.password);
    if (!isValid) {
      return res.status(422).send({
        success: false,
        message: "密码错误",
      });
    }
    const type = await AdminUser.findOne({
      userType: "webUser"
    }).select("password");
    if (!type) {
      return res.status(422).send({
        success: false,
        message: "该用户没有权限",
      });
    }
    const usermessage = await AdminUser.findOne({
      username
    }).select();

    res.send({
      success: isValid,
      usermessage: usermessage
    });

    //3.返回token
  });
  // =====================================================================
  //新闻资讯页
  router.get("/news/list", async (req, res) => {
    try {
      const parent = await Category.findOne({
        name: "新闻分类",
      });
      // 聚合查询
      const cats = await Category.aggregate([
        {
          $match: {
            parent: parent._id,
          },
        },
        {
          $lookup: {
            from: "articles",
            localField: "_id",
            foreignField: "categories",
            as: "newsList",
          },
        },
        {
          $addFields: {
            newsList: {
              $slice: ["$newsList", 5],
            }, //每个找5个，多余的不显示页面
          },
        },
      ]);
      //------------------------------------------------
      //定义热门的数据是随机获取的
      const subCats = cats.map((v) => v._id);
      cats.unshift({
        name: "热门",
        newsList: await Article.find()
          .where({
            categories: {
              $in: subCats,
            },
          })
          .populate("categories")
          .limit(5)
          .lean(),
      });
  
      cats.map((cat) => {
        cat.newsList.map((news) => {
          //  news.CategoryName = cat.name   //热门下的名字就是热门
          news.CategoryName =
            cat.name === "热门" ? news.categories[0].name : cat.name; //热门下的名字去第一个数组的
          return news;
        });
        return cat;
      });
      console.log(cats);
      res.status(200).send({
        code: 200,
        msg: "获取成功",
        data: cats,
      });
    } catch (err) {
      res.status(500).send({
        code: 500,
        msg: "获取失败",
        data: null,
      });
    }
  });
  //------------------------------------------------
  //新闻详情页面
  router.get('/articles/:id', async (req, res) => {
    const data = await Article.findById(req.params.id)
    res.send(data)
  })

  //-----------------------------------------------------------------  

  //上传图片
  const multer = require("multer");
  //中间件，上传的地址
  const upload = multer({
    dest: __dirname + "/../../uploads"
  });
  //此接口，将允许接收上传的文件
  app.post("/web/api/upload", upload.single("file"), async (req, res) => {
    const file = req.file;
    file.url = `http://localhost:3000/uploads/${file.filename}`;
    res.send(file);
  });

  //----------------------------------------------  
  app.use("/web/api", router);
};