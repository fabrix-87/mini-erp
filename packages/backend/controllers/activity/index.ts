// ============================================================================
// ACTIVITY CONTTROLLER - Main Export
// ============================================================================

// Activity
export { getAllActivities } from './activity-controller'
export { getActivityById } from './activity-controller'
export { createActivity } from './activity-controller'
export { updateActivity } from './activity-controller'
export { updateActivityStatus } from './activity-controller'
export { completeActivity } from './activity-controller'
export { deleteActivity } from './activity-controller'
export { getActivityStats } from './activity-controller'

// Partecipant
export { getActivityParticipants } from './activity-participant-controller'
export { addActivityParticipant } from './activity-participant-controller'
export { updateActivityParticipant } from './activity-participant-controller'
export { removeActivityParticipant } from './activity-participant-controller'
export { addBulkParticipants } from './activity-participant-controller'

// Template
export { getAllActivityTemplates } from './activity-template-controller'
export { getActivityTemplateById } from './activity-template-controller'
export { createActivityTemplate } from './activity-template-controller'
export { updateActivityTemplate } from './activity-template-controller'
export { deleteActivityTemplate } from './activity-template-controller'
export { createActivityFromTemplate } from './activity-template-controller'
export { toggleTemplateActive } from './activity-template-controller'