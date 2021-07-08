const request = require('request')
const paths = require("path");
const fs = require("fs");

// 查询条件，去除没有值的key
function Invalid(params = {}) {
    let obj = {};
    Object.keys(params).map(item => {
        if (
            params[item] !== null &&
            params[item] !== undefined &&
            params[item] !== ''
        ) {
            obj[item] = params[item];
        }
    });
    return obj
}


// 分页处理
function Paging({ page = 1, size = 10 }) {
    let obj = {
        page: Math.max(page * 1, 1) - 1,
        size: Math.max(size * 1, 1),
    };
    return obj
}

let checkProxy = function(proxy, headers) {
    return new Promise((resolve, reject) => {
      request(
        {
          // 检测网址为百度的某个js文件，速度快，文件小，非常适合作为检测方式
          url: 'http://apps.bdimg.com/libs/jquery/2.1.4/jquery.min.js',
          proxy: `http://${proxy.ip}:${proxy.port}`,
          method: 'GET',
          timeout: 8000,
        },
        function(err, response, body) {
          if (!err && response.statusCode === 200) {
            // console.log(proxy.ip + ' 链接成功：')
            resolve(true)
          } else {
            // console.log(proxy.ip + ' 链接失败')
            resolve(false)
          }
        },
      )
    })
  }


  let getDir = function (path) {
    return new Promise((resolve, reject) => {
      let components = [];
      let dir = paths.join(path);
      let files = [];
      try {
        files = fs.readdirSync(dir);
      } catch (error) {
        reject();
        return;
      }
      files.forEach(function (item, index) {
        let stat = fs.lstatSync(paths.join(dir, item));
        if (stat.isDirectory() === true) {
          components.push({
            name: item,
            file:{
              name:item,
            },
            path: paths.join(dir, item),
          });
        }
      });
      resolve(components);
    });
  };
  
  let existsFile = function (path) {
    return new Promise((resolve, reject) => {
      try {
        fs.accessSync(path, fs.constants.R_OK | fs.constants.W_OK);
        resolve(true);
      } catch (err) {
        console.error("no access!");
        resolve(false);
      }
    });
  };
  
  let parseLine = function (data) {
    var oparray = [];
    var kws = data;
    kws = kws.replace(/^\n*/, "");
    kws = kws.replace(/\n{2,}/g, "\n");
    kws = kws.replace(/\n*$/, "");
    oparray = kws.split("\n");
    return oparray;
  };
  
  function left_zero_4(str) {
    if (str != null && str != "" && str != "undefined") {
      if (str.length == 2) {
        return "00" + str;
      }
    }
    return str;
  }
  
  let ascii = function (str) {
    var value = "";
    for (var i = 0; i < str.length; i++) {
      value +=
        "&#x" + left_zero_4(parseInt(str.charCodeAt(i)).toString(16)) + ";";
    }
    return value;
  };

module.exports = { Invalid, Paging, checkProxy, getDir, existsFile, parseLine,ascii };