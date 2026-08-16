<template>
	<WindowFrame id="deleteObject" @confirm="onConfirm">
		<template #title><TitleBar>Delete Object<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Object</div><CustomBox id="deleteObject-object" type="object" @input="onObject" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { useDeleteObjectCommandSchema } from '@app/composables/commands/useDeleteObjectCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

const { form, save } = useDeleteObjectCommandSchema();

const onObject = (value: unknown) => {
	form.object = value;
};

const onConfirm = () => {
	save();
};

</script>
