<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('animSoundFrame-properties-grid') || 'Frame' }}</DetailSummary>
		<div class="detail-grid" id="animSoundFrame-properties-grid">
			<div class="text">{{ local.getLabel('animSoundFrame-sound') || 'Sound' }}</div
			><CustomBox
				id="animSoundFrame-sound"
				:model-value="form.sound"
				type="file"
				filter="audio"
				@input="onParamInput"
			></CustomBox>
			<div class="text">{{ local.getLabel('animSoundFrame-volume') || 'Volume' }}</div
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
import { onMounted, reactive } from 'vue';
import { Inspector } from '@/inspector/inspector.ts';
import { useAnimationStore } from '@app/stores/animation';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';

interface AnimSoundFrameForm {
	sound: string;
	volume: number;
}

const FORM_KEYS: (keyof AnimSoundFrameForm)[] = ['sound', 'volume'];

const animation = useAnimationStore();
const local = useLocalStore();

const form = reactive<Partial<AnimSoundFrameForm>>({});

const sync = (): void => {
	const target = Inspector?.animSoundFrame?.target as
		| Partial<AnimSoundFrameForm>
		| null
		| undefined;
	if (!target) return;
	for (const key of FORM_KEYS) {
		form[key] = target[key];
	}
};

const onParamInput = (event: Event) => {
	const target = event?.target ?? document.activeElement;
	Inspector?.animSoundFrame?.paramInput?.({ target });
	sync();
};

onMounted(() => {
	const el = document.getElementById('animSoundFrame-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
	animation.syncState();
	local.syncState();
});
</script>
