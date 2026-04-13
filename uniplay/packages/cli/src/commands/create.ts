import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function createProject(name: string, template: string) {
  const projectPath = path.join(process.cwd(), name);

  console.log(`Erstelle UniPlay-Projekt: ${name} mit Template: ${template}`);

  // Kopiere Template
  const templatePath = path.join(__dirname, '../../../templates', template);
  if (!await fs.pathExists(templatePath)) {
    console.error(`Template ${template} nicht gefunden.`);
    return;
  }

  await fs.copy(templatePath, projectPath);
  console.log(`Projekt erstellt in: ${projectPath}`);

  // Installiere Abhängigkeiten
  console.log('Installiere Abhängigkeiten...');
  // Hier könnte pnpm install aufgerufen werden, aber für Demo skippen
}