const Replace = require("./replaceFile");
const fs = require("fs");
const paths = require("path");
const { getDir } = require("../../common/utils");

let current = [];

class Clone {
  async create(ctx) {
    current = [];
    const { contents, path } = ctx.request.body;

    // 获取目录下的文件夹
    let files = [];
    try {
      files = await getDir(path);
    } catch (error) {
      ctx.body = {
        code: -1,
        data: [],
      };
    }

    let formatFile = files.map((item,index)=>{
      return {
        file:item,
        content:contents[index]
      }
    })

    for (const file of formatFile) {
      let result = await Replace.create(file);
      console.log('result',result);
      current.push(result);
    }

    console.log("全部完成了");
    ctx.body = {
      code: 0,
      data: "全部完成了",
    };
  }

  async getWebsite(ctx) {
    const { path } = ctx.query;
    let files = [];
    try {
      files = await getDir(path);
    } catch (error) {
      console.log('error: ', error);
      ctx.body = {
        code: -1,
        data: [],
      };
    }

    ctx.body = {
      code: 0,
      data: files,
    };
  }

  async progress(ctx) {
    ctx.body = {
      code: 0,
      data: current
    };
  }

}

module.exports = new Clone();
