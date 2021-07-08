const Koa = require("koa");
const path = require("path");
const koaBody = require("koa-body");
const koaStatic = require("koa-static");
const parameter = require("koa-parameter");
const error = require("koa-json-error");
const routing = require("./routes");
const app = new Koa();


// 静态托管
app.use(koaStatic(path.join(__dirname, "public")));
app.use(koaStatic(path.join(__dirname, "page")));

// 错误处理
app.use(
  error({
    postFormat: (e, { stack, ...rest }) =>
      process.env.NODE_ENV === "production" ? rest : { stack, ...rest }
  })
);

// 处理post请求和图片上传
app.use(
  koaBody({
    multipart: true,
    formidable: {
      uploadDir: path.join(__dirname, "/public/uploads"),
      keepExtensions: true
    }
  })
);

// 参数校验
app.use(parameter(app));

// 路由处理
routing(app);

app.listen(3000, () => console.log('\x1B[45m%s\x1B[49m', '牛逼工具: server is running at http://localhost:3000 node服务已启动'));
