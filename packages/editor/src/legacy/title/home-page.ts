import { SettingConfig } from '@app/legacy/module/settingconfig';
import { $ } from '@app/utils/dom';
import { addClass, hasClass, rect, removeClass } from '@app/utils/element-utils';
import { Path } from '@app/utils/config';
import { File } from '@app/legacy/file/file-system-core.ts';
import { Menu } from '@app/legacy/components/menu-list.ts';
import { FS, FSP } from '@app/services/file-system/fs-bridge.ts';
import { Layout } from '@app/engine/layout/layout.ts';
import { Editor } from '@app/services/project/editor.ts';
import { Title } from './title-bar.ts';
import { showInExplorerCommand } from '@app/legacy/tools/platform.ts';
import { createGetter } from '@app/i18n';
import { getHomeStore } from '@app/stores/home';

import type { Dirent, Stats } from 'node:fs';

type StatType = 'folder' | 'data' | 'script' | 'image' | 'media' | 'other';

interface StatCounts {
	folder: number;
	data: number;
	script: number;
	image: number;
	media: number;
	other: number;
	total: number;
}

interface FileStatItem {
	type: StatType;
	size: number;
}

interface RecentProject {
	name: string;
	path: string;
	date: string | number;
	[k: string]: any;
}

export interface HomeRecentCard {
	title: string;
	dateText: string;
	pathText: string;
	stats: string[];
	disabled: boolean;
	hidden: boolean;
}

interface HomeShape {
	dependsOn?: string[];
	openProject: ((path?: string) => void) | null;
	createProject: ((path?: string) => void) | null;
	recentCards: HomeRecentCard[] | null;

	initialize: ((this: typeof Home) => void) | null;
	updateCenterPosition: ((this: typeof Home) => void) | null;
	parseRecentProjects: ((this: typeof Home) => void) | null;
	removeRecentProject: ((this: typeof Home, index: number) => void) | null;
	publishRecent: ((this: typeof Home) => void) | null;
	readFileList: ((this: typeof Home, path: string) => Promise<FileStatItem[]>) | null;
	countFileList: ((this: typeof Home, path: string) => Promise<FileStatItem[]>) | null;
	windowResize: ((this: typeof Home, event: Event) => void) | null;
	windowLocalize: ((this: typeof Home, event: Event) => void) | null;
	startClick: ((this: typeof Home, event: Event) => void) | null;
	recentClick: ((this: typeof Home, event: Event) => void) | null;
	recentPointerup: ((this: typeof Home, event: Event) => void) | null;
	[k: string]: any;
}

export const Home: HomeShape = {
	dependsOn: ['Layout'],
	initialize: null,
	updateCenterPosition: null,
	parseRecentProjects: null,
	removeRecentProject: null,
	publishRecent: null,
	readFileList: null,
	countFileList: null,
	windowResize: null,
	windowLocalize: null,
	startClick: null,
	recentClick: null,
	recentPointerup: null,
	recentCards: null as HomeRecentCard[] | null,
	openProject: null as ((path?: string) => void) | null,
	createProject: null as (() => void) | null
};

Home.initialize = function (this: typeof Home) {
	getHomeStore().state = Layout.manager?.index === 'home' ? 'open' : 'closed';
	Layout.manager?.on('switch', (event: Event & { value: string | null }) => {
		getHomeStore().state = event.value === 'home' ? 'open' : 'closed';
	});
	window.addEventListener('resize', this.windowResize!);
	window.addEventListener('localize', this.windowLocalize!);
	// start/recent 事件经 Vue 模板转发（LayoutPanel @click/@pointerup → Home.startClick/recentClick/recentPointerup）
};

Home.updateCenterPosition = function (this: typeof Home) {
	if (Layout.manager?.index === 'home') {
		const elPage = $('#home');
		const elContent = $('#home-content');
		const pageRect = rect(elPage);
		const contentRect = rect(elContent);
		const left = (pageRect.width - contentRect.width) / 2;
		const top = (pageRect.height - contentRect.height) / 2;
		elContent.style.left = `${left}px`;
		elContent.style.top = `${top}px`;
	}
};

Home.windowResize = function (this: typeof Home, event: Event) {
	// 不支持page(home):resize事件 先用window:resize代替
	Home.updateCenterPosition!();
};

Home.parseRecentProjects = function (this: typeof Home) {
	const items = Editor.config!.recent! as RecentProject[];
	const statsMode =
		typeof SettingConfig !== 'undefined' && SettingConfig.config.recent
			? SettingConfig.config.recent.statsMode
			: 'count';
	const cards: HomeRecentCard[] = [];

	for (let i = 0; i < 3; i++) {
		const item = items[i];
		if (!item) {
			cards.push({
				title: '',
				dateText: '',
				pathText: '',
				stats: [],
				disabled: false,
				hidden: true
			});
			continue;
		}

		const date = new Date(item.date);
		const Y = date.getFullYear();
		const M = date.getMonth() + 1;
		const D = date.getDate();
		const h = date.getHours();
		const m = date.getMinutes();
		const m2 = m.toString().padStart(2, '0');
		const card: HomeRecentCard = {
			title: '',
			dateText: `${Y}/${M}/${D} ${h}:${m2}`,
			pathText: Path.normalize!(item.path),
			stats: [],
			disabled: false,
			hidden: false
		};
		cards.push(card);

		const path = item.path;
		const dirname = Path.dirname!(path);
		new Promise<string>((resolve: (val: string) => void, reject: (err: unknown) => void) => {
			if (FS.existsSync!(path)) {
				const dPath = `${dirname}/data/config.json`;
				resolve(FSP.readFile!(dPath, 'utf8'));
			} else {
				reject(new URIError());
			}
		})
			.then((data: string) => {
				const { window } = JSON.parse(data);
				card.title = window.title;

				// 根据配置选择使用readFileList或countFileList
				if (statsMode === 'size') {
					return this.readFileList!(dirname);
				} else {
					return this.countFileList!(dirname);
				}
			})
			.then((list: FileStatItem[]) => {
				const counts: StatCounts = {
					folder: 0,
					data: 0,
					script: 0,
					image: 0,
					media: 0,
					other: 0,
					total: 0
				};
				const sizes: StatCounts = {
					folder: 0,
					data: 0,
					script: 0,
					image: 0,
					media: 0,
					other: 0,
					total: 0
				};
				const length = list.length;
				for (let i = 0; i < length; i++) {
					const { type, size } = list[i];
					counts[type] += 1;
					sizes[type] += size;
				}
				counts.total =
					counts.data + counts.script + counts.image + counts.media + counts.other;
				sizes.total = sizes.data + sizes.script + sizes.image + sizes.media + sizes.other;
				const get = createGetter('stats');
				const texts: string[] = [];
				for (const { type, name } of [
					{ type: 'data', name: get('data') },
					{ type: 'script', name: get('script') },
					{ type: 'image', name: get('image') },
					{ type: 'media', name: get('media') },
					{ type: 'other', name: get('other') },
					{ type: 'total', name: get('total') }
				] as { type: StatType | 'total'; name: string }[]) {
					const count = counts[type];
					const size = File.parseFileSize!(sizes[type]);

					// 根据统计模式显示不同的信息
					if (statsMode === 'size') {
						texts.push(`${name}: ${size}`);
					} else {
						texts.push(`${name}: ${count}`);
					}
				}
				card.stats = texts;
				Home.publishRecent!();
			})
			.catch((error: unknown) => {
				card.disabled = true;
				if (error instanceof URIError) {
					card.title = 'Project does not exist';
				} else {
					card.title = 'Failed to load data';
				}
				Home.publishRecent!();
			});
	}
	this.recentCards = cards;
	Home.publishRecent!();
};

Home.publishRecent = function (this: typeof Home) {
	window.dispatchEvent(new CustomEvent('home-recent-update'));
};

Home.removeRecentProject = function (this: typeof Home, index: number) {
	const items = Editor.config!.recent! as RecentProject[];
	const item = items[index];
	if (item) {
		items.remove(item);
		Home.parseRecentProjects!();
	}
};

Home.countFileList = (function IIFE() {
	const extnameToTypeMap: Record<string, StatType> = {
		'.actor': 'data',
		'.skill': 'data',
		'.trigger': 'data',
		'.item': 'data',
		'.equip': 'data',
		'.state': 'data',
		'.event': 'data',
		'.scene': 'data',
		'.tile': 'data',
		'.ui': 'data',
		'.anim': 'data',
		'.particle': 'data',
		'.json': 'data',
		'.js': 'script',
		'.ts': 'script',
		'.png': 'image',
		'.jpg': 'image',
		'.jpeg': 'image',
		'.cur': 'image',
		'.webp': 'image',
		'.mp3': 'media',
		'.m4a': 'media',
		'.ogg': 'media',
		'.wav': 'media',
		'.flac': 'media',
		'.mp4': 'media',
		'.mkv': 'media',
		'.webm': 'media',
		'.ttf': 'other',
		'.otf': 'other',
		'.woff': 'other',
		'.woff2': 'other'
	};
	const options: { withFileTypes: true } = { withFileTypes: true };
	const read = (path: string, list: FileStatItem[]): Promise<FileStatItem[]> => {
		return FSP.readdir!(path, options).then(async (files: Dirent[]) => {
			if (path) {
				path += '/';
			}
			const promises: Promise<FileStatItem[]>[] = [];
			for (const file of files) {
				const name = file.name;
				const newPath = `${path}${name}`;
				if (file.isDirectory()) {
					list.push({
						type: 'folder',
						size: 0
					});
					promises.push(read(newPath, list));
				} else {
					const extname = Path.extname!(name);
					const type = extnameToTypeMap[extname.toLowerCase()] ?? 'other';
					list.push({
						type: type,
						size: 0
					});
				}
			}
			if (promises.length !== 0) {
				await Promise.all(promises);
			}
			return list;
		});
	};
	return function (this: typeof Home, path: string) {
		return read(path, []);
	};
})();

Home.readFileList = (function IIFE() {
	const extnameToTypeMap: Record<string, StatType> = {
		'.actor': 'data',
		'.skill': 'data',
		'.trigger': 'data',
		'.item': 'data',
		'.equip': 'data',
		'.state': 'data',
		'.event': 'data',
		'.scene': 'data',
		'.tile': 'data',
		'.ui': 'data',
		'.anim': 'data',
		'.particle': 'data',
		'.json': 'data',
		'.js': 'script',
		'.ts': 'script',
		'.png': 'image',
		'.jpg': 'image',
		'.jpeg': 'image',
		'.cur': 'image',
		'.webp': 'image',
		'.mp3': 'media',
		'.m4a': 'media',
		'.ogg': 'media',
		'.wav': 'media',
		'.flac': 'media',
		'.mp4': 'media',
		'.mkv': 'media',
		'.webm': 'media',
		'.ttf': 'other',
		'.otf': 'other',
		'.woff': 'other',
		'.woff2': 'other'
	};
	const options: { withFileTypes: true } = { withFileTypes: true };
	const read = (path: string, list: FileStatItem[]): Promise<FileStatItem[]> => {
		return FSP.readdir!(path, options).then(async (files: Dirent[]) => {
			if (path) {
				path += '/';
			}
			const promises: Promise<FileStatItem[] | void>[] = [];
			for (const file of files) {
				const name = file.name;
				const newPath = `${path}${name}`;
				if (file.isDirectory()) {
					list.push({
						type: 'folder',
						size: 0
					});
					promises.push(read(newPath, list));
				} else {
					const extname = Path.extname!(name);
					const type = extnameToTypeMap[extname.toLowerCase()] ?? 'other';
					const item = {
						type: type,
						size: 0
					};
					list.push(item);
					promises.push(
						FSP.stat!(newPath).then((stats: Stats) => {
							item.size = stats.size;
						})
					);
				}
			}
			if (promises.length !== 0) {
				await Promise.all(promises);
			}
			return list;
		});
	};
	return function (this: typeof Home, path: string) {
		return read(path, []);
	};
})();

Home.windowLocalize = function (this: typeof Home, event: Event) {
	if (Layout.manager?.index === 'home') {
		Home.parseRecentProjects!();
	}
};

Home.startClick = function (this: typeof Home, event: Event) {
	const element = event.target as HTMLElement;
	if (hasClass(element, 'home-start-item')) {
		switch (element.getAttribute('value')) {
			case 'new':
				Title.newProject!();
				break;
			case 'open':
				Title.openProject!();
				break;
		}
	}
};

const homeBridgeKeys = ['state'] as const;

for (const key of homeBridgeKeys) {
	Object.defineProperty(Home, key, {
		get: () => getHomeStore()[key],
		set: (value: unknown) => {
			(getHomeStore() as unknown as Record<(typeof homeBridgeKeys)[number], any>)[key] =
				value;
		},
		configurable: true
	});
}

Home.recentClick = function (this: typeof Home, event: Event) {
	const element = event.target as HTMLElement;
	if (hasClass(element, 'home-recent-item') && !hasClass(element, 'disabled')) {
		const index = element.getAttribute('value');
		const items = Editor.config!.recent! as RecentProject[];
		const item = items[parseInt(index ?? '0')];
		if (item) Editor.open!(item.path);
	}
};

Home.recentPointerup = function (this: typeof Home, event: Event) {
	switch (event.button) {
		case 2: {
			const element = event.target as HTMLElement;
			if (
				hasClass(element, 'home-recent-item') &&
				element.childNodes.length !== 0 &&
				document.activeElement === element.parentNode
			) {
				addClass(element, 'hover');
				const index = parseInt(element.getAttribute('value') ?? '0');
				const enabled = !hasClass(element, 'disabled');
				const get = createGetter('menuRecent');
				Menu.popup!(
					{
						x: event.clientX,
						y: event.clientY,
						close: () => {
							removeClass(element, 'hover');
						}
					},
					[
						{
							label: get('openProject'),
							enabled: enabled,
							click: () => {
								const items = Editor.config!.recent! as RecentProject[];
								const item = items[index];
								if (item) {
									Editor.open!(item.path);
								}
							}
						},
						{
							label: get(showInExplorerCommand),
							enabled: enabled,
							click: () => {
								const items = Editor.config!.recent! as RecentProject[];
								const item = items[index];
								if (item) {
									File.showInExplorer!(item.path);
								}
							}
						},
						{
							label: get('removeFromList'),
							click: () => {
								Home.removeRecentProject!(index);
							}
						}
					]
				);
			}
			break;
		}
	}
};
