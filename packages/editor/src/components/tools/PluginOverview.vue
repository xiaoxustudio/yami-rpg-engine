<template>
	<div v-if="meta">
		<template v-if="overview.plugin">
			<div class="plugin-title text">
				<div class="plugin-name text">{{ langMap?.get(overview.plugin) }}</div>
				<div v-if="overview.version" class="plugin-version text">{{ ' ver' + overview.version }}</div>
				<div v-if="deprecatedText" class="plugin-deprecated text">{{ deprecatedText }}</div>
			</div>
		</template>
		<template v-if="overview.author">
			{{ hasTitle ? '\n' : '' }}
			<div class="plugin-label text">{{ get('author') }}: </div>
			<div
				class="plugin-type text"
				:class="{ 'plugin-link': !!overview.link }"
				@click="onLinkClick"
			>{{ overview.author }}</div>
		</template>
		<template v-if="overview.desc">
			{{ hasTitleOrAuthor ? '\n\n' : '' }}
			{{ langMap?.get(overview.desc) }}
		</template>
		<template v-if="missing.length">
			{{ hasOverviewText ? '\n\n' : '' }}
			<div class="plugin-require-warn text">{{ requireText }}</div>
		</template>
		<template v-if="detailed && meta.parameters.length">
			{{ hasAnyOverview ? '\n\n' : '' }}
			<div v-for="parameter in meta.parameters" :key="parameter.key" class="plugin-wrap text">
				<div class="plugin-key text">{{ langMap?.get(parameter.alias) ?? parameter.key }}</div>
				<div class="plugin-label text">: </div>
				<template v-for="(segment, index) in typeSegments(parameter)" :key="index">
					<div v-if="segment.separator" class="plugin-label text">|</div>
					<div class="plugin-type text">{{ segment.text }}</div>
				</template>
				<div v-if="parameter.key in states" class="plugin-label text">?</div>
				<div v-if="parameter.desc" class="plugin-param-desc text">{{ langMap?.get(parameter.desc) }}</div>
			</div>
		</template>
		<span v-if="!hasAnyContent">No Description</span>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Data } from '@app/data/data-object.ts';
import { File } from '@app/file/file-system-core.ts';
import type { OverviewShape, ParameterShape, PluginMetaShape } from '@app/plugin/plugin.ts';
import { useLocalStore } from '@app/stores/local';

const props = withDefaults(defineProps<{ meta: PluginMetaShape | null; detailed: boolean }>(), {
	meta: null,
	detailed: false
});

const local = useLocalStore();
const get = local.createGetter('plugin');

const overview = computed<OverviewShape>(() => props.meta?.overview ?? ({} as OverviewShape));
const langMap = computed(() => props.meta?.langMap.update());
const states = computed(() => props.meta?.manager.states ?? {});

const hasTitle = computed(() => !!overview.value.plugin);
const hasTitleOrAuthor = computed(() => hasTitle.value || !!overview.value.author);
const hasOverviewText = computed(() => hasTitleOrAuthor.value || !!overview.value.desc);
const missing = computed(() => {
	const requires = overview.value.requires ?? [];
	if (!requires.length) return [];
	const guidMap = Data.manifest?.guidMap ?? {};
	const loaded = new Set<string>();
	for (const id in guidMap) {
		const plugin = guidMap[id]?.overview?.plugin;
		if (plugin) loaded.add(plugin);
	}
	return requires.filter((req) => !loaded.has(req.plugin));
});
const hasAnyOverview = computed(() => hasOverviewText.value || !!missing.value.length);
const hasAnyContent = computed(
	() => hasAnyOverview.value || (props.detailed && !!props.meta?.parameters.length)
);

const deprecatedText = computed(() => {
	const deprecated = overview.value.deprecated;
	if (!deprecated) return '';
	return typeof deprecated === 'string' ? get('deprecated') + ': ' + deprecated : get('deprecated');
});

const requireText = computed(() => get('requireMissing') + missing.value.map((req) => req.plugin).join(', '));

const typeSegments = (parameter: ParameterShape): { separator: boolean; text: string }[] => {
	const { type, filter } = parameter;
	if (type === 'attribute' || type === 'attribute-key') {
		let attrType = 'attribute';
		if (filter !== 'any') {
			attrType += '.' + filter;
		}
		return [
			{
				separator: false,
				text: get(attrType) + (type === 'attribute-key' ? `(${get('key')})` : '')
			}
		];
	}
	if (type === 'attribute-group') {
		return [{ separator: false, text: get('attribute.group') }];
	}
	if (type === 'enum' || type === 'enum-value') {
		let enumType = 'enum';
		if (filter !== 'any') {
			enumType += '.' + filter;
		}
		return [
			{
				separator: false,
				text: get(enumType) + (type === 'enum-value' ? `(${get('value')})` : '')
			}
		];
	}
	if (type === 'enum-group') {
		return [{ separator: false, text: get('enum.group') }];
	}
	if (type === 'element-id') {
		return [{ separator: false, text: `${get('element')}(${get('id')})` }];
	}
	if (type === 'file' && filter) {
		return filter.split(' ').map((item, index) => ({
			separator: index !== 0,
			text: get('file.' + item)
		}));
	}
	return [{ separator: false, text: get(type) }];
};

const onLinkClick = () => {
	const link = overview.value.link;
	if (link) File.openURL?.(link);
};
</script>
