<template>
	<WindowFrame id="useItem" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.useItem.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Actor</div>
			<CustomBox id="useItem-actor" type="actor" @input="onActor" />
			<div class="text">Mode</div>
			<SelectBox id="useItem-mode" v-model="form.mode" />
			<div class="text">Shortcut Key</div>
			<SelectBox id="useItem-key" v-model="form.key" />
			<div class="text">Item</div>
			<CustomBox id="useItem-itemId" type="file" filter="item" @input="onItemId" />
			<div class="text">Item</div>
			<CustomBox id="useItem-item" type="item" @input="onItem" />
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

const onActor = (value: unknown) => {
	form.actor = value;
};

const onItemId = (value: unknown) => {
	form.itemId = value;
};

const onItem = (value: unknown) => {
	form.item = value;
};

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
