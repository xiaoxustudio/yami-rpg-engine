import { YamiIpc } from '@app/services/ipc/bridge.ts';
import { serviceEls } from '@app/services/element-registry';
import { Window } from '@app/tools/window-object.ts';
import { disable, enable, on } from '@app/utils/element-utils.ts';
import { Path } from '@app/utils/config';
import { FSP } from '@app/services/file-system/fs-bridge.ts';
import { Log } from '@app/log/log-window.ts';
import { Editor } from '@app/services/project/editor.ts';
import { Deployment, DeploymentForm } from '@app/title/deploy-project-window.ts';
import type { YamiElement } from '@app/types/element-api';

export const WebServer = new (class {
	port = 5959;
	constructor() {}
	bindButtons() {
		const startBtn = serviceEls.get('qr-start-button') as YamiElement;
		if (!startBtn) return;
		on(startBtn, 'click', () => {
			this.start!(Path.slash(Editor.config!.project!));
		});
		on(serviceEls.get('qr-close-button') as YamiElement, 'click', () => this.stop!());
	}
	get enable() {
		return YamiIpc.sync.getServerState();
	}
	start(path: string) {
		void YamiIpc.invoke.startServer({
			port: this.port,
			path
		});
		// oxlint-disable-next-line unbound-method
		window.addEventListener('beforeunload', this.stop);
		this.load!();
	}
	toDataUrl(url: string) {
		return YamiIpc.invoke.toQrcode(url);
	}
	getIp() {
		return YamiIpc.invoke.getLocalIp();
	}
	stop() {
		if (!this.enable) return;
		void YamiIpc.invoke.stopServer();
		// oxlint-disable-next-line unbound-method
		window.removeEventListener('beforeunload', this.stop);
		this.load!();
	}
	load() {
		if (this.enable) {
			disable(serviceEls.get('qr-start-button') as YamiElement);
			enable(serviceEls.get('qr-close-button') as YamiElement);
		} else {
			disable(serviceEls.get('qr-close-button') as YamiElement);
			enable(serviceEls.get('qr-start-button') as YamiElement);
		}
	}
	async open() {
		this.bindButtons!();
		Window.open!('qr-code');
		const ips = await WebServer.getIp();
		let index = 0;
		let url = `http://${ips[index]}:${WebServer.port}`;
		this.setContent!(url, (await WebServer.toDataUrl(url)) ?? '');
		on(serviceEls.get('qr-update-button') as YamiElement, 'click', async () => {
			index = index >= ips.length - 1 ? 0 : ++index;
			url = `http://${ips[index]}:${WebServer.port}`;
			this.setContent!(url, (await WebServer.toDataUrl(url)) ?? '');
		});
		this.load!();
	}
	setContent(url: string, img: string) {
		const content = serviceEls.get('qr-code-content') as HTMLElement & {
			update?: (value: { url: string; img: string }) => void;
		};
		content?.update?.({ url, img });
	}
	update(projectPath: string) {
		if (!this.enable) return;
		const path = Path.dirname(projectPath);
		const location = Path.join(path, '.preview');
		return FSP.mkdir(path, { recursive: true })
			.then((_done: unknown) => {
				DeploymentForm.platform = 'web';
				return Deployment.copyFilesTo!(location);
			})
			.finally(() => {
				Window.close!('copyProgress');
				if (Deployment.timer) {
					Deployment.timer.remove();
					Deployment.timer = null;
				}
			})
			.then(() => {
				Editor.config!.dialogs!.deploy = Path.slash(Path.resolve(location));
			})
			.catch((error: unknown) => {
				Log.throw!(error);
				Window.confirm!(
					{
						message: 'Failed to deploy project:\n' + (error as Error).message
					},
					[
						{
							label: 'Confirm'
						}
					]
				);
			});
	}
})();
