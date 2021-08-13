const { Cluster } = require("puppeteer-cluster");
const useProxy = require("puppeteer-page-proxy");
const { checkProxy } = require("./checkIp");
const execSync = require("child_process").execSync;

const pppoe = {
  name: "pppoe",
  username: "t531f72340824",
  password: "220908",
};

let time = 0;

const launchOptions = {
  headless: true,
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  // executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  // ignoreHTTPSErrors: true, // 忽略证书错误
  args: [
    // '--disable-gpu',
    // '--disable-dev-shm-usage',
    // '--disable-web-security',
    // '--disable-xss-auditor', // 关闭 XSS Auditor
    // '--no-zygote',
    // '--no-sandbox',
    // '--disable-setuid-sandbox',
    // '--allow-running-insecure-content', // 允许不安全内容
    // '--disable-webgl',
    // '--disable-popup-blocking',
    // '--disable-infobars',
    // `--proxy-server=${newProxyUrl}`, // 配置代理
    // `--proxy-server=180.109.144.18:4254`, // 配置代理
  ],
};

const clusterLanuchOptions = {
  concurrency: Cluster.CONCURRENCY_CONTEXT,
  maxConcurrency: 1, // 并发的workers数
  retryLimit: 1, // 重试次数
  skipDuplicateUrls: true, // 不爬重复的url
  monitor: false, // 显示性能消耗
  puppeteerOptions: launchOptions,
};
let ips = [];
const getIp = async (ips) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve) => {
    if (ips.length === 0) {
      resolve("noProxy");
      return;
    }
    // 随机数下标
    const randomNo = Math.floor(Math.random() * ips.length);
    const current = ips[randomNo];

    const enabled = await checkProxy(current);
    if (!enabled) {
      ips.splice(randomNo, 1);
      if (!ips.length) {
        // win.webContents.send('site-log', `没有任何可以使用的代理ip`)
        resolve("noProxy");
        return;
      }
      getIp(ips);
      // win.webContents.send('site-log', `代理ip: ${current.ip} 不可用 - 继续检测其它代理ip`)
    } else {
      console.log("检测到当前可用ip", current);
      resolve(current);
    }
  });
};

// 拨号
let changeIp = (pppoe) => {
  return new Promise((resolve) => {
    let stop = execSync("rasdial /d");
    console.log("断开网络", stop);
    let cmd = execSync(
      `rasdial ${pppoe.name} ${pppoe.username} ${pppoe.password}`
    );
    console.log("重新链接", cmd);
    resolve(cmd);
  });
};

let current = [];

class Clone {
  async create(ctx) {
    time = 0;
    current = [];
    const { urls } = ctx.request.body;
    console.log("urls", urls);

    const cluster = await Cluster.launch(clusterLanuchOptions);

    await cluster.task(async ({ page, data: url }) => {
      // const proxy = await getIp(ips)
      // console.log('proxy',proxy);
      // if (proxy !== 'noProxy') {
      //   await useProxy(page, `http://${proxy.ip}:${proxy.port}`)
      //   useProxy.lookup(page).then(data => {
      //     console.log('当前使用ip', data)
      //   })
      // }
      time++;
      let body = {};
      try {
        if (time % 3 == 0) {
          await changeIp(pppoe);
        }

        console.log("baidu-begin01");

        // 随机数下标
        const times = [1000, 2000, 3000, 4000, 10000];
        const randomNo = Math.floor(Math.random() * times.length);
        const currentTime = times[randomNo];
        await page.waitForTimeout(currentTime);

        // page.on('console', msg => console.log('PAGE LOG:', msg.text()));

        await page.goto("https://baidu.com", { timeout: 40000 });

        const inputArea = await page.$("#kw");
        await inputArea.type(`site:${url}`, 5000);
        await page.click("#su");

        
        await page.waitForTimeout(3000);

        await page.waitForSelector("#container", { timeout: 60000 });
        // content_none 判断是否有结果
        const contentNone = await page.$(".content_none");
        await page.waitForTimeout(1000);
        if (!contentNone) {
          body.titles = await page.evaluate(() => {
            const titles = [...document.querySelectorAll(".result")];
            let h3s = titles.map((el) => {
              let h3 = el.querySelector("h3");
              return h3 ? h3.innerText : "";
            });
            return h3s;
          });
          // console.log("// 有收录结果", body);
        } else {
          body.titles = [];
          // 没有收录结果
          console.log("// 没有收录结果");
        }
        body.url = url;
        body.error = false;
        body.url = url;
      } catch (error) {
        console.log("error", error);
        // win.webContents.send('site-log', `打开网页出错-${url}`)
        body.title = [];
        body.url = url;
        body.error = true;
      }
      try {
        // console.log("body", body);
        // console.log("body", current);
        current.push(body);
        await page.waitForTimeout(3000);
      } catch (error) {
        console.log("error", error);
      }
    });

    // 队列执行任务
    for (const iterator of urls) {
      cluster.queue(iterator);
    }

    await cluster.idle();
    await cluster.close().then((res) => {
      console.log("全部完成,关闭");
      // status = 'all-finish'
    });

    ctx.body = {
      code: 0,
      data: "全部完成了",
    };
  }

  async progress(ctx) {
    ctx.body = {
      code: 0,
      data: current,
    };
  }
}

module.exports = new Clone();
