const Router = require("koa-router");
const router = new Router();
const { upload } = require("../controllers/home");



router.get("/", ctx => {
  ctx.type = 'html';
  ctx.body = `<style type="text/css">*{ padding: 0; margin: 0; }; li{ line-height: 40px;} div{ padding: 4px 48px;} a{color:cadetblue;cursor:
    pointer;text-decoration: none} a:hover{text-decoration:underline; } body{ background: #fff; font-family:
    "Century Gothic","Microsoft yahei"; color: #333;font-size:18px; line-height: 30px;} h1{ font-size: 100px; font-weight: normal;
    margin-bottom: 12px; } p{ line-height: 1.6em; font-size: 42px }</style><div style="padding: 24px 48px;"><p>
    Niu Bi <br/><span style="font-size:30px">心上无垢，林间有风。</span></p>
    
    <ul>
     <li><a target="_blank" href="./site/">批量site</a></li>
     <li><a target="_blank" href="./baidutop/">top50网站查询</a></li>
     <li><a target="_blank" href="./kelong/">网站克隆</a></li>
     <li><a target="_blank" href="./tihuan/">tdk替换</a></li>
    </ul>
    </div> `;
});

router.post("/upload", upload);

module.exports = router;
