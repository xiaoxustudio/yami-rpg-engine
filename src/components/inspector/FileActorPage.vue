<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileActor-general-grid') || 'General' }}</DetailSummary>
			<div class="detail-grid" id="fileActor-general-grid">
				<text>{{ local.getLabel('fileActor-portrait') || 'Portrait' }}</text
			><CustomBox
				id="fileActor-portrait"
				type="file"
				filter="image"
			/>
			<text>{{ local.getLabel('fileActor-clip') || 'Clip' }}</text
			><CustomBox
				id="fileActor-clip"
				type="clip"
				image="fileActor-portrait"
			/>
			<text>{{ local.getLabel('fileActor-animationId') || 'Animation' }}</text
			><CustomBox
				id="fileActor-animationId"
				type="file"
				filter="animation"
			/>
				<text>Idle Motion</text
				><SelectBox id="fileActor-idleMotion" />
				<text>Move Motion</text
				><SelectBox id="fileActor-moveMotion" />
				<text>Rotatable</text><SelectBox id="fileActor-rotatable" />
				<text>Passage Terrain</text
				><SelectBox id="fileActor-passage" />
				<text>Movement Speed</text
				><NumberBox
					id="fileActor-speed"
					min="0"
					max="32"
					decimals="4"
					unit="t/s"
				/>
				<text>Collision Shape</text
				><SelectBox id="fileActor-shape" />
				<text>Collision Size</text
				><NumberBox
					id="fileActor-size"
					min="0"
					max="16"
					step="0.1"
					decimals="4"
					unit="t"
				/>
				<text>Collision Weight</text
				><NumberBox
					id="fileActor-weight"
					min="0"
					max="8"
					step="0.1"
					decimals="4"
				/>
				<text>Immovable</text><SelectBox id="fileActor-immovable" />
				<text>Scale</text
				><NumberBox
					id="fileActor-scale"
					min="0"
					max="10"
					step="0.1"
					decimals="4"
				/>
				<text>Priority</text
				><NumberBox
					id="fileActor-priority"
					min="-512"
					max="512"
					decimals="4"
				/>
				<text>Inherit</text
				><CustomBox
					id="fileActor-inherit"
					type="file"
					filter="actor"
				/>
			</div>
		</DetailBox>
		<DetailBox open>
			<DetailSummary>{{ local.getLabel('fileActor-sprites') || 'Sprites' }}</DetailSummary>
			<ParamList
				id="fileActor-sprites"
				class="inspector-list"
				flexible
			/>
		</DetailBox>
		<DetailBox open>
			<DetailSummary>{{ local.getLabel('fileActor-attributes') || 'Attributes' }}</DetailSummary>
			<ParamList
				id="fileActor-attributes"
				class="inspector-list"
				group="actor"
				flexible
			/>
		</DetailBox>
		<DetailBox open>
			<DetailSummary>{{ local.getLabel('fileActor-skills') || 'Skills' }}</DetailSummary>
			<ParamList
				id="fileActor-skills"
				class="inspector-list"
				flexible
			/>
		</DetailBox>
		<DetailBox open>
			<DetailSummary>{{ local.getLabel('fileActor-equipments') || 'Equipments' }}</DetailSummary>
			<ParamList
				id="fileActor-equipments"
				class="inspector-list"
				flexible
			/>
		</DetailBox>
		<DetailBox open>
			<DetailSummary>{{ local.getLabel('fileActor-inventory') || 'Inventory' }}</DetailSummary>
			<ParamList
				id="fileActor-inventory"
				class="inspector-list"
				flexible
			/>
		</DetailBox>
		<DetailBox open>
			<DetailSummary>{{ local.getLabel('fileActor-events') || 'Events' }}</DetailSummary>
			<ParamList
				id="fileActor-events"
				class="inspector-list"
				filter="actor"
				flexible
			/>
		</DetailBox>
		<DetailBox open>
			<DetailSummary>{{ local.getLabel('fileActor-scripts') || 'Scripts' }}</DetailSummary>
			<ParamList
				id="fileActor-scripts"
				class="inspector-list"
				flexible
			/>
		</DetailBox>
		<ParameterPane id="fileActor-parameter-pane" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import ParameterPane from '@app/components/common/ParameterPane.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
