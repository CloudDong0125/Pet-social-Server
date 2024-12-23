const jwt = require('jsonwebtoken')
const assert = require('http-assert')
const express = require("express");
const router = express.Router({
  mergeParams: true,
});

// 获取模型
const Announcement = require('../../models/Announcement');
const Item = require('../../models/Item');
const Ad = require('../../models/Ad');
const Room = require('../../models/Room');
const Buy = require('../../models/Buy');
const AdminUser = require("../../models/AdminUser");


// 封装中间件函数
const setModel = async (req, res, next) => {
  try {
    const modelName = require('inflection').classify(req.params.resource);
    req.Model = require(`../../models/${modelName}`);
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
const handleGetRequest = async (Model, req, res, customQuery = {}) => {
  try {
    let query = {
      ...customQuery
    };
    if (req.query.type) {
      query.type = req.query.type;
    } else if (Model.modelName === 'Buy') {
      query.type = {
        $in: ['1', '2']
      };
    }
    const data = await Model.find(query);
    res.send({
      status: 'success',
      msg: `获取${Model.modelName}信息成功`,
      data,
    });
  } catch (err) {
    res.status(500).send({
      status: 'error',
      msg: `获取${Model.modelName}信息失败`,
      data: null,
    });
  }
};

// 使用通用函数处理各个GET请求
router.get('/announcements', async (req, res) => {
  const announcements = await Announcement.find();
  const announcementsString = announcements.map(announcement => announcement.content).join('\n');
  res.send({
    status: 'success',
    msg: '获取公告信息成功',
    data: announcementsString,
  });
});
router.get('/rest/ads', (req, res) => handleGetRequest(Ad, req, res));
router.get('/rest/items', (req, res) => handleGetRequest(Item, req, res));
router.get('/rest/room', (req, res) => handleGetRequest(Room, req, res));
router.get('/rest/buy', (req, res) => handleGetRequest(Buy, req, res));

 

module.exports = app => {
  app.use('/demo/api', router);
};