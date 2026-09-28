<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.animMotion-general-grid.label') || 'Motion'
		}}</DetailSummary>
		<div class="detail-grid" id="animMotion-general-grid">
			<div class="text">{{ t('components.animMotion-mode.label') || 'Direction' }}</div>
			<SelectBox
				id="animMotion-mode"
				v-tip="t('components.animMotion-mode.tip')"
				ref="elMode"
				v-model="form.mode"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.animMotion-skip.label') || 'Skip Last Frame' }}</div>
			<CheckBox
				id="animMotion-skip"
				v-tip="t('components.animMotion-skip.tip')"
				ref="elSkip"
				class="standard large"
				:model-value="form.skip"
				@input="onParamInput"
			></CheckBox>
			<div class="text">{{ t('components.animMotion-loop.label') || 'Loop' }}</div>
			<CheckBox
				id="animMotion-loop"
				v-tip="t('components.animMotion-loop.tip')"
				ref="elLoop"
				class="standard large"
				:model-value="form.loop"
				@input="onParamInput"
			></CheckBox>
			<div class="text">{{ t('components.animMotion-loopStart.label') || 'Loop Start' }}</div>
			<NumberBox
				id="animMotion-loopStart"
				v-tip="t('components.animMotion-loopStart.tip')"
				ref="elLoopStart"
				v-model="form.loopStart"
				min="0"
				max="10000"
				@input="onParamInput"
			></NumberBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import type { AnimationMotionData } from '@app/animation/animation-window.ts';
import { onMounted, ref } from 'vue';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registerElement } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
import { useAnimMotionPage } from '@app/composables/useAnimMotionPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { Animation } from '@app/animation/animation-window.ts';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CheckBox from '@app/components/common/CheckBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, sync, onParamInput: onParamInputEvent } = useAnimMotionPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as Event);
};

const { bindInput } = useInspectorInput();

const elMode = ref<InstanceType<typeof SelectBox> | null>(null);
const elSkip = ref<InstanceType<typeof CheckBox> | null>(null);
const elLoop = ref<InstanceType<typeof CheckBox> | null>(null);
const elLoopStart = ref<InstanceType<typeof NumberBox> | null>(null);

onMounted(() => {
	registerElement(inspectorEls, 'animMotion-mode', elMode.value);
	const animMotion = Inspector.animMotion;
	if (!animMotion) return;

	animMotion.owner = {
		// 面板回调实参就是运行期的 motion（store 里那一份），按共享模型收窄，而不是 Record
		setTarget: (motion: AnimationMotionData) => {
			Animation.setMotion!(motion);
			Inspector.open!('animMotion', motion);
		}
	};

	elMode.value?.loadItems([
		{
			name: t('components.animMotion-mode.options.1-dir.name'),
			tip: t('components.animMotion-mode.options.1-dir.tip'),
			value: '1-dir'
		},
		{
			name: t('components.animMotion-mode.options.2-dir.name'),
			tip: t('components.animMotion-mode.options.2-dir.tip'),
			value: '2-dir'
		},
		{
			name: t('components.animMotion-mode.options.4-dir.name'),
			tip: t('components.animMotion-mode.options.4-dir.tip'),
			value: '4-dir'
		},
		{
			name: t('components.animMotion-mode.options.8-dir.name'),
			tip: t('components.animMotion-mode.options.8-dir.tip'),
			value: '8-dir'
		},
		{
			name: t('components.animMotion-mode.options.1-dir-mirror.name'),
			tip: t('components.animMotion-mode.options.1-dir-mirror.tip'),
			value: '1-dir-mirror'
		},
		{
			name: t('components.animMotion-mode.options.2-dir-mirror.name'),
			tip: t('components.animMotion-mode.options.2-dir-mirror.tip'),
			value: '2-dir-mirror'
		},
		{
			name: t('components.animMotion-mode.options.3-dir-mirror.name'),
			tip: t('components.animMotion-mode.options.3-dir-mirror.tip'),
			value: '3-dir-mirror'
		},
		{
			name: t('components.animMotion-mode.options.5-dir-mirror.name'),
			tip: t('components.animMotion-mode.options.5-dir-mirror.tip'),
			value: '5-dir-mirror'
		}
	]);

	const loopStartEl = elLoopStart.value?.root;
	if (loopStartEl) {
		elLoop.value?.relate([loopStartEl]);
	}

	const elements = [elSkip.value?.root, elLoop.value?.root, elLoopStart.value?.root].filter(
		(el): el is HTMLElement => el != null
	);
	bindInput(elements, animMotion, Animation);

	const el = inspectorEls.get('animMotion-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
