<template>
	<WindowFrame id="switchCollisionSystem" @confirm="onConfirm">
		<template #title><TitleBar>{{ t('components.switchCollisionSystem.title') }}<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Operation</div><SelectBox id="switchCollisionSystem-operation" v-model="form.operation" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSwitchCollisionSystemCommandSchema } from '@app/composables/commands/useSwitchCollisionSystemCommandSchema';
import { $ } from '@app/legacy/util/dom.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSwitchCollisionSystemCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#switchCollisionSystem-operation')?.loadItems?.([
		{ name: 'Enable Actor Collision', value: 'enable-actor-collision' },
		{ name: 'Disable Actor Collision', value: 'disable-actor-collision' },
		{ name: 'Enable Scene Collision', value: 'enable-scene-collision' },
		{ name: 'Disable Scene Collision', value: 'disable-scene-collision' }
	]);
});

</script>
