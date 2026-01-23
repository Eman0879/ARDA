// app/components/ProjectManagement/depthead/SprintChatTab.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import {
  MessageSquare,
  Send,
  Loader2,
  Paperclip,
  X,
  Download,
  FileText,
  Image as ImageIcon,
  File
} from 'lucide-react';

interface Attachment {
  name: string;
  data: string;
  type: string;
  size: number;
}

interface SprintChatTabProps {
  sprint: any;
  userId: string;
  userName: string;
  onUpdate: () => void;
}

export default function SprintChatTab({
  sprint,
  userId,
  userName,
  onUpdate
}: SprintChatTabProps) {
  const { colors, cardCharacters, showToast } = useTheme();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Scroll to bottom when chat updates
    if (sprint.chat?.length > 0) {
      scrollToBottom();
    }
  }, [sprint.chat?.length]);

  useEffect(() => {
    // Also scroll when the actual content changes
    scrollToBottom();
  }, [sprint.chat]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    const fileArray = Array.from(files);
    
    const processedFiles = await Promise.all(
      fileArray.map((file) => {
        return new Promise<Attachment | null>((resolve) => {
          if (file.size > maxSize) {
            showToast(`File ${file.name} exceeds 10MB limit`, 'warning');
            resolve(null);
            return;
          }

          const reader = new FileReader();
          reader.onload = (event) => {
            const base64Data = event.target?.result as string;
            resolve({
              name: file.name,
              data: base64Data.split(',')[1],
              type: file.type,
              size: file.size
            });
          };
          reader.onerror = () => {
            showToast(`Failed to read file ${file.name}`, 'error');
            resolve(null);
          };
          reader.readAsDataURL(file);
        });
      })
    );

    const validFiles = processedFiles.filter((f): f is Attachment => f !== null);
    
    if (validFiles.length > 0) {
      setAttachments((prev) => [...prev, ...validFiles]);
      showToast(`${validFiles.length} file(s) attached`, 'success');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if ((!message.trim() && attachments.length === 0) || sending) return;

    try {
      setSending(true);
      
      const response = await fetch('/api/ProjectManagement/depthead/sprints/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sprintId: sprint._id,
          userId,
          userName,
          message: message.trim() || '📎 Attachment(s)',
          attachments: attachments.length > 0 ? attachments : undefined
        })
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      showToast('Message sent successfully', 'success');
      setMessage('');
      setAttachments([]);
      onUpdate();
    } catch (error) {
      console.error('Failed to send message:', error);
      showToast('Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
      return <ImageIcon className="w-5 h-5" />;
    }
    if (['pdf'].includes(ext || '')) {
      return <FileText className="w-5 h-5" />;
    }
    return <File className="w-5 h-5" />;
  };

  const getAttachmentUrl = (attachmentPath: string): string => {
    return `/api/download?path=${encodeURIComponent(attachmentPath)}`;
  };

  const getCleanFilename = (path: string): string => {
    const filename = path.split(/[\\\/]/).pop() || path;
    // Remove timestamp prefix if present
    return filename.replace(/^\d+_/, '');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-black ${colors.textPrimary} flex items-center gap-2`}>
          <MessageSquare className="w-5 h-5" />
          Sprint Chat
        </h3>
        <span className={`text-sm ${colors.textMuted}`}>
          {sprint.chat?.length || 0} message{(sprint.chat?.length || 0) !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Messages Container - Chat Bubbles Style */}
      <div className={`relative overflow-hidden rounded-xl border ${colors.border} ${colors.cardBg} p-4`}>
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
        
        <div className="relative space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2" style={{ minHeight: '200px' }}>
          {sprint.chat?.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className={`w-16 h-16 mx-auto mb-4 ${colors.textMuted} opacity-30`} />
              <p className={`${colors.textPrimary} font-bold mb-2`}>
                No messages yet
              </p>
              <p className={`${colors.textMuted} text-sm`}>
                Start the conversation!
              </p>
            </div>
          ) : (
            <>
              {sprint.chat.map((msg: any, index: number) => {
                const isCurrentUser = msg.userId === userId || msg.userName === userName;
                
                return (
                  <div
                    key={index}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-2`}
                  >
                    <div
                      className={`group relative overflow-hidden rounded-2xl transition-all max-w-[70%] ${
                        isCurrentUser
                          ? `bg-gradient-to-br ${cardCharacters.interactive.bg} border-2 ${cardCharacters.interactive.border} ml-auto`
                          : `${colors.inputBg} border-2 ${colors.border} mr-auto`
                      }`}
                      style={{ 
                        borderRadius: isCurrentUser 
                          ? '20px 20px 4px 20px' 
                          : '20px 20px 20px 4px' 
                      }}
                    >
                      <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
                      
                      <div className="relative p-3">
                        {/* Message Header */}
                        <div className="flex items-center justify-between gap-3 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${
                              isCurrentUser ? cardCharacters.interactive.text : colors.textPrimary
                            }`}>
                              {msg.userName}
                            </span>
                            {isCurrentUser && (
                              <span className={`text-xs px-1.5 py-0.5 rounded ${colors.badge} ${colors.badgeText}`}>
                                You
                              </span>
                            )}
                          </div>
                          <span className={`text-xs ${colors.textMuted} whitespace-nowrap`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        
                        {/* Message Text */}
                        {msg.message && (
                          <p className={`text-sm ${
                            isCurrentUser ? colors.textPrimary : colors.textSecondary
                          } leading-relaxed break-words whitespace-pre-wrap`}>
                            {msg.message}
                          </p>
                        )}
                      
                        {/* Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="space-y-2 mt-3">
                            {msg.attachments.map((attachment: string, i: number) => {
                              const fileName = getCleanFilename(attachment);
                              const fileUrl = getAttachmentUrl(attachment);
                              const fileSize = fileName.length; // Placeholder since we don't have actual size
                              
                              return (
                                <a
                                  key={i}
                                  href={fileUrl}
                                  download
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className={`
                                    group/file relative overflow-hidden flex items-center gap-3 p-3 rounded-xl 
                                    transition-all duration-200 border-2
                                    ${isCurrentUser 
                                      ? `bg-white/5 border-white/20 hover:bg-white/10` 
                                      : `${colors.cardBg} ${colors.border} hover:${colors.cardBgHover}`
                                    }
                                  `}
                                >
                                  <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
                                  
                                  {/* File Icon */}
                                  <div className={`relative p-2.5 rounded-lg flex-shrink-0 ${
                                    isCurrentUser 
                                      ? `bg-white/10` 
                                      : `bg-gradient-to-r ${cardCharacters.informative.bg}`
                                  }`}>
                                    <div className={isCurrentUser ? 'text-white' : cardCharacters.informative.iconColor}>
                                      {getFileIcon(fileName)}
                                    </div>
                                  </div>
                                  
                                  {/* File Info */}
                                  <div className="flex-1 min-w-0 relative">
                                    <p className={`text-sm font-bold truncate ${
                                      isCurrentUser ? 'text-white' : colors.textPrimary
                                    }`}>
                                      {fileName}
                                    </p>
                                    <p className={`text-xs ${colors.textMuted} flex items-center gap-2`}>
                                      <span>Click to download</span>
                                    </p>
                                  </div>
                                  
                                  {/* Download Icon */}
                                  <div className={`relative p-2 rounded-lg flex-shrink-0 transition-all ${
                                    isCurrentUser
                                      ? 'bg-white/10 text-white group-hover/file:bg-white/20'
                                      : `${colors.inputBg} ${colors.textMuted} group-hover/file:${colors.textPrimary}`
                                  }`}>
                                    <Download className="w-4 h-4" />
                                  </div>
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Attachment Preview */}
      {attachments.length > 0 && (
        <div className={`rounded-xl border-2 ${colors.border} ${colors.inputBg} p-3`}>
          <p className={`text-xs font-bold ${colors.textMuted} mb-2 flex items-center gap-1.5`}>
            <Paperclip className="w-3.5 h-3.5" />
            Attachments ({attachments.length})
          </p>
          <div className="space-y-1.5">
            {attachments.map((att, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 p-2.5 rounded-lg border-2 bg-gradient-to-br ${cardCharacters.informative.bg} ${cardCharacters.informative.border}`}
              >
                <div className={`${cardCharacters.informative.iconColor}`}>
                  {getFileIcon(att.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold ${cardCharacters.informative.text} truncate`}>
                    {att.name}
                  </p>
                  <p className={`text-xs ${colors.textMuted}`}>
                    {(att.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  className={`p-1.5 rounded-lg hover:bg-red-500/10 transition-all`}
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder="Type a message..."
            disabled={sending}
            className={`flex-1 px-4 py-3 rounded-xl text-sm ${colors.inputBg} border-2 ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder} disabled:opacity-50 focus:border-opacity-50 transition-all`}
          />
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            accept="*/*"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending}
            className={`group relative p-3 rounded-xl font-bold text-sm transition-all overflow-hidden border-2 ${colors.buttonSecondary} ${colors.buttonSecondaryText} disabled:opacity-50 hover:scale-105`}
            title="Attach files"
          >
            <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
            <Paperclip className="w-5 h-5 relative z-10" />
          </button>
          
          <button
            type="submit"
            disabled={(!message.trim() && attachments.length === 0) || sending}
            className={`group relative px-6 py-3 rounded-xl font-bold text-sm transition-all overflow-hidden bg-gradient-to-r ${colors.buttonPrimary} ${colors.buttonPrimaryText} disabled:opacity-50 hover:scale-105`}
          >
            <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}` }}
            ></div>
            
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin relative z-10" />
            ) : (
              <Send className="w-5 h-5 relative z-10" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}