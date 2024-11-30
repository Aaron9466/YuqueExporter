import fs from 'fs'
import path from 'path'
import { cwd } from 'process'

const packageJsonPath = path.join(cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    if (!packageJson.scripts) {
        packageJson.scripts = {};
    }

    packageJson.scripts['yuque-exporter'] = 'yuque-exporter';

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
}
