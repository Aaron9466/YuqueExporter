# 简介

一个基于账号密码的个人语雀 Markdown 文档批量导出工具，基于 Node.js 实现，使用简单便捷。

- 支持按目录批量导出文档
- 支持多知识库批量导出
- 支持文档图片导出
- 支持自定义文档处理器

# 快速开始

项目基于 Node.js 开发，需要 Node.js 环境，请在本地 Node 项目文件夹下执行以下命令。

## 安装

```bash
npm install yuque-exporter
```

## 初始化

```bash
npm run yuque-exporter init
```

## 配置

执行初始化命令后，会在项目根目录下生成`yuque_exporter`文件夹，其中包含默认用户配置文件`user_config.json`和默认用户插件文件`user_hooks.js`。

### 默认用户配置文件

```json
{
    "puppeteer": {
        "chromePath": "",
        "headless": true
    },
    "account": {
        "user": "",
        "password": "",
        "cookies": ""
    },
    "sync": {
        "repo": "",
        "books": []
    },
    "output": {
        "docPath": "books",
        "imgPath": "images"
    }
}
```

各个配置含义如下：

| 配置项     | 含义                                                         | 是否必须配置 | 示例                                                         |
| ---------- | ------------------------------------------------------------ | ------------ | ------------------------------------------------------------ |
| chromePath | 本地谷歌浏览器路径，一般是                                   | 是           | `"C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"` |
| headless   | puppeteer登录行为，无头模式不会启动页面                      | 否           | /                                                            |
| user       | 语雀登录账号                                                 | 是           | `"157********"`                                              |
| password   | 语雀登录密码                                                 | 是           | `"********"`                                                 |
| cookies    | 语雀登录cookie，登录后自动生成                               | 否           | /                                                            |
| repo       | 语雀个人路径                                                 | 是           | `"smilingly"`                                                |
| books      | 需要同步的语雀知识库列表，如果通过指定知识库的方式就不需要配置 | 否           | `["note", "code"]`                                           |
| docPath    | 文档输出目录，默认为 项目根目录/books                        | 否           | `books`、`dir/books`                                         |
| imgPath    | 图片输出目录，默认为 项目根目录/images                       | 否           | `images`、`dir/images`                                       |

### 默认用户插件文件

```javascript
import { registerHook } from 'yuque-exporter/utils/hook'

/**
 * 注册自定义文档处理接口
 * 可以在此处处理文档内容，比如替换图片链接等
 * 
 * @param {string} docContent 文档内容
 * @param {object} docDetail 文档详情
 * @return {string} 处理后的文档内容
 */
async function customHook(docContent, docDetail) {
    // 自定义处理逻辑

    return docContent;
}

registerHook(customHook);
```

该文件已提供基本框架，如有自定义文档处理的需求，可进行修改。

## 登录

```bash
npm run yuque-exporter login
```

## 同步文档

```bash
npm run yuque-exporter sync
```

## 删除文档

```bash
npm run yuque-exporter clear
```

