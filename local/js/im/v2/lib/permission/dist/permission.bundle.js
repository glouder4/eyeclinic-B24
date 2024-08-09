/* eslint-disable */
this.BX = this.BX || {};
this.BX.Messenger = this.BX.Messenger || {};
this.BX.Messenger.v2 = this.BX.Messenger.v2 || {};
(function (exports,main_core,im_v2_application_core,im_v2_lib_logger,im_v2_const) {
	'use strict';

	const DEFAULT_TYPE = 'default';
	var _instance = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("instance");
	var _chatTypePermissions = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("chatTypePermissions");
	var _actionGroups = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("actionGroups");
	var _actionGroupsDefaultRoles = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("actionGroupsDefaultRoles");
	var _init = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("init");
	var _canPerformActionByChatType = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("canPerformActionByChatType");
	var _canPerformActionByChatSettings = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("canPerformActionByChatSettings");
	var _getGroupByAction = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("getGroupByAction");
	var _prepareChatTypePermissions = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("prepareChatTypePermissions");
	var _checkMinimalRole = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("checkMinimalRole");
	var _canPerformKickByHierarchy = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("canPerformKickByHierarchy");
	var _getDialog = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("getDialog");
	var _getUserRole = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("getUserRole");
	class PermissionManager {
	  static getInstance() {
	    if (!babelHelpers.classPrivateFieldLooseBase(this, _instance)[_instance]) {
	      babelHelpers.classPrivateFieldLooseBase(this, _instance)[_instance] = new this();
	    }
	    return babelHelpers.classPrivateFieldLooseBase(this, _instance)[_instance];
	  }
	  static init() {
	    PermissionManager.getInstance();
	  }
	  constructor() {
	    Object.defineProperty(this, _getUserRole, {
	      value: _getUserRole2
	    });
	    Object.defineProperty(this, _getDialog, {
	      value: _getDialog2
	    });
	    Object.defineProperty(this, _canPerformKickByHierarchy, {
	      value: _canPerformKickByHierarchy2
	    });
	    Object.defineProperty(this, _checkMinimalRole, {
	      value: _checkMinimalRole2
	    });
	    Object.defineProperty(this, _prepareChatTypePermissions, {
	      value: _prepareChatTypePermissions2
	    });
	    Object.defineProperty(this, _getGroupByAction, {
	      value: _getGroupByAction2
	    });
	    Object.defineProperty(this, _canPerformActionByChatSettings, {
	      value: _canPerformActionByChatSettings2
	    });
	    Object.defineProperty(this, _canPerformActionByChatType, {
	      value: _canPerformActionByChatType2
	    });
	    Object.defineProperty(this, _init, {
	      value: _init2
	    });
	    Object.defineProperty(this, _chatTypePermissions, {
	      writable: true,
	      value: void 0
	    });
	    Object.defineProperty(this, _actionGroups, {
	      writable: true,
	      value: void 0
	    });
	    Object.defineProperty(this, _actionGroupsDefaultRoles, {
	      writable: true,
	      value: void 0
	    });
	    const {
	      permissions
	    } = im_v2_application_core.Core.getApplicationData();
	    im_v2_lib_logger.Logger.warn('PermissionManager: permission from server', permissions);
	    babelHelpers.classPrivateFieldLooseBase(this, _init)[_init](permissions);
	  }
	  canPerformAction(actionType, dialogId) {
	    return babelHelpers.classPrivateFieldLooseBase(this, _canPerformActionByChatType)[_canPerformActionByChatType](actionType, dialogId) && babelHelpers.classPrivateFieldLooseBase(this, _canPerformActionByChatSettings)[_canPerformActionByChatSettings](actionType, dialogId);
	  }
	  canPerformKick(dialogId, userId) {
	    return babelHelpers.classPrivateFieldLooseBase(this, _canPerformActionByChatType)[_canPerformActionByChatType](im_v2_const.ChatActionType.kick, dialogId) && babelHelpers.classPrivateFieldLooseBase(this, _canPerformActionByChatSettings)[_canPerformActionByChatSettings](im_v2_const.ChatActionType.kick, dialogId) && babelHelpers.classPrivateFieldLooseBase(this, _canPerformKickByHierarchy)[_canPerformKickByHierarchy](dialogId, userId);
	  }
	  getDefaultRolesForActionGroups() {
	    return babelHelpers.classPrivateFieldLooseBase(this, _actionGroupsDefaultRoles)[_actionGroupsDefaultRoles];
	  }
	}
	function _init2(rawPermissions) {
	  const {
	    byChatType,
	    actionGroups,
	    actionGroupsDefaults
	  } = rawPermissions;
	  babelHelpers.classPrivateFieldLooseBase(this, _chatTypePermissions)[_chatTypePermissions] = babelHelpers.classPrivateFieldLooseBase(this, _prepareChatTypePermissions)[_prepareChatTypePermissions](byChatType);
	  babelHelpers.classPrivateFieldLooseBase(this, _actionGroups)[_actionGroups] = actionGroups;
	  babelHelpers.classPrivateFieldLooseBase(this, _actionGroupsDefaultRoles)[_actionGroupsDefaultRoles] = actionGroupsDefaults;
	}
	function _canPerformActionByChatType2(rawActionType, dialogId) {
	  let actionType = rawActionType;
	  const dialog = babelHelpers.classPrivateFieldLooseBase(this, _getDialog)[_getDialog](dialogId);
	  const {
	    role: userRole,
	    owner: chatOwner
	  } = dialog;
	  let {
	    type: chatType
	  } = dialog;
	  if (main_core.Type.isUndefined(babelHelpers.classPrivateFieldLooseBase(this, _chatTypePermissions)[_chatTypePermissions][chatType])) {
	    chatType = DEFAULT_TYPE;
	  }

	  // for kick check if users can leave this type of chat
	  if (actionType === im_v2_const.ChatActionType.kick) {
	    actionType = im_v2_const.ChatActionType.leave;
	  }
	  const isOwner = chatOwner === im_v2_application_core.Core.getUserId();
	  if (actionType === im_v2_const.ChatActionType.leave && isOwner) {
	    actionType = im_v2_const.ChatActionType.leaveOwner;
	  }
	  if (main_core.Type.isUndefined(babelHelpers.classPrivateFieldLooseBase(this, _chatTypePermissions)[_chatTypePermissions][chatType][actionType])) {
	    return true;
	  }
	  const minimalRole = babelHelpers.classPrivateFieldLooseBase(this, _chatTypePermissions)[_chatTypePermissions][chatType][actionType];
	  return babelHelpers.classPrivateFieldLooseBase(this, _checkMinimalRole)[_checkMinimalRole](minimalRole, userRole);
	}
	function _canPerformActionByChatSettings2(actionType, dialogId) {
	  const {
	    role: userRole,
	    type: chatType,
	    permissions: chatPermissions
	  } = babelHelpers.classPrivateFieldLooseBase(this, _getDialog)[_getDialog](dialogId);
	  if (chatType === im_v2_const.DialogType.user) {
	    return true;
	  }
	  if (actionType === im_v2_const.ChatActionType.send) {
	    return babelHelpers.classPrivateFieldLooseBase(this, _checkMinimalRole)[_checkMinimalRole](chatPermissions.canPost, userRole);
	  }
	  const actionGroup = babelHelpers.classPrivateFieldLooseBase(this, _getGroupByAction)[_getGroupByAction](actionType);
	  if (!actionGroup) {
	    return true;
	  }
	  let minimalRoleForGroup = chatPermissions[actionGroup];
	  if (!minimalRoleForGroup) {
	    minimalRoleForGroup = im_v2_const.UserRole.member;
	  }
	  return babelHelpers.classPrivateFieldLooseBase(this, _checkMinimalRole)[_checkMinimalRole](minimalRoleForGroup, userRole);
	}
	function _getGroupByAction2(actionType) {
	  const searchResult = Object.entries(babelHelpers.classPrivateFieldLooseBase(this, _actionGroups)[_actionGroups]).find(([_, groupActions]) => {
	    return groupActions.includes(actionType);
	  });
	  if (!searchResult) {
	    return null;
	  }
	  const [groupName] = searchResult;
	  return groupName;
	}
	function _prepareChatTypePermissions2(permissionsByChatType) {
	  const preparedPermissions = {
	    ...permissionsByChatType
	  };
	  preparedPermissions[im_v2_const.DialogType.user] = {
	    [im_v2_const.ChatActionType.avatar]: im_v2_const.UserRole.none,
	    [im_v2_const.ChatActionType.call]: im_v2_const.UserRole.member,
	    [im_v2_const.ChatActionType.extend]: im_v2_const.UserRole.member,
	    [im_v2_const.ChatActionType.leave]: im_v2_const.UserRole.none,
	    [im_v2_const.ChatActionType.leaveOwner]: im_v2_const.UserRole.none,
	    [im_v2_const.ChatActionType.mute]: im_v2_const.UserRole.none,
	    [im_v2_const.ChatActionType.rename]: im_v2_const.UserRole.none,
	    [im_v2_const.ChatActionType.send]: im_v2_const.UserRole.member
	  };
	  return preparedPermissions;
	}
	function _checkMinimalRole2(minimalRole, roleToCheck) {
	  if (minimalRole === im_v2_const.UserRole.none) {
	    return false;
	  }
	  const roleWeights = {};
	  Object.values(im_v2_const.UserRole).forEach((role, index) => {
	    roleWeights[role] = index;
	  });
	  return roleWeights[roleToCheck] >= roleWeights[minimalRole];
	}
	function _canPerformKickByHierarchy2(dialogId, userId) {
	  const preparedUserId = Number.parseInt(userId, 10);
	  const {
	    role: userRole
	  } = babelHelpers.classPrivateFieldLooseBase(this, _getDialog)[_getDialog](dialogId);
	  const targetUserRole = babelHelpers.classPrivateFieldLooseBase(this, _getUserRole)[_getUserRole](dialogId, preparedUserId);
	  return babelHelpers.classPrivateFieldLooseBase(this, _checkMinimalRole)[_checkMinimalRole](targetUserRole, userRole);
	}
	function _getDialog2(dialogId) {
	  return im_v2_application_core.Core.getStore().getters['dialogues/get'](dialogId, true);
	}
	function _getUserRole2(dialogId, userId) {
	  const {
	    owner,
	    managerList
	  } = babelHelpers.classPrivateFieldLooseBase(this, _getDialog)[_getDialog](dialogId);
	  if (userId === owner) {
	    return im_v2_const.UserRole.owner;
	  }
	  if (managerList.includes(userId)) {
	    return im_v2_const.UserRole.manager;
	  }
	  return im_v2_const.UserRole.member;
	}
	Object.defineProperty(PermissionManager, _instance, {
	  writable: true,
	  value: void 0
	});

	exports.PermissionManager = PermissionManager;

}((this.BX.Messenger.v2.Lib = this.BX.Messenger.v2.Lib || {}),BX,BX.Messenger.v2.Application,BX.Messenger.v2.Lib,BX.Messenger.v2.Const));
//# sourceMappingURL=permission.bundle.js.map
