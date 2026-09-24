// Column names on the Dataverse `gd_booking` table.
// After `pa app add data-source --connector dataverse --table gd_booking`, check these
// against src/generated/models/Gd_bookingsModel.ts and adjust if a name differs.
export const COLUMNS = {
  id: 'gd_bookingid',
  name: 'gd_name',
  start: 'gd_startdate',
  end: 'gd_enddate',
} as const

// Bookings starting within this many days are marked "binnenkort".
export const SOON_DAYS = 14
