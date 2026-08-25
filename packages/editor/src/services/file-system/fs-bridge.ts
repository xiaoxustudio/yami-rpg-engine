import nodeFs from 'node:fs';
import { YamiIpc } from '@app/services/ipc/bridge.ts';

export const FS = nodeFs;
// oxlint-disable-next-line no-explicit-any
export const FSP = (FS.promises ?? {}) as unknown as Record<string, any>;

FSP.writeFile = function (path: string, text: string | Buffer, check = false) {
	return YamiIpc.invoke.writeFile(path, text, check);
};
