<template>
<WindowFrame id="showText" @confirm="onConfirm">
	<template #title><TitleBar>Show Text<div class="close" /></TitleBar></template>
	
		<CustomBox id="showText-target" type="actor" />
		<TextBox id="showText-parameters" />
		<TextArea
			id="showText-content"
			menu="tag-local-var tag-global-var tag-localization"
		 />
	
</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import TextArea from '@app/components/common/TextArea.vue';
import TextBox from '@app/components/common/TextBox.vue';


const onConfirm = () => {
	Command?.cases?.showText?.save?.();
};

</script>
