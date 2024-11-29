#!/usr/bin/env node
import { program } from 'commander'
import { initYuqueExporter } from './commands/init.js'
import { loginToYuque } from './commands/login.js'
import { syncYuqueDocs } from './commands/sync.js'
import { clearSyncedDocs } from './commands/clear.js'

program
  .command('init')
  .description('Init Yueque Exporter')
  .action(initYuqueExporter);

program
  .command('login')
  .description('Login to Yuque')
  .option('-f, --force', 'force login')
  .action(loginToYuque);

program
  .command('sync')
  .description('Sync all book docs')
  .option('-f, --force', 'force sync')
  .option('-b, --book <book>', 'sync specified book')
  .action(syncYuqueDocs);

program
  .command('clear')
  .description('Clear all synced docs and images')
  .action(clearSyncedDocs);

program.parse(process.argv);