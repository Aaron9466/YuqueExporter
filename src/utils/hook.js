import path from 'path'
import fs from 'fs'
import { cwd } from 'process'
import { print } from './log.js'
import { pathToFileURL } from 'url'
import { yuqueExporterFolder, yuqueExporterHooksFile } from '../index.js'

export const hooks = []

export function registerHook(hookFunction) {
    hooks.push(hookFunction);
}

export async function runHooks(docContent, docDetail, docPath, bookSlug) {    
    let modifiedDocContent = docContent;
    for (const hook of hooks) {
        modifiedDocContent = await hook(docContent, docDetail, docPath, bookSlug);
    }
    return modifiedDocContent;
}

export async function loadUserHooks() {
    const hookPath = path.join(cwd(), yuqueExporterFolder, yuqueExporterHooksFile);
    if (fs.existsSync(hookPath)) {
        try {
            const hookUrl = pathToFileURL(hookPath).href;
            
            await import(hookUrl);            
        } catch (err) {
            print('error', '加载自定义的JS文件失败');
            print('error', err);
        }
    }
}

