<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.animJointFrame-properties-grid.label') || 'Frame'
		}}</DetailSummary>
		<div class="detail-grid" id="animJointFrame-properties-grid">
			<div class="text">
				{{ t('components.animJointFrame-position-box.label') || 'Position' }}
			</div>
			<div id="animJointFrame-position-box" class="box uiElement-grid-box with-2-columns">
				<NumberBox
					id="animJointFrame-x"
					ref="elX"
					v-model="form.x"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
					@input="onParamInput"
				></NumberBox>
				<NumberBox
					id="animJointFrame-y"
					ref="elY"
					v-model="form.y"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.animJointFrame-rotation-box.label') || 'Rotation' }}
			</div>
			<div id="animJointFrame-rotation-box" class="box uiElement-grid-box with-2-columns">
				<NumberBox
					id="animJointFrame-rotation"
					ref="elRotation"
					v-model="form.rotation"
					min="-36000"
					max="36000"
					decimals="4"
					unit="deg"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.animJointFrame-scale-box.label') || 'Scale' }}</div>
			<div id="animJointFrame-scale-box" class="box uiElement-grid-box with-2-columns">
				<NumberBox
					id="animJointFrame-scaleX"
					ref="elScaleX"
					v-model="form.scaleX"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
				<NumberBox
					id="animJointFrame-scaleY"
					ref="elScaleY"
					v-model="form.scaleY"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.animJointFrame-opacity-box.label') || 'Opacity' }}
			</div>
			<div id="animJointFrame-opacity-box" class="box uiElement-grid-box with-2-columns">
				<NumberBox
					id="animJointFrame-opacity"
					ref="elOpacity"
					v-model="form.opacity"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
			</div>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
/* oxlint-disable eslint/no-restricted-properties */
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAnimJointFramePage } from '@app/composables/useAnimJointFramePage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { Animation } from '@app/animation/animation-window.ts';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import NumberBox from '@app/components/common/NumberBox.vue';

const { t } = useI18n();

const { form, sync, onParamInput: onParamInputEvent } = useAnimJointFramePage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as unknown as Event);
};

const { bindInput } = useInspectorInput();

const elX = ref<InstanceType<typeof NumberBox> | null>(null);
const elY = ref<InstanceType<typeof NumberBox> | null>(null);
const elRotation = ref<InstanceType<typeof NumberBox> | null>(null);
const elScaleX = ref<InstanceType<typeof NumberBox> | null>(null);
const elScaleY = ref<InstanceType<typeof NumberBox> | null>(null);
const elOpacity = ref<InstanceType<typeof NumberBox> | null>(null);

onMounted(() => {
	const animJointFrame = Inspector.animJointFrame;
	if (!animJointFrame) return;

	const elements = [
		elX.value?.root,
		elY.value?.root,
		elRotation.value?.root,
		elScaleX.value?.root,
		elScaleY.value?.root,
		elOpacity.value?.root
	].filter((el): el is HTMLElement => el != null);
	bindInput(elements, animJointFrame, Animation as unknown as { history: unknown }, (data: Record<string, unknown>) => {
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
