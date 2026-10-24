import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const version = process.argv[2];
if (!version) {
	console.error('用法: node scripts/release-notes.mjs <semver>');
	process.exit(1);
}
const file = join(process.cwd(), 'CHANGELOG.md');
const text = readFileSync(file, 'utf8');
const escaped = version.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const heading = new RegExp(`^##\\s*\\[?${escaped}\\]?[^\\n]*$`, 'm');
const match = heading.exec(text);
if (!match) {
	process.exit(0);
}
const start = match.index + match[0].length;
const rest = text.slice(start);
const next = /^##\s+/m.exec(rest);
const body = (next ? rest.slice(0, next.index) : rest).trim();
process.stdout.write(body);
