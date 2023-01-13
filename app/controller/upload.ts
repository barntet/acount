import fs from 'fs';
import moment from 'moment';
import mkdirp from 'mkdirp';
import path from 'path';
import { Controller } from 'egg';

export default class UploadController extends Controller {
  public async upload() {
    const { ctx, app } = this;
    //  需要前往config/config.default.js 设置config.multipart的mode属性为file
    const file = ctx.request.files[0];

    let uploadDir = '';
    try {
      const f = fs.readFileSync(file.filepath);
      const day = moment().format('YYYYMMDD');
      // 创建图片保存的地址
      const dir = path.join(app.config.userConfig.uploadDir, day);
      const date = Date.now(); // 毫秒数
      await mkdirp(dir);
      // 返回图片保存路径
      uploadDir = path.join(dir, date + path.extname(file.filename));
      fs.writeFileSync(uploadDir, f);
    } catch (error) {
      console.log('upload', error);
      return error;
    } finally {
      // 清除临时文件
      ctx.cleanupRequestFiles();
    }
    ctx.body = {
      code: 200,
      msg: '上传成功',
      data: uploadDir.replace(/app/g, ''),
    };
  }
}
