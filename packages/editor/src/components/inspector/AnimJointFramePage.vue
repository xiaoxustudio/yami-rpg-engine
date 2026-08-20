<template>
	<DetailBox open>
		<DetailSummary>{{ t('components.animJointFrame-properties-grid.label') || 'Frame' }}</DetailSummary>
		<div class="detail-grid" id="animJointFrame-properties-grid">
			<div class="text">{{ t('components.animJointFrame-position-box.label') || 'Position' }}</div>
			<div
				id="animJointFrame-position-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="animJointFrame-x"
					v-model="form.x"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px" @input="onParamInput"
				></NumberBox>
				<NumberBox
					id="animJointFrame-y"
					v-model="form.y"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.animJointFrame-rotation-box.label') || 'Rotation' }}</div>
			<div
				id="animJointFrame-rotation-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="animJointFrame-rotation"
					v-model="form.rotation"
					min="-36000"
					max="36000"
					decimals="4"
					unit="deg" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.animJointFrame-scale-box.label') || 'Scale' }}</div>
			<div
				id="animJointFrame-scale-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="animJointFrame-scaleX"
					v-model="form.scaleX"
					min="-100"
					max="100"
					step="0.1"
					decimals="4" @input="onParamInput"
				></NumberBox>
				<NumberBox
					id="animJointFrame-scaleY"
					v-model="form.scaleY"
					min="-100"
					max="100"
					step="0.1"
					decimals="4" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.animJointFrame-opacity-box.label') || 'Opacity' }}</div>
			<div
				id="animJointFrame-opacity-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="animJointFrame-opacity"
					v-model="form.opacity"
					min="0"
					max="1"
					step="0.05"
					decimals="4" @input="onParamInput"
				></NumberBox>
			</div>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAnimJointFramePage } from '@app/composables/useAnimJointFramePage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { Animation } from '@app/legacy/animation/animation-window.ts';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import NumberBox from '@app/components/common/NumberBox.vue';

const { t } = useI18n();

const { form, sync, onParamInput } = useAnimJointFramePage();

const { bindInput } = useInspectorInput();

onMounted(() => {
	const animJointFrame = Inspector.animJointFrame;
	if (!animJointFrame) return;

	const elements = document.querySelectorAll(`#animJointFrame-x, #animJointFrame-y, #animJointFrame-rotation,
    #animJointFrame-scaleX, #animJointFrame-scaleY, #animJointFrame-opacity`);
	bindInput(elements, animJointFrame, Animation, (data: Record<string, unknown>) => {
		data.type = 'inspector-frame-change';
		data.motion = animJointFrame.motion;
		data.direction = Animation.direction;
	});

	const el = document.getElementById('animJointFrame-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
