/**
 * WAYPOINT Calendar Integration
 *
 * Uses expo-calendar to integrate with native calendar apps:
 * - iOS: iCloud Calendar, Google Calendar (if added to device), Exchange/Outlook
 * - Android: Google Calendar, Exchange accounts
 *
 * All events are created as private and tagged with WAYPOINT notes.
 */

import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';
import { addDays, format, nextSunday, parseISO, startOfDay } from 'date-fns';

import { colors } from './theme';

const WAYPOINT_CALENDAR_NAME = 'WAYPOINT';
const WAYPOINT_NOTE_SUFFIX = 'Created by WAYPOINT.';

const MILESTONE_EVENTS = [
  {
    day: 7,
    title: 'WAYPOINT: First week reflection',
    notes: 'Check in with your goals. Review Day 1-7 in WAYPOINT.',
  },
  {
    day: 14,
    title: 'WAYPOINT: Two weeks in',
    notes: "Who haven't you met yet that you should? Review your stakeholder map.",
  },
  {
    day: 30,
    title: 'WAYPOINT: 30-day milestone 🎯',
    notes: 'Time for your first milestone report. Open WAYPOINT to generate it.',
  },
  {
    day: 45,
    title: 'WAYPOINT: Midpoint check',
    notes: 'Are your early wins landing? How is Phase 2 going?'
  },
  {
    day: 60,
    title: 'WAYPOINT: 60-day milestone 🎯',
    notes: 'Phase 2 complete. Open WAYPOINT for your 60-day report.',
  },
  {
    day: 75,
    title: 'WAYPOINT: Final stretch',
    notes: 'What will your 90-day story be? Two weeks to shape it.',
  },
  {
    day: 90,
    title: 'WAYPOINT: 90-day milestone 🎉',
    notes: 'You made it. Open WAYPOINT for your final report.',
  },
];

function withWaypointNote(notes: string): string {
  if (notes.includes(WAYPOINT_NOTE_SUFFIX)) {
    return notes;
  }
  return `${notes}\n\n${WAYPOINT_NOTE_SUFFIX}`;
}

/**
 * Request calendar (and reminders on iOS) permissions.
 */
export async function requestCalendarPermissions(): Promise<{ granted: boolean }> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  const granted = status === 'granted';

  if (granted && Platform.OS === 'ios') {
    const { status: remindersStatus } = await Calendar.requestRemindersPermissionsAsync();
    void remindersStatus;
  }

  return { granted };
}

/**
 * Check if calendar permission is already granted (no prompt).
 */
export async function hasCalendarPermission(): Promise<boolean> {
  const { status } = await Calendar.getCalendarPermissionsAsync();
  return status === 'granted';
}

/**
 * Get all available calendars the user can write to.
 */
export async function getAvailableCalendars(): Promise<Calendar.Calendar[]> {
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  return calendars.filter((calendar) => calendar.allowsModifications);
}

async function findWaypointCalendarId(): Promise<string | null> {
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const existing = calendars.find(
    (calendar) => calendar.title === WAYPOINT_CALENDAR_NAME && calendar.allowsModifications,
  );
  return existing?.id ?? null;
}

async function getDefaultCalendarSource(): Promise<Calendar.Source> {
  if (Platform.OS === 'ios') {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const preferredSource = calendars.find(
      (calendar) =>
        calendar.source &&
        (calendar.source.type === Calendar.SourceType.CALDAV ||
          calendar.source.type === Calendar.SourceType.LOCAL),
    )?.source;

    if (preferredSource) {
      return preferredSource;
    }

    if (calendars.length > 0 && calendars[0].source) {
      return calendars[0].source;
    }
  }

  return {
    isLocalAccount: true,
    name: WAYPOINT_CALENDAR_NAME,
    type: 'local',
  } as Calendar.Source;
}

/**
 * Create a dedicated WAYPOINT calendar.
 * Returns the calendar ID.
 */
export async function createWaypointCalendar(): Promise<string> {
  const existing = await findWaypointCalendarId();
  if (existing) return existing;

  const source = await getDefaultCalendarSource();

  const calendarId = await Calendar.createCalendarAsync({
    title: WAYPOINT_CALENDAR_NAME,
    color: colors.accent,
    entityType: Calendar.EntityTypes.EVENT,
    source,
    name: WAYPOINT_CALENDAR_NAME,
    ownerAccount: 'personal',
    accessLevel: Calendar.CalendarAccessLevel.OWNER,
  });

  return calendarId;
}

/**
 * Get or create the WAYPOINT calendar.
 */
export async function getOrCreateWaypointCalendar(): Promise<string> {
  return (await findWaypointCalendarId()) ?? createWaypointCalendar();
}

/**
 * Create a single calendar event.
 * Returns event ID.
 */
export async function createCalendarEvent(params: {
  calendarId: string;
  title: string;
  notes: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
}): Promise<string> {
  const eventId = await Calendar.createEventAsync(params.calendarId, {
    title: params.title,
    startDate: params.startDate,
    endDate: params.endDate,
    notes: withWaypointNote(params.notes),
    accessLevel: Calendar.EventAccessLevel.PRIVATE,
    availability: Calendar.Availability.FREE,
    allDay: params.allDay ?? false,
  });

  return eventId;
}

/**
 * Schedule all 7 milestone reminders.
 */
export async function scheduleMilestoneEvents(params: {
  calendarId: string;
  startDate: string;
}): Promise<string[]> {
  const start = startOfDay(parseISO(params.startDate));
  const eventIds: string[] = [];

  for (const milestone of MILESTONE_EVENTS) {
    const eventDate = addDays(start, milestone.day - 1);
    const startTime = new Date(eventDate);
    startTime.setHours(9, 0, 0, 0);
    const endTime = new Date(eventDate);
    endTime.setHours(9, 30, 0, 0);

    const eventId = await createCalendarEvent({
      calendarId: params.calendarId,
      title: milestone.title,
      notes: milestone.notes,
      startDate: startTime,
      endDate: endTime,
      allDay: false,
    });
    eventIds.push(eventId);
  }

  return eventIds;
}

/**
 * Schedule weekly review events every Sunday at 18:00 for 13 weeks.
 */
export async function scheduleWeeklyReviewEvents(params: {
  calendarId: string;
  startDate: string;
}): Promise<string[]> {
  const start = startOfDay(parseISO(params.startDate));
  const firstSunday = start.getDay() === 0 ? start : nextSunday(start);
  const eventIds: string[] = [];

  for (let week = 0; week < 13; week += 1) {
    const sunday = addDays(firstSunday, week * 7);
    const startTime = new Date(sunday);
    startTime.setHours(18, 0, 0, 0);
    const endTime = new Date(sunday);
    endTime.setHours(18, 30, 0, 0);

    const eventId = await createCalendarEvent({
      calendarId: params.calendarId,
      title: 'WAYPOINT: Weekly reflection',
      notes: 'Take 5 minutes to review your week. Open WAYPOINT and complete this week\'s reflection.',
      startDate: startTime,
      endDate: endTime,
      allDay: false,
    });
    eventIds.push(eventId);
  }

  return eventIds;
}

/**
 * Add a goal deadline to calendar (all-day).
 */
export async function addGoalToCalendar(params: {
  calendarId: string;
  goalText: string;
  targetDate: Date;
}): Promise<string> {
  const startDate = startOfDay(params.targetDate);
  const endDate = addDays(startDate, 1);
  const targetLabel = format(startDate, 'd MMM yyyy');

  return await createCalendarEvent({
    calendarId: params.calendarId,
    title: `WAYPOINT Goal: ${params.goalText}`,
    notes: `Goal deadline set in WAYPOINT for ${targetLabel}.\n\nGoal: ${params.goalText}`,
    startDate,
    endDate,
    allDay: true,
  });
}

/**
 * Add a people follow-up reminder.
 */
export async function addFollowUpReminder(params: {
  calendarId: string;
  personName: string;
  followUpDate: Date;
}): Promise<string> {
  const startTime = new Date(params.followUpDate);
  startTime.setHours(9, 0, 0, 0);
  const endTime = new Date(params.followUpDate);
  endTime.setHours(9, 30, 0, 0);
  const followUpLabel = format(params.followUpDate, 'd MMM yyyy');

  return await createCalendarEvent({
    calendarId: params.calendarId,
    title: `WAYPOINT: Follow up with ${params.personName}`,
    notes: `Follow-up reminder for ${params.personName} on ${followUpLabel}.`,
    startDate: startTime,
    endDate: endTime,
    allDay: false,
  });
}

/**
 * Delete a calendar event by ID.
 */
export async function deleteCalendarEvent(eventId: string): Promise<void> {
  await Calendar.deleteEventAsync(eventId);
}
