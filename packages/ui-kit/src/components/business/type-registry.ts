import { elementDataOf } from '../../utils/element-data';

export interface TypeRegistryDataSource {
	createEasingItems(): unknown[];
	createTeamItems(): unknown[];
	getAttributeItems(filter: string, flag: string, unlinked: boolean): unknown[];
	getStringItems(filter: string, flag: boolean): unknown[];
}

/** P4b：`numBox` 现在是元素数据（WeakMap），消费者只能拿到形状——这里把它提成具名类型 */
interface ParamNumBox {
	input: { min: string; max: string };
	decimals?: number;
	setPlaceholder(placeholder: string): void;
}

interface Pane {
	createCheckBox(): unknown;
	createColorBox(): unknown;
	createCustomBox(): { input: { type: string; filter?: string; isPluginInput?: boolean } };
	createKeyboardBox(): unknown;
	createNumberBox(): {
		input: {
			input: { min: string; max: string };
			decimals?: number;
			setPlaceholder(placeholder: string): void;
		};
	};
	createNumberVar(): {
		input: {
			numBox: ParamNumBox;
			varBox: { isPluginInput?: boolean };
		};
	};
	createRepeatableGroup(param?: Param): unknown;
	createSelectBox(): {
		input: { loadItems(items: unknown[] | undefined): void; branched?: boolean };
	};
	createTextBox(): { input: { setPlaceholder(placeholder: string): void } };
}

interface Param {
	min?: number;
	max?: number;
	decimals?: number;
	placeholder?: string;
	dataItems?: unknown[];
	wrap?: boolean;
	filter?: string;
}

interface RegistryEntry {
	component: string;
	// oxlint-disable-next-line no-explicit-any
	create(...args: any[]): any;
}

export interface TypeRegistryApi {
	// oxlint-disable-next-line no-explicit-any
	types: Record<string, any>;
	register(type: string, config: unknown): void;
	get(type: string): RegistryEntry;
	has(type: string): boolean;
}

export function createTypeRegistry(dataSource: TypeRegistryDataSource): TypeRegistryApi {
	const TypeRegistry: TypeRegistryApi = {
		types: {},

		register(type: string, config: unknown) {
			this.types[type] = config;
		},

		get(type: string) {
			return this.types[type];
		},

		has(type: string) {
			return type in this.types;
		}
	};

	TypeRegistry.register('boolean', {
		component: 'check-box',
		create(pane: Pane) {
			return pane.createCheckBox();
		}
	});

	TypeRegistry.register('number', {
		component: 'number-box',
		create(pane: Pane, param: Param) {
			const wrap = pane.createNumberBox();
			wrap.input.input.min = param.min!.toString();
			wrap.input.input.max = param.max!.toString();
			wrap.input.decimals = param.decimals;
			if (param.placeholder) {
				wrap.input.setPlaceholder(param.placeholder);
			}
			return wrap;
		}
	});

	TypeRegistry.register('variable-number', {
		component: 'number-var',
		create(pane: Pane, param: Param) {
			const wrap = pane.createNumberVar();
			// P4b：numBox 走显式元素数据（字段已从 DATA_FIELDS 摘除）
			const numBox = elementDataOf<{ numBox: ParamNumBox }>(wrap.input).numBox;
			numBox.input.min = param.min!.toString();
			numBox.input.max = param.max!.toString();
			numBox.decimals = param.decimals;
			wrap.input.varBox.isPluginInput = true;
			if (param.placeholder) {
				numBox.setPlaceholder(param.placeholder);
			}
			return wrap;
		}
	});

	TypeRegistry.register('string', {
		component: 'text-box',
		create(pane: Pane, param: Param) {
			const wrap = pane.createTextBox();
			if (param.placeholder) {
				wrap.input.setPlaceholder(param.placeholder);
			}
			return wrap;
		}
	});

	TypeRegistry.register('option', {
		component: 'select-box',
		create(pane: Pane, param: Param) {
			const wrap = pane.createSelectBox();
			wrap.input.loadItems(param.dataItems);
			wrap.input.branched = !!param.wrap;
			return wrap;
		}
	});

	TypeRegistry.register('easing', {
		component: 'select-box',
		create(pane: Pane) {
			const wrap = pane.createSelectBox();
			wrap.input.loadItems(dataSource.createEasingItems());
			return wrap;
		}
	});

	TypeRegistry.register('team', {
		component: 'select-box',
		create(pane: Pane) {
			const wrap = pane.createSelectBox();
			wrap.input.loadItems(dataSource.createTeamItems());
			return wrap;
		}
	});

	TypeRegistry.register('variable', {
		component: 'custom-box',
		create(pane: Pane) {
			const wrap = pane.createCustomBox();
			wrap.input.type = 'global-variable';
			wrap.input.filter = '';
			return wrap;
		}
	});

	TypeRegistry.register('attribute', {
		component: 'custom-box',
		create(pane: Pane, param: Param) {
			if (param.filter === 'any') {
				const wrap = pane.createCustomBox();
				wrap.input.type = 'attribute';
				return wrap;
			} else {
				const wrap = pane.createSelectBox();
				wrap.input.loadItems(dataSource.getAttributeItems(param.filter!, '', true));
				return wrap;
			}
		}
	});

	TypeRegistry.register('attribute-key', {
		component: 'custom-box',
		create(pane: Pane, param: Param) {
			if (param.filter === 'any') {
				const wrap = pane.createCustomBox();
				wrap.input.type = 'attribute';
				return wrap;
			} else {
				const wrap = pane.createSelectBox();
				wrap.input.loadItems(dataSource.getAttributeItems(param.filter!, '', true));
				return wrap;
			}
		}
	});

	TypeRegistry.register('attribute-group', {
		component: 'custom-box',
		create(pane: Pane) {
			const wrap = pane.createCustomBox();
			wrap.input.type = 'attribute-group';
			return wrap;
		}
	});

	TypeRegistry.register('enum', {
		component: 'custom-box',
		create(pane: Pane, param: Param) {
			if (param.filter === 'any') {
				const wrap = pane.createCustomBox();
				wrap.input.type = 'enum-string';
				return wrap;
			} else {
				const wrap = pane.createSelectBox();
				wrap.input.loadItems(dataSource.getStringItems(param.filter!, true));
				return wrap;
			}
		}
	});

	TypeRegistry.register('enum-value', {
		component: 'custom-box',
		create(pane: Pane, param: Param) {
			if (param.filter === 'any') {
				const wrap = pane.createCustomBox();
				wrap.input.type = 'enum-string';
				return wrap;
			} else {
				const wrap = pane.createSelectBox();
				wrap.input.loadItems(dataSource.getStringItems(param.filter!, true));
				return wrap;
			}
		}
	});

	TypeRegistry.register('enum-group', {
		component: 'custom-box',
		create(pane: Pane) {
			const wrap = pane.createCustomBox();
			wrap.input.type = 'enum-group';
			return wrap;
		}
	});

	TypeRegistry.register('actor', {
		component: 'custom-box',
		create(pane: Pane) {
			const wrap = pane.createCustomBox();
			wrap.input.type = 'preset-object';
			wrap.input.filter = 'actor';
			return wrap;
		}
	});

	TypeRegistry.register('region', {
		component: 'custom-box',
		create(pane: Pane) {
			const wrap = pane.createCustomBox();
			wrap.input.type = 'preset-object';
			wrap.input.filter = 'region';
			return wrap;
		}
	});

	TypeRegistry.register('light', {
		component: 'custom-box',
		create(pane: Pane) {
			const wrap = pane.createCustomBox();
			wrap.input.type = 'preset-object';
			wrap.input.filter = 'light';
			return wrap;
		}
	});

	TypeRegistry.register('animation', {
		component: 'custom-box',
		create(pane: Pane) {
			const wrap = pane.createCustomBox();
			wrap.input.type = 'preset-object';
			wrap.input.filter = 'animation';
			return wrap;
		}
	});

	TypeRegistry.register('particle', {
		component: 'custom-box',
		create(pane: Pane) {
			const wrap = pane.createCustomBox();
			wrap.input.type = 'preset-object';
			wrap.input.filter = 'particle';
			return wrap;
		}
	});

	TypeRegistry.register('parallax', {
		component: 'custom-box',
		create(pane: Pane) {
			const wrap = pane.createCustomBox();
			wrap.input.type = 'preset-object';
			wrap.input.filter = 'parallax';
			return wrap;
		}
	});

	TypeRegistry.register('tilemap', {
		component: 'custom-box',
		create(pane: Pane) {
			const wrap = pane.createCustomBox();
			wrap.input.type = 'preset-object';
			wrap.input.filter = 'tilemap';
			return wrap;
		}
	});

	TypeRegistry.register('element', {
		component: 'custom-box',
		create(pane: Pane) {
			const wrap = pane.createCustomBox();
			wrap.input.type = 'preset-element';
			wrap.input.filter = '';
			return wrap;
		}
	});

	TypeRegistry.register('element-id', {
		component: 'custom-box',
		create(pane: Pane) {
			const wrap = pane.createCustomBox();
			wrap.input.type = 'preset-element';
			wrap.input.filter = '';
			return wrap;
		}
	});

	TypeRegistry.register('file', {
		component: 'custom-box',
		create(pane: Pane, param: Param) {
			const wrap = pane.createCustomBox();
			wrap.input.type = 'file';
			wrap.input.filter = param.filter;
			return wrap;
		}
	});

	TypeRegistry.register('variable-getter', {
		component: 'custom-box',
		create(pane: Pane) {
			const wrap = pane.createCustomBox();
			wrap.input.type = 'variable';
			wrap.input.filter = 'all';
			wrap.input.isPluginInput = true;
			return wrap;
		}
	});

	TypeRegistry.register('variable-setter', {
		component: 'custom-box',
		create(pane: Pane) {
			const wrap = pane.createCustomBox();
			wrap.input.type = 'variable';
			wrap.input.filter = 'all';
			wrap.input.isPluginInput = true;
			return wrap;
		}
	});

	TypeRegistry.register('actor-getter', {
		component: 'custom-box',
		create(pane: Pane) {
			const wrap = pane.createCustomBox();
			wrap.input.type = 'actor';
			wrap.input.isPluginInput = true;
			return wrap;
		}
	});

	TypeRegistry.register('skill-getter', {
		component: 'custom-box',
		create(pane: Pane) {
			const wrap = pane.createCustomBox();
			wrap.input.type = 'skill';
			wrap.input.isPluginInput = true;
			return wrap;
		}
	});

	TypeRegistry.register('state-getter', {
		component: 'custom-box',
		create(pane: Pane) {
			const wrap = pane.createCustomBox();
			wrap.input.type = 'state';
			wrap.input.isPluginInput = true;
			return wrap;
		}
	});

	TypeRegistry.register('equipment-getter', {
		component: 'custom-box',
		create(pane: Pane) {
			const wrap = pane.createCustomBox();
			wrap.input.type = 'equipment';
			wrap.input.isPluginInput = true;
			return wrap;
		}
	});

	TypeRegistry.register('item-getter', {
		component: 'custom-box',
		create(pane: Pane) {
			const wrap = pane.createCustomBox();
			wrap.input.type = 'item';
			wrap.input.isPluginInput = true;
			return wrap;
		}
	});

	TypeRegistry.register('element-getter', {
		component: 'custom-box',
		create(pane: Pane) {
			const wrap = pane.createCustomBox();
			wrap.input.type = 'element';
			wrap.input.isPluginInput = true;
			return wrap;
		}
	});

	TypeRegistry.register('position-getter', {
		component: 'custom-box',
		create(pane: Pane) {
			const wrap = pane.createCustomBox();
			wrap.input.type = 'position';
			wrap.input.isPluginInput = true;
			return wrap;
		}
	});

	TypeRegistry.register('number[]', {
		component: 'custom-box',
		create(pane: Pane) {
			const wrap = pane.createCustomBox();
			wrap.input.type = 'array';
			wrap.input.filter = 'number';
			return wrap;
		}
	});

	TypeRegistry.register('string[]', {
		component: 'custom-box',
		create(pane: Pane) {
			const wrap = pane.createCustomBox();
			wrap.input.type = 'array';
			wrap.input.filter = 'string';
			return wrap;
		}
	});

	TypeRegistry.register('repeatable-group', {
		component: 'custom-box',
		create(pane: Pane, param: Param) {
			return pane.createRepeatableGroup(param);
		}
	});

	TypeRegistry.register('keycode', {
		component: 'keyboard-box',
		create(pane: Pane) {
			return pane.createKeyboardBox();
		}
	});

	TypeRegistry.register('color', {
		component: 'color-box',
		create(pane: Pane) {
			return pane.createColorBox();
		}
	});

	return TypeRegistry;
}
