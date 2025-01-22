import { useAppContext } from '../common';

const superRoles = {
	Supervisor: 'supervisor',
	Viewer: 'viewer',
	Editor: 'editor',
};

const middleRoles = {
	GoodEditor: 'good_editor',
	GoodReader: 'good_reader',
	SessionEditor: 'session_editor',
	SessionReader: 'session_reader',
	UserEditor: 'user_editor',
	UserReader: 'user_reader',
};

export function usePermissions() {
	const { roles } = useAppContext();

	return {
		/**
		 * Returns true if a user can create sessions
		 * @returns {boolean}
		 */
		canCreateSessions: () => {
			return (roles || []).some(
				(role) =>
					role === superRoles.Supervisor ||
					role === superRoles.Editor ||
					role === middleRoles.SessionEditor,
			);
		},

		canDeleteSessions: () => {
			return (roles || []).some(
				(role) =>
					role === superRoles.Supervisor ||
					role === superRoles.Editor ||
					role === middleRoles.SessionEditor,
			);
		},

		canUpdateSessions: () => {
			return (roles || []).some(
				(role) =>
					role === superRoles.Supervisor ||
					role === superRoles.Editor ||
					role === middleRoles.SessionEditor,
			);
		},
	};
}
