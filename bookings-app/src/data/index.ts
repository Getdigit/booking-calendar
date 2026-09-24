import { dataverseRepo } from './dataverseRepo'
import { mockRepo } from './mockRepo'

export const isMock = import.meta.env.VITE_USE_MOCK === 'true'

export const bookingsRepo = isMock ? mockRepo : dataverseRepo
