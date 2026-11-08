<template>
	<WindowFrame id="scriptCommand" :ref="bind('frame')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>Custom Command
				<div class="close"></div></TitleBar
		></template>

		<ParameterPane id="scriptCommand-parameter-pane" :ref="bind('parameterPane')">
			<DetailBox id="scriptCommand-parameter-detail" :ref="bind('parameterDetail')" open>
				<div
					class="detail-grid"
					id="scriptCommand-parameter-grid"
					:ref="bind('parameterGrid')"
				/>
			</DetailBox>
		</ParameterPane>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { Command } from '@app/commands/command-object.ts';
import { scriptCommandNodes } from '@app/composables/command-nodes';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import DetailBox from '@app/components/common/DetailBox.vue';
import ParameterPane from '@app/components/common/ParameterPane.vue';

const { bind, dispose } = scriptCommandNodes.scoped();
onUnmounted(dispose);

const onConfirm = () => {
	Command?.custom?.save?.();
};

onMounted(() => {});
</script>

<style>
#scriptCommand {
	width: 324px;
}

#scriptCommand-parameter-grid {
	display: grid;
	margin: 10px;
	grid-gap: 4px;
	grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
}

#scriptCommand-confirm {
	right: 108px;
	bottom: 10px;
}

#scriptCommand-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
