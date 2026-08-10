import { ipcRenderer } from 'electron';
import { Window } from '@/tools/window-object.ts';
import { $ } from '@/util/dom.ts';
import { disable, enable, on, write } from '@/util/element-utils.ts';
import { Path } from '@/util/config.ts';
import { FSP } from '@/file/file-system.ts';
import { Log } from '@/log/log-window.ts';
import { Editor } from '@/main/editor.ts';
import { Deployment } from '@/title/deploy-project-window.ts';

export const WebServer = new (class {
	port = 5959;
	constructor() {}
	bindButtons() {
		const startBtn = $('#qr-start-button');
		if (!startBtn) return;
		on(startBtn, 'click', () => {
			this.start!(Path.slash(Editor.config!.project!));
		});
		on($('#qr-close-button'), 'click', () => this.stop!());
	}
	get enable() {
		return ipcRenderer.sendSync('get-server-state');
	}
	start(path: any) {
		ipcRenderer.invoke('start-server', {
			port: this.port,
			path
		});
		window.addEventListener('beforeunload', this.stop);
		this.load!();
	}
	toDataUrl(url: any) {
		return ipcRenderer.invoke('to-qrcode', url);
	}
	getIp() {
		return ipcRenderer.invoke('get-local-ip');
	}
	stop() {
		if (!this.enable) return;
		ipcRenderer.invoke('stop-server');
		window.removeEventListener('beforeunload', this.stop);
		this.load!();
	}
	load() {
		if (this.enable) {
			disable($('#qr-start-button'));
			enable($('#qr-close-button'));
		} else {
			disable($('#qr-close-button'));
			enable($('#qr-start-button'));
		}
	}
	async open() {
		this.bindButtons!();
		Window.open!('qr-code');
		const ips = await WebServer.getIp();
		let index = 0;
		let url = `http://${ips[index]}:${WebServer.port}`;
		$('#qr-code-content').innerHTML =
			`<div>IP：${url}</div><div>扫描二维码打开网页</div><div style='color:red'>PS：注意需在同一局域网下扫描二维码</div>
		<div style='color:red'>如果内容没刷新，请Ctrl+S保存场景</div>`;
		$('#qr-code-img').src = await WebServer.toDataUrl(url);
		on($('#qr-update-button'), 'click', async () => {
			index = index >= ips.length - 1 ? 0 : ++index;
			url = `http://${ips[index]}:${WebServer.port}`;
			$('#qr-code-img').src = await WebServer.toDataUrl(url);
			$('#qr-code-content').innerHTML =
				`<div>IP：${url}</div><div>扫描二维码打开网页</div><div style='color:red'>PS：注意需在同一局域网下扫描二维码</div>
		<div style='color:red'>如果内容没刷新，请Ctrl+S保存场景</div>`;
		});
		this.load!();
	}
	update(projectPath: any) {
		if (!this.enable) return;
		const path = Path.dirname(projectPath);
		const location = Path.join(path, '.preview');
		return FSP.mkdir(path, { recursive: true })
			.then((done: any) => {
				write($('#deployment-platform'), 'web');
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
			.catch((error: any) => {
				Log.throw!(error);
				Window.confirm!(
					{
						message: 'Failed to deploy project:\n' + error.message
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
