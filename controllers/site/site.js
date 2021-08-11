const {Cluster} = require('puppeteer-cluster')
const useProxy = require('puppeteer-page-proxy')
const {checkProxy} = require('./checkIp')


const launchOptions = {
  headless: true,
  // executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ignoreHTTPSErrors: true, // 忽略证书错误
  args: [
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--disable-web-security',
    '--disable-xss-auditor', // 关闭 XSS Auditor
    '--no-zygote',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--allow-running-insecure-content', // 允许不安全内容
    '--disable-webgl',
    '--disable-popup-blocking',
    '--disable-infobars',
    // `--proxy-server=${newProxyUrl}`, // 配置代理
    // `--proxy-server=180.109.144.18:4254`, // 配置代理
  ],
}

const clusterLanuchOptions = {
  concurrency: Cluster.CONCURRENCY_CONTEXT,
  maxConcurrency: 1, // 并发的workers数
  retryLimit: 1, // 重试次数
  skipDuplicateUrls: true, // 不爬重复的url
  monitor: false, // 显示性能消耗
  puppeteerOptions: launchOptions,
}
let ips = []
const getIp = async (ips) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async resolve => {
    if (ips.length === 0) {
      resolve('noProxy')
      return
    }
    // 随机数下标
    const randomNo = Math.floor(Math.random() * ips.length)
    const current = ips[randomNo]

    const enabled = await checkIp(current)
    if (!enabled) {
      ips.splice(randomNo, 1)
      if (!ips.length || status) {
        // win.webContents.send('site-log', `没有任何可以使用的代理ip`)
        resolve('noProxy')
        return
      }
      getIp(ips, win)
      // win.webContents.send('site-log', `代理ip: ${current.ip} 不可用 - 继续检测其它代理ip`)
    } else {
      console.log('检测到当前可用ip', current)
      resolve(current)
    }
  })
}

let current = []

class Clone {
  async create(ctx) {
    current = []
    const { urls } = ctx.request.body;
    console.log('urls',urls);

    const cluster = await Cluster.launch(clusterLanuchOptions)

    await cluster.task(async ({ page, data: url }) => {
      const proxy = await getIp(ips)
      if (proxy !== 'noProxy') {
        await useProxy(page, `http://${proxy.ip}:${proxy.port}`)
        useProxy.lookup(page).then(data => {
          console.log('当前使用ip', data)
          win.webContents.send('site-log', `当前使用ip-${data.ip}`)
        })
      }
  
      // 随机数下标
      const times = [1000, 2000, 3000, 4000]
      const randomNo = Math.floor(Math.random() * times.length)
      const currentTime = times[randomNo]
      await page.waitForTimeout(currentTime)
  
      try {
        await page.goto('https://baidu.com', { timeout: 15000 })
      } catch (error) {
        console.log('打开网页出错', url, error)
      }
      const inputArea = await page.$('#kw')
      await inputArea.type(`site:${url}`, 5000)
      await page.click('#su')
  
      let body = {}
      try {
        await page.waitForSelector('#container', { timeout: 10000 })
        // content_none 判断是否有结果
        const contentNone = await page.$('.content_none')
  
        if (!contentNone) {
          body.titles = await page.evaluate(() => {
            const titles = [...document.querySelectorAll('.new-pmd .t a')]
            let title = titles.map(a => (a.innerText))
            return title
          })
          // 有收录结果
        } else {
          body.titles = []
          // 没有收录结果
        }
        body.url = url
        body.error = false
      } catch (error) {
        console.log('error', error)
        // win.webContents.send('site-log', `打开网页出错-${url}`)
        body.title = []
        body.url = url
        body.error = true
      }
      current.push(body)
    })
  
    // 队列执行任务
    for (const iterator of urls) {
      cluster.queue(iterator)
    }
  
    await cluster.idle()
    await cluster.close().then(res => {
      console.log('全部完成,关闭')
      // status = 'all-finish'
    })

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