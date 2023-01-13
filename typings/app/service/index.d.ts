// This file is created by egg-ts-helper@1.34.1
// Do not modify this file!!!!!!!!!

import 'egg';
type AnyClass = new (...args: any[]) => any;
type AnyFunc<T = any> = (...args: any[]) => T;
type CanExportFunc = AnyFunc<Promise<any>> | AnyFunc<IterableIterator<any>>;
type AutoInstanceType<T, U = T extends CanExportFunc ? T : T extends AnyFunc ? ReturnType<T> : T> = U extends AnyClass ? InstanceType<U> : U;
import ExportBill from '../../../app/service/bill';
import ExportHome from '../../../app/service/Home';
import ExportTest from '../../../app/service/Test';
import ExportUser from '../../../app/service/User';

declare module 'egg' {
  interface IService {
    bill: AutoInstanceType<typeof ExportBill>;
    home: AutoInstanceType<typeof ExportHome>;
    test: AutoInstanceType<typeof ExportTest>;
    user: AutoInstanceType<typeof ExportUser>;
  }
}
