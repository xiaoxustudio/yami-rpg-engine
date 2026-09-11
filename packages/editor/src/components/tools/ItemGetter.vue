<template>
	<WindowFrame ref="frame" id="itemGetter" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.itemGetter.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.itemGetter-type.label') }}</div>
			<SelectBox id="itemGetter-type"
				:ref="fieldRef('itemGetter-type')" v-focus v-model="form.type" />
			<div class="text">{{ t('components.itemGetter-actor.label') }}</div>
			<CustomBox id="itemGetter-actor"
				:ref="fieldRef('itemGetter-actor')" type="actor" v-model="form.actor" />
			<div class="text">{{ t('components.itemGetter-key.label') }}</div>
			<SelectVar id="itemGetter-key"
				:ref="fieldRef('itemGetter-key')" v-focus v-model="form.key" />
			<div class="text">{{ t('components.itemGetter-itemId.label') }}</div>
			<CustomBox
				id="itemGetter-itemId"
				:ref="fieldRef('itemGetter-itemId')"
				v-focus
				type="file"
				filter="item"
				v-model="form.itemId"
			/>
			<div class="text">{{ t('components.itemGetter-variable.label') }}</div>
			<CustomBox
				id="itemGetter-variable"
				:ref="fieldRef('itemGetter-variable')"
				v-focus
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
import { createAccessorFields } from '@app/commands/accessors/accessor-factory.ts';
import { useItemGetterWindow } from '@app/composables/useItemGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { on } from '@app/utils/element-utils';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const itemGetter = useItemGetterWindow();
const form = itemGetter.form;

// P5b 批次 2：把控件实例登记给访问器模块的 initialize()（替代按 id 查 DOM）
const { fields, fieldRef } = createAccessorFields();
ItemGetter.fields = fields;

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const onConfirm = () => {
	ItemGetter?.confirm?.(new Event('click'));
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		on(el, 'closed', () => itemGetter.onWindowClosed());
	}
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#itemGetter {
	width: 324px;
	height: 146px;
}

#itemGetter-confirm {
	right: 108px;
	bottom: 10px;
}

#itemGetter-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
