import { Window } from '@app/tools/window-object.ts';
import { Data } from '@app/data/data-object.ts';
import { Meta } from '@app/data/metadata.ts';
import { FolderItem } from '@app/services/file-system/file-item.ts';
import { Log } from '@app/log/log-window.ts';
import { Editor } from '@app/services/project/editor.ts';
import { File } from './file-system-core.ts';
import { GL } from '@app/engine/webgl/webgl-init.ts';
import { DirectoryTree, registerDirectoryTree } from '@app/services/file-system/directory-tree.ts';
import { emitCustom } from '@app/events/custom-events';
import { remove } from '@app/utils/array';

// oxlint-disable-next-line no-explicit-any
type DirectoryMethod = (...args: any[]) => any;

export const Directory: {
	inoMap: Record<string, unknown>;
	assets: FolderItem | null;
	symbol: symbol | null;
	reading: boolean;
	updating: Promise<unknown> | null;
	initialize: DirectoryMethod | null;
	read: DirectoryMethod | null;
	close: DirectoryMethod | null;
	update: DirectoryMethod | null;
	getFolder: DirectoryMethod | null;
	getFile: DirectoryMethod | null;
	readdir: DirectoryMethod | null;
	searchFiles: DirectoryMethod | null;
	existFiles: DirectoryMethod | null;
	filterFiles: DirectoryMethod | null;
	deleteFiles: DirectoryMethod | null;
	moveFiles: DirectoryMethod | null;
	saveFiles: DirectoryMethod | null;
	copyFiles: DirectoryMethod | null;
	sortFiles: DirectoryMethod | null;
	createInoMap: DirectoryMethod | null;
	windowFocus: DirectoryMethod | null;
} = registerDirectoryTree(
	new DirectoryTree({
		onVersionTick: () => {
			Meta.versionId++;
		},
		onReadError: (error: unknown) => {
			Log.throw!(error);
			Window.confirm!(
				{
					message: 'Failed to read directory',
					close: () => {
						Editor.close!(false);
					}
				},
				[
					{
						label: 'Confirm'
					}
				]
			);
		},
		onManifestUpdate: () => {
			Data.manifest.update();
		},
		onChanged: () => {
			emitCustom('dirchange');
		},
		getChanges: () => Data.manifest.changes,
		onSaved: (metas: Array<unknown>) => {
			// 同 `File.planToSave`：`changes` 是普通数组，没有 `remove` 方法，
			// 必须用自由函数 `remove(changes, meta)`（2026-09-18）。
			const changes = Data.manifest.changes;
			for (const meta of metas) {
				remove(changes, meta as (typeof changes)[number]);
			}
		},
		fileItem: {
			path: (relativePath: string) => File.path!(relativePath),
			getVersionId: () => Meta.versionId,
			getMetaByGuid: (guid: string) => Data.manifest.guidMap[guid],
			registerMeta: (file, guid) => new Meta(file, guid),
			deleteMeta: (meta) => Data.manifest.deleteMeta(meta as InstanceType<typeof Meta>),
			redirectMeta: (meta, file) => meta.redirect(file),
			onTextureLoad: (guid: string) => GL.textureManager.updateImage(guid),
			onLoadScript: (file) => {
				void Data.loadScript(
					file as {
						meta?: { guid: string; code?: string };
						promise?: Promise<unknown> | null;
						path: string;
					}
				);
			}
		},
		file: {
			path: (dirPath: string) => File.path!(dirPath),
			saveFile: (meta) => File.saveFile!(meta),
			filterGUID: (name: string) => File.filterGUID!(name)
		}
	})
);
