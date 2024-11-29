export const yuqueExporterFolder = 'yuque_exporter'
export const yuqueDocDetailListCacheFolder = 'doc_detail_list_cache'
export const yuqueExporterConfigFile = 'user_config.json'

export const yuqueExporterDefaultConfig =
{
    "puppeteer":
    {
        "chromePath": "",                   // Chrome浏览器路径，必须配置
        "headless": true,                   // puppeteer运行模式，默认无头模式
        "slideSleep": 500,                  // 滑块验证等待时间，默认500ms
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
        "docPath": "books",                 // 文档输出目录，可选配置，默认为./books
        "imgPath": "imgs",                  // 图片输出目录，可选配置，默认为./imgs
    },
}
