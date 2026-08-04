export interface RadioGroupMember {
	unselect(): void;
}

export const radioGroups = new Map<string, Set<RadioGroupMember>>();
