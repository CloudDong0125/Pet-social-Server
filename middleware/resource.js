module.exports = options => {
   
    return async (req, res, next) => {
        //定义模型名称（下载好inflection）  classify()转类名
        const modelName = require("inflection").classify(req.params.resource);

        //定义模型 req表示给请求对象挂载一个属性Model
        req.Model = require(`../models/${modelName}`);

        next();
    }
}