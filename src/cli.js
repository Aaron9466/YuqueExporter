#!/usr/bin/env node
import { program } from 'commander'
import { initYuqueExporter } from './commands/init.js'
import { loginToYuque } from './commands/login.js'
import { syncYuqueDocs } from './commands/sync.js'
import { clearSyncedDocs } from './commands/clear.js'
import { print } from './utils/log.js'
import readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

program
  .command('init')
  .description('Init Yueque Exporter')
  .action(async () => {
    await initYuqueExporter();
    process.exit(0);
  });

program
  .command('login')
  .description('Login to Yuque')
  .option('-f, --force', 'force login')
  .action(async (options) => {
    await loginToYuque(options);
    process.exit(0);
  });

program
  .command('sync')
  .description('Sync all book docs')
  .option('-f, --force', 'force sync')
  .option('-b, --book <book>', 'sync specified book')
  .action(async (options) => {
    await syncYuqueDocs(options);
    process.exit(0);
  });

program
  .command('clear')
  .description('Clear all synced docs and images')
  .action(() => {
    rl.question('各个知识库以及图片输出目录将会被直接删除，是否确认？ (yes/no): ', async (answer) => {
      if (answer.toLowerCase() === 'yes') {
        await clearSyncedDocs();
        process.exit(0);
      } else {
        print('info', '已取消');
      }
      rl.close();
    });
  });

program.parse(process.argv);
