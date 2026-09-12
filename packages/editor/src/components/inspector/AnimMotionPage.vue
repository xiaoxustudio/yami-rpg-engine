<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.animMotion-general-grid.label') || 'Motion'
		}}</DetailSummary>
		<div class="detail-grid" id="animMotion-general-grid">
			<div class="text">{{ t('components.animMotion-mode.label') || 'Direction' }}</div>
			<SelectBox id="animMotion-mode" ref="elMode" v-model="form.mode" @input="onParamInput"></SelectBox>
			<div class="text">{{ t('components.animMotion-skip.label') || 'Skip Last Frame' }}</div>
			<CheckBox
				id="animMotion-skip"
				ref="elSkip"
				class="standard large"
				:model-value="form.skip"
				@input="onParamInput"
			></CheckBox>
			<div class="text">{{ t('components.animMotion-loop.label') || 'Loop' }}</div>
			<CheckBox
				id="animMotion-loop"
				ref="elLoop"
				class="standard large"
				:model-value="form.loop"
				@input="onParamInput"
			></CheckBox>
			<div class="text">{{ t('components.animMotion-loopStart.label') || 'Loop Start' }}</div>
			<NumberBox
				id="animMotion-loopStart"
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
/* oxlint-disable eslint/no-restricted-properties */
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
	onParamInputEvent(value as unknown as Event);
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
		setTarget: (motion: Record<string, unknown>) => {
			Animation.setMotion!(motion);
			Inspector.open!('animMotion', motion);
		}
	};

	elMode.value?.loadItems([
		{ name: '1 Directional', value: '1-dir' },
		{ name: '2 Directional', value: '2-dir' },
		{ name: '4 Directional', value: '4-dir' },
		{ name: '8 Directional', value: '8-dir' },
		{ name: '1 Directional - Mirror', value: '1-dir-mirror' },
		{ name: '2 Directional - Mirror', value: '2-dir-mirror' },
		{ name: '3 Directional - Mirror', value: '3-dir-mirror' },
		{ name: '5 Directional - Mirror', value: '5-dir-mirror' }
	]);

	const loopStartEl = elLoopStart.value?.root;
	if (loopStartEl) {
		elLoop.value?.relate([loopStartEl]);
	}

	const elements = [elSkip.value?.root, elLoop.value?.root, elLoopStart.value?.root].filter(
		(el): el is HTMLElement => el != null
	);
	bindInput(elements, animMotion, Animation as unknown as { history: unknown });

	const el = document.getElementById('animMotion-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
