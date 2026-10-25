import { Timer } from '@app/utils/timer';
import {
	criticalComponentsReady,
	lazyComponentsReady,
	resolveEditorDomainsReady,
	workspaceActivation
} from '@app/bootstrap';
import { loadConfigPromise } from '@app/utils/config';
import { primeWindows } from '@app/tools/window-registry';
import { Window } from '@app/tools/window-object.ts';
import '@app/variable/initialize.ts';

import { Editor } from '@app/services/project/editor.ts';
import { EventBus } from '@app/utils/event-bus.ts';
import { initI18n, loadI18n } from '@app/i18n';
import { markBoot, reportBootTimeline } from '@app/utils/boot-timeline';
import { showBootProgress } from '@app/main/boot-progress';
import { emitCustom } from '@app/events/custom-events';

type ClusterShape = typeof import('@app/tools/window-cluster');

interface SingletonShape {
	initialize?: (() => void) | null;
}

let clusterRef: ClusterShape | null = null;

const initializedSet = new Set<string>();

function initSingleton(name: string, singleton: unknown): void {
	if (initializedSet.has(name)) return;
	initializedSet.add(name);
	const shape = singleton as SingletonShape;
	if (!singleton || typeof shape.initialize !== 'function') {
		return;
	}
	try {
		shape.initialize.call(singleton);
	} catch (e: unknown) {
		console.warn(`[init] ${name} initialize failed:`, (e as Error)?.message);
		console.warn(`[init] ${name} stack:`, (e as Error)?.stack);
	}
	markBoot(`init:${name}`);
}

function initCore(cluster: ClusterShape): void {
	initSingleton('Menubar', cluster.Menubar);
	initSingleton('Layout', cluster.Layout);
	initSingleton('Home', cluster.Home);
	initSingleton('Timer', Timer);
	initSingleton('Window', Window);
}

function initEditors(cluster: ClusterShape): void {
	initSingleton('EventEditor', cluster.EventEditor);
	initSingleton('Inspector', cluster.Inspector);
	initSingleton('Command', cluster.Command);
	initSingleton('Project', cluster.Project);
	initSingleton('Easing', cluster.Easing);
	initSingleton('Team', cluster.Team);
	initSingleton('PluginManager', cluster.PluginManager);
	initSingleton('CustomCommand', cluster.CustomCommand);
	initSingleton('Log', cluster.Log);
	initSingleton('UpdateLog', cluster.UpdateLog);
	initSingleton('Reference', cluster.Reference);
	initSingleton('Directory', cluster.Directory);
	initSingleton('Printer', cluster.Printer);
}

function initTools(cluster: ClusterShape): void {
	initSingleton('Color', cluster.Color);
	initSingleton('Attribute', cluster.Attribute);
	initSingleton('Enum', cluster.Enum);
	initSingleton('Localization', cluster.Localization);
	initSingleton('ImageClip', cluster.ImageClip);
	initSingleton('Selection', cluster.Selection);
	initSingleton('SetQuantity', cluster.SetQuantity);
	initSingleton('SetTileTag', cluster.SetTileTag);
	initSingleton('PresetObject', cluster.PresetObject);
	initSingleton('PresetElement', cluster.PresetElement);
	initSingleton('ArrayList', cluster.ArrayList);
	initSingleton('AttributeListInterface', cluster.AttributeListInterface);
	initSingleton('ConditionListInterface', cluster.ConditionListInterface);
}

Editor.initialize = async function (this: typeof Editor) {
	this.switchHotkey!(false);
	markBoot('editor-init');

	try {
		const data = await loadConfigPromise;
		const code = JSON.stringify(data);
		this.config = data ?? {};
		Object.defineProperty(this.config, 'code', { value: code });
		markBoot('config-loaded');
		await initI18n().catch(() => undefined);
		markBoot('i18n-ready');

		clusterRef = await import('@app/tools/window-cluster');
		markBoot('cluster-imported');
		await clusterRef.clusterReady;
		markBoot('cluster-ready');
		primeWindows(clusterRef as Record<string, unknown>);
		const cluster = clusterRef;
		const { Layout } = cluster;
		if (this.config) this.checkForEditorUpdates!();

		initCore(cluster);
		markBoot('init-core');
		this.loadConfig!();
		markBoot('load-config');
		Layout.manager.switch('home');
		markBoot('home-visible');
		reportBootTimeline();
		emitCustom('boot-ready', { ok: true });

		const initAudio = () => initSingleton('AudioManager', cluster.AudioManager);
		if (typeof requestIdleCallback === 'function') {
			requestIdleCallback(initAudio, { timeout: 2000 });
		} else {
			setTimeout(initAudio, 0);
		}

		void Promise.resolve()
			.then(async () => {
				await Promise.race([
					criticalComponentsReady,
					new Promise<void>((resolve) => setTimeout(resolve, 5000))
				]);
				await loadI18n(Editor.config?.language ?? '').catch(() => undefined);
				cluster.Title.initialize!();
				markBoot('title-ready');

				await workspaceActivation;
				await Promise.race([
					lazyComponentsReady,
					new Promise<void>((resolve) => setTimeout(resolve, 60000))
				]);
				showBootProgress('正在初始化编辑器…');
				initEditors(cluster);
				initTools(cluster);
				markBoot('editors-ready');
				showBootProgress('编辑器已就绪');
				resolveEditorDomainsReady();

				EventBus.emit('editor_loaded');
			})
			.catch((error: unknown) => {
				console.error('[init] editor initialize failed:', error);
			});
	} catch (error: unknown) {
		reportBootTimeline();
		emitCustom('boot-ready', { ok: false });
		clusterRef?.Log?.throw?.(error);
		Window.confirm!(
			{
				message: `Failed to initialize\n${(error as Error).message}`,
				close: () => {
					this.config = null;
					this.quit!();
				}
			},
			[
				{
					label: 'Confirm'
				}
			]
		);
	}
};
