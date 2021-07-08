const Topic = require("../models/topics");
const User = require("../models/users");
const { Invalid, Paging } = require("../common/utils")
class TopicController {
  async find(ctx) {
    const params = {}
    const QUERY = Invalid(params)
    const { page, size } = Paging({ page: ctx.query.page, size: ctx.query.size })
    const query = Answer.find();
    const totalElements = await query.estimatedDocumentCount();

    const content = await Topic.find(QUERY)
      .limit(size)
      .skip(page * size);
    ctx.body = {
      content,
      totalElements,
      totalPages: Math.ceil(totalElements / size)
    }
  }
  async findById(ctx) {
    const { fields } = ctx.query;
    const selectFields =
      fields &&
      fields
        .split(";")
        .filter(f => f)
        .map(f => " +" + f)
        .join("");
    const topic = await Topic.findById(ctx.params.id).select(selectFields);
    ctx.body = topic;
  }
  async create(ctx) {
    ctx.verifyParams({
      name: { type: "string", required: true },
      avatar_url: { type: "string", required: false },
      introduction: { type: "string", required: false }
    });
    const topic = await new Topic(ctx.request.body).save();
    ctx.body = topic;
  }
  async update(ctx) {
    ctx.verifyParams({
      name: { type: "string", required: false },
      avatar_url: { type: "string", required: false },
      introduction: { type: "string", required: false }
    });
    const topic = await Topic.findByIdAndUpdate(
      ctx.params.id,
      ctx.request.body
    );
    ctx.body = topic;
  }
  async listTopicFollowers(ctx) {
    const users = await User.find({ followingTopics: ctx.params.id });
    ctx.body = users;
  }
  async checkTopicExist(ctx, next) {
    const topic = await Topic.findById(ctx.params.id);
    if (!topic) {
      ctx.throw(404, "...不存在");
    }
    await next();
  }
}

module.exports = new TopicController();
