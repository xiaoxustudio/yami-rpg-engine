<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { ThemeProvider } from '@ui-kit';
import YMButtonDemo from './demos/basic/YMButton.demo.vue';
import YMCheckBoxDemo from './demos/basic/YMCheckBox.demo.vue';
import YMRadioBoxDemo from './demos/basic/YMRadioBox.demo.vue';
import YMSwitchItemDemo from './demos/basic/YMSwitchItem.demo.vue';
import YMTextBoxDemo from './demos/basic/YMTextBox.demo.vue';
import YMTextAreaDemo from './demos/basic/YMTextArea.demo.vue';
import YMNumberBoxDemo from './demos/basic/YMNumberBox.demo.vue';
import YMSliderBoxDemo from './demos/basic/YMSliderBox.demo.vue';
import YMSelectBoxDemo from './demos/basic/YMSelectBox.demo.vue';
import YMSelectListDemo from './demos/basic/YMSelectList.demo.vue';
import YMMenuListDemo from './demos/basic/YMMenuList.demo.vue';
import YMColorBoxDemo from './demos/basic/YMColorBox.demo.vue';
import YMCommonListDemo from './demos/basic/YMCommonList.demo.vue';
import YMTreeListDemo from './demos/basic/YMTreeList.demo.vue';
import YMScrollBarDemo from './demos/basic/YMScrollBar.demo.vue';
import YMDetailBoxDemo from './demos/basic/YMDetailBox.demo.vue';
import YMDetailSummaryDemo from './demos/basic/YMDetailSummary.demo.vue';
import YMEmptyStateDemo from './demos/basic/YMEmptyState.demo.vue';
import YMLoadingOverlayDemo from './demos/basic/YMLoadingOverlay.demo.vue';
import YMToastManagerDemo from './demos/basic/YMToastManager.demo.vue';
import YMPageManagerDemo from './demos/basic/YMPageManager.demo.vue';
import YMNavBarDemo from './demos/basic/YMNavBar.demo.vue';
import YMFormButtonsDemo from './demos/basic/YMFormButtons.demo.vue';
import YMFilterBoxDemo from './demos/basic/YMFilterBox.demo.vue';
import YMKeyboardBoxDemo from './demos/basic/YMKeyboardBox.demo.vue';
import YMGamepadBoxDemo from './demos/basic/YMGamepadBox.demo.vue';
import YMNumberVarDemo from './demos/basic/YMNumberVar.demo.vue';
import YMStringVarDemo from './demos/basic/YMStringVar.demo.vue';
import YMTextAreaVarDemo from './demos/basic/YMTextAreaVar.demo.vue';
import YMSelectVarDemo from './demos/basic/YMSelectVar.demo.vue';
import YMFileVarDemo from './demos/basic/YMFileVar.demo.vue';
import YMWindowFrameDemo from './demos/business/YMWindowFrame.demo.vue';
import YMTitleBarDemo from './demos/business/YMTitleBar.demo.vue';
import YMTabBarDemo from './demos/business/YMTabBar.demo.vue';
import YMConfirmationDemo from './demos/business/YMConfirmation.demo.vue';
import YMRenameDemo from './demos/business/YMRename.demo.vue';
import YMZoomDemo from './demos/business/YMZoom.demo.vue';
import YMSetKeyDemo from './demos/business/YMSetKey.demo.vue';
import YMSetQuantityDemo from './demos/business/YMSetQuantity.demo.vue';
import YMFontDemo from './demos/business/YMFont.demo.vue';
import YMFontSizeDemo from './demos/business/YMFontSize.demo.vue';
import YMRequestKeyValueDemo from './demos/business/YMRequestKeyValue.demo.vue';
import YMArrayListNumberDemo from './demos/business/YMArrayListNumber.demo.vue';
import YMArrayListStringDemo from './demos/business/YMArrayListString.demo.vue';
import YMCustomBoxDemo from './demos/business/YMCustomBox.demo.vue';
import YMParamListDemo from './demos/business/YMParamList.demo.vue';
import YMParameterPaneDemo from './demos/business/YMParameterPane.demo.vue';
import YMCommandListDemo from './demos/business/YMCommandList.demo.vue';
import YMMarqueeAreaDemo from './demos/business/YMMarqueeArea.demo.vue';
import YMDragAndDropHintDemo from './demos/business/YMDragAndDropHint.demo.vue';
import YMFileBrowserDemo from './demos/business/YMFileBrowser.demo.vue';
import YMFileHeadPaneDemo from './demos/business/YMFileHeadPane.demo.vue';
import YMFileNavPaneDemo from './demos/business/YMFileNavPane.demo.vue';
import YMFileBodyPaneDemo from './demos/business/YMFileBodyPane.demo.vue';

interface WindowFrameHost {
	positionMode?: string;
	frames?: HTMLElement[] & {
		append(element: HTMLElement): boolean;
		remove(element: HTMLElement): boolean;
	};
	ambient?: { update(): void };
	close?(id?: string): void;
}

const frames = [] as HTMLElement[] & {
	append(element: HTMLElement): boolean;
	remove(element: HTMLElement): boolean;
};
frames.append = (element: HTMLElement) => {
	if (frames.indexOf(element) !== -1) {
		return false;
	}
	frames.push(element);
	document.body.appendChild(element);
	element.classList.add('open');
	return true;
};
frames.remove = (element: HTMLElement) => {
	const index = frames.indexOf(element);
	if (index === -1) {
		return false;
	}
	frames.splice(index, 1);
	element.classList.remove('open');
	return true;
};

const mockWindow: WindowFrameHost = {
	positionMode: 'center',
	frames,
	ambient: { update() {} },
	close(id?: string) {
		const el = frames.find((frame) => frame.id === id);
		if (el) {
			frames.remove(el);
		}
	}
};

onMounted(() => {
	(window as Window & { Window?: WindowFrameHost }).Window = mockWindow;
});

onUnmounted(() => {
	(window as unknown as { Window?: unknown }).Window = undefined;
});
</script>

<template>
	<ThemeProvider>
		<div class="page">
			<h1>@yami/ui-kit Playground</h1>
			<YMButtonDemo />
			<YMCheckBoxDemo />
			<YMRadioBoxDemo />
			<YMSwitchItemDemo />
			<YMTextBoxDemo />
			<YMTextAreaDemo />
			<YMNumberBoxDemo />
			<YMSliderBoxDemo />
			<YMSelectBoxDemo />
			<YMSelectListDemo />
			<YMMenuListDemo />
			<YMColorBoxDemo />
			<YMCommonListDemo />
			<YMTreeListDemo />
			<YMScrollBarDemo />
			<YMDetailBoxDemo />
			<YMDetailSummaryDemo />
			<YMEmptyStateDemo />
			<YMLoadingOverlayDemo />
			<YMToastManagerDemo />
			<YMPageManagerDemo />
			<YMNavBarDemo />
			<YMFormButtonsDemo />
			<YMFilterBoxDemo />
			<YMKeyboardBoxDemo />
			<YMGamepadBoxDemo />
			<YMNumberVarDemo />
			<YMStringVarDemo />
			<YMTextAreaVarDemo />
			<YMSelectVarDemo />
			<YMFileVarDemo />
			<YMWindowFrameDemo />
			<YMTitleBarDemo />
			<YMTabBarDemo />
			<YMConfirmationDemo />
			<YMRenameDemo />
			<YMZoomDemo />
			<YMSetKeyDemo />
			<YMSetQuantityDemo />
			<YMFontDemo />
			<YMFontSizeDemo />
			<YMRequestKeyValueDemo />
			<YMArrayListNumberDemo />
			<YMArrayListStringDemo />
			<YMCustomBoxDemo />
			<YMParamListDemo />
			<YMParameterPaneDemo />
			<YMCommandListDemo />
			<YMMarqueeAreaDemo />
			<YMDragAndDropHintDemo />
			<YMFileBrowserDemo />
			<YMFileHeadPaneDemo />
			<YMFileNavPaneDemo />
			<YMFileBodyPaneDemo />
		</div>
	</ThemeProvider>
</template>

<style scoped>
.page {
	max-width: 960px;
	margin: 0 auto;
	padding: 32px;
	font-family: var(--ym-font-sans);
	color: var(--ym-color-text);
	background: var(--ym-color-surface);
	min-height: 100vh;
}
</style>
