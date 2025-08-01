const permissions = {
    admin: ['manager', 'financial', 'academic', 'state', 'center', 'teacher', 'cardadmin'],
    manager: ['state', 'center'],
    academic: ['teacher'],
};

const canManage = (userRole, targetRole) => {
    return permissions[userRole]?.includes(targetRole);
};

module.exports = { canManage };
