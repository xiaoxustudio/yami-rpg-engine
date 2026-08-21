<template>
	<DetailBox open>
		<DetailSummary>{{ t('components.uiAnimation-properties-grid.label') || 'Animation Properties' }}</DetailSummary>
		<div class="detail-grid" id="uiAnimation-properties-grid">
			<div class="text">{{ t('components.uiAnimation-animation.label') || 'Animation' }}</div
			><CustomBox
				id="uiAnimation-animation"
				type="file"
				filter="animation"
				@input="onParamInput"
			></CustomBox>
			<div class="text">{{ t('components.uiAnimation-motion.label') || 'Motion' }}</div><SelectBox id="uiAnimation-motion" @input="onParamInput"></SelectBox>
			<div class="text">{{ t('components.uiAnimation-autoplay.label') || 'Autoplay' }}</div
			><CheckBox
				id="uiAnimation-autoplay"
				class="standard large"
				@input="onParamInput"
			></CheckBox>
			<div class="text">{{ t('components.uiAnimation-rotatable.label') || 'Rotatable' }}</div
			><CheckBox
				id="uiAnimation-rotatable"
				class="standard large"
				@input="onParamInput"
			></CheckBox>
			<div class="text">{{ t('components.uiAnimation-angle.label') || 'Angle' }}</div
			><NumberBox
				id="uiAnimation-angle"
				min="0"
				max="360"
				unit="deg"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiAnimation-frame.label') || 'Frame' }}</div
			><NumberBox id="uiAnimation-frame" min="0" max="10000" @input="onParamInput"></NumberBox>
			<div class="text">{{ t('components.uiAnimation-offset-box.label') || 'Offset' }}</div>
			<div
				id="uiAnimation-offset-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="uiAnimation-offsetX"
					min="-10000"
					max="10000"
					unit="px"
					@input="onParamInput"
				></NumberBox>
				<NumberBox
					id="uiAnimation-offsetY"
					min="-10000"
					max="10000"
					unit="px"
					@input="onParamInput"
				></NumberBox>
			</div>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import '@app/inspector/element-animation-page.ts';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { UI } from '@app/ui/ui-window.ts';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CheckBox from '@app/components/common/CheckBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { bindInput } = useInspectorInput();

const onParamInput = (event: Event) => {
	const target = event?.target ?? document.activeElement;
	Inspector?.uiAnimation?.paramInput?.({ target });
};

onMounted(() => {
	const uiAnimation = Inspector.uiAnimation;
	if (!uiAnimation) return;
	document.getElementById('uiAnimation-animation')?.addEventListener('write', (event: Event) => {
		uiAnimation.animationIdWrite(event);
	});
	const elements = document.querySelectorAll(`#uiAnimation-animation, #uiAnimation-motion,
    #uiAnimation-autoplay, #uiAnimation-rotatable, #uiAnimation-angle,
    #uiAnimation-frame, #uiAnimation-offsetX, #uiAnimation-offsetY`);
	bindInput(elements, uiAnimation, UI);
});
</script>
