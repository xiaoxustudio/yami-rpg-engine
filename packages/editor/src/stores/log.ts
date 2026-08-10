import { defineStore } from 'pinia';
import { UpdateLog } from '@/log/update-log-window.ts';
import { Log } from '@/log/log-window.ts';
import { Reference } from '@/log/related-references.ts';
import { shallowRef } from 'vue';

export const useLogStore = defineStore('log', () => {
	const logs = shallowRef<{ [k: string]: any }[]>([]);

	function syncState() {
		logs.value = Log?.logs ?? [];
	}

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

	function logThrow(...args: any[]) {
		Log?.throw?.(...args);
	}

	function logPrint(...args: any[]) {
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

	function logCatchError(...args: any[]) {
		Log?.catchError?.(...args);
	}

	function logCatchRejection(...args: any[]) {
		Log?.catchRejection?.(...args);
	}

	function logTscLog(...args: any[]) {
		Log?.tscLog?.(...args);
	}

	function updateLogInitialize() {
		UpdateLog?.initialize?.();
	}

	function updateLogOpen(...args: any[]) {
		UpdateLog?.open?.(...args);
	}

	function updateLogUpdate(...args: any[]) {
		UpdateLog?.update?.(...args);
	}

	function updateLogSwitchMode(...args: any[]) {
		UpdateLog?.switchMode?.(...args);
	}

	function updateLogLoadCommunityReleases(...args: any[]) {
		UpdateLog?.loadCommunityReleases?.(...args);
	}

	function updateLogDisplayDonationList(...args: any[]) {
		UpdateLog?.displayDonationList?.(...args);
	}

	function updateLogParseCommunityReleases(...args: any[]) {
		UpdateLog?.parseCommunityReleases?.(...args);
	}

	function updateLogWindowClosed(...args: any[]) {
		UpdateLog?.windowClosed?.(...args);
	}

	function referenceInitialize() {
		Reference?.initialize?.();
	}

	function referenceFindAllGuids(...args: any[]) {
		return Reference?.findAllGuids?.(...args);
	}

	function referenceFilterUselessComments(...args: any[]) {
		return Reference?.filterUselessComments?.(...args);
	}

	function referenceFindRelated(...args: any[]) {
		return Reference?.findRelated?.(...args);
	}

	function referenceOpenRelated(...args: any[]) {
		Reference?.openRelated?.(...args);
	}

	function referenceFindInvalid() {
		return Reference?.findInvalid?.();
	}

	function referenceOpenInvalid(...args: any[]) {
		Reference?.openInvalid?.(...args);
	}

	function referenceFindUnused() {
		return Reference?.findUnused?.();
	}

	function referenceOpenUnused(...args: any[]) {
		Reference?.openUnused?.(...args);
	}

	function referenceOpenList(...args: any[]) {
		Reference?.openList?.(...args);
	}

	function referenceUpdate(...args: any[]) {
		Reference?.update?.(...args);
	}

	function referenceWindowClosed(...args: any[]) {
		Reference?.windowClosed?.(...args);
	}

	function referenceListSelect(...args: any[]) {
		Reference?.listSelect?.(...args);
	}

	function referenceListPopup(...args: any[]) {
		Reference?.listPopup?.(...args);
	}

	function referenceGetKeydownListener(...args: any[]) {
		return Reference?.getKeydownListener?.(...args);
	}

	function referenceGetKeyupListener(...args: any[]) {
		return Reference?.getKeyupListener?.(...args);
	}

	function referenceGetPointerdownListener(...args: any[]) {
		return Reference?.getPointerdownListener?.(...args);
	}

	function referenceGetPointermoveListener(...args: any[]) {
		return Reference?.getPointermoveListener?.(...args);
	}

	return {
		logs,
		syncState,
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
