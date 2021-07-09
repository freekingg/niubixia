const Router = require("koa-router");
const router = new Router({
  prefix: "/bd",
});
const { create } = require("../controllers/baiduTop/baiduTop");

// router.get("/", find);

router.post("/", create);

// router.get("/:id", findById);

module.exports = router;
