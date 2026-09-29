<template>
	<DetailBox open>
		<DetailSummary>{{ t('components.fileActor-sprites.label') || 'Sprites' }}</DetailSummary>
		<ParamList
			id="fileActor-sprites"
			v-tip="t('components.fileActor-sprites.tip')"
			ref="elSprites"
			@change="onListChange"
			class="inspector-list"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{
			t('components.fileActor-attributes.label') || 'Attributes'
		}}</DetailSummary>
		<ParamList
			id="fileActor-attributes"
			v-tip="t('components.fileActor-attributes.tip')"
			ref="elAttributes"
			@change="onListChange"
			class="inspector-list"
			group="actor"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.fileActor-skills.label') || 'Skills' }}</DetailSummary>
		<ParamList
			id="fileActor-skills"
			v-tip="t('components.fileActor-skills.tip')"
			ref="elSkills"
			@change="onListChange"
			class="inspector-list"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{
			t('components.fileActor-equipments.label') || 'Equipments'
		}}</DetailSummary>
		<ParamList
			id="fileActor-equipments"
			v-tip="t('components.fileActor-equipments.tip')"
			ref="elEquipments"
			@change="onListChange"
			class="inspector-list"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{
			t('components.fileActor-inventory.label') || 'Inventory'
		}}</DetailSummary>
		<ParamList
			id="fileActor-inventory"
			v-tip="t('components.fileActor-inventory.tip')"
			ref="elInventory"
			@change="onListChange"
			class="inspector-list"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.fileActor-events.label') || 'Events' }}</DetailSummary>
		<ParamList
			id="fileActor-events"
			v-tip="t('components.fileActor-events.tip')"
			ref="elEvents"
			@change="onListChange"
			class="inspector-list"
			filter="actor"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.fileActor-scripts.label') || 'Scripts' }}</DetailSummary>
		<ParamList
			id="fileActor-scripts"
			v-tip="t('components.fileActor-scripts.tip')"
			ref="elScripts"
			@change="onListChange"
			class="inspector-list"
			flexible
		/>
	</DetailBox>
	<ParameterPane id="fileActor-parameter-pane" ref="elParameterPane" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registerElement } from '@app/utils/element-registry';
import { Inspector } from '@app/inspector/inspector.ts';
import { EventListInterface } from '@app/tools/event-list.ts';
import { AttributeListInterface } from '@app/tools/property-list.ts';
import { ScriptListInterface } from '@app/tools/script-list.ts';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import ParamList from '@app/components/common/ParamList.vue';
import ParameterPane from '@app/components/common/ParameterPane.vue';

const { t } = useI18n();

const onListChange = () => {
	Inspector?.fileActor?.listChange?.();
};

const elSprites = ref<InstanceType<typeof ParamList> | null>(null);
const elAttributes = ref<InstanceType<typeof ParamList> | null>(null);
const elSkills = ref<InstanceType<typeof ParamList> | null>(null);
const elEquipments = ref<InstanceType<typeof ParamList> | null>(null);
const elInventory = ref<InstanceType<typeof ParamList> | null>(null);
const elEvents = ref<InstanceType<typeof ParamList> | null>(null);
const elScripts = ref<InstanceType<typeof ParamList> | null>(null);
const elParameterPane = ref<InstanceType<typeof ParameterPane> | null>(null);

onMounted(() => {
	registerElement(inspectorEls, 'fileActor-sprites', elSprites.value);
	registerElement(inspectorEls, 'fileActor-attributes', elAttributes.value);
	registerElement(inspectorEls, 'fileActor-skills', elSkills.value);
	registerElement(inspectorEls, 'fileActor-equipments', elEquipments.value);
	registerElement(inspectorEls, 'fileActor-inventory', elInventory.value);
	registerElement(inspectorEls, 'fileActor-events', elEvents.value);
	registerElement(inspectorEls, 'fileActor-scripts', elScripts.value);
	registerElement(inspectorEls, 'fileActor-parameter-pane', elParameterPane.value);
	const editor = Inspector.fileActor;
	if (!editor) return;
	if (editor.sprites) elSprites.value?.bind(editor.sprites);
	elAttributes.value?.bind(new AttributeListInterface());
	if (editor.skills) elSkills.value?.bind(editor.skills);
	if (editor.equipments) elEquipments.value?.bind(editor.equipments);
	if (editor.inventory) elInventory.value?.bind(editor.inventory);
	elEvents.value?.bind(new EventListInterface(editor));
	elScripts.value?.bind(new ScriptListInterface());
	elParameterPane.value?.bind(elScripts.value?.root as HTMLElement);
});
</script>
