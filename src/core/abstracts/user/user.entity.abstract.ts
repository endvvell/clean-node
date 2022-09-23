export abstract class UserEntity {
	abstract id?: string | null
	abstract username?: string | null
	abstract password?: string | null
	abstract firstName?: string | null
	abstract lastName?: string | null
	abstract lastLogin?: string | null
	abstract dateJoined?: string | null
	abstract isAdmin?: boolean
	abstract isActive?: boolean
	abstract telegramLink?: string | null
	abstract email?: string | null
	abstract preferredName?: string | null

	abstract validUsername(value: string): string
	abstract validPassword(value: string): string
	abstract validFirstName(value: string): string
	abstract validLastName(value: string): string
	// abstract validIsAdmin(value: boolean): boolean
	// abstract validIsActive(value: boolean): boolean
	abstract validTelegramLink(value: string): string
	abstract validEmail(value: string): string
}
