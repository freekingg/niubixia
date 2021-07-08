const fs = require('fs')
const path = require('path')

const node_ssh = require('node-ssh'); //ssh连接服务器
const shell = require('shelljs') // 执行shell命令
const chalk = require('chalk') //命令行颜色
const inquirer = require('inquirer') //命令行交互
const zipFile = require('compressing')// 压缩zip

const CONFIG = require('./config') //配置文件
let config = CONFIG.development // 默认开发环境

let SSH = new node_ssh(); // 生成ssh实例

//logs 控制台 打印日志
const defaultLog = log => console.log(chalk.blue(`---------------- ${log} ----------------`));
const errorLog = log => console.log(chalk.red(`---------------- ${log} ----------------`));
const successLog = log => console.log(chalk.green(`---------------- ${log} ----------------`));


//项目打包代码 npm run build 
const compileDist = async () => {
    defaultLog('项目开始打包')
    shell.cd(path.resolve(__dirname, '../'));
    const res = await shell.exec('npm run build'); //执行shell 打包命令
    if (res.code === 0) {
        successLog('项目打包成功!');
    } else {
        errorLog('项目打包失败, 请重试!');
    }
}

//压缩代码
const zipDist = async () => {
    const distDir = path.resolve(__dirname, config.distDir); //待打包
    const distZipPath = path.resolve(__dirname, `dist2.zip`); //打包后地址(dist.zip是文件名)
    defaultLog('项目开始压缩');
    console.log(config);
    console.log('distDir', distDir);
    console.log('distZipPath', distZipPath);
    try {
        await zipFile.zip.compressDir(distDir, distZipPath)
        successLog('压缩成功!');
    } catch (error) {
        errorLog(error);
        errorLog('压缩失败, 退出程序!');
    }
}

//连接服务器
const connectSSH = async () => {
    try {
        await SSH.connect({
            host: config.host,
            username: config.username,
            // privateKey: config.PRIVATE_KEY, 
            password: config.password,
            port: config, port
        });
        successLog('SSH连接成功!');
    } catch (error) {
        errorLog(error);
        errorLog('SSH连接失败!');
    }
}

//线上执行命令
const runCommand = async (command) => {
    const result = await SSH.exec(command, [], { cwd: config.PATH })
    // defaultLog(result);
}

//清空线上目标目录里的旧文件
const clearOldFile = async () => {
    defaultLog('准备删除旧文件')
    const commands = ['ls', 'rm -rf *'];
    await Promise.all(commands.map(async (it) => {
        return await runCommand(it);
    }));
}

//传送zip文件到服务器
const uploadZipBySSH = async () => {
    //线上目标文件清空
    await clearOldFile();

    defaultLog('准备上传文件')
    try {
        await SSH.putFiles([{ local: distZipPath, remote: config.PATH + '/dist.zip' }]); //local 本地 ; remote 服务器 ;
        successLog('上传成功!');
        successLog('正在解压文件!');
        await runCommand('unzip ./dist.zip'); //解压
        await runCommand(`rm -rf ${config.PATH}/dist.zip`); //解压完删除线上压缩包
        //将目标目录的dist里面文件移出到目标文件  
        //举个例子 假如我们部署在 /test/html 这个目录下 只有一个网站, 那么上传解压后的文件在 /test/html/dist 里
        //需要将 dist 目录下的文件 移出到 /test/html ;  多网站情况, 如 /test/html/h5  或者 /test/html/admin 都和上面同样道理
        await runCommand(`mv -f ${config.PATH}/dist/*  ${config.PATH}`);
        await runCommand(`rm -rf ${config.PATH}/dist`); //移出后删除 dist 文件夹
        SSH.dispose(); //断开连接
    } catch (error) {
        errorLog(error);
        errorLog('上传失败!');
    }
}


// 开始前的配置检查
const checkConfig = (conf) => {
    const checkArr = Object.entries(conf);
    checkArr.map(it => {
        const key = it[0];
        if (key === 'webDir' && conf[key] === '/') { //上传zip前会清空目标目录内所有文件
            errorLog('webDir 不能是服务器根目录!');
        }
        if (!conf[key]) {
            errorLog(`配置项 ${key} 不能为空`);
        }
    })
}


//------------发布程序---------------
const runTask = async () => {
    console.log(chalk.yellow(`--------->  启动自动部署流程  <---------`));
    //打包
    // await compileDist();
    //压缩
    await zipDist();
    //连接ssh
    // await connectSSH();
    //连接服务器上传文件
    // await uploadZipBySSH();
    successLog('大吉大利, 部署成功!');
}



// 执行交互后 启动发布程序
inquirer
    .prompt([{
        type: 'list',
        message: '请选择发布环境',
        name: 'env',
        choices: [{
            name: '测试环境',
            value: 'development'
        }, {
            name: '正式环境',
            value: 'production'
        }]
    }])
    .then(answers => {
        config = CONFIG[answers.env];
        checkConfig(config); // 检查
        runTask(); // 发布
    });