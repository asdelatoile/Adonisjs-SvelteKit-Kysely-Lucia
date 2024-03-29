import type { PageServerLoad, Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { vine } from 'sveltekit-superforms/adapters';
import { schema } from './schema.js';

const defaults = { email: 'test@test.com', password: 'demo1234' };

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user;
	if (user) {
		redirect(302, '/admin/dashboard');
	}
	const form = await superValidate(vine(schema, { defaults }));

	return { form };
};

export const actions: Actions = {
	default: async ({ cookies, fetch, request }) => {
		const form = await superValidate(request, vine(schema, { defaults }));

		// Check validation
		if (!form.valid) {
			// reset password field
			form.data.password = '';
			return message(form, {
				type: 'error',
				message: 'Invalid email or password.'
			});
		}

		try {
			const { email, password } = form.data;
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				body: JSON.stringify({
					email,
					password
				})
			});
			const resJson = await res.json();
			const { token, error } = resJson;

			if (error) {
				return message(form, {
					type: 'error',
					message: error
				});
			}

			// Set the cookie
			cookies.set('AuthorizationToken', token, {
				httpOnly: true,
				path: '/',
				secure: true,
				sameSite: 'strict',
				maxAge: 60 * 60 * 24 // 1 day
			});

			redirect(302, '/admin/dashboard');
		} catch (err) {
			if (err && err instanceof Error) {
				return message(form, {
					type: 'error',
					message: 'Internal Server Error'
				});
			} else {
				throw err;
			}
		}
	}
};
