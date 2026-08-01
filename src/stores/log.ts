import { defineStore } from 'pinia';
import { shallowRef } from 'vue';

export const useLogStore = defineStore('log', () => {
	const logs = shallowRef<any[]>([]);

	function syncState() {
		logs.value = (window as any).Log?.logs ?? [];
	}

	function log(message: string) {
		(window as any).Log?.log?.(message);
	}

	function warn(message: string) {
		(window as any).Log?.warn?.(message);
	}

	function error(message: string) {
		(window as any).Log?.error?.(message);
	}

	function logInitialize() {
		(window as any).Log?.initialize?.();
	}

	function logThrow(...args: any[]) {
		(window as any).Log?.throw?.(...args);
	}

	function logPrint(...args: any[]) {
		(window as any).Log?.print?.(...args);
	}

	function logClear() {
		(window as any).Log?.clear?.();
	}

	function logUpdate() {
		(window as any).Log?.update?.();
	}

	function logTick() {
		(window as any).Log?.tick?.();
	}

	function logCatchError(...args: any[]) {
		(window as any).Log?.catchError?.(...args);
	}

	function logCatchRejection(...args: any[]) {
		(window as any).Log?.catchRejection?.(...args);
	}

	function logTscLog(...args: any[]) {
		(window as any).Log?.tscLog?.(...args);
	}

	function updateLogInitialize() {
		(window as any).UpdateLog?.initialize?.();
	}

	function updateLogOpen(...args: any[]) {
		(window as any).UpdateLog?.open?.(...args);
	}

	function updateLogUpdate(...args: any[]) {
		(window as any).UpdateLog?.update?.(...args);
	}

	function updateLogSwitchMode(...args: any[]) {
		(window as any).UpdateLog?.switchMode?.(...args);
	}

	function updateLogLoadCommunityReleases(...args: any[]) {
		(window as any).UpdateLog?.loadCommunityReleases?.(...args);
	}

	function updateLogDisplayDonationList(...args: any[]) {
		(window as any).UpdateLog?.displayDonationList?.(...args);
	}

	function updateLogParseCommunityReleases(...args: any[]) {
		(window as any).UpdateLog?.parseCommunityReleases?.(...args);
	}

	function updateLogWindowClosed(...args: any[]) {
		(window as any).UpdateLog?.windowClosed?.(...args);
	}

	function referenceInitialize() {
		(window as any).Reference?.initialize?.();
	}

	function referenceFindAllGuids(...args: any[]) {
		return (window as any).Reference?.findAllGuids?.(...args);
	}

	function referenceFilterUselessComments(...args: any[]) {
		return (window as any).Reference?.filterUselessComments?.(...args);
	}

	function referenceFindRelated(...args: any[]) {
		return (window as any).Reference?.findRelated?.(...args);
	}

	function referenceOpenRelated(...args: any[]) {
		(window as any).Reference?.openRelated?.(...args);
	}

	function referenceFindInvalid() {
		return (window as any).Reference?.findInvalid?.();
	}

	function referenceOpenInvalid(...args: any[]) {
		(window as any).Reference?.openInvalid?.(...args);
	}

	function referenceFindUnused() {
		return (window as any).Reference?.findUnused?.();
	}

	function referenceOpenUnused(...args: any[]) {
		(window as any).Reference?.openUnused?.(...args);
	}

	function referenceOpenList(...args: any[]) {
		(window as any).Reference?.openList?.(...args);
	}

	function referenceUpdate(...args: any[]) {
		(window as any).Reference?.update?.(...args);
	}

	function referenceWindowClosed(...args: any[]) {
		(window as any).Reference?.windowClosed?.(...args);
	}

	function referenceListSelect(...args: any[]) {
		(window as any).Reference?.listSelect?.(...args);
	}

	function referenceListPopup(...args: any[]) {
		(window as any).Reference?.listPopup?.(...args);
	}

	function referenceGetKeydownListener(...args: any[]) {
		return (window as any).Reference?.getKeydownListener?.(...args);
	}

	function referenceGetKeyupListener(...args: any[]) {
		return (window as any).Reference?.getKeyupListener?.(...args);
	}

	function referenceGetPointerdownListener(...args: any[]) {
		return (window as any).Reference?.getPointerdownListener?.(...args);
	}

	function referenceGetPointermoveListener(...args: any[]) {
		return (window as any).Reference?.getPointermoveListener?.(...args);
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
