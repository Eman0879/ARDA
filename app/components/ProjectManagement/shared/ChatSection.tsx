// app/components/ProjectManagement/shared/ChatSection.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Loader2, Paperclip, X, Download, FileText, Image as ImageIcon, File } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';

interface ChatSectionProps {
  chat: Array<{
    userId: string;
    userName: string;
    message: string;
    timestamp: Date | string;
    attachments?: string[];
  }>;
  onSendMessage: (message: string, attachments?: Array<{ name: string; data: string; type: string; size: number }>) => Promise<void>;
  currentUserId: string;
  currentUserName: string;
  type: 'project' | 'sprint';
  entityNumber: string; // PRJ-XXXX or SPR-XXXX for file saving
}

interface AttachmentFile {
  name: string;
  data: string;
  type: string;
  size: number;
}

export default function ChatSection({
  chat,
  onSendMessage,
  currentUserId,
  currentUserName,
  type,
  entityNumber
}: ChatSectionProps) {
  const { colors, cardCharacters, showToast } = useTheme();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    const fileArray = Array.from(files);
    
    const processedFiles = await Promise.all(
      fileArray.map((file) => {
        return new Promise<AttachmentFile | null>((resolve) => {
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

    const validFiles = processedFiles.filter((f): f is AttachmentFile => f !== null);
    
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
    if ((!message.trim() && attachments.length === 0) || sending) return;

    try {
      setSending(true);
      await onSendMessage(message.trim() || '📎 Attachment(s)', attachments.length > 0 ? attachments : undefined);
      setMessage('');
      setAttachments([]);
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
      return <ImageIcon className="w-3 h-3" />;
    }
    if (['pdf'].includes(ext || '')) {
      return <FileText className="w-3 h-3" />;
    }
    return <File className="w-3 h-3" />;
  };

  const getAttachmentUrl = (attachmentPath: string): string => {
    // Handle absolute paths
    if (attachmentPath.includes('\\') || attachmentPath.startsWith('D:') || attachmentPath.startsWith('C:')) {
      const uploadsIndex = attachmentPath.indexOf('uploads');
      if (uploadsIndex !== -1) {
        const relativePath = attachmentPath.substring(uploadsIndex).replace(/\\/g, '/');
        return `/api/attachments/${relativePath.replace('uploads/projects/', '')}`;
      }
      const parts = attachmentPath.split(/[\\\/]/);
      const entityIndex = parts.findIndex(p => p.startsWith('PRJ-') || p.startsWith('SPR-'));
      if (entityIndex !== -1 && entityIndex < parts.length - 1) {
        const entityNum = parts[entityIndex];
        const filename = parts[parts.length - 1];
        return `/api/attachments/${entityNum}/${filename}`;
      }
      return attachmentPath;
    }
    
    // Handle relative paths
    return `/api/attachments/${attachmentPath.replace('uploads/projects/', '')}`;
  };

  return (
    <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${colors.cardBg} ${colors.border} ${colors.shadowCard}`}>
      <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
      
      <div className="relative">
        {/* Header */}
        <div className={`p-4 border-b ${colors.border} bg-gradient-to-r ${cardCharacters.informative.bg}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${cardCharacters.informative.bg}`}>
              <MessageSquare className={`w-5 h-5 ${cardCharacters.informative.iconColor}`} />
            </div>
            <div>
              <h3 className={`text-base font-black ${cardCharacters.informative.text}`}>
                {type === 'project' ? 'Project' : 'Sprint'} Chat
              </h3>
              <p className={`text-xs ${colors.textMuted}`}>
                {chat.length} message{chat.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Messages - Chat-style layout */}
        <div className="p-4 space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
          {chat.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className={`w-12 h-12 mx-auto mb-3 ${colors.textMuted} opacity-40`} />
              <p className={`${colors.textMuted} text-sm`}>
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            <>
              {chat.map((msg, index) => {
                const isCurrentUser = msg.userId === currentUserId || msg.userName === currentUserName;
                
                return (
                  <div
                    key={index}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`group relative overflow-hidden rounded-lg p-3 transition-all max-w-[75%] ${
                        isCurrentUser
                          ? `bg-gradient-to-r ${cardCharacters.interactive.bg} border ${cardCharacters.interactive.border} ml-auto`
                          : `${colors.inputBg} border ${colors.inputBorder} mr-auto`
                      }`}
                    >
                      <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
                      
                      <div className="relative space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <span className={`text-sm font-bold ${
                            isCurrentUser ? cardCharacters.interactive.text : colors.textPrimary
                          }`}>
                            {msg.userName}
                            {isCurrentUser && (
                              <span className={`ml-2 text-xs font-normal ${colors.textMuted}`}>
                                (You)
                              </span>
                            )}
                          </span>
                          <span className={`text-xs ${colors.textMuted} whitespace-nowrap`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        
                        {msg.message && (
                          <p className={`text-sm ${
                            isCurrentUser ? colors.textPrimary : colors.textSecondary
                          } leading-relaxed break-words`}>
                            {msg.message}
                          </p>
                        )}
                      
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="space-y-1.5 mt-2">
                            {msg.attachments.map((attachment, i) => {
                              const fileName = attachment.split(/[\\\/]/).pop() || attachment;
                              const fileUrl = getAttachmentUrl(attachment);
                              
                              return (
                                <a
                                  key={i}
                                  href={fileUrl}
                                  download
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`
                                    group/file flex items-center gap-2 px-2 py-1.5 rounded-lg 
                                    transition-all duration-200 border
                                    ${isCurrentUser 
                                      ? `${cardCharacters.interactive.border} hover:bg-white/10` 
                                      : `${colors.borderSubtle} ${colors.inputBg} hover:${colors.cardBgHover}`
                                    }
                                  `}
                                >
                                  <div className={`flex-shrink-0 ${isCurrentUser ? cardCharacters.interactive.iconColor : colors.textMuted}`}>
                                    {getFileIcon(fileName)}
                                  </div>
                                  <span className={`text-xs truncate flex-1 ${
                                    isCurrentUser ? colors.textPrimary : colors.textSecondary
                                  }`}>
                                    {fileName}
                                  </span>
                                  <Download className={`w-3 h-3 flex-shrink-0 opacity-0 group-hover/file:opacity-100 transition-opacity ${
                                    isCurrentUser ? cardCharacters.interactive.iconColor : colors.textMuted
                                  }`} />
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

        {/* Attachment Preview */}
        {attachments.length > 0 && (
          <div className={`px-4 pb-2 border-t ${colors.border}`}>
            <div className="pt-3 space-y-1.5">
              <p className={`text-xs font-bold ${colors.textMuted} mb-2`}>
                Attachments ({attachments.length})
              </p>
              {attachments.map((att, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 p-2 rounded-lg border ${colors.inputBorder} ${colors.inputBg}`}
                >
                  <div className={colors.textMuted}>
                    {getFileIcon(att.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium ${colors.textPrimary} truncate`}>
                      {att.name}
                    </p>
                    <p className={`text-xs ${colors.textMuted}`}>
                      {(att.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className={`p-1 rounded hover:bg-red-500/10 transition-colors`}
                  >
                    <X className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className={`p-4 border-t ${colors.border}`}>
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                disabled={sending}
                className={`flex-1 px-4 py-3 rounded-lg text-sm ${colors.inputBg} border ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder} disabled:opacity-50`}
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
                className={`group relative p-3 rounded-lg font-bold text-sm transition-all overflow-hidden border-2 ${colors.buttonSecondary} ${colors.buttonSecondaryText} disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105`}
                title="Attach files"
              >
                <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
                <Paperclip className="w-5 h-5 relative z-10" />
              </button>
              <button
                type="submit"
                disabled={(!message.trim() && attachments.length === 0) || sending}
                className={`group relative px-6 py-3 rounded-lg font-bold text-sm transition-all overflow-hidden bg-gradient-to-r ${colors.buttonPrimary} ${colors.buttonPrimaryText} disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105`}
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
      </div>
    </div>
  );
}