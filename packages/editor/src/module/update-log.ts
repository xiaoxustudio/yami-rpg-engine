import { Window } from '@app/tools/window-object.ts';
import { UpdateLog, type UpdateLogItem } from '@app/log/update-log-window.ts';

export function initializeUpdateLog(): void {
	UpdateLog.tabsClick = function (this: typeof UpdateLog, event: MouseEvent) {
		const btn = (event.target as HTMLElement).closest?.('.update-log-tab');
		if (btn) {
			if (btn.id === 'update-log-tab-internal') {
				UpdateLog.switchMode?.('internal');
			} else if (btn.id === 'update-log-tab-community') {
				UpdateLog.switchMode?.('community');
			} else if (btn.id === 'update-log-tab-donation') {
				UpdateLog.switchMode?.('donation');
			}
		}
	} as (...args: unknown[]) => unknown;

	const origin = UpdateLog.open;
	UpdateLog.open = function (this: typeof UpdateLog, ...args: unknown[]) {
		const items = args[0] as unknown[] | null;
		if (items instanceof Array) {
			Window.open!('update-log');
			this.internalItems = items as UpdateLogItem[];
			this.currentMode = 'internal';
			this.update?.(items);
			this.loadCommunityReleases?.();
		} else {
			origin!.call(this);
		}
	};

	UpdateLog.switchMode = function (
		this: typeof UpdateLog,
		mode: 'internal' | 'community' | 'donation'
	) {
		if (mode === this.currentMode) return;
		this.currentMode = mode;
		UpdateLog.publish?.();
	} as (...args: unknown[]) => unknown;

	UpdateLog.loadCommunityReleases = async function (this: typeof UpdateLog) {
		try {
			const response = await fetch(
				'https://api.github.com/repos/Open-Yami-Community/yami-rpg-editor/releases/latest'
			);
			if (!response.ok) throw new Error('Failed to fetch releases');
			const releases = await response.json();
			this.communityItems = this.parseCommunityReleases?.(releases) as UpdateLogItem[];
		} catch (error) {
			console.error('Failed to load community releases:', error);
			this.communityItems = [
				{
					title: 'Error',
					major: 'Failed to load community releases from GitHub'
				}
			];
		}
		UpdateLog.publish?.();
	};

	UpdateLog.displayDonationList = function (this: typeof UpdateLog) {
		UpdateLog.publish?.();
	};

	UpdateLog.parseCommunityReleases = function (this: typeof UpdateLog, _r: unknown) {
		const release = _r as {
			name?: string;
			body?: string;
			draft?: boolean;
			prerelease?: boolean;
		};
		return release
			? [{ title: release.name, major: release.body || 'No description provided' }]
			: [];
	};
}
