// ===== app/(Dashboard)/dept-head/components/CalendarView.tsx =====
'use client';

import React from 'react';
import PersonalCalendar from '@/app/components/calendars/PersonalCalendar';

/**
 * CalendarView Component
 * 
 * Wrapper component for the PersonalCalendar that can be used across all role dashboards.
 * This component provides a consistent interface for calendar functionality across:
 * - Employee Dashboard
 * - HR Employee Dashboard
 * - Department Head Dashboard
 * - HR Head Dashboard
 * - Admin Dashboard
 * 
 * Features:
 * - Personal calendar management
 * - Event creation and editing
 * - Multiple view modes (month, week, day)
 * - Event filtering and search
 * - Theme-aware styling with neon aesthetics
 */
export default function CalendarView() {
  return (
    <div className="w-full h-full">
      <PersonalCalendar />
    </div>
  );
}