<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.animParticleFrame-properties-grid.label') || 'Frame'
		}}</DetailSummary>
		<div class="detail-grid" id="animParticleFrame-properties-grid">
			<div class="text">
				{{ t('components.animParticleFrame-position-box.label') || 'Position' }}
			</div>
			<div id="animParticleFrame-position-box" class="box uiElement-grid-box with-2-columns">
				<NumberBox
					id="animParticleFrame-x"
				v-tip="t('components.animParticleFrame-x.tip')"
					ref="elX"
					v-model="form.x"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
					@input="onParamInput"
				></NumberBox>
				<NumberBox
					id="animParticleFrame-y"
				v-tip="t('components.animParticleFrame-y.tip')"
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
				{{ t('components.animParticleFrame-rotation-box.label') || 'Rotation' }}
			</div>
			<div id="animParticleFrame-rotation-box" class="box uiElement-grid-box with-2-columns">
				<NumberBox
					id="animParticleFrame-rotation"
				v-tip="t('components.animParticleFrame-rotation.tip')"
					ref="elRotation"
					v-model="form.rotation"
					min="-36000"
					max="36000"
					decimals="4"
					unit="deg"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.animParticleFrame-scale-box.label') || 'Scale' }}
			</div>
			<div id="animParticleFrame-scale-box" class="box uiElement-grid-box with-2-columns">
				<NumberBox
					id="animParticleFrame-scaleX"
				v-tip="t('components.animParticleFrame-scaleX.tip')"
					ref="elScaleX"
					v-model="form.scaleX"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
				<NumberBox
					id="animParticleFrame-scaleY"
				v-tip="t('components.animParticleFrame-scaleY.tip')"
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
				{{ t('components.animParticleFrame-opacity-box.label') || 'Opacity' }}
			</div>
			<div id="animParticleFrame-opacity-box" class="box uiElement-grid-box with-2-columns">
				<NumberBox
					id="animParticleFrame-opacity"
				v-tip="t('components.animParticleFrame-opacity.tip')"
					ref="elOpacity"
					v-model="form.opacity"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.animParticleFrame-scale.label') || 'Particle Scale' }}
			</div>
			<NumberBox
				id="animParticleFrame-scale"
				v-tip="t('components.animParticleFrame-scale.tip')"
				ref="elScale"
				v-model="form.scale"
				min="0.1"
				max="10"
				step="0.1"
				decimals="4"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.animParticleFrame-speed.label') || 'Speed' }}</div>
			<NumberBox
				id="animParticleFrame-speed"
				v-tip="t('components.animParticleFrame-speed.tip')"
				ref="elSpeed"
				v-model="form.speed"
				min="0.1"
				max="10"
				step="0.1"
				decimals="4"
				@input="onParamInput"
			></NumberBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
/* oxlint-disable eslint/no-restricted-properties */
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Inspector } from '@app/inspector/inspector.ts';
import { Animation } from '@app/animation/animation-window.ts';
import { useAnimParticleFramePage } from '@app/composables/useAnimParticleFramePage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import NumberBox from '@app/components/common/NumberBox.vue';

const { t } = useI18n();

const { form, sync, onParamInput: onParamInputEvent } = useAnimParticleFramePage();

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
const elScale = ref<InstanceType<typeof NumberBox> | null>(null);
const elSpeed = ref<InstanceType<typeof NumberBox> | null>(null);

onMounted(() => {
	const editor = Inspector.animParticleFrame;
	if (!editor) return;

	const el = document.getElementById('animParticleFrame-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}

	const elements = [
		elX.value?.root,
		elY.value?.root,
		elRotation.value?.root,
		elScaleX.value?.root,
		elScaleY.value?.root,
		elOpacity.value?.root,
		elScale.value?.root,
		elSpeed.value?.root
	].filter((el): el is HTMLElement => el != null);
	bindInput(elements, editor, Animation as unknown as { history: unknown }, (data: Record<string, unknown>) => {
		data.type = 'inspector-frame-change';
		data.motion = editor.motion;
		data.direction = Animation.direction;
	});

	sync();
});
</script>
