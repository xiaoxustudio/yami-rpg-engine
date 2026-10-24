import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);
const tag = args[0];
const option = (name) => {
	const index = args.indexOf(name);
	return index === -1 ? undefined : args[index + 1];
};
const packageArg = option('--package') ?? 'packages/editor';
const prefix = option('--prefix') ?? '';
const pkgPath = resolve(process.cwd(), packageArg, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const pattern = prefix
	? new RegExp(`^${escapedPrefix}-v(\\d+\\.\\d+\\.\\d+(?:-[0-9A-Za-z.-]+)?)$`)
	: /^v(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)$/;
const match = tag?.match(pattern);
if (!match) {
	const expected = prefix ? `${prefix}-vX.Y.Z` : 'vX.Y.Z';
	console.error(`不是合法的发布 tag：${tag ?? '(empty)'}（期望 ${expected}）`);
	process.exit(1);
}
const version = match[1];
if (pkg.version !== version) {
	console.error(
		`tag 版本 (${version}) 与 ${join(packageArg, 'package.json')} (${pkg.version}) 不一致`
	);
	console.error('请先提交版本号变更，再从该提交打 tag。');
	process.exit(1);
}
console.log(`release tag ${tag} -> ${pkg.name} ${version}`);
