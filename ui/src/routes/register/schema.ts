import vine from '@vinejs/vine';

export const schema = vine.object({
	email: vine.string().trim().email(),
	password: vine.string().minLength(8).confirmed({
		confirmationField: 'password_confirmation'
	}),
	password_confirmation: vine.string().minLength(8)
});
