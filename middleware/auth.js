module.exports = options => {
    // 注意要引入
    const jwt = require('jsonwebtoken')
    const assert = require('http-assert')
    const AdminUser = require("../models/AdminUser");

    return async (req, res, next) => {
        // 校验用户是否登录 token
        const token = String(req.headers.authorization || '').split(' ').pop(); // 获取token并且分割提取Bearer之后的
        assert(token, 401, '请先登录-请提供jwt token');

        // 解构赋值
        const {
            id
        } = jwt.verify(token, req.app.get('secret')); //  req.app注意这个
        assert(id, 401, '请先登录-无效的jwt token');


        req.user = await AdminUser.findById(id); // 通过这个id去找到是否有这个用户 req挂载到这里才可以使用哦
        assert(req.user, 401, '请先登录');

        await next();
    }
}