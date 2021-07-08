// 数据库配置信息
const dbOptions = {
    url: 'mongodb://10.10.6.100:27017/sql-etl',
    options: {
        authSource: 'admin',
        user: 'sql-etl',
        pass: '123@321',
        useNewUrlParser: true,
    }
}

// jwt 密钥
const secret = 'k5dgkej8jddk8akny9wszzgjbd9cvpsg'


// // 数据库配置信息
// const dbOptions = {
//     url: 'mongodb://ds129831.mlab.com:29831/simple-blogs',
//     options: {
//         user: 'wp0214',
//         pass: 'wang3588829',
//         useNewUrlParser: true
//     }
// }


module.exports = { dbOptions, secret }
