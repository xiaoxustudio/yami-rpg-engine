<template>
	<DetailBox open>
		<DetailSummary>{{ t('components.uiVideo-properties-grid.label') || 'Video Properties' }}</DetailSummary>
		<div class="detail-grid" id="uiVideo-properties-grid">
			<div class="text">{{ t('components.uiVideo-video.label') || 'Video' }}</div
			><CustomBox id="uiVideo-video" type="file" filter="video" @input="onParamInput"></CustomBox>
			<div class="text">{{ t('components.uiVideo-playbackRate.label') || 'Playback Rate' }}</div
			><NumberBox
				id="uiVideo-playbackRate"
				min="0"
				max="4"
				decimals="4"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiVideo-loop.label') || 'Loop' }}</div><SelectBox id="uiVideo-loop" @input="onParamInput"></SelectBox>
			<div class="text">{{ t('components.uiVideo-flip.label') || 'Flip' }}</div><SelectBox id="uiVideo-flip" @input="onParamInput"></SelectBox>
			<div class="text">{{ t('components.uiVideo-blend.label') || 'Blend' }}</div><SelectBox id="uiVideo-blend" @input="onParamInput"></SelectBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import '@app/inspector/element-video-page.ts';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { UI } from '@app/ui/ui-window.ts';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { bindInput } = useInspectorInput();

const onParamInput = (event: Event) => {
	const target = event?.target ?? document.activeElement;
	Inspector?.uiVideo?.paramInput?.({ target });
};

onMounted(() => {
	const editor = Inspector.uiVideo;
	if (!editor) return;

	const elLoop = document.getElementById('uiVideo-loop') as HTMLElement & { loadItems?: (items: unknown[]) => void } | null;
	if (elLoop?.loadItems) {
		elLoop.loadItems([
			{ name: 'Once', value: false },
			{ name: 'Loop', value: true }
		]);
	}

	const elFlip = document.getElementById('uiVideo-flip') as HTMLElement & { loadItems?: (items: unknown[]) => void } | null;
	if (elFlip?.loadItems) {
		elFlip.loadItems([
			{ name: 'None', value: 'none' },
			{ name: 'Horizontal', value: 'horizontal' },
			{ name: 'Vertical', value: 'vertical' },
			{ name: 'Both', value: 'both' }
		]);
	}

	const elBlend = document.getElementById('uiVideo-blend') as HTMLElement & { loadItems?: (items: unknown[]) => void } | null;
	if (elBlend?.loadItems) {
		elBlend.loadItems([
			{ name: 'Normal', value: 'normal' },
			{ name: 'Additive', value: 'additive' },
			{ name: 'Subtract', value: 'subtract' }
		]);
	}

	const elements = document.querySelectorAll('#uiVideo-video, #uiVideo-playbackRate, #uiVideo-loop, #uiVideo-flip, #uiVideo-blend');
	bindInput(elements, editor, UI);
});
</script>
