const fs = require("fs");
const path = require("path");
const replace = require("replace-in-file");

const os = require("os");
const homedir = os.homedir();
const desktop = path.join(homedir, "Desktop");
const siteDir = path.join(desktop, `/clone-site`);

const { existsFile, ascii } = require("../../common/utils");

const checkDir = fs.existsSync(siteDir);
if (!checkDir) {
  fs.mkdir(siteDir, (e) => {
    console.log("clone-site目录创建成功...");
  });
}

class replaceFile {
  async create(file) {
    console.log('file',file);
    return new Promise(async (resolve, reject) => {
      let indexHtml = path.join(file.file.path, "index.html");
      let exists = await existsFile(indexHtml);

      if (!exists) {
        resolve({
          file:file.file,
          status:false,
          path:indexHtml,
          code: -1,
          msg: "index.html文件不存在",
        });
        return;
      }

      const options = {
        files: indexHtml,
        from: [
          /<title>[\s\S]*?<\/title>/gi,
          /<.*?["']?keywords["']?.*?\/?>/gi,
          /<.*?["']?description["']?.*?\/?>/gi,
        ],
        to: (m1) => {
          if (!m1) return;

          // 替换标题
          if (m1.indexOf("title") !== -1) {
            return `<title>${ascii(file.content.title)}</title>`
          }

          // 替换关键词
          if (m1.indexOf("keywords") !== -1) {
            return `<meta name="keywords" content="${ascii(file.content.keywords)}">`
          }

          // 替换关键词
          if (m1.indexOf("description") !== -1) {
            return `<meta name="description" content="${ascii(file.content.keywords)}">`
          }

          return m1;
        },
      };

      replace(options)
        .then((results) => {
          console.log("内容替换完成:");
          resolve({
            file:file.file,
            status:true,
            path:indexHtml,
            code: 0,
          });
        })
        .catch((error) => {
          console.error("内容替换失败:", error);
          // eslint-disable-next-line prefer-promise-reject-errors
          resolve({
            file:file.file,
            status:false,
            path:indexHtml,
            code: -1,
          });
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

module.exports = new replaceFile();
