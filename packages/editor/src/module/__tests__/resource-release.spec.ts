import { beforeEach, describe, expect, it, vi } from 'vitest';
import { parseResourceReleases, type GitHubRelease } from '@app/module/resource-release.ts';

const netGet = vi.hoisted(() => vi.fn());
vi.mock('@app/services/ipc/net.ts', () => ({ Net: { get: netGet } }));

const rateLimited = (status = 403) => ({ response: { status, headers: {} } });

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

describe('fetchResourceReleases（GitHub 限流 403）', () => {
	beforeEach(() => {
		vi.resetModules();
		netGet.mockReset();
	});

	it('没有可用缓存时给出限流错误，并在一段时间内不再打接口', async () => {
		netGet.mockRejectedValue(rateLimited());
		const { fetchResourceReleases } = await import('@app/module/resource-release.ts');

		await expect(fetchResourceReleases()).rejects.toThrow(/限流/);
		// 静默期内即使强制刷新也不再请求：否则每次开面板都刷一条 403。
		await expect(fetchResourceReleases(true)).rejects.toThrow(/限流/);
		expect(netGet).toHaveBeenCalledTimes(1);
	});

	it('有上次成功的列表时，403 沿用缓存而不是把面板清空', async () => {
		netGet
			.mockResolvedValueOnce({
				status: 200,
				data: [release('template-v1.0.22', [asset('arpg-ts-chinese_pack.zip')])],
				headers: { etag: 'W/"abc"' }
			})
			.mockRejectedValueOnce(rateLimited());
		const { fetchResourceReleases } = await import('@app/module/resource-release.ts');

		const first = await fetchResourceReleases();
		expect(first).toHaveLength(1);
		const second = await fetchResourceReleases(true);
		expect(second).toEqual(first);
		expect(netGet).toHaveBeenCalledTimes(2);
	});

	it('304 命中时沿用缓存', async () => {
		netGet
			.mockResolvedValueOnce({
				status: 200,
				data: [release('template-v1.0.22', [asset('arpg-ts-chinese_pack.zip')])],
				headers: { etag: 'W/"abc"' }
			})
			.mockResolvedValueOnce({ status: 304, data: '', headers: {} });
		const { fetchResourceReleases } = await import('@app/module/resource-release.ts');

		const first = await fetchResourceReleases();
		const second = await fetchResourceReleases(true);
		expect(second).toEqual(first);
		const headers = (netGet.mock.calls[1][1] as { headers: Record<string, string> }).headers;
		expect(headers['If-None-Match']).toBe('W/"abc"');
	});
});
