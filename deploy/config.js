module.exports = Object.freeze({
    // 测试服务器
    development: {
        host: '39.98.157.64',//ssh地址 服务器地址
        username: 'root',// ssh 用户名
        // privateKey: fs.readFileSync('/home/steel/.ssh/id_rsa') （推荐 private 本机私钥文件地址）
        password: 'WANGpeng3588829',
        port: 22,
        distDir: '../public',// 需要打包的目录  (相对于项目要目录)
        webDir: '/usr/local/nginx/html/vue' // 服务器目录地址
    },
    // 生产服务器
    production: {

    }
})