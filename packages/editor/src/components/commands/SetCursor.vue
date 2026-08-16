<template>
	<WindowFrame id="setCursor" @confirm="onConfirm">
		<template #title><TitleBar>Set Cursor<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Image</div
				><CustomBox id="setCursor-image" type="file" filter="image" @input="onImage" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { useSetCursorCommandSchema } from '@app/composables/commands/useSetCursorCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

const { form, save } = useSetCursorCommandSchema();

const onImage = (value: unknown) => {
	form.image = value;
};

const onConfirm = () => {
	save();
};

</script>
