const Router = require("koa-router");
const router = new Router({
  prefix: "/replace",
});
const { create ,getWebsite,progress} = require("../controllers/replace/replace");

router.get("/getWebsite", getWebsite);

router.get("/progress", progress);

router.post("/", create);

// router.get("/:id", findById);

module.exports = router;
