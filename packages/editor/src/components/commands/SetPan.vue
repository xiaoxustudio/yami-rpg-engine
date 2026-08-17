<template>
<WindowFrame id="setPan" @confirm="onConfirm">
	<template #title><TitleBar>Set Pan<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Type</div><SelectBox id="setPan-type" v-model="form.type" /> <div class="text">Pan</div
			><NumberVar id="setPan-pan" min="-1" max="1" step="0.1" decimals="4" v-model="form.pan" />
			<div class="text">Easing</div><SelectBox id="setPan-easingId" name="easing" v-model="form.easingId" />
			<div class="text">Duration</div
			><NumberBox
				id="setPan-duration"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
				v-model="form.duration"
			 />
			<div class="text">Wait</div><SelectBox id="setPan-wait" name="wait" v-model="form.wait" />
		</div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useSetPanCommandSchema } from '@app/composables/commands/useSetPanCommandSchema';
import { $ } from '@app/legacy/util/dom.ts';
import { clear } from '@app/legacy/util/element-utils';
import { Data } from '@app/legacy/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { form, save } = useSetPanCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setPan-type')?.loadItems?.([
		{ name: 'BGM', value: 'bgm' },
		{ name: 'BGS', value: 'bgs' },
		{ name: 'CV', value: 'cv' },
		{ name: 'SE', value: 'se' }
	]);
	$('#setPan-wait')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
	$('#setPan')?.on?.('open', () => {
		$('#setPan-easingId')?.loadItems?.(Data.createEasingItems!());
	});
	$('#setPan')?.on?.('closed', () => {
		clear($('#setPan-easingId'));
	});
});

</script>
