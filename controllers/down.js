const scrape = require("website-scraper");
const PuppeteerPlugin = require("website-scraper-puppeteer");
const fs = require("fs");
const path = require("path");
const replace = require("replace-in-file");

const os = require("os");
const homedir = os.homedir();
const desktop = path.join(homedir, "Desktop");
const siteDir = path.join(desktop, `/clone-site`);

const checkDir = fs.existsSync(siteDir);
if (!checkDir) {
  fs.mkdir(siteDir, (e) => {
    console.log("clone-site目录创建成功...");
  });
}

class Down {
  async create(url) {
    return new Promise((resolve, reject) => {
      // 取第一个域名为文件夹名字
      const { host } = new URL(url);
      const name = host;

      console.log(new URL(url));

      // 创建网站文件夹
      const webSiteDir = path.join(siteDir, name);
      console.log("webSiteDir: ", webSiteDir);

      if (fs.existsSync(webSiteDir)) {
        delFile(webSiteDir);
        console.log("存在目标文件夹，先删除");
      }

      // win.webContents.send('clone-log', `【${host}】开始下载...`)

      const options = {
        urls: url,
        directory: webSiteDir,
        ignoreErrors: true,
        maxDepth: 2,
        request: {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
        },
        urlFilter: function (url) {
          // win.webContents.send('clone-log', `【${url}】正在下载...`)

          const ignore = ["cnzz", "ce.cn"];
          const r = ignore.filter((item) => url.indexOf(item) !== -1);
          if (!r.length) {
            return url;
          }
        },
        plugins: [
          new PuppeteerPlugin({
            launchOptions: {
              headless: true,
              defaultViewport: {
                width: 1920,
                height: 1080,
              },
              timeout: 60000,
            },
            scrollToBottom: { timeout: 10000, viewportN: 10 },
          }),
        ],
      };

      scrape(options)
        .then((result) => {

          const src = path.join(webSiteDir, "index.html");
          console.log("克隆完成", src);

          const options = {
            files: src,
            from: [
              /<a([\s]+|[\s]+[^<>]+[\s]+)href=(\"([^<>"\']*)\"|\'([^<>"\']*)\')[^<>]*>/gi,
              /<script([\s]+|[\s]+[^<>]+[\s]+)src=(\"([^<>"\']*)\"|\'([^<>"\']*)\')[^<>]*>/gi,
              /hm.src/gi,
              /cnzz.com/gi,
              /window.open/gi,
            ],
            to: (m1) => {
              if (!m1) return;

              if (m1.indexOf("href") !== -1) {
                const reg = /href="[^"]*"/gi;
                const str = m1.replace(reg, 'href="#"');
                return str;
              }

              if (m1.indexOf("src") !== -1) {
                const ignoreJs = ["cnzz", "51.la", "baidu"];

                const r = ignoreJs.filter((item) => m1.indexOf(item) !== -1);
                if (r.length) {
                  const reg = /src="[^"]*"/gi;
                  const str = m1.replace(reg, 'src="#"');
                  return str;
                }
              }

              if (m1.indexOf("hm.src") !== -1) {
                return "hm";
              }

              if (m1.indexOf("cnzz.com") !== -1) {
                return "";
              }

              if (m1.indexOf("window.open") !== -1) {
                return "";
              }

              return m1;
            },
          };

          replace(options)
            .then((results) => {
              console.log("内容替换完成:", results);
              resolve({
                url,
                path:results
              });
            })
            .catch((error) => {
              console.error("内容替换失败:", error);
              // eslint-disable-next-line prefer-promise-reject-errors
              resolve(false);
            });
        })
        .catch((e) => {
          console.log("网络克隆失败", e);
          // eslint-disable-next-line prefer-promise-reject-errors
          resolve(false);
        });
    });
  }
}

/**
 *
 * @param {*} url
 */
function delFile(url) {
  let files = [];
  /**
   * 判断给定的路径是否存在
   */
  if (fs.existsSync(url)) {
    /**
     * 返回文件和子目录的数组
     */
    files = fs.readdirSync(url);
    files.forEach(function (file, index) {
      const curPath = path.join(url, file);
      console.log(curPath);
      /**
       * fs.statSync同步读取文件夹文件，如果是文件夹，在重复触发函数
       */
      if (fs.statSync(curPath).isDirectory()) {
        // recurse
        delFile(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    /**
     * 清除文件夹
     */
    fs.rmdirSync(url);
  } else {
    console.log("给定的路径不存在，请给出正确的路径");
  }
}

module.exports = new Down();
