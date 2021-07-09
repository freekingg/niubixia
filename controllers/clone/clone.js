const Down = require('./down')
const concurrentRun = require('./concurrentRun')


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

    // let requestFnList = urls.map(async url=> Down.create(url))

    // const reply = await  concurrentRun(requestFnList,2,'开始下载')
    console.log('reply',reply);
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