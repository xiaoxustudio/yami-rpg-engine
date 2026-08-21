<template>
<WindowFrame ref="frame" id="forEach" @confirm="onConfirm">
	<template #title><TitleBar>{{ t('components.forEach.title') }}<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Data</div
			><SelectBox id="forEach-data" v-model="form.data" /> <div class="text">List Variable</div
			><CustomBox
				id="forEach-list"
				type="variable"
				filter="object"
				v-model="form.list"
			/>
			<div class="text">Actor</div
			><CustomBox id="forEach-actor" type="actor" v-model="form.actor" />
			<div class="text">Parent Element</div
			><CustomBox id="forEach-element" type="element" v-model="form.element" />
			<div class="text">Attribute Group</div
			><CustomBox
				id="forEach-attribute-groupId"
				type="attribute-group"
				v-model="form.attributeGroupId"
			/>
			<div class="text">Enum Group</div
			><CustomBox
				id="forEach-enum-groupId"
				type="enum-group"
				v-model="form.enumGroupId"
			/>
			<div class="text">Write to Variable</div
			><CustomBox
				id="forEach-variable"
				type="variable"
				filter="object"
				v-model="form.variable"
			/>
			<div class="text">Write Save Index</div
			><CustomBox
				id="forEach-saveIndex"
				type="variable"
				filter="number"
				v-model="form.saveIndex"
			/>
			<div class="text">Touch Id</div
			><CustomBox
				id="forEach-touchId"
				type="variable"
				filter="number"
				v-model="form.touchId"
			/>
		</div>
	
</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { $ } from '@app/utils/dom';
import { createGetter } from '@app/i18n';
import { on } from '@app/utils/element-utils.ts';
import { useForEachCommandSchema } from '@app/composables/commands/useForEachCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save, windowClosed } = useForEachCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	const get = createGetter('command.forEach');
	$('#forEach-data')
		?.loadItems?.([
			{ name: get('list') || 'List', value: 'list' },
			{ name: get('skill') || 'Skill', value: 'skill' },
			{ name: get('state') || 'State', value: 'state' },
			{ name: get('equipment') || 'Equipment', value: 'equipment' },
			{ name: get('inventory') || 'Inventory', value: 'inventory' },
			{ name: get('element') || 'Element', value: 'element' },
			{ name: get('member') || 'Party Member', value: 'member' },
			{ name: get('attribute') || 'Attribute Key', value: 'attribute' },
			{ name: get('enum') || 'Enumeration Value', value: 'enum' },
			{ name: get('save') || 'Save Data', value: 'save' },
			{ name: get('touch') || 'Touch Point', value: 'touch' },
			{ name: get('changed-touch') || 'Changed Touch Point', value: 'changed-touch' }
		])
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'list',
				targets: [$('#forEach-list'), $('#forEach-variable')]
			},
			{
				case: ['skill', 'state', 'equipment', 'inventory'],
				targets: [$('#forEach-actor'), $('#forEach-variable')]
			},
			{
				case: 'element',
				targets: [$('#forEach-element'), $('#forEach-variable')]
			},
			{ case: 'member', targets: [$('#forEach-variable')] },
			{
				case: 'attribute',
				targets: [$('#forEach-attribute-groupId'), $('#forEach-variable')]
			},
			{
				case: 'enum',
				targets: [$('#forEach-enum-groupId'), $('#forEach-variable')]
			},
			{ case: 'save', targets: [$('#forEach-saveIndex')] },
			{
				case: ['touch', 'changed-touch'],
				targets: [$('#forEach-touchId')]
			}
		]);
	on($('#forEach'), 'closed', () => windowClosed(new Event('closed')));
});
</script>
