import { describe, expect, it } from 'vitest';
import { parseResourceReleases, type GitHubRelease } from '@app/module/resource-release.ts';

const asset = (name: string, size = 100, digest: string | null = null) => ({
	name,
	size,
	browser_download_url: `https://example.com/${name}`,
	digest
});

const release = (
	tag_name: string,
	assets: ReturnType<typeof asset>[],
	patch: Partial<GitHubRelease> = {}
): GitHubRelease => ({
	tag_name,
	draft: false,
	prerelease: false,
	published_at: '2026-01-01T00:00:00Z',
	assets,
	...patch
});

describe('parseResourceReleases（GitHub Release → 资源列表）', () => {
	it('解析模板双语言、脚本、导出壳，并读取 sha256', () => {
		const resources = parseResourceReleases([
			release('template-v1.0.22', [
				asset('arpg-ts-chinese_pack.zip', 10, 'sha256:aaa'),
				asset('arpg-ts-chinese_pack.json'),
				asset('arpg-ts-english_pack.zip', 20),
				asset('arpg-ts-english_pack.json')
			]),
			release('script-v1.0.0', [
				asset('script_pack.zip', 30, 'sha256:bbb'),
				asset('script_pack.json')
			]),
			release('export-v1.0.0', [
				asset('electron-win-x64_1.0.0.zip', 40),
				asset('manifest-win-x64.json'),
				asset('electron-mac-universal_1.0.0.zip', 50)
			])
		]);

		expect(resources.map((item) => item.key)).toEqual([
			'arpg-ts-chinese',
			'arpg-ts-english',
			'electron-mac-universal',
			'electron-win-x64',
			'script'
		]);
		expect(resources[0]).toMatchObject({
			kind: 'template',
			version: '1.0.22',
			sha256: 'aaa',
			size: 10,
			manifestUrl: 'https://example.com/arpg-ts-chinese_pack.json'
		});
		expect(resources.find((item) => item.key === 'script')?.sha256).toBe('bbb');
		expect(resources.find((item) => item.key === 'electron-win-x64')?.manifestUrl).toBe(
			'https://example.com/manifest-win-x64.json'
		);
	});

	it('忽略 draft / prerelease，并选择最新的正式 Release', () => {
		const resources = parseResourceReleases([
			release('template-v1.0.20', [asset('arpg-ts-chinese_pack.zip')], {
				published_at: '2026-01-01T00:00:00Z'
			}),
			release('template-v1.0.21', [asset('arpg-ts-chinese_pack.zip')], {
				prerelease: true,
				published_at: '2026-01-03T00:00:00Z'
			}),
			release('template-v1.0.22', [asset('arpg-ts-chinese_pack.zip')], {
				published_at: '2026-01-02T00:00:00Z'
			}),
			release('template-v1.0.23', [asset('arpg-ts-chinese_pack.zip')], {
				draft: true,
				published_at: '2026-01-04T00:00:00Z'
			})
		]);
		expect(resources).toHaveLength(1);
		expect(resources[0].version).toBe('1.0.22');
	});
});
