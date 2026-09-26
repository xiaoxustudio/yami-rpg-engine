<template>
	<WindowFrame
		id="scriptCommand"
		:ref="registryRef(scriptCommandEls, 'scriptCommand')"
		@confirm="onConfirm"
	>
		<template #title
			><TitleBar
				>Custom Command
				<div class="close"></div></TitleBar
		></template>

		<ParameterPane
			id="scriptCommand-parameter-pane"
			:ref="registryRef(scriptCommandEls, 'scriptCommand-parameter-pane')"
		>
			<DetailBox
				id="scriptCommand-parameter-detail"
				:ref="registryRef(scriptCommandEls, 'scriptCommand-parameter-detail')"
				open
			>
				<div
					class="detail-grid"
					id="scriptCommand-parameter-grid"
					:ref="registryRef(scriptCommandEls, 'scriptCommand-parameter-grid')"
				/>
			</DetailBox>
		</ParameterPane>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Command } from '@app/commands/command-object.ts';
import { scriptCommandEls } from '@app/commands/command-custom.ts';
import { registryRef } from '@app/utils/element-registry';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import DetailBox from '@app/components/common/DetailBox.vue';
import ParameterPane from '@app/components/common/ParameterPane.vue';

const onConfirm = () => {
	Command?.custom?.save?.();
};

onMounted(() => {});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
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
