// app/(Dashboard)/dept-head/components/HomeContent/NewAnnouncementForm.tsx
'use client';

import React, { useState } from 'react';
import { Calendar, X, AlertCircle, Paperclip, FileText, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Attachment } from './types';

interface NewAnnouncementFormProps {
  newTitle: string;
  setNewTitle: (title: string) => void;
  newContent: string;
  setNewContent: (content: string) => void;
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  expirationDate: string;
  setExpirationDate: (date: string) => void;
  attachments: Attachment[];
  setAttachments: (attachments: Attachment[]) => void;
  onCancel: () => void;
  onPost: () => void;
}

const colorOptions = [
  { value: '#0000FF', label: 'Royal Blue' },
  { value: '#FF0000', label: 'Bright Red' },
  { value: '#87CEEB', label: 'Sky Blue' },
  { value: '#DC143C', label: 'Crimson' },
  { value: '#6495ED', label: 'Cornflower Blue' },
  { value: '#000080', label: 'Navy Blue' },
  { value: '#FFD700', label: 'Gold' },
  { value: '#00FF00', label: 'Green' },
  { value: '#800080', label: 'Purple' },
  { value: '#FFA500', label: 'Orange' }
];

export default function NewAnnouncementForm({
  newTitle,
  setNewTitle,
  newContent,
  setNewContent,
  selectedColor,
  setSelectedColor,
  expirationDate,
  setExpirationDate,
  attachments,
  setAttachments,
  onCancel,
  onPost
}: NewAnnouncementFormProps) {
  const today = new Date().toISOString().split('T')[0];
  const [showCalendar, setShowCalendar] = useState(false);
  const [errors, setErrors] = useState({ title: false, content: false });

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
      className="mb-6 p-6 bg-gradient-to-br from-black/60 to-black/40 rounded-xl border-4 transition-all duration-300"
      style={{ borderColor: selectedColor }}
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-black text-white">New Announcement</h4>
        <button
          onClick={onCancel}
          className="p-1.5 hover:bg-white/20 rounded-lg transition-all"
        >
          <X className="h-5 w-5 text-white" />
        </button>
      </div>

      <div className="space-y-4">
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
            className={`w-full px-4 py-3 bg-black/40 backdrop-blur-sm border-2 rounded-xl text-white placeholder-white/50 focus:outline-none font-bold transition-all ${
              errors.title 
                ? 'border-[#FF0000] shadow-[0_0_10px_rgba(255,0,0,0.5)]' 
                : 'border-white/30 focus:border-[#0000FF]'
            }`}
          />
          {errors.title && (
            <div className="flex items-center gap-2 mt-2 text-[#FF0000] text-sm font-semibold">
              <AlertCircle className="h-4 w-4" />
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
            rows={4}
            className={`w-full px-4 py-3 bg-black/40 backdrop-blur-sm border-2 rounded-xl text-white placeholder-white/50 focus:outline-none font-semibold resize-none transition-all ${
              errors.content 
                ? 'border-[#FF0000] shadow-[0_0_10px_rgba(255,0,0,0.5)]' 
                : 'border-white/30 focus:border-[#0000FF]'
            }`}
          />
          {errors.content && (
            <div className="flex items-center gap-2 mt-2 text-[#FF0000] text-sm font-semibold">
              <AlertCircle className="h-4 w-4" />
              Content is required
            </div>
          )}
        </div>

        {/* Attachments */}
        <div>
          <label className="flex items-center gap-2 px-4 py-3 bg-black/40 hover:bg-black/60 border-2 border-white/30 hover:border-[#0000FF] rounded-xl text-white font-bold cursor-pointer transition-all w-fit">
            <Paperclip className="h-5 w-5" />
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
            <div className="mt-3 space-y-2">
              <p className="text-sm font-semibold text-white/80">
                {attachments.length} file{attachments.length !== 1 ? 's' : ''} attached
              </p>
              {attachments.map((attachment, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-white/20">
                  {attachment.type === 'image' ? (
                    <ImageIcon className="h-5 w-5 text-[#87CEEB]" />
                  ) : (
                    <FileText className="h-5 w-5 text-[#87CEEB]" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate font-semibold">{attachment.name}</p>
                    <p className="text-xs text-white/60">{formatFileSize(attachment.size)}</p>
                  </div>
                  <button
                    onClick={() => removeAttachment(idx)}
                    className="p-1.5 hover:bg-red-500/50 rounded transition-all"
                    title="Remove attachment"
                  >
                    <Trash2 className="h-4 w-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Color Selection */}
        <div>
          <label className="block text-sm font-bold text-white mb-2">Border Color</label>
          <div className="flex gap-3 flex-wrap">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                onClick={() => setSelectedColor(color.value)}
                className={`w-12 h-12 rounded-lg transition-all border-2 ${
                  selectedColor === color.value
                    ? 'border-white shadow-lg scale-110'
                    : 'border-white/30 hover:scale-105'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.label}
              />
            ))}
          </div>
        </div>

        {/* Calendar (keeping existing code) */}
        <div className="relative">
          <label className="block text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#87CEEB]" />
            Expiration Date (Optional - Expires at 5:00 PM)
          </label>
          
          <div className="flex gap-3 items-center">
            <button
              type="button"
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex-1 h-14 px-5 py-3 bg-black/60 backdrop-blur-sm border-2 border-[#0000FF] rounded-xl text-white font-semibold text-left transition-all hover:border-[#87CEEB] focus:outline-none"
              style={{
                boxShadow: '0 0 15px rgba(0, 0, 255, 0.3)'
              }}
            >
              <div className="flex items-center justify-between">
                <span className={expirationDate ? 'text-white' : 'text-white/50'}>
                  {getSelectedDateFormatted()}
                </span>
                <Calendar className="h-5 w-5 text-[#87CEEB]" />
              </div>
            </button>
            
            {expirationDate && (
              <button
                onClick={() => setExpirationDate('')}
                className="h-14 px-5 py-3 bg-[#FF0000]/20 hover:bg-[#FF0000]/30 border-2 border-[#FF0000]/60 rounded-xl text-white font-bold transition-all flex items-center gap-2"
                title="Clear expiration date"
              >
                <X className="h-5 w-5" />
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
                className="absolute z-50 mt-2 p-5 bg-[#0a0a0a] border-4 rounded-xl w-full max-w-sm shadow-2xl"
                style={{
                  borderColor: selectedColor,
                  boxShadow: `0 0 30px ${selectedColor}80`
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => changeMonth(-1)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all text-white font-bold text-xl"
                  >
                    ←
                  </button>
                  <span 
                    className="font-black text-lg"
                    style={{ color: selectedColor }}
                  >
                    {getMonthYear()}
                  </span>
                  <button
                    onClick={() => changeMonth(1)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all text-white font-bold text-xl"
                  >
                    →
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div 
                      key={day} 
                      className="text-center font-bold text-sm py-2"
                      style={{ color: selectedColor }}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
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
                          aspect-square p-2 rounded-lg text-sm font-semibold transition-all
                          ${!dayObj.isCurrentMonth ? 'text-white/20 cursor-default' : ''}
                          ${dayObj.isPast ? 'text-white/30 cursor-not-allowed line-through' : ''}
                          ${dayObj.isCurrentMonth && !dayObj.isPast ? 'text-white hover:bg-white/10 cursor-pointer' : ''}
                        `}
                        style={isSelected ? {
                          backgroundColor: selectedColor,
                          border: '2px solid white',
                          fontWeight: 'bold'
                        } : {}}
                      >
                        {dayObj.day}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t-2" style={{ borderColor: `${selectedColor}40` }}>
                  <button
                    onClick={() => {
                      setExpirationDate('');
                      setShowCalendar(false);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-semibold transition-all text-sm"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setShowCalendar(false)}
                    className="flex-1 px-4 py-2 rounded-lg text-white font-semibold transition-all text-sm"
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
              className="mt-3 p-3 border-2 rounded-lg"
              style={{ 
                backgroundColor: `${selectedColor}10`,
                borderColor: `${selectedColor}60`
              }}
            >
              <p className="text-sm font-semibold" style={{ color: selectedColor }}>
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
        <div className="flex gap-3 pt-2">
          <button
            onClick={handlePost}
            className="flex-1 px-6 py-3 rounded-xl text-white font-bold transition-all border-2"
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
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-white font-bold transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}