const Down = require('./down')

let current = []

class Clone {
  async create(ctx) {
    current = []
    const { urls } = ctx.request.body;
    console.log('urls',urls);

    for (const url of urls) {
      let result =  await Down.create(url)
      current.push({url,status:result})
    }

    console.log('全部完成了');
    ctx.body = {
      code: 0,
      data: '全部完成了',
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