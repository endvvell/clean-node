import { User } from "../../entities/user.entity";

export type Entity = User // | Post | ...

export abstract class IGenericRepo<Entity, DTOIn> {
	abstract formattedError(error: Error | any): any
	abstract exists(criteriaObj: any): Promise<boolean>
	abstract getMany(criteriaObj: DTOIn): Promise<Entity[]>
	abstract getOne(criteriaObj: DTOIn): Promise<Entity>
	abstract create(dataObj: DTOIn): Promise<Entity>
	abstract update(dataObj: DTOIn): Promise<Entity>
	abstract delete(criteriaObj: DTOIn): Promise<void>
}
