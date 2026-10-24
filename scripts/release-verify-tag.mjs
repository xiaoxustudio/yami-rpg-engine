import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const tag = process.argv[2];
const match = tag?.match(/^v(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)$/);
if (!match) {
	console.error(`不是合法的发布 tag：${tag ?? '(empty)'}（期望 vX.Y.Z 或 vX.Y.Z-beta.N）`);
	process.exit(1);
}
const version = match[1];
const pkgPath = join(process.cwd(), 'packages', 'editor', 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
if (pkg.version !== version) {
	console.error(`tag 版本 (${version}) 与 packages/editor/package.json (${pkg.version}) 不一致`);
	console.error('请先提交版本号变更，再从该提交打 tag。');
	process.exit(1);
}
console.log(`release tag ${tag} -> editor ${version}`);
