export abstract class GenericError {
	public error?: Object
    public message?: string

    // overloads
    constructor(error: {message?: string})
    constructor(error: {message?: string, error?: Object,})

	constructor(error : {message?: string, error?: Object,}) {
        this.error = error.error
        this.message = error.message
    }
}
