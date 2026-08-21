import { defineStore } from 'pinia';
import { UpdateLog } from '@app/log/update-log-window.ts';
import { Log } from '@app/log/log-window.ts';
import { Reference } from '@app/log/related-references.ts';
import { pinia } from './pinia';
import { shallowRef } from 'vue';

export const useLogStore = defineStore('log', () => {
	const logs = shallowRef<{ type: string; message: string; duration: number }[]>([]);

	function log(message: string) {
		Log?.log?.(message);
	}

	function warn(message: string) {
		Log?.warn?.(message);
	}

	function error(message: string) {
		Log?.error?.(message);
	}

	function logInitialize() {
		Log?.initialize?.();
	}

	function logThrow(...args: unknown[]) {
		Log?.throw?.(...args);
	}

	function logPrint(...args: unknown[]) {
		Log?.print?.(...args);
	}

	function logClear() {
		Log?.clear?.();
	}

	function logUpdate() {
		Log?.update?.();
	}

	function logTick() {
		Log?.tick?.();
	}

	function logCatchError(...args: unknown[]) {
		Log?.catchError?.(...args);
	}

	function logCatchRejection(...args: unknown[]) {
		Log?.catchRejection?.(...args);
	}

	function logTscLog(...args: unknown[]) {
		Log?.tscLog?.(...args);
	}

	function updateLogInitialize() {
		UpdateLog?.initialize?.();
	}

	function updateLogOpen(...args: unknown[]) {
		UpdateLog?.open?.(...args);
	}

	function updateLogUpdate(...args: unknown[]) {
		UpdateLog?.update?.(...args);
	}

	function updateLogSwitchMode(...args: unknown[]) {
		UpdateLog?.switchMode?.(...args);
	}

	function updateLogLoadCommunityReleases(...args: unknown[]) {
		UpdateLog?.loadCommunityReleases?.(...args);
	}

	function updateLogDisplayDonationList(...args: unknown[]) {
		UpdateLog?.displayDonationList?.(...args);
	}

	function updateLogParseCommunityReleases(...args: unknown[]) {
		UpdateLog?.parseCommunityReleases?.(...args);
	}

	function updateLogWindowClosed(...args: unknown[]) {
		UpdateLog?.windowClosed?.(...args);
	}

	function referenceInitialize() {
		Reference?.initialize?.();
	}

	function referenceFindAllGuids(targetGuid?: string) {
		return Reference?.findAllGuids?.(targetGuid);
	}

	function referenceFilterUselessComments(...args: unknown[]) {
		return Reference?.filterUselessComments?.(...args);
	}

	function referenceFindRelated(...args: unknown[]) {
		return Reference?.findRelated?.(...args);
	}

	function referenceOpenRelated(...args: unknown[]) {
		Reference?.openRelated?.(...args);
	}

	function referenceFindInvalid() {
		return Reference?.findInvalid?.();
	}

	function referenceOpenInvalid(...args: unknown[]) {
		Reference?.openInvalid?.(...args);
	}

	function referenceFindUnused() {
		return Reference?.findUnused?.();
	}

	function referenceOpenUnused(...args: unknown[]) {
		Reference?.openUnused?.(...args);
	}

	function referenceOpenList(...args: unknown[]) {
		Reference?.openList?.(...args);
	}

	function referenceUpdate(...args: unknown[]) {
		Reference?.update?.(...args);
	}

	function referenceWindowClosed(...args: unknown[]) {
		Reference?.windowClosed?.(...args);
	}

	function referenceListSelect(...args: unknown[]) {
		Reference?.listSelect?.(...args);
	}

	function referenceListPopup(...args: unknown[]) {
		Reference?.listPopup?.(...args);
	}

	function referenceGetKeydownListener(...args: unknown[]) {
		return Reference?.getKeydownListener?.(...args);
	}

	function referenceGetKeyupListener(...args: unknown[]) {
		return Reference?.getKeyupListener?.(...args);
	}

	function referenceGetPointerdownListener(...args: unknown[]) {
		return Reference?.getPointerdownListener?.(...args);
	}

	function referenceGetPointermoveListener(...args: unknown[]) {
		return Reference?.getPointermoveListener?.(...args);
	}

	return {
		logs,
		log,
		warn,
		error,
		logInitialize,
		logThrow,
		logPrint,
		logClear,
		logUpdate,
		logTick,
		logCatchError,
		logCatchRejection,
		logTscLog,
		updateLogInitialize,
		updateLogOpen,
		updateLogUpdate,
		updateLogSwitchMode,
		updateLogLoadCommunityReleases,
		updateLogDisplayDonationList,
		updateLogParseCommunityReleases,
		updateLogWindowClosed,
		referenceInitialize,
		referenceFindAllGuids,
		referenceFilterUselessComments,
		referenceFindRelated,
		referenceOpenRelated,
		referenceFindInvalid,
		referenceOpenInvalid,
		referenceFindUnused,
		referenceOpenUnused,
		referenceOpenList,
		referenceUpdate,
		referenceWindowClosed,
		referenceListSelect,
		referenceListPopup,
		referenceGetKeydownListener,
		referenceGetKeyupListener,
		referenceGetPointerdownListener,
		referenceGetPointermoveListener
	};
});

export function getLogStore() {
	return useLogStore(pinia);
}
