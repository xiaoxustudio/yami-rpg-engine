<template>
	<WindowFrame id="setAmbientLight" @confirm="onConfirm">
		<template #title><TitleBar>Set Ambient Light<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Red</div
				><NumberVar id="setAmbientLight-red" min="0" max="255" step="5" v-model="form.red" />
				<div class="text">Green</div
				><NumberVar id="setAmbientLight-green" min="0" max="255" step="5" v-model="form.green" />
				<div class="text">Blue</div
				><NumberVar id="setAmbientLight-blue" min="0" max="255" step="5" v-model="form.blue" />
				<div class="text">Easing</div><SelectBox id="setAmbientLight-easingId" name="easing" v-model="form.easingId" />
				<div class="text">Duration</div
				><NumberVar
					id="setAmbientLight-duration"
					name="duration"
					min="0"
					max="3600000"
					unit="ms"
					v-model="form.duration"
				 />
				<div class="text">Wait</div><SelectBox id="setAmbientLight-wait" name="wait" v-model="form.wait" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useSetAmbientLightCommandSchema } from '@app/composables/commands/useSetAmbientLightCommandSchema';
import { $ } from '@/util/dom.ts';
import { clear } from '@/util/element-utils';
import { Data } from '@/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { form, save } = useSetAmbientLightCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setAmbientLight-wait')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
	$('#setAmbientLight')?.on?.('open', () => {
		$('#setAmbientLight-easingId')?.loadItems?.(Data.createEasingItems!());
	});
	$('#setAmbientLight')?.on?.('closed', () => {
		clear($('#setAmbientLight-easingId'));
	});
});

</script>
