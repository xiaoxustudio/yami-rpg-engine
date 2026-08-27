<template>
	<WindowFrame ref="frame" id="itemGetter" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.itemGetter.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.itemGetter-type.label') }}</div>
			<SelectBox id="itemGetter-type" v-model="form.type" />
			<div class="text">{{ t('components.itemGetter-actor.label') }}</div>
			<CustomBox id="itemGetter-actor" type="actor" v-model="form.actor" />
			<div class="text">{{ t('components.itemGetter-key.label') }}</div>
			<SelectVar id="itemGetter-key" v-model="form.key" />
			<div class="text">{{ t('components.itemGetter-itemId.label') }}</div>
			<CustomBox id="itemGetter-itemId" type="file" filter="item" v-model="form.itemId" />
			<div class="text">{{ t('components.itemGetter-variable.label') }}</div>
			<CustomBox
				id="itemGetter-variable"
				type="variable"
				filter="object"
				v-model="form.variable"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ItemGetter } from '@app/commands/accessors/item-accessor-window.ts';
import { useItemGetterWindow } from '@app/composables/useItemGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const itemGetter = useItemGetterWindow();
const form = itemGetter.form;

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	ItemGetter?.confirm?.();
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		el.on('closed', () => itemGetter.onWindowClosed());
	}
});
</script>
