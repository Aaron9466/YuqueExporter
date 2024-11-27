#!/usr/bin/env node
import { program } from 'commander'
import { initYuqueExporter } from './commands/init.js'
import { loginToYuque } from './commands/login.js'
import { syncYuqueDocs } from './commands/sync.js'

program
  .command('init')
  .description('Init Yueque Exporter')
  .action(initYuqueExporter);

program
  .command('login')
  .description('Login to Yuque')
  .option('-f, --focus', 'focus on login')
  .action(loginToYuque);

program
  .command('sync')
  .description('Sync docs from Yuque')
  .option('-b, --book <book>', 'sync specified book')
  .action(syncYuqueDocs);

program.parse(process.argv);