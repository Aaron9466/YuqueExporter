import fs from 'fs'
import path from 'path'
import { cwd } from 'process'
import { print } from '../utils/log.js'
import { getUserConfig, deleteAllDocDetailListCache, getBookDirList } from '../utils/cfg_mgt.js'

export async function clearSyncedDocs() {
    const userConfig = getUserConfig();
    const bookDirList = getBookDirList();
    const imgPath = path.join(cwd(), userConfig.output.imgPath);

    print('info', '删除已同步文档...');
    try {
        for (const bookDir of bookDirList) {
            if (fs.existsSync(bookDir.bookPath)) {
                fs.rmSync(bookDir.bookPath, { recursive: true, force: true });
                print('info', '删除知识库：' + bookDir.bookSlug);
            }
        }
    } catch (error) {
        print('error', '删除文档失败，请检查文档目录是否存在');
        return;
    }

    print('info', '删除已同步图片...');
    try {
        fs.rmSync(imgPath, { recursive: true, force: true });
    } catch (error) {
        print('error', '删除图片失败，请检查图片目录是否存在');
        return;
    }

    print('info', '删除文档信息缓存...');
    deleteAllDocDetailListCache();
}