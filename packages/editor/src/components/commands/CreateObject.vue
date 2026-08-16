<template>
	<WindowFrame id="createObject" @confirm="onConfirm">
		<template #title><TitleBar>Create Object<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Object</div
				><CustomBox id="createObject-presetId" type="preset-object" filter="any" @input="onPresetId" />
				<div class="text">Position</div
				><CustomBox id="createObject-position" type="position" @input="onPosition" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { useCreateObjectCommandSchema } from '@app/composables/commands/useCreateObjectCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

const { form, save } = useCreateObjectCommandSchema();

const onPresetId = (value: unknown) => {
	form.presetId = value;
};

const onPosition = (value: unknown) => {
	form.position = value;
};

const onConfirm = () => {
	save();
};

</script>
