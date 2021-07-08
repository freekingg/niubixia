const Router = require("koa-router");
const router = new Router({
  prefix: "/clone",
});
const { create, progress } = require("../controllers/clone");

router.get("/progress", progress);

router.post("/", create);

// router.get("/:id", findById);

module.exports = router;
