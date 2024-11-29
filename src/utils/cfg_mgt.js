import fs from 'fs'
import path from 'path'
import { cwd } from 'process'
import { yuqueExporterFolder, yuqueDocDetailListCacheFolder, yuqueExporterConfigFile } from '../index.js'

export function isCookieExpired(cookieString) {
    // 正则表达式用于匹配expires时间
    const expiresRegex = /expires=([a-zA-Z]{3},\s\d{1,2}\s[a-zA-Z]{3}\s\d{4}\s\d{2}:\d{2}:\d{2}\sGMT)/;
    const match = cookieString.match(expiresRegex);

    if (match) {
        const expiresTimeStr = match[1];
        const expiresTime = new Date(expiresTimeStr);
        const currentTime = new Date();

        return expiresTime < currentTime;
    }

    return false;
}
export function getUserConfig() {
    const userConfigPath = path.join(cwd(), yuqueExporterFolder, yuqueExporterConfigFile);

    if (!fs.existsSync(userConfigPath)) {
        return null;
    }

    return JSON.parse(fs.readFileSync(userConfigPath, 'utf-8'));
}

export function setUserConfig(config) {
    const userConfigPath = path.join(cwd(), yuqueExporterFolder, yuqueExporterConfigFile);

    const dir = path.dirname(userConfigPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(userConfigPath, JSON.stringify(config, null, 4));
}

export function setDocDetailListCache(bookSlug, docDetailList) {
    const cachePath = path.join(cwd(), yuqueExporterFolder, yuqueDocDetailListCacheFolder, bookSlug + '_cache.json');
    
    const dir = path.dirname(cachePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(cachePath, JSON.stringify(docDetailList, null, 4));
}

export function getDocDetailListCache(bookSlug) {
    const cachePath = path.join(cwd(), yuqueExporterFolder, yuqueDocDetailListCacheFolder, bookSlug + '_cache.json');

    if (!fs.existsSync(cachePath)) {
        return null;
    }

    return JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
}

export function deleteAllDocDetailListCache() {
    const cacheFolderPath = path.join(cwd(), yuqueExporterFolder, yuqueDocDetailListCacheFolder);

    if (!fs.existsSync(cacheFolderPath)) {
        return;
    }

    fs.rmSync(cacheFolderPath, { recursive: true, force: true });
}
