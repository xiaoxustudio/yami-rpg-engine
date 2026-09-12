<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.animSoundLayer-properties-grid.label') || 'Sound Layer'
		}}</DetailSummary>
		<div class="detail-grid" id="animSoundLayer-properties-grid">
			<div class="text">
				{{ t('components.animSoundLayer-playbackRate.label') || 'Playback Rate' }}
			</div>
			<SelectBox
				id="animSoundLayer-playbackRate"
				v-tip="t('components.animSoundLayer-playbackRate.tip')"
				ref="elPlaybackRate"
				v-model="form.playbackRate"
				@input="onParamInput"
			></SelectBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
/* oxlint-disable eslint/no-restricted-properties */
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAnimSoundLayerPage } from '@app/composables/useAnimSoundLayerPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { Animation } from '@app/animation/animation-window.ts';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, sync, onParamInput: onParamInputEvent } = useAnimSoundLayerPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as unknown as Event);
};

const { bindInput } = useInspectorInput();

const elPlaybackRate = ref<InstanceType<typeof SelectBox> | null>(null);

onMounted(() => {
	const animSoundLayer = Inspector.animSoundLayer;
	if (animSoundLayer) {
		elPlaybackRate.value?.loadItems([
			{ name: t('components.animSoundLayer-playbackRate.options.default.name'), tip: t('components.animSoundLayer-playbackRate.options.default.tip'), value: 'default'  },
			{ name: t('components.animSoundLayer-playbackRate.options.inherit.name'), tip: t('components.animSoundLayer-playbackRate.options.inherit.tip'), value: 'inherit'  }
		]);
		const el = elPlaybackRate.value?.root;
		if (el) {
			bindInput(
				[el],
				animSoundLayer,
				Animation as unknown as { history: unknown },
				(data: Record<string, unknown>) => {
					data.type = 'inspector-layer-change';
					data.motion = animSoundLayer.motion;
					data.direction = Animation.direction;
				}
			);
		}
	}
	const el = document.getElementById('animSoundLayer-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
