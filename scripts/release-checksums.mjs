import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const dir = process.argv[2];
if (!dir) {
	console.error('用法: node scripts/release-checksums.mjs <dir>');
	process.exit(1);
}

const files = readdirSync(dir)
	.map((entry) => join(dir, entry))
	.filter((full) => statSync(full).isFile())
	.filter((full) => !full.endsWith('SHA256SUMS.txt'))
	.sort((a, b) => a.localeCompare(b));
const lines = files.map((file) => {
	const hash = createHash('sha256').update(readFileSync(file)).digest('hex');
	return `${hash}  ${relative(dir, file).replace(/\\/g, '/')}`;
});
const out = join(dir, 'SHA256SUMS.txt');
writeFileSync(out, `${lines.join('\n')}\n`, 'utf8');
console.log(out);
