// This file is created by egg-ts-helper@1.34.1
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportModelUser from '../../../app/model/user';

declare module 'egg' {
  interface IModel {
    ModelUser: ReturnType<typeof ExportModelUser>;
  }
}
