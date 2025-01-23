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

const entities = {
	Good: 'good',
	Session: 'session',
	User: 'user',
};

const operations = {
	Read: 'read',
	Write: 'write',
	Update: 'update',
};

function makePermissionName(entity, operation) {
	return `${entity}_${operation}`.toUpperCase();
}

export function usePermissions() {
	const {
		auth: { roles, permissions },
	} = useAppContext();

	function hasRoles(requestedRoles) {
		return requestedRoles.some((role) => roles.includes(role));
	}

	function hasPermission(permission) {
		return (permissions || []).includes(permission);
	}

	return {
		/**
		 * Returns true if a user can create sessions
		 * @returns {boolean}
		 */
		canCreateSessions: () => {
			return (
				hasRoles([
					superRoles.Supervisor,
					superRoles.Editor,
					middleRoles.SessionEditor,
				]) ||
				hasPermission(makePermissionName(entities.Session, operations.Write))
			);
		},

		canDeleteSessions: () => {
			return (
				hasRoles([
					superRoles.Supervisor,
					superRoles.Editor,
					middleRoles.SessionEditor,
				]) ||
				hasPermission(makePermissionName(entities.Session, operations.Write))
			);
		},

		canUpdateSessions: () => {
			return (
				hasRoles([
					superRoles.Supervisor,
					superRoles.Editor,
					middleRoles.SessionEditor,
				]) ||
				hasPermission(makePermissionName(entities.Session, operations.Write))
			);
		},

		canUpdateGoods: () => {
			return (
				hasRoles([
					superRoles.Supervisor,
					superRoles.Editor,
					middleRoles.GoodEditor,
				]) || hasPermission(makePermissionName(entities.Good, operations.Write))
			);
		},

		canDeleteGoods: () => {
			return (
				hasRoles([
					superRoles.Supervisor,
					superRoles.Editor,
					middleRoles.GoodEditor,
				]) || hasPermission(makePermissionName(entities.Good, operations.Write))
			);
		},
	};
}
