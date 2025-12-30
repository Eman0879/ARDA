// app/utils/calendarSync.ts

import CalendarEvent from '@/models/CalendarEvent';

interface Assignee {
  employeeId: string;
  name: string;
  email: string;
}

interface CalendarSyncOptions {
  title: string;
  description: string;
  type: 'sprint' | 'project' | 'task';
  startDate?: Date;
  dueDate?: Date;
  assignees: Assignee[];
  createdBy?: {
    employeeId: string;
    name: string;
    email: string;
  };
  customColor?: string; // Allow custom color to be passed
}

/**
 * Creates calendar events for all assignees of a sprint/project/task
 */
export async function createCalendarEventsForAssignees(options: CalendarSyncOptions) {
  const { title, description, type, startDate, dueDate, assignees, createdBy, customColor } = options;
  
  // Determine the appropriate calendar event type
  const calendarType = type === 'task' ? 'task' : 'deadline';
  
  // Use custom color if provided, otherwise use default color based on type
  const defaultColorMap = {
    sprint: '#FF6B6B',    // Red for sprints
    project: '#4ECDC4',   // Teal for projects
    task: '#95E1D3'       // Light teal for tasks
  };
  const color = customColor || defaultColorMap[type];
  
  console.log(`🎨 Calendar color for ${type} "${title}":`, {
    customColor,
    finalColor: color,
    hasCustomColor: !!customColor
  });
  
  // Include creator in the list of people to get calendar events
  const allUsers = [...assignees];
  if (createdBy && !assignees.find(a => a.employeeId === createdBy.employeeId)) {
    allUsers.push(createdBy);
  }
  
  // Create calendar events for each assignee
  const calendarEvents = [];
  
  for (const assignee of allUsers) {
    try {
      // Handle single day event (start and due date are the same)
      if (dueDate && startDate && isSameDay(new Date(startDate), new Date(dueDate))) {
        const event = await CalendarEvent.create({
          userId: assignee.employeeId,
          username: assignee.name,
          title: `${title} - Due Today`,
          description: description || `${type.charAt(0).toUpperCase() + type.slice(1)}: ${title}`,
          type: calendarType,
          startDate: new Date(dueDate),
          endDate: null,
          startTime: null,
          endTime: null,
          color,
          isAllDay: true,
          completed: false,
          reminder: {
            enabled: true,
            minutesBefore: 60 // 1 hour before
          }
        });
        calendarEvents.push(event);
      } 
      // Handle date range or single due date
      else if (dueDate) {
        // If there's a start date and it's different from due date, create two events
        if (startDate && !isSameDay(new Date(startDate), new Date(dueDate))) {
          // Start event
          const startEvent = await CalendarEvent.create({
            userId: assignee.employeeId,
            username: assignee.name,
            title: `${title} - Start`,
            description: description || `${type.charAt(0).toUpperCase() + type.slice(1)} starts: ${title}`,
            type: 'reminder',
            startDate: new Date(startDate),
            endDate: null,
            startTime: null,
            endTime: null,
            color,
            isAllDay: true,
            completed: false,
            reminder: {
              enabled: true,
              minutesBefore: 60
            }
          });
          calendarEvents.push(startEvent);
        }
        
        // Due date event
        const dueEvent = await CalendarEvent.create({
          userId: assignee.employeeId,
          username: assignee.name,
          title: `${title} - Due`,
          description: description || `${type.charAt(0).toUpperCase() + type.slice(1)} due: ${title}`,
          type: calendarType,
          startDate: new Date(dueDate),
          endDate: null,
          startTime: null,
          endTime: null,
          color,
          isAllDay: true,
          completed: false,
          reminder: {
            enabled: true,
            minutesBefore: 60
          }
        });
        calendarEvents.push(dueEvent);
      }
      // Only start date provided
      else if (startDate) {
        const event = await CalendarEvent.create({
          userId: assignee.employeeId,
          username: assignee.name,
          title: `${title} - Start`,
          description: description || `${type.charAt(0).toUpperCase() + type.slice(1)}: ${title}`,
          type: 'reminder',
          startDate: new Date(startDate),
          endDate: null,
          startTime: null,
          endTime: null,
          color,
          isAllDay: true,
          completed: false,
          reminder: {
            enabled: true,
            minutesBefore: 60
          }
        });
        calendarEvents.push(event);
      }
    } catch (error) {
      console.error(`Error creating calendar event for ${assignee.name}:`, error);
      // Continue with other assignees even if one fails
    }
  }
  
  return calendarEvents;
}

/**
 * Updates calendar events when a sprint/project/task is updated
 */
export async function updateCalendarEventsForItem(
  itemId: string,
  itemType: 'sprint' | 'project' | 'task',
  options: CalendarSyncOptions
) {
  console.log(`🔄 Updating calendar events for ${itemType} ${itemId}`);
  
  // Delete old calendar events related to this item
  await deleteCalendarEventsForItem(itemId, itemType);
  
  // Create new calendar events with updated data (WITH TRACKING)
  return await createCalendarEventsWithTracking(itemId, options);
}

/**
 * Deletes calendar events associated with a sprint/project/task
 */
export async function deleteCalendarEventsForItem(
  itemId: string,
  itemType: 'sprint' | 'project' | 'task'
) {
  try {
    // We'll store the item reference in the description for tracking
    // Delete events that have this reference
    // Escape special regex characters in the pattern
    const searchPattern = `\\[${itemType}-${itemId}\\]`;
    
    console.log(`🗑️  Attempting to delete calendar events for ${itemType} ${itemId}`);
    console.log(`🔍 Search pattern: ${searchPattern}`);
    
    // First, let's see what events exist with this pattern
    const existingEvents = await CalendarEvent.find({
      description: { $regex: searchPattern }
    });
    
    console.log(`📋 Found ${existingEvents.length} events to delete`);
    
    const result = await CalendarEvent.deleteMany({
      description: { $regex: searchPattern }
    });
    
    console.log(`✅ Deleted ${result.deletedCount} calendar events`);
    
    return result;
  } catch (error) {
    console.error(`Error deleting calendar events for ${itemType} ${itemId}:`, error);
    return null;
  }
}

/**
 * Helper function to check if two dates are the same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Enhanced version that includes item reference for tracking
 */
export async function createCalendarEventsWithTracking(
  itemId: string,
  options: CalendarSyncOptions
) {
  const { title, description, type, startDate, dueDate, assignees, createdBy } = options;
  
  // Add tracking reference to description
  const trackingRef = `[${type}-${itemId}]`;
  const enhancedDescription = description 
    ? `${description}\n\n${trackingRef}`
    : `${type.charAt(0).toUpperCase() + type.slice(1)}: ${title}\n\n${trackingRef}`;
  
  return await createCalendarEventsForAssignees({
    ...options,
    description: enhancedDescription
  });
}