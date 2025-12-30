// app/components/OrgAnnouncements/OrgAnnouncementForm.tsx
'use client';

import React, { useState } from 'react';
import { Calendar, X, AlertCircle, Paperclip, FileText, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Attachment } from '../DeptHeadAnnouncements/types';
import { useTheme } from '@/app/context/ThemeContext';

interface OrgAnnouncementFormProps {
  newTitle: string;
  setNewTitle: (title: string) => void;
  newContent: string;
  setNewContent: (content: string) => void;
  expirationDate: string;
  setExpirationDate: (date: string) => void;
  attachments: Attachment[];
  setAttachments: (attachments: Attachment[]) => void;
  onCancel: () => void;
  onPost: () => void;
}

export default function OrgAnnouncementForm({
  newTitle,
  setNewTitle,
  newContent,
  setNewContent,
  expirationDate,
  setExpirationDate,
  attachments,
  setAttachments,
  onCancel,
  onPost
}: OrgAnnouncementFormProps) {
  const { colors } = useTheme();
  const [showCalendar, setShowCalendar] = useState(false);
  const [errors, setErrors] = useState({ title: false, content: false });
  const selectedColor = '#FF0000'; // Always red for org announcements

  const handlePost = () => {
    const newErrors = {
      title: !newTitle.trim(),
      content: !newContent.trim()
    };
    
    setErrors(newErrors);
    
    if (!newErrors.title && !newErrors.content) {
      onPost();
      setErrors({ title: false, content: false });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newAttachment: Attachment = {
          name: file.name,
          url: event.target?.result as string,
          type: file.type.startsWith('image/') ? 'image' : 'document',
          size: file.size,
          uploadedAt: new Date().toISOString()
        };
        setAttachments([...attachments, newAttachment]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const generateCalendarDays = () => {
    const [year, month] = expirationDate ? expirationDate.split('-').map(Number) : 
                          [new Date().getFullYear(), new Date().getMonth() + 1];
    
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const prevLastDay = new Date(year, month - 1, 0);
    
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const daysInPrevMonth = prevLastDay.getDate();
    
    const days = [];
    
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, isCurrentMonth: false, isPast: true });
    }
    
    const todayDate = new Date();
    const todayDay = todayDate.getDate();
    const todayMonth = todayDate.getMonth() + 1;
    const todayYear = todayDate.getFullYear();
    
    for (let i = 1; i <= daysInMonth; i++) {
      const isPast = year < todayYear || 
                     (year === todayYear && month < todayMonth) || 
                     (year === todayYear && month === todayMonth && i < todayDay);
      days.push({ day: i, isCurrentMonth: true, isPast });
    }
    
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false, isPast: false });
    }
    
    return days;
  };

  const handleDateSelect = (day: number, isCurrentMonth: boolean, isPast: boolean) => {
    if (isPast || !isCurrentMonth) return;
    
    const [year, month] = expirationDate ? expirationDate.split('-').map(Number) : 
                          [new Date().getFullYear(), new Date().getMonth() + 1];
    
    const selectedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setExpirationDate(selectedDate);
    setShowCalendar(false);
  };

  const changeMonth = (delta: number) => {
    const [year, month] = expirationDate ? expirationDate.split('-').map(Number) : 
                          [new Date().getFullYear(), new Date().getMonth() + 1];
    
    let newMonth = month + delta;
    let newYear = year;
    
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    
    setExpirationDate(`${newYear}-${String(newMonth).padStart(2, '0')}-01`);
  };

  const getMonthYear = () => {
    const [year, month] = expirationDate ? expirationDate.split('-').map(Number) : 
                          [new Date().getFullYear(), new Date().getMonth() + 1];
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getSelectedDateFormatted = () => {
    if (!expirationDate) return 'Select expiration date';
    const date = new Date(expirationDate + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div 
      className={`mb-4 p-4 bg-gradient-to-br ${colors.cardBg} backdrop-blur-lg rounded-xl border-3 transition-all duration-300`}
      style={{ borderColor: selectedColor }}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className={`text-base font-black ${colors.textPrimary}`}>New Organization Announcement</h4>
        <button
          onClick={onCancel}
          className={`p-1 hover:${colors.sidebarItemBgHover} rounded-lg transition-all`}
        >
          <X className={`h-4 w-4 ${colors.textPrimary}`} />
        </button>
      </div>

      <div className="space-y-3">
        {/* Title Input */}
        <div>
          <input
            type="text"
            placeholder="Announcement Title"
            value={newTitle}
            onChange={(e) => {
              setNewTitle(e.target.value);
              if (errors.title) setErrors({ ...errors, title: false });
            }}
            className={`w-full px-3 py-2 ${colors.inputBg} backdrop-blur-sm border-2 rounded-lg ${colors.textPrimary} placeholder-gray-400 focus:outline-none font-bold transition-all text-sm ${
              errors.title 
                ? 'border-[#FFD700] shadow-[0_0_8px_rgba(255,215,0,0.5)]' 
                : `${colors.inputBorder} focus:border-[#FF0000]`
            }`}
          />
          {errors.title && (
            <div className="flex items-center gap-1.5 mt-1.5 text-[#FFD700] text-xs font-semibold">
              <AlertCircle className="h-3 w-3" />
              Title is required
            </div>
          )}
        </div>

        {/* Content Textarea */}
        <div>
          <textarea
            placeholder="Announcement Content"
            value={newContent}
            onChange={(e) => {
              setNewContent(e.target.value);
              if (errors.content) setErrors({ ...errors, content: false });
            }}
            rows={3}
            className={`w-full px-3 py-2 ${colors.inputBg} backdrop-blur-sm border-2 rounded-lg ${colors.textPrimary} placeholder-gray-400 focus:outline-none font-semibold resize-none transition-all text-sm ${
              errors.content 
                ? 'border-[#FFD700] shadow-[0_0_8px_rgba(255,215,0,0.5)]' 
                : `${colors.inputBorder} focus:border-[#FF0000]`
            }`}
          />
          {errors.content && (
            <div className="flex items-center gap-1.5 mt-1.5 text-[#FFD700] text-xs font-semibold">
              <AlertCircle className="h-3 w-3" />
              Content is required
            </div>
          )}
        </div>

        {/* Attachments */}
        <div>
          <label className={`flex items-center gap-2 px-3 py-2 ${colors.inputBg} hover:${colors.inputFocusBg} border-2 ${colors.inputBorder} hover:border-[#FF0000] rounded-lg ${colors.textPrimary} font-bold cursor-pointer transition-all w-fit text-sm`}>
            <Paperclip className="h-4 w-4" />
            Add Attachments
            <input
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          
          {attachments.length > 0 && (
            <div className="mt-2 space-y-1.5">
              <p className={`text-xs font-semibold ${colors.textSecondary}`}>
                {attachments.length} file{attachments.length !== 1 ? 's' : ''} attached
              </p>
              {attachments.map((attachment, idx) => (
                <div key={idx} className={`flex items-center gap-2 p-2 ${colors.glassBg} rounded-lg border ${colors.border}`}>
                  {attachment.type === 'image' ? (
                    <ImageIcon className={`h-4 w-4 ${colors.textAccent}`} />
                  ) : (
                    <FileText className={`h-4 w-4 ${colors.textAccent}`} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs ${colors.textPrimary} truncate font-semibold`}>{attachment.name}</p>
                    <p className={`text-[10px] ${colors.textMuted}`}>{formatFileSize(attachment.size)}</p>
                  </div>
                  <button
                    onClick={() => removeAttachment(idx)}
                    className="p-1 hover:bg-red-500/50 rounded transition-all"
                    title="Remove attachment"
                  >
                    <Trash2 className={`h-3 w-3 ${colors.textPrimary}`} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calendar */}
        <div className="relative">
          <label className={`block text-xs font-bold ${colors.textPrimary} mb-2 flex items-center gap-1.5`}>
            <Calendar className="h-4 w-4" style={{ color: selectedColor }} />
            Expiration Date (Optional - Expires at 5:00 PM)
          </label>
          
          <div className="flex gap-2 items-center">
            <button
              type="button"
              onClick={() => setShowCalendar(!showCalendar)}
              className={`flex-1 h-10 px-3 py-2 ${colors.inputBg} backdrop-blur-sm border-2 rounded-lg ${colors.textPrimary} font-semibold text-left transition-all hover:opacity-80 focus:outline-none text-sm`}
              style={{
                borderColor: selectedColor,
                boxShadow: `0 0 10px ${selectedColor}50`
              }}
            >
              <div className="flex items-center justify-between">
                <span className={expirationDate ? colors.textPrimary : colors.textMuted}>
                  {getSelectedDateFormatted()}
                </span>
                <Calendar className="h-4 w-4" style={{ color: selectedColor }} />
              </div>
            </button>
            
            {expirationDate && (
              <button
                onClick={() => setExpirationDate('')}
                className={`h-10 px-3 py-2 ${colors.sidebarItemBg} hover:${colors.sidebarItemBgHover} border-2 ${colors.border} rounded-lg ${colors.textPrimary} font-bold transition-all flex items-center gap-1.5 text-sm`}
                title="Clear expiration date"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            )}
          </div>

          {showCalendar && (
            <>
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setShowCalendar(false)}
              />
              
              <div 
                className={`absolute z-50 mt-2 p-3 ${colors.cardBg} backdrop-blur-xl border-3 rounded-lg w-full max-w-sm shadow-2xl`}
                style={{
                  borderColor: selectedColor,
                  boxShadow: `0 0 20px ${selectedColor}80`
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => changeMonth(-1)}
                    className={`p-1.5 hover:${colors.sidebarItemBgHover} rounded-lg transition-all ${colors.textPrimary} font-bold text-lg`}
                  >
                    ←
                  </button>
                  <span 
                    className="font-black text-sm"
                    style={{ color: selectedColor }}
                  >
                    {getMonthYear()}
                  </span>
                  <button
                    onClick={() => changeMonth(1)}
                    className={`p-1.5 hover:${colors.sidebarItemBgHover} rounded-lg transition-all ${colors.textPrimary} font-bold text-lg`}
                  >
                    →
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-0.5 mb-1.5">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div 
                      key={day} 
                      className="text-center font-bold text-[10px] py-1"
                      style={{ color: selectedColor }}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-0.5">
                  {generateCalendarDays().map((dayObj, idx) => {
                    const isSelected = expirationDate && 
                      parseInt(expirationDate.split('-')[2]) === dayObj.day && 
                      dayObj.isCurrentMonth;
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => handleDateSelect(dayObj.day, dayObj.isCurrentMonth, dayObj.isPast)}
                        disabled={dayObj.isPast || !dayObj.isCurrentMonth}
                        className={`
                          aspect-square p-1 rounded-md text-xs font-semibold transition-all
                          ${!dayObj.isCurrentMonth ? `${colors.textMuted} opacity-30 cursor-default` : ''}
                          ${dayObj.isPast ? `${colors.textMuted} opacity-50 cursor-not-allowed line-through` : ''}
                          ${dayObj.isCurrentMonth && !dayObj.isPast ? `${colors.textPrimary} hover:${colors.sidebarItemBgHover} cursor-pointer` : ''}
                        `}
                        style={isSelected ? {
                          backgroundColor: selectedColor,
                          border: '2px solid white',
                          fontWeight: 'bold',
                          color: 'white'
                        } : {}}
                      >
                        {dayObj.day}
                      </button>
                    );
                  })}
                </div>

                <div className={`flex gap-1.5 mt-3 pt-3 border-t-2`} style={{ borderColor: `${selectedColor}40` }}>
                  <button
                    onClick={() => {
                      setExpirationDate('');
                      setShowCalendar(false);
                    }}
                    className={`flex-1 px-3 py-1.5 ${colors.sidebarItemBg} hover:${colors.sidebarItemBgHover} rounded-lg ${colors.textPrimary} font-semibold transition-all text-xs`}
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setShowCalendar(false)}
                    className="flex-1 px-3 py-1.5 rounded-lg text-white font-semibold transition-all text-xs"
                    style={{
                      backgroundColor: selectedColor,
                      opacity: 0.9
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}
                  >
                    Done
                  </button>
                </div>
              </div>
            </>
          )}

          {expirationDate && (
            <div 
              className="mt-2 p-2 border-2 rounded-lg"
              style={{ 
                backgroundColor: `${selectedColor}10`,
                borderColor: `${selectedColor}60`
              }}
            >
              <p className="text-xs font-semibold" style={{ color: selectedColor }}>
                ⏰ Expires at 5:00 PM on {new Date(expirationDate + 'T00:00:00').toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-1.5">
          <button
            onClick={handlePost}
            className="flex-1 px-4 py-2 rounded-lg text-white font-bold transition-all border-2 text-sm"
            style={{
              backgroundColor: selectedColor,
              borderColor: selectedColor,
              opacity: 0.9
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}
          >
            Post Announcement
          </button>
          <button
            onClick={onCancel}
            className={`px-4 py-2 ${colors.sidebarItemBg} hover:${colors.sidebarItemBgHover} rounded-lg ${colors.textPrimary} font-bold transition-all text-sm`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}