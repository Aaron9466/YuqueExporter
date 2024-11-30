export const yuqueExporterFolder = 'yuque_exporter'
export const yuqueDocDetailListCacheFolder = 'doc_detail_list_cache'
export const yuqueExporterConfigFile = 'user_config.json'
export const yuqueExporterBookDirListFile = 'book_dir_list.json'
export const yuqueExporterHooksFile = 'user_hooks.js'

export const yuqueExporterDefaultConfig =
{
    "puppeteer":
    {
        "chromePath": "",                   // Chrome浏览器路径，必须配置
        "headless": true,                   // puppeteer运行模式，默认无头模式
    },
    "account":                              // 语雀账号信息
    {
        "user": "",                         // 语雀登录账号，必须配置
        "password": "",                     // 语雀登录密码，必须配置
        "cookies": "",                      // 语雀登录cookie，无需配置，登录后自动生成
    },
    "sync":                                 // 同步配置
    {
        "repo": "",                         // 语雀个人路径，必须配置
        "books": [],                        // 需要同步的语雀知识库列表，可选配置，如果通过指定知识库的方式就不需要配置，否则必须配置
    },
    "output":                               // 输出配置
    {   
        "bookPath": "books",                 // 文档输出目录，可选配置，默认为 项目根目录/books
        "imgPath": "images",                // 图片输出目录，可选配置，默认为 项目根目录/images
    },
}

export const yuqueExporterDefaultHooks = 
`
import { registerHook } from '@singlemoonlight/yuque-exporter/hook'

/**
 * 注册自定义文档处理接口
 * 可以在此处处理文档内容，比如替换图片链接等
 * 
 * @param {string} docContent 文档内容
 * @param {object} docDetail 文档详情
 * @param {string} docPath 文档路径
 * @param {string} bookSlug 知识库标识
 * @return {string} 处理后的文档内容
 */
async function customHook(docContent, docDetail, docPath, bookSlug) {
    // 自定义处理逻辑

    return docContent;
}

registerHook(customHook);
`
