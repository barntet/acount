import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';

export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>;

  // override config from framework / plugin
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1673507491240_6263';

  // add your egg config in here
  config.middleware = [];

  // add your special config in here
  const bizConfig = {
    sourceUrl: `https://github.com/eggjs/examples/tree/master/${appInfo.name}`,
  };

  // 白名单
  config.security = {
    csrf: {
      enable: false,
      ignoreJSON: true,
    },
    domainWhiteList: ['*'], // 配置报名的
  };

  config.view = {
    mapping: { '.html': 'ejs' }, // key是html后缀，会自动渲染.html文件，该配置是将 view 文件夹下的.html后缀的文件，识别为.ejs
  };

  // config.mysql = {
  //   // 单数据库配置
  //   client: {
  //     host: 'localhost',
  //     port: '3306',
  //     user: 'root',
  //     password: 'mysqlhhxx0@',
  //     database: 'ledger',
  //   },
  //   // 是否加载到app上 默认开启
  //   app: true,
  //   // 是否加载到agent上, 默认 false
  //   agent: false,
  // };

  config.jwt = {
    secret: 'barnett',
  };

  config.multipart = {
    mode: 'file',
  };

  config.userConfig = {
    uploadDir: 'app/public/upload',
  };

  config.cors = {
    origin: '*', // 允许所有跨越使用
    credentials: true, // 允许cookie跨域
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
  };

  config.sequelize = {
    database: 'ledger',
    password: 'mysqlhhxx9@',
  };

  // the return config will combines to EggAppConfig
  return {
    ...config,
    ...bizConfig,
  };
};
