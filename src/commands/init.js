import fs from 'fs'
import path from 'path'
import { cwd } from 'process'
import { print } from '../utils/log.js'
import { yuqueExporterFolder, yuqueExporterConfigFile, yuqueExporterHooksFile, yuqueExporterDefaultHooks, yuqueExporterDefaultConfig } from '../index.js'

export function initYuqueExporter() {
    print('info', '初始化开始...')

    // 创建配置文件夹
    const folderPath = path.join(cwd(), yuqueExporterFolder);
    fs.mkdirSync(folderPath, { recursive: true });
    print('info', '创建配置文件夹');

    // 创建默认配置文件
    const configPath = path.join(cwd(), yuqueExporterFolder, yuqueExporterConfigFile);
    fs.writeFileSync(configPath, JSON.stringify(yuqueExporterDefaultConfig, null, 4));
    print('info', '创建默认配置文件');

    // 创建默认插件文件
    const hooksPath = path.join(cwd(), yuqueExporterFolder, yuqueExporterHooksFile);
    fs.writeFileSync(hooksPath, yuqueExporterDefaultHooks);
    print('info', '创建默认插件文件');

    // 将配置文件夹加入.gitignore
    const gitignorePath = path.join(cwd(), '.gitignore');
    if (fs.existsSync(gitignorePath)) {
        const content = `\n${yuqueExporterFolder}\/\n`;
        const fileContent = fs.readFileSync(gitignorePath, 'utf8');
        if (!fileContent.includes(content.trim())) {
            fs.appendFileSync(gitignorePath, content, { encoding: 'utf8' });
            print('info', '添加配置文件夹至 .gitignore 文件');
        }
    } else {
        print('warn', '.gitignore 文件不存在，如果后续您不使用git进行版本控制，可以忽略本提示');
    }

    print('success', '初始化完成！');
}
