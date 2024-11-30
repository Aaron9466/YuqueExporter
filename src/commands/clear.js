import fs from 'fs'
import path from 'path'
import { cwd } from 'process'
import { print } from '../utils/log.js'
import { getUserConfig, deleteAllDocDetailListCache } from '../utils/cfg_mgt.js'

export async function clearSyncedDocs() {
    const userConfig = getUserConfig();
    const bookPath = path.join(cwd(), userConfig.output.bookPath);
    const imgPath = path.join(cwd(), userConfig.output.imgPath);

    print('info', '清除已同步文档...');
    try {
        fs.rmSync(bookPath, { recursive: true, force: true });
    } catch (error) {
        print('error', '清除文档失败，请检查文档目录是否存在');
        return;
    }

    print('info', '清除已同步图片...');
    try {
        fs.rmSync(imgPath, { recursive: true, force: true });
    } catch (error) {
        print('error', '清除图片失败，请检查图片目录是否存在');
        return;
    }

    print('info', '清除文档信息缓存...');
    deleteAllDocDetailListCache();
}