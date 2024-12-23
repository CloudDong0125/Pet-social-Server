const jwt = require('jsonwebtoken');
const assert = require('http-assert');
const express = require('express');
const router = express.Router({
  mergeParams: true
});

// 获取模型
const models = {
  Announcement: require('../../models/Announcement'),
  Item: require('../../models/Item'),
  Ad: require('../../models/Ad'),
  Room: require('../../models/Room'),
  Buy: require('../../models/Buy'),
  AdminUser: require('../../models/AdminUser'),
};

// 封装中间件函数
const setModel = async (req, res, next) => {
  try {
    const modelName = require('inflection').classify(req.params.resource);
    req.Model = models[modelName];
    if (!req.Model) {
      return res.status(404).send({
        status: 'error',
        msg: '模型未找到',
        data: null,
      });
    }
    next();
  } catch (err) {
    res.status(500).send({
      status: 'error',
      msg: '模型加载失败',
      data: null,
    });
  }
};

// 通用的GET请求处理函数
const handleGetRequest = async (req, res, customQuery = {}) => {
  try {
    let query = {
      ...customQuery
    };
    if (req.query.type) {
      query.type = req.query.type;
    } else if (req.Model.modelName === 'Buy') {
      query.type = {
        $in: ['1', '2']
      };
    }
    const data = await req.Model.find(query);
    res.send({
      status: 'success',
      msg: `获取${req.Model.modelName}信息成功`,
      data,
    });
  } catch (err) {
    console.error(`获取${req.Model.modelName}信息失败:`, err); // 添加日志记录
    res.status(500).send({
      status: 'error',
      msg: `获取${req.Model.modelName}信息失败`,
      data: null,
    });
  }
};

// 通用的POST请求处理函数
const handlePostRequest = async (Model, req, res) => {
  try {
    console.log(Model.modelName === 'Room', Model.modelName, req.body.user == '{}');
    // 验证 user 对象是否存在且不为空
    if (Model.modelName === 'Room' && (!req.body.user || Object.keys(req.body.user).length === 0)) {
      return res.status(400).send({
        status: 'error',
        msg: '创建Room时，user对象必须传入且不能为空',
        data: null,
      });
    }

    const model = await Model.create(req.body);
    res.send({
      status: 'success',
      msg: `创建${Model.modelName}成功`,
      data: model,
    });
  } catch (err) {
    console.error(`创建${Model.modelName}失败:`, err); // 添加日志记录
    res.status(500).send({
      status: 'error',
      msg: `创建${Model.modelName}失败`,
      data: null,
    });
  }
};

// 通用的PUT请求处理函数
const handlePutRequest = async (req, res) => {
  try {
    const model = await req.Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    res.send({
      status: 'success',
      msg: `更新${req.Model.modelName}成功`,
      data: model,
    });
  } catch (err) {
    console.error(`更新${req.Model.modelName}失败:`, err); // 添加日志记录
    res.status(500).send({
      status: 'error',
      msg: `更新${req.Model.modelName}失败`,
      data: null,
    });
  }
};


// 登录校验中间件
const authMiddleware = async (req, res, next) => {
  const token = String(req.headers.authorization || '').split(' ').pop(); // 获取token并且分割提取Bearer之后的
  // console.log(token,'token');
  try {
    // 解构赋值
    const {
      id
    } = jwt.verify(token, req.app.get('secret')); //  req.app注意这个
    assert(id, 401, '请先登录-无效的jwt token');
    // const tokenData = jwt.verify(token, app.get('secret'));
    // console.log(tokenData, 'tokenData');
    // req.user = tokenData; // 将用户信息存储在 req 对象中
    next(); // 调用 next() 继续处理请求
  } catch (err) {
    return res.status(401).send({
      status: 'error',
      msg: '请先登录',
      data: null
    });
  }
};

// 使用动态路由处理各个GET请求
router.param('resource', setModel); // 改为动态路由，你可以使用 Express 的 router.param 中间件来动态加载模型，并根据请求的 resource 参数来处理不同的 GET 请求。

router.get('/rest/:resource', authMiddleware, handleGetRequest);
// 使用通用函数处理各个POST请求
router.post('/rest/:resource', authMiddleware, async (req, res) => {
  const modelName = require('inflection').classify(req.params.resource);
  const Model = require(`../../models/${modelName}`);
  await handlePostRequest(Model, req, res);
});
router.put('/rest/:resource/:id', authMiddleware, handlePutRequest);


module.exports = app => {
  app.use('/demo/api', router);

  // 登入接口
  app.post("/demo/api/login", async (req, res) => {
    const {
      username,
      password
    } = req.body;

    // 2-1. 根据用户名找用户
    const AdminUser = require("../../models/AdminUser");
    const user = await AdminUser.findOne({
      username
    }).select("+password");

    // 判断用户是否存在
    if (!user) {
      return res.status(422).send({
        message: "用户不存在",
      });
    }

    // 2-2. 校验密码
    const isValid = require("bcryptjs").compareSync(password, user.password);
    if (!isValid) {
      return res.status(422).send({
        message: "密码错误",
      });
    }

    // 2-3 返回token：需下载模块npm i jsonwebtoken
    const jwt = require("jsonwebtoken");
    const token = jwt.sign({
      id: user._id
    }, app.get("secret"));

    const usermessage = await AdminUser.findOne({
      username
    }).select();
    res.send({
      success: isValid,
      usermessage: usermessage,
      token
    }); // 发回给前端
  });
};