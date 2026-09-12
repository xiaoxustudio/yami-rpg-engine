<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.animSoundFrame-properties-grid.label') || 'Frame'
		}}</DetailSummary>
		<div class="detail-grid" id="animSoundFrame-properties-grid">
			<div class="text">{{ t('components.animSoundFrame-sound.label') || 'Sound' }}</div>
			<CustomBox
				id="animSoundFrame-sound"
				v-tip="t('components.animSoundFrame-sound.tip')"
				ref="elSound"
				:model-value="form.sound"
				type="file"
				filter="audio"
				@input="onParamInput"
			></CustomBox>
			<div class="text">{{ t('components.animSoundFrame-volume.label') || 'Volume' }}</div>
			<NumberBox
				id="animSoundFrame-volume"
				v-tip="t('components.animSoundFrame-volume.tip')"
				ref="elVolume"
				v-model="form.volume"
				min="0"
				max="1"
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
import { useAnimSoundFramePage } from '@app/composables/useAnimSoundFramePage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { Animation } from '@app/animation/animation-window.ts';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';

const { t } = useI18n();

const { form, sync, onParamInput: onParamInputEvent } = useAnimSoundFramePage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as unknown as Event);
};

const { bindInput } = useInspectorInput();

const elSound = ref<InstanceType<typeof CustomBox> | null>(null);
const elVolume = ref<InstanceType<typeof NumberBox> | null>(null);

onMounted(() => {
	const animSoundFrame = Inspector.animSoundFrame;
	if (animSoundFrame) {
		const elements = [elSound.value?.root, elVolume.value?.root].filter(
			(el): el is HTMLElement => el != null
		);
		bindInput(elements, animSoundFrame, Animation as unknown as { history: unknown }, (data: Record<string, unknown>) => {
			data.type = 'inspector-frame-change';
			data.motion = animSoundFrame.motion;
			data.direction = Animation.direction;
		});
	}
	const el = document.getElementById('animSoundFrame-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
