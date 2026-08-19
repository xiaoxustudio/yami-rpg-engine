<template>
	<DetailBox open>
		<DetailSummary>{{ t('components.animSoundLayer-properties-grid.label') || 'Sound Layer' }}</DetailSummary>
		<div class="detail-grid" id="animSoundLayer-properties-grid">
			<div class="text">{{ t('components.animSoundLayer-playbackRate.label') || 'Playback Rate' }}</div
			><SelectBox id="animSoundLayer-playbackRate" v-model="form.playbackRate" @input="onParamInput"></SelectBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAnimSoundLayerPage } from '@app/composables/useAnimSoundLayerPage';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { Animation } from '@app/legacy/animation/animation-window.ts';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, sync, onParamInput } = useAnimSoundLayerPage();

onMounted(() => {
	const animSoundLayer = Inspector.animSoundLayer;
	if (animSoundLayer) {
		const el = document.getElementById('animSoundLayer-playbackRate');
		if (el) {
			(el as unknown as { loadItems: (items: { name: string; value: string }[]) => void }).loadItems([
				{ name: 'Default', value: 'default' },
				{ name: 'Inherit', value: 'inherit' }
			]);
			el.addEventListener('focus', Inspector.inputFocus);
		if (Inspector.inputBlur) {
			el.addEventListener(
				'blur',
				Inspector.inputBlur!(
					animSoundLayer,
					Animation,
					(data: { type: string; [k: string]: unknown }) => {
						data.type = 'inspector-layer-change';
						data.motion = animSoundLayer.motion;
						data.direction = Animation.direction;
					}
				)
			);
		}
		}
	}
	const el = document.getElementById('animSoundLayer-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
