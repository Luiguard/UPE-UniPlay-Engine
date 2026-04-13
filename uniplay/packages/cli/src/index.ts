#!/usr/bin/env node

import { Command } from 'commander';
import { createProject } from './commands/create.js';
import { addPlugin } from './commands/addPlugin.js';

const program = new Command();

program
  .name('uniplay')
  .description('UniPlay CLI – Universal Multiplayer Engine')
  .version('0.1.0');

program
  .command('create <name>')
  .description('Erstelle ein neues UniPlay-Projekt')
  .option('-t, --template <template>', 'Template wählen (z.B. fps, rpg, sandbox)', 'sandbox')
  .action((name, options) => {
    createProject(name, options.template);
  });

program
  .command('add-plugin <plugin>')
  .description('Füge ein Plugin hinzu (z.B. physics, ai)')
  .action((plugin) => {
    addPlugin(plugin);
  });

program.parse();