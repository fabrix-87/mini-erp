// ============================================================================
// ACTIVITY CONTTROLLER - Main Export
// ============================================================================

// Activity
export { getAllActivities } from './activity/activity'
export { getActivityById } from './activity/activity'
export { createActivity } from './activity/activity'
export { updateActivity } from './activity/activity'
export { updateActivityStatus } from './activity/activity'
export { completeActivity } from './activity/activity'
export { deleteActivity } from './activity/activity'
export { getActivityStats } from './activity/activity'

// Partecipant
export { getActivityParticipants } from './activity/partecipant'
export { addActivityParticipant } from './activity/partecipant'
export { updateActivityParticipant } from './activity/partecipant'
export { removeActivityParticipant } from './activity/partecipant'
export { addBulkParticipants } from './activity/partecipant'

// Template
export { getAllActivityTemplates } from './activity/template'
export { getActivityTemplateById } from './activity/template'
export { createActivityTemplate } from './activity/template'
export { updateActivityTemplate } from './activity/template'
export { deleteActivityTemplate } from './activity/template'
export { createActivityFromTemplate } from './activity/template'
export { toggleTemplateActive } from './activity/template'