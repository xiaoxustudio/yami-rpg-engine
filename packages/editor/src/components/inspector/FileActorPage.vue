<template>
	<DetailBox open>
		<DetailSummary>{{ t('components.fileActor-general-grid.label') || 'General' }}</DetailSummary>
			<div class="detail-grid" id="fileActor-general-grid">
				<div class="text">{{ t('components.fileActor-portrait.label') || 'Portrait' }}</div
			><CustomBox
				id="fileActor-portrait"
				type="file"
				filter="image"
				:model-value="form.portrait"
				@input="onParamInput" />
			<div class="text">{{ t('components.fileActor-clip.label') || 'Clip' }}</div
			><CustomBox
				id="fileActor-clip"
				type="clip"
				image="fileActor-portrait"
				:model-value="form.clip"
				@input="onParamInput" />
			<div class="text">{{ t('components.fileActor-animationId.label') || 'Animation' }}</div
			><CustomBox
				id="fileActor-animationId"
				type="file"
				filter="animation"
				:model-value="form.animationId"
				@input="onParamInput"
				@write="onAnimationIdWrite"
			/>
				<div class="text">Idle Motion</div
				><SelectBox id="fileActor-idleMotion" v-model="form.idleMotion" @input="onParamInput" />
				<div class="text">Move Motion</div
				><SelectBox id="fileActor-moveMotion" v-model="form.moveMotion" @input="onParamInput" />
				<div class="text">Rotatable</div><SelectBox id="fileActor-rotatable" v-model="form.rotatable" @input="onParamInput" />
				<div class="text">Passage Terrain</div
				><SelectBox id="fileActor-passage" v-model="form.passage" @input="onParamInput" />
				<div class="text">Movement Speed</div
				><NumberBox
					id="fileActor-speed"
					v-model="form.speed"
					min="0"
					max="32"
					decimals="4"
					unit="t/s"
					@input="onParamInput" />
				<div class="text">Collision Shape</div
				><SelectBox id="fileActor-shape" v-model="form.shape" @input="onParamInput" />
				<div class="text">Collision Size</div
				><NumberBox
					id="fileActor-size"
					v-model="form.size"
					min="0"
					max="16"
					step="0.1"
					decimals="4"
					unit="t"
					@input="onParamInput" />
				<div class="text">Collision Weight</div
				><NumberBox
					id="fileActor-weight"
					v-model="form.weight"
					min="0"
					max="8"
					step="0.1"
					decimals="4"
					@input="onParamInput" />
				<div class="text">Immovable</div><SelectBox id="fileActor-immovable" v-model="form.immovable" @input="onParamInput" />
				<div class="text">Scale</div
				><NumberBox
					id="fileActor-scale"
					v-model="form.scale"
					min="0"
					max="10"
					step="0.1"
					decimals="4"
					@input="onParamInput" />
				<div class="text">Priority</div
				><NumberBox
					id="fileActor-priority"
					v-model="form.priority"
					min="-512"
					max="512"
					decimals="4"
					@input="onParamInput" />
				<div class="text">Inherit</div
				><CustomBox
					id="fileActor-inherit"
					type="file"
					filter="actor"
					:model-value="form.inherit"
					@input="onParamInput" />
			</div>
		</DetailBox>
		<DetailBox open>
			<DetailSummary>{{ t('components.fileActor-sprites.label') || 'Sprites' }}</DetailSummary>
			<ParamList
				id="fileActor-sprites" @change="onListChange"
				class="inspector-list"
				flexible
			/>
		</DetailBox>
		<DetailBox open>
			<DetailSummary>{{ t('components.fileActor-attributes.label') || 'Attributes' }}</DetailSummary>
			<ParamList
				id="fileActor-attributes" @change="onListChange"
				class="inspector-list"
				group="actor"
				flexible
			/>
		</DetailBox>
		<DetailBox open>
			<DetailSummary>{{ t('components.fileActor-skills.label') || 'Skills' }}</DetailSummary>
			<ParamList
				id="fileActor-skills" @change="onListChange"
				class="inspector-list"
				flexible
			/>
		</DetailBox>
		<DetailBox open>
			<DetailSummary>{{ t('components.fileActor-equipments.label') || 'Equipments' }}</DetailSummary>
			<ParamList
				id="fileActor-equipments" @change="onListChange"
				class="inspector-list"
				flexible
			/>
		</DetailBox>
		<DetailBox open>
			<DetailSummary>{{ t('components.fileActor-inventory.label') || 'Inventory' }}</DetailSummary>
			<ParamList
				id="fileActor-inventory" @change="onListChange"
				class="inspector-list"
				flexible
			/>
		</DetailBox>
		<DetailBox open>
			<DetailSummary>{{ t('components.fileActor-events.label') || 'Events' }}</DetailSummary>
			<ParamList
				id="fileActor-events" @change="onListChange"
				class="inspector-list"
				filter="actor"
				flexible
			/>
		</DetailBox>
		<DetailBox open>
			<DetailSummary>{{ t('components.fileActor-scripts.label') || 'Scripts' }}</DetailSummary>
			<ParamList
				id="fileActor-scripts" @change="onListChange"
				class="inspector-list"
				flexible
			/>
		</DetailBox>
		<ParameterPane id="fileActor-parameter-pane" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { EventListInterface } from '@app/legacy/tools/event-list.ts';
import { AttributeListInterface } from '@app/legacy/tools/property-list.ts';
import { ScriptListInterface } from '@app/legacy/tools/script-list.ts';
import { useFileActorPage } from '@app/composables/useFileActorPage';
import { useInspectorStore } from '@app/stores/inspector';
import { attachElementApi } from '@app/legacy/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import ParameterPane from '@app/components/common/ParameterPane.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const { t } = useI18n();

const { form, sync, onParamInput } = useFileActorPage();

const onAnimationIdWrite = (value: unknown) => {
	Inspector?.fileActor?.animationIdWrite?.({ value });
};
const onListChange = () => {
	Inspector?.fileActor?.listChange?.();
};

onMounted(() => {
	const editor = Inspector.fileActor;
	if (!editor) return;

	const el = document.getElementById('fileActor-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}

	const elRotatable = document.getElementById('fileActor-rotatable') as HTMLElement & { loadItems?: (items: unknown[]) => void } | null;
	if (elRotatable?.loadItems) {
		elRotatable.loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		]);
	}

	const elPassage = document.getElementById('fileActor-passage') as HTMLElement & { loadItems?: (items: unknown[]) => void } | null;
	if (elPassage?.loadItems) {
		elPassage.loadItems([
			{ name: 'Land', value: 'land' },
			{ name: 'Water', value: 'water' },
			{ name: 'Unrestricted', value: 'unrestricted' }
		]);
	}

	const elShape = document.getElementById('fileActor-shape') as HTMLElement & { loadItems?: (items: unknown[]) => void } | null;
	if (elShape?.loadItems) {
		elShape.loadItems([
			{ name: 'Square', value: 'square' },
			{ name: 'Circle', value: 'circle' }
		]);
	}

	const elImmovable = document.getElementById('fileActor-immovable') as HTMLElement & { loadItems?: (items: unknown[]) => void } | null;
	if (elImmovable?.loadItems) {
		elImmovable.loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		]);
	}

	if (editor.sprites) document.getElementById('fileActor-sprites')?.bind?.(editor.sprites);
	document.getElementById('fileActor-attributes')?.bind?.(new AttributeListInterface());
	if (editor.skills) document.getElementById('fileActor-skills')?.bind?.(editor.skills);
	if (editor.equipments) document.getElementById('fileActor-equipments')?.bind?.(editor.equipments);
	if (editor.inventory) document.getElementById('fileActor-inventory')?.bind?.(editor.inventory);
	document.getElementById('fileActor-events')?.bind?.(new EventListInterface(editor));
	document.getElementById('fileActor-scripts')?.bind?.(new ScriptListInterface());
	document.getElementById('fileActor-parameter-pane')?.bind?.(document.getElementById('fileActor-scripts'));

	sync();
});
</script>
