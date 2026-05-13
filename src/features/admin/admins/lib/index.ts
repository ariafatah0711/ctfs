export {
  getEventAdmins,
  getGlobalAdmins,
  grantEventAdmin,
  isGlobalAdmin,
  revokeEventAdmin,
  searchUsersByUsername,
} from '@/features/admin/services/admin.service'
export { getEvents } from '@/features/events/services/event.service'

export type { EventAdminRow, UserLite } from '@/features/admin/services/admin.service'
