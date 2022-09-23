export abstract class DTOOut<Entity> {
	abstract data: Entity | boolean | undefined | any
}

export abstract class DTOIn<Entity> {
	abstract data: Partial<Entity> | any
	abstract field?: string | null
	abstract criteria?: string | any
}
