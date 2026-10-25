import { Net } from '@app/services/ipc/net.ts';

// 资源 Release 的归属仓库。**必须**与 `.github/workflows/release-resources.yml` /
// `release-export.yml` 打 tag 的仓库一致：workflow 只在 tag 所在仓库建 Release，
// 而这里的地址是编辑器唯一的发现入口，不一致就是「发了但没人看到」。
// 旧仓库 `xiaoxustudio/yami-rpg-editor` 已 301 到 `Open-Yami-Community/yami-rpg-editor`，
// 存量客户端仍读旧地址 —— 迁移期两边各发一份，直到存量用户升级完。
export const RESOURCE_REPO = {
	owner: 'xiaoxustudio',
	repo: 'yami-rpg-engine'
} as const;

export type ResourceKind = 'template' | 'script' | 'export';

export interface RemoteResource {
	key: string;
	kind: ResourceKind;
	version: string;
	url: string;
	size: number;
	sha256: string;
	manifestUrl: string;
	tag: string;
}

interface GitHubAsset {
	name: string;
	size: number;
	browser_download_url: string;
	digest?: string | null;
}

export interface GitHubRelease {
	tag_name: string;
	draft: boolean;
	prerelease: boolean;
	published_at: string;
	assets: GitHubAsset[];
}

const RELEASE_PATTERNS: Array<{ kind: ResourceKind; prefix: string }> = [
	{ kind: 'template', prefix: 'template-v' },
	{ kind: 'script', prefix: 'script-v' },
	{ kind: 'export', prefix: 'export-v' }
];

const versionOf = (tag: string, prefix: string): string => tag.slice(prefix.length);

const assetSha256 = (asset: GitHubAsset): string =>
	asset.digest?.startsWith('sha256:') ? asset.digest.slice('sha256:'.length) : '';

const resourceKey = (kind: ResourceKind, assetName: string): string => {
	if (kind === 'template') return assetName.replace(/_pack\.zip$/, '');
	if (kind === 'script') return 'script';
	return assetName.replace(/_\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?\.zip$/, '');
};

const manifestName = (kind: ResourceKind, key: string): string => {
	if (kind === 'template') return `${key}_pack.json`;
	if (kind === 'script') return 'script_pack.json';
	return `manifest-${key.replace(/^electron-/, '')}.json`;
};

export function parseResourceReleases(releases: GitHubRelease[]): RemoteResource[] {
	const selected = new Map<ResourceKind, GitHubRelease>();
	for (const release of releases) {
		if (release.draft) continue;
		const matched = RELEASE_PATTERNS.find((item) => release.tag_name.startsWith(item.prefix));
		if (!matched) continue;
		if (release.prerelease) continue;
		const current = selected.get(matched.kind);
		if (!current || release.published_at > current.published_at) {
			selected.set(matched.kind, release);
		}
	}

	const resources: RemoteResource[] = [];
	for (const [kind, release] of selected) {
		const prefix = RELEASE_PATTERNS.find((item) => item.kind === kind)!.prefix;
		const version = versionOf(release.tag_name, prefix);
		for (const asset of release.assets) {
			if (!asset.name.endsWith('.zip')) continue;
			const key = resourceKey(kind, asset.name);
			const manifest = release.assets.find((item) => item.name === manifestName(kind, key));
			resources.push({
				key,
				kind,
				version,
				url: asset.browser_download_url,
				size: asset.size,
				sha256: assetSha256(asset),
				manifestUrl: manifest?.browser_download_url ?? '',
				tag: release.tag_name
			});
		}
	}
	return resources.sort((a, b) => a.key.localeCompare(b.key));
}

let cache: RemoteResource[] | null = null;
let cacheAt = 0;
const CACHE_TTL = 5 * 60 * 1000;

export async function fetchResourceReleases(force = false): Promise<RemoteResource[]> {
	if (!force && cache !== null && Date.now() - cacheAt < CACHE_TTL) return cache;
	const response = await Net.get(
		`https://api.github.com/repos/${RESOURCE_REPO.owner}/${RESOURCE_REPO.repo}/releases?per_page=100`,
		{
			headers: {
				Accept: 'application/vnd.github+json',
				'X-GitHub-Api-Version': '2022-11-28'
			}
		}
	);
	if (!Array.isArray(response.data)) {
		throw new Error('GitHub Releases 返回格式不正确');
	}
	cache = parseResourceReleases(response.data as GitHubRelease[]);
	cacheAt = Date.now();
	return cache;
}
