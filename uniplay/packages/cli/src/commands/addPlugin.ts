import fs from 'fs-extra';
import path from 'path';

export async function addPlugin(plugin: string) {
  console.log(`Füge Plugin hinzu: ${plugin}`);

  // Plugin-Logik, z.B. package.json erweitern
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!await fs.pathExists(packageJsonPath)) {
    console.error('Kein package.json gefunden. Bist du in einem UniPlay-Projekt?');
    return;
  }

  const pkg = await fs.readJson(packageJsonPath);
  if (!pkg.dependencies) pkg.dependencies = {};
  pkg.dependencies[`@uniplay/plugin-${plugin}`] = 'workspace:*';

  await fs.writeJson(packageJsonPath, pkg, { spaces: 2 });
  console.log(`Plugin ${plugin} hinzugefügt.`);
}