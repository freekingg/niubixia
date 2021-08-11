const Router = require("koa-router");
const router = new Router({
  prefix: "/site",
});
const { create, progress } = require("../controllers/site/site");

router.get("/progress", progress);

router.post("/", create);

// router.get("/:id", findById);

module.exports = router;
