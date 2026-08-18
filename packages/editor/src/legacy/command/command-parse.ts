import { Command } from './command-object.ts';
import {
	parseBlend,
	fetchVariables,
	parseVariable,
	parseGlobalVariable,
	parseAttributeGroup,
	parseAttributeKey,
	parseAttributeTag,
	parseVariableTag,
	parseVariableNumber,
	parseVariableString,
	parseVariableTemplate,
	parseVariableAttr,
	parseVariableEnum,
	parseVariableFile,
	parseVariableTeam,
	parseMultiLineString,
	parseSpriteName,
	parseEventType,
	parseEnumGroup,
	parseEnumString,
	parseEnumStringTag,
	parseGroupEnumString,
	parseListItem,
	parseParameter,
	parseActor,
	parseSkill,
	parseState,
	parseEquipment,
	parseItem,
	parsePosition,
	parseAngle,
	parseTrigger,
	parseLight,
	parseRegion,
	parseTilemap,
	parseObject,
	parseElement,
	parsePresetObject,
	parsePresetElement,
	parseTeam,
	parseHexColor,
	parseActorSelector,
	parseFileName,
	parseAudioType,
	parseWait,
	parseEasing,
	parseUnlinkedId,
	parseTextTags,
	removeTextTags
} from '@app/composables/useCommandParse.ts';

Command.parseBlend = parseBlend;
Command.fetchVariables = fetchVariables;
Command.parseVariable = parseVariable;
Command.parseGlobalVariable = parseGlobalVariable;
Command.parseAttributeGroup = parseAttributeGroup;
Command.parseAttributeKey = parseAttributeKey;
Command.parseAttributeTag = parseAttributeTag;
Command.parseVariableTag = parseVariableTag;
Command.parseVariableNumber = parseVariableNumber;
Command.parseVariableString = parseVariableString;
Command.parseVariableTemplate = parseVariableTemplate;
Command.parseVariableAttr = parseVariableAttr;
Command.parseVariableEnum = parseVariableEnum;
Command.parseVariableFile = parseVariableFile;
Command.parseVariableTeam = parseVariableTeam;
Command.parseMultiLineString = parseMultiLineString;
Command.parseSpriteName = parseSpriteName;
Command.parseEventType = parseEventType;
Command.parseEnumGroup = parseEnumGroup;
Command.parseEnumString = parseEnumString;
Command.parseEnumStringTag = parseEnumStringTag;
Command.parseGroupEnumString = parseGroupEnumString;
Command.parseListItem = parseListItem;
Command.parseParameter = parseParameter;
Command.parseActor = parseActor;
Command.parseSkill = parseSkill;
Command.parseState = parseState;
Command.parseEquipment = parseEquipment;
Command.parseItem = parseItem;
Command.parsePosition = parsePosition;
Command.parseAngle = parseAngle;
Command.parseTrigger = parseTrigger;
Command.parseLight = parseLight;
Command.parseRegion = parseRegion;
Command.parseTilemap = parseTilemap;
Command.parseObject = parseObject;
Command.parseElement = parseElement;
Command.parsePresetObject = parsePresetObject;
Command.parsePresetElement = parsePresetElement;
Command.parseTeam = parseTeam;
Command.parseHexColor = parseHexColor;
Command.parseActorSelector = parseActorSelector;
Command.parseFileName = parseFileName;
Command.parseAudioType = parseAudioType;
Command.parseWait = parseWait;
Command.parseEasing = parseEasing;
Command.parseUnlinkedId = parseUnlinkedId;
Command.parseTextTags = parseTextTags;
Command.removeTextTags = removeTextTags;
