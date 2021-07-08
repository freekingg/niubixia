const User = require("../models/users");
const jsonwebtoken = require("jsonwebtoken");
const { secret } = require("../config");
class UserController {
  async find(ctx) {
    const params = {}
    const QUERY = Invalid(params)
    const { page, size } = Paging({ page: ctx.query.page, size: ctx.query.size })
    const query = Answer.find();
    const totalElements = await query.estimatedDocumentCount();

    ctx.body = await User.find(QUERY)
      .limit(size)
      .skip(page * size);
    ctx.body = {
      content,
      totalElements,
      totalPages: Math.ceil(totalElements / size)
    }
  }
  async findById(ctx) { }
  async create(ctx) {
    ctx.verifyParams({
      name: { type: "string", required: true },
      password: { type: "string", required: true }
    });
    const { name } = ctx.request.body;
    const repeatedUser = await User.findOne({ name });
    if (repeatedUser) {
      ctx.throw(409, "用户名已存在");
    }
    const user = await new User(ctx.request.body).save();
    ctx.body = user;
  }
  async update(ctx) {
    ctx.verifyParams({
      name: { type: "string", required: false },
      password: { type: "string", required: false },
      avatar_url: { type: "string", required: false },
      gender: { type: "string", required: false },
      headline: { type: "string", required: false },
      locations: { type: "array", itemType: "string", required: false },
      business: { type: "string", required: false },
      employments: { type: "array", itemType: "object", required: false },
      educations: { type: "array", itemType: "object", required: false }
    });
    const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body);
    if (!user) {
      ctx.throw(404, "用户不存在");
    }
    ctx.body = user;
  }
  async delete(ctx) {
    const user = await User.findByIdAndRemove(ctx.params.id);
    if (!user) {
      ctx.throw(404, "用户不存在");
    }
    ctx.status = 204;
  }
  async login(ctx) {
    ctx.verifyParams({
      name: { type: "string", required: true },
      password: { type: "string", required: true }
    });
    const user = await User.findOne(ctx.request.body);
    if (!user) {
      ctx.throw(401, "用户名或密码不正确");
    }
    const { _id, name } = user;
    const token = jsonwebtoken.sign({ _id, name }, secret, { expiresIn: "1d" });
    ctx.body = { token };
  }
}

module.exports = new UserController();
