import { ipcRenderer } from 'electron';
import nodeFs from 'node:fs';
import { CHANNELS } from '@app/services/ipc/channels.ts';

export const FS = nodeFs;
// oxlint-disable-next-line no-explicit-any
export const FSP = (FS.promises ?? {}) as unknown as Record<string, any>;

FSP.writeFile = function (path: string, text: string | Buffer, check = false) {
	// oxlint-disable-next-line unbound-method
	const { invoke } = ipcRenderer;
	return invoke(CHANNELS.invoke.writeFile, path, text, check);
};
