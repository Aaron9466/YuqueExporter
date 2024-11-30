import axios from "axios"
import fs from 'fs'
import path from 'path'
import { JSDOM } from 'jsdom'
import { cwd } from 'process'
import { getUserConfig, getDocDetailListCache, setDocDetailListCache, setBookDirList, isCookieExpired } from '../utils/cfg_mgt.js'
import { print } from '../utils/log.js'
import { loadUserHooks, runHooks } from "../utils/hook.js"

const baseApiUrl = "https://www.yuque.com/api"
const yuqueUrl = "https://www.yuque.com"
let userConfig = null

async function getBook(book) {
    const res = await axios.get(`${yuqueUrl}/${userConfig.sync.repo}/${book}`, {
        headers: {
            cookie: userConfig.account.cookies,
        },
    })
    if (res.status === 200) {
        const dom = new JSDOM(`${res.data}`, { runScripts: 'dangerously' })
        const appData = dom.window.appData;

        return appData.book;
    } else {
        print('error', '知识库 ' + book + ' 信息获取失败');
        return null;
    }
}

async function getDocContent(docSlug, bookId) {
    const res = await axios.get(`${baseApiUrl}/docs/${docSlug}`, {
        headers: {
            cookie: userConfig.account.cookies,
        },
        params: {
            book_id: bookId,
            mode: 'markdown'
        }
    })

    if (res.status === 200) {
        return res.data.data.sourcecode;
    } else {
        print('error', docSlug + ' 文档获取失败');
        return null;
    }
}

async function getDocDetailList(bookId) {
    const res = await axios.get(`${baseApiUrl}/docs`, {
        headers: {
            cookie: userConfig.account.cookies,
        },
        params: {
            book_id: bookId,
        }
    })

    if (res.status === 200) {
        return res.data.data;
    } else {
        print('error', bookId + ' 文档列表获取失败')
        return null;
    }
}

async function getDocTags(docId) {
    const res = await axios.get(`${baseApiUrl}/tags`, {
        headers: {
            cookie: userConfig.account.cookies,
        },
        params: {
            docId: docId,
        }
    })

    if (res.status === 200) {
        return res.data.data;
    } else {
        print('error', bookId + ' 文档 Tags 获取失败')
        return null;
    }
}

function getParentPath(bookTocMap, docParentUuid, basePath) {
    if (!docParentUuid) return basePath;

    let currentDoc = bookTocMap.get(docParentUuid);
    let pathParts = [currentDoc.title];

    while (currentDoc.parent_uuid) {
        currentDoc = bookTocMap.get(currentDoc.parent_uuid);
        pathParts.unshift(currentDoc.title);
    }

    return path.join(basePath, ...pathParts);
}

function docIsUpdated(doc, docCache) {
    const currentUpdateTime = new Date(doc.updated_at);
    const cacheUpdateTime = new Date(docCache.updated_at);

    return currentUpdateTime > cacheUpdateTime;
}

function deleteOldImages(filePath, imgBasePath) {
    const docContent = fs.readFileSync(filePath, 'utf-8');
    const imgRegex = /!\[(.*?)\]\((.*?)\)/g;
    let match;

    while ((match = imgRegex.exec(docContent)) !== null) {
        const imgSrc = match[2];
        const imgName = path.basename(imgSrc);
        const imgPath = path.join(imgBasePath, imgName);

        if (fs.existsSync(imgPath)) {
            fs.unlinkSync(imgPath);
        }
    }
}

async function downloadAndReplaceImages(docParentPath, docContent, imagesDir) {
    // 正则表达式匹配 Markdown 中的图片链接
    const imgRegex = /!\[(.*?)\]\((.*?)\)/g;
    let match;
    let newContent = docContent;

    while ((match = imgRegex.exec(docContent)) !== null) {
        const imgSrc = match[2];
        const imgName = path.basename(imgSrc);
        const imgDestPath = path.join(imagesDir, imgName);
        const relativePath = path.relative(docParentPath, imgDestPath).replace(/\\/g, '/');

        // 下载图片
        try {
            const response = await axios({
                url: imgSrc,
                method: 'GET',
                responseType: 'stream',
                headers: {
                    cookie: userConfig.account.cookies,
                },
            });
            response.data.pipe(fs.createWriteStream(imgDestPath));
            print('info', '下载图片成功：' + imgSrc + ' -> ' + imgDestPath);
        } catch (error) {
            print('error', '下载图片失败：' + imgSrc);
            continue;
        }

        // 替换图片链接
        const altText = match[1]; // 提取 alt 文本
        newContent = newContent.replace(match[0], `![${altText}](${relativePath})`);
    }

    return newContent;
}

async function syncBook(bookSlug, forceSync) {
    print('info', '开始同步 ' + bookSlug + ' 知识库...');
    try {
        const book = await getBook(bookSlug);
        if (!book) return;
        const bookTocMap = new Map();
        const docDetailCacheMap = new Map();
        const docDetailMap = new Map();

        // 读取文章列表缓存信息
        const docDetailListCache = getDocDetailListCache(bookSlug);
        if (docDetailListCache) {
            docDetailListCache.forEach(doc => {
                docDetailCacheMap.set(doc.id, doc);
            });
        }

        // 获取文章列表信息
        const docDetailList = await getDocDetailList(book.id);
        if (!docDetailList) return;
        print('info', '获取到 ' + docDetailList.length + ' 篇文章');
        for (const doc of docDetailList) {
            // 获取文章标签
            const tags = await getDocTags(doc.id);
            const tagTitles = tags.map(tag => tag.title);
            doc.tag = tagTitles;

            docDetailMap.set(doc.id, doc);
        };

        const bookToc = book.toc;        
        // 首先将所有条目映射到map中
        bookToc.forEach(item => {
            bookTocMap.set(item.uuid, item);
        });

        const bookBasePath = path.join(cwd(), userConfig.output.bookPath, book.name);
        const imgBasePath = path.join(cwd(), userConfig.output.imgPath);
        // 创建文档存放目录
        if (!fs.existsSync(bookBasePath)) {
            fs.mkdirSync(bookBasePath, { recursive: true });
        }

        // 创建图片存放目录
        if (!fs.existsSync(imgBasePath)) {
            fs.mkdirSync(imgBasePath, { recursive: true });
        }

        // 记录生成知识库路径
        setBookDirList(bookSlug, bookBasePath);
 
        // 处理每个条目
        for (const item of bookToc) {
            const docType = item.type;
            const docTitle = item.title;
            const docParentUuid = item.parent_uuid;
            const docId = item.doc_id;
            const docParentPath = getParentPath(bookTocMap, docParentUuid, bookBasePath);

            switch (docType) {
                case 'DOC':
                    // 创建文档
                    const filePath = path.join(docParentPath, `${docTitle}.md`);
                    const docDetail = docDetailMap.get(docId);
                    const docDetailCache = docDetailCacheMap.get(docId);

                    if ((!docDetailCache || docIsUpdated(docDetail, docDetailCache)) || forceSync) {
                        if (forceSync) {
                            print('info', '同步文档 ' + docTitle);
                        } else {
                            print('info', '发现文档 ' + docTitle + ' 更新，开始同步...');
                        }
                        // 如果文档存在，则删除旧文档及其图片
                        if (fs.existsSync(filePath)) {
                            deleteOldImages(filePath, imgBasePath);
                            fs.unlinkSync(filePath);
                        }

                        const docContent = await getDocContent(docDetail.slug, docDetail.book_id);
                        if (!docContent) continue;

                        // 下载并替换图片
                        const newContent = await downloadAndReplaceImages(docParentPath, docContent, imgBasePath);

                        // 调用用户注册的钩子
                        const finalContent = await runHooks(newContent, docDetail);

                        fs.writeFileSync(filePath, finalContent);
                    } else {
                        print('info', '文档 ' + docTitle + ' 未更新，跳过同步...');
                    }

                    break;
                case 'TITLE':
                    // 创建目录
                    const dirPath = path.join(docParentPath, docTitle);
                    if (!fs.existsSync(dirPath)) {
                        fs.mkdirSync(dirPath, { recursive: true });
                    }
                    break;
                default:
                    print('warn', '`无法处理类型为 ' + docType + ' 的文档: ' + docTitle);
                    break;
            }
        };

        // 更新缓存
        setDocDetailListCache(bookSlug, docDetailList);
        print('success', '知识库 ' + bookSlug + ' 同步完成！');
    } catch (error) {
        print('error', '知识库 ' + bookSlug + ' 同步失败...');
        print('error', error);
    }
}

export async function syncYuqueDocs(option) {
    userConfig = getUserConfig();
    if (!userConfig) {
        print('error', '配置文件不存在，请先进行初始化');
        return;
    }

    if (!userConfig.sync.repo) {
        print('error', '语雀账号个人路径未配置，请先进行配置');
        return;
    }

    if (!userConfig.account.cookies) {
        print('error', '还未登录语雀，请先登录');
        return;
    }

    if (isCookieExpired(userConfig.account.cookies)) {
        print('error', 'Cookie 已过期，请重新登录');
        return;
    }

    // 加载用户自定义钩子
    await loadUserHooks();
    
    let forceSync = false;
    if (option && option.force) {
        forceSync = true;
    }

    if (option && option.book) {
        await syncBook(option.book, forceSync);
    } else {
        if (userConfig.sync.books.length === 0) {
            print('error', '未指定和配置需要同步的知识库，请指定或进行配置');
            return;
        }
        for (let i = 0; i < userConfig.sync.books.length; i++) {
            const book = userConfig.sync.books[i];
            await syncBook(book, forceSync);
        }
    }    
}
