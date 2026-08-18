<template>
	<DetailBox open>
		<DetailSummary>{{ t('components.animSoundFrame-properties-grid.label') || 'Frame' }}</DetailSummary>
		<div class="detail-grid" id="animSoundFrame-properties-grid">
			<div class="text">{{ t('components.animSoundFrame-sound.label') || 'Sound' }}</div
			><CustomBox
				id="animSoundFrame-sound"
				:model-value="form.sound"
				type="file"
				filter="audio"
				@input="onParamInput"
			></CustomBox>
			<div class="text">{{ t('components.animSoundFrame-volume.label') || 'Volume' }}</div
			><NumberBox
				id="animSoundFrame-volume"
				v-model="form.volume"
				min="0"
				max="1"
				step="0.1"
				decimals="4" @input="onParamInput"
			></NumberBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAnimSoundFramePage } from '@app/composables/useAnimSoundFramePage';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { Animation } from '@app/legacy/animation/animation-window.ts';
import { attachElementApi } from '@app/legacy/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';

const { t } = useI18n();

const { form, sync, onParamInput } = useAnimSoundFramePage();

onMounted(() => {
	const animSoundFrame = Inspector.animSoundFrame;
	if (animSoundFrame) {
		const elements = document.querySelectorAll('#animSoundFrame-sound, #animSoundFrame-volume');
		(elements as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('focus', Inspector.inputFocus)
		);
		if (Inspector.inputBlur) {
			(elements as unknown as HTMLElement[]).forEach((el: HTMLElement) =>
				el.addEventListener(
					'blur',
					Inspector.inputBlur!(animSoundFrame, Animation, (data: Record<string, unknown>) => {
						data.type = 'inspector-frame-change';
						data.motion = animSoundFrame.motion;
						data.direction = Animation.direction;
					})
				)
			);
		}
	}
	const el = document.getElementById('animSoundFrame-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
