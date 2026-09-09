<template>
	<WindowFrame id="useItem" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.useItem.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Actor</div>
			<CustomBox id="useItem-actor" v-focus type="actor" v-model="form.actor" />
			<div class="text">Mode</div>
			<SelectBox id="useItem-mode" v-model="form.mode" />
			<div class="text">Shortcut Key</div>
			<SelectBox id="useItem-key" v-focus v-model="form.key" />
			<div class="text">Item</div>
			<CustomBox
				id="useItem-itemId"
				v-focus
				type="file"
				filter="item"
				v-model="form.itemId"
			/>
			<div class="text">Item</div>
			<CustomBox id="useItem-item" type="item" v-model="form.item" />
			<div class="text">Wait</div>
			<SelectBox id="useItem-wait" name="wait" v-model="form.wait" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUseItemCommandSchema } from '@app/composables/commands/useUseItemCommandSchema';
import { $ } from '@app/utils/dom';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useUseItemCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#useItem-mode')?.loadItems?.([
		{ name: 'By Shortcut Key', value: 'by-key' },
		{ name: 'By Item ID', value: 'by-id' },
		{ name: 'By Item Instance', value: 'by-item' }
	]);
	$('#useItem-mode')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'by-key', targets: [$('#useItem-key')] },
			{ case: 'by-id', targets: [$('#useItem-itemId')] },
			{ case: 'by-item', targets: [$('#useItem-item')] }
		]);
	$('#useItem-wait')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#useItem {
	width: 324px;
	height: 170px;
}

#useItem-confirm {
	right: 108px;
	bottom: 10px;
}

#useItem-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
