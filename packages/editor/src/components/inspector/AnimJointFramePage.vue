<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('animJointFrame-properties-grid') || 'Frame' }}</DetailSummary>
		<div class="detail-grid" id="animJointFrame-properties-grid">
			<div class="text">{{ local.getLabel('animJointFrame-position-box') || 'Position' }}</div>
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
			<div class="text">{{ local.getLabel('animJointFrame-rotation-box') || 'Rotation' }}</div>
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
			<div class="text">{{ local.getLabel('animJointFrame-scale-box') || 'Scale' }}</div>
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
			<div class="text">{{ local.getLabel('animJointFrame-opacity-box') || 'Opacity' }}</div>
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
import { onMounted, reactive } from 'vue';
import { Inspector } from '@/inspector/inspector.ts';
import { useAnimationStore } from '@app/stores/animation';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import NumberBox from '@app/components/common/NumberBox.vue';

interface AnimJointFrameForm {
	x: number;
	y: number;
	rotation: number;
	scaleX: number;
	scaleY: number;
	opacity: number;
}

const FORM_KEYS: (keyof AnimJointFrameForm)[] = [
	'x',
	'y',
	'rotation',
	'scaleX',
	'scaleY',
	'opacity'
];

const animation = useAnimationStore();
const local = useLocalStore();

const form = reactive<Partial<AnimJointFrameForm>>({});

const sync = (): void => {
	const target = Inspector?.animJointFrame?.target as
		| Partial<AnimJointFrameForm>
		| null
		| undefined;
	if (!target) return;
	for (const key of FORM_KEYS) {
		form[key] = target[key];
	}
};

const onParamInput = (event: Event) => {
	const target = event?.target ?? document.activeElement;
	Inspector?.animJointFrame?.paramInput?.({ target });
	sync();
};

onMounted(() => {
	const el = document.getElementById('animJointFrame-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
	animation.syncState();
	local.syncState();
});
</script>
