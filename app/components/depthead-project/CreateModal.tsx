// ============================================
// app/components/depthead-project/CreateModal.tsx
// ============================================

import { X, Upload, Calendar, Users, AlertCircle } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';
import MentionTextarea from './MentionTextarea';
import MultiSelectAssignee from './MultiSelectAssignee';
import { TeamMember, Project, ActiveTab, Attachment } from './types';
import { uploadFile } from './utils';

interface CreateModalProps {
  show: boolean;
  onClose: () => void;
  onCreate: () => Promise<void>;
  activeTab: ActiveTab;
  formData: any;
  setFormData: (data: any) => void;
  selectedAssignees: string[];
  setSelectedAssignees: (assignees: string[]) => void;
  mentions: string[];
  setMentions: (mentions: string[]) => void;
  teamMembers: TeamMember[];
  projects: Project[];
  theme: string;
  attachments: Attachment[];
  setAttachments: (attachments: Attachment[]) => void;
  userId: string;
  userName: string;
}

export default function CreateModal({
  show,
  onClose,
  onCreate,
  activeTab,
  formData,
  setFormData,
  selectedAssignees,
  setSelectedAssignees,
  mentions,
  setMentions,
  teamMembers,
  projects,
  attachments,
  setAttachments,
  userId,
  userName
}: CreateModalProps) {
  const { colors, getButtonStyles } = useTheme();

  if (!show) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      try {
        const attachment = await uploadFile(files[i], userId, userName);
        setAttachments([...attachments, attachment]);
      } catch (error) {
        alert('Failed to upload file: ' + files[i].name);
      }
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const itemType = activeTab === 'sprints' ? 'Sprint' : activeTab === 'projects' ? 'Project' : 'Task';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      {/* Paper Texture Overlay */}
      <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02] pointer-events-none`}></div>
      
      <div className={`relative rounded-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto ${colors.shadowDropdown} backdrop-blur-md border ${colors.borderStrong}`}
           style={{
             background: `linear-gradient(to bottom right, var(--tw-gradient-from), var(--tw-gradient-to))`,
           }}>
        {/* Paper texture in modal */}
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02] rounded-2xl pointer-events-none`}></div>
        
        <div className={`relative bg-gradient-to-br ${colors.cardBg} rounded-2xl p-8 -m-8`}>
          {/* Modal Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className={`text-3xl font-bold ${colors.textPrimary}`}>
                Create New {itemType}
              </h2>
              <p className={`text-sm mt-2 ${colors.textSecondary}`}>
                Fill in the details to create a new {itemType.toLowerCase()}
              </p>
            </div>
            <button 
              onClick={onClose} 
              className={`p-2 rounded-xl transition-all ${colors.buttonGhostHover} ${colors.textSecondary} hover:${colors.textPrimary}`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Project Selection for Tasks */}
            {activeTab === 'tasks' && (
              <div>
                <label className={`flex items-center gap-2 font-semibold mb-3 ${colors.textPrimary}`}>
                  <Users className="w-4 h-4" />
                  Project <span className={colors.textAccent}>*</span>
                </label>
                <select
                  value={formData.projectId || ''}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} ${colors.inputFocusBg} focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                >
                  <option value="">Select a project</option>
                  {projects.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Title/Name Field */}
            <div>
              <label className={`flex items-center gap-2 font-semibold mb-3 ${colors.textPrimary}`}>
                {activeTab === 'projects' ? 'Project Name' : 'Title'} <span className={colors.textAccent}>*</span>
              </label>
              <input
                type="text"
                value={formData.title || formData.name || ''}
                onChange={(e) => setFormData({ ...formData, [activeTab === 'projects' ? 'name' : 'title']: e.target.value })}
                placeholder={`Enter ${activeTab === 'projects' ? 'project name' : 'title'}...`}
                className={`w-full px-4 py-3 rounded-xl border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder} ${colors.inputFocusBg} focus:outline-none focus:ring-2 focus:ring-opacity-50`}
              />
            </div>

            {/* Description Field */}
            <div>
              <label className={`flex items-center gap-2 font-semibold mb-3 ${colors.textPrimary}`}>
                Description <span className={colors.textAccent}>*</span>
                <span className={`text-xs font-normal ${colors.textMuted}`}>
                  (Type @ to mention team members)
                </span>
              </label>
              <MentionTextarea
                value={formData.description || ''}
                onChange={(text, extractedMentions) => {
                  setFormData({ ...formData, description: text });
                  setMentions(extractedMentions);
                }}
                placeholder={`Describe the ${activeTab === 'sprints' ? 'sprint' : activeTab === 'projects' ? 'project' : 'task'}...`}
                teamMembers={teamMembers}
                rows={5}
              />
            </div>

            {/* Assignees Selection */}
            <MultiSelectAssignee
              teamMembers={teamMembers}
              selectedAssignees={selectedAssignees}
              onChange={setSelectedAssignees}
              allowEmpty={activeTab === 'projects'}
            />

            {/* Priority and Date Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`flex items-center gap-2 font-semibold mb-3 ${colors.textPrimary}`}>
                  <AlertCircle className="w-4 h-4" />
                  Priority
                </label>
                <select
                  value={formData.priority || 'medium'}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} ${colors.inputFocusBg} focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🟠 High</option>
                  <option value="urgent">🔴 Urgent</option>
                </select>
              </div>

              {activeTab === 'sprints' && (
                <>
                  <div>
                    <label className={`flex items-center gap-2 font-semibold mb-3 ${colors.textPrimary}`}>
                      <Calendar className="w-4 h-4" />
                      Due Date <span className={colors.textAccent}>*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.dueDate || ''}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} ${colors.inputFocusBg} focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                    />
                  </div>
                  <div>
                    <label className={`flex items-center gap-2 font-semibold mb-3 ${colors.textPrimary}`}>
                      Estimated Hours
                    </label>
                    <input
                      type="number"
                      value={formData.estimatedHours || 0}
                      onChange={(e) => setFormData({ ...formData, estimatedHours: parseFloat(e.target.value) })}
                      placeholder="0"
                      className={`w-full px-4 py-3 rounded-xl border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder} ${colors.inputFocusBg} focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                    />
                  </div>
                </>
              )}

              {activeTab === 'tasks' && (
                <div>
                  <label className={`flex items-center gap-2 font-semibold mb-3 ${colors.textPrimary}`}>
                    <Calendar className="w-4 h-4" />
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate || ''}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} ${colors.inputFocusBg} focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                  />
                </div>
              )}
            </div>

            {/* Project-specific Fields */}
            {activeTab === 'projects' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`flex items-center gap-2 font-semibold mb-3 ${colors.textPrimary}`}>
                      <Calendar className="w-4 h-4" />
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.startDate || ''}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} ${colors.inputFocusBg} focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                    />
                  </div>
                  <div>
                    <label className={`flex items-center gap-2 font-semibold mb-3 ${colors.textPrimary}`}>
                      <Calendar className="w-4 h-4" />
                      Target Date
                    </label>
                    <input
                      type="date"
                      value={formData.targetDate || ''}
                      onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} ${colors.inputFocusBg} focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`flex items-center gap-2 font-semibold mb-3 ${colors.textPrimary}`}>
                    Calendar Color
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={formData.color || '#4ECDC4'}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className={`h-14 w-24 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 ${colors.inputBorder}`}
                    />
                    <div className="flex flex-wrap gap-2">
                      {['#4ECDC4', '#FF6B6B', '#95E1D3', '#FFA07A', '#9B59B6', '#3498DB', '#F39C12', '#E74C3C'].map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData({ ...formData, color })}
                          className={`w-10 h-10 rounded-xl border-2 transition-all hover:scale-110 ${colors.shadowCard} ${
                            formData.color === color ? `border-2 scale-110 ring-2 ring-offset-2` : colors.borderSubtle
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                  <p className={`text-xs mt-2 ${colors.textMuted}`}>
                    This color will be used for calendar events related to this project
                  </p>
                </div>
              </>
            )}

            {/* Attachments */}
            <div>
              <label className={`flex items-center gap-2 font-semibold mb-3 ${colors.textPrimary}`}>
                <Upload className="w-4 h-4" />
                Attachments
              </label>
              <div className={`relative border-2 border-dashed rounded-xl p-6 transition-all hover:border-solid ${colors.borderSubtle} ${colors.inputBg} ${colors.borderHover}`}>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="text-center">
                  <Upload className={`w-8 h-8 mx-auto mb-2 ${colors.textMuted}`} />
                  <p className={`text-sm ${colors.textSecondary}`}>
                    Click to upload or drag and drop
                  </p>
                  <p className={`text-xs mt-1 ${colors.textMuted}`}>
                    Any file type supported
                  </p>
                </div>
              </div>
              {attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  {attachments.map((att, idx) => (
                    <div 
                      key={idx} 
                      className={`flex justify-between items-center p-3 rounded-xl transition-all border ${colors.cardBg} ${colors.border} ${colors.cardBgHover}`}
                    >
                      <span className={`text-sm truncate ${colors.textPrimary}`}>
                        📎 {att.filename}
                      </span>
                      <button
                        onClick={() => removeAttachment(idx)}
                        className={`p-1 rounded-lg transition-all ${colors.textMuted} hover:${colors.textPrimary}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Modal Actions */}
          <div className={`flex gap-4 mt-8 pt-6 border-t ${colors.border}`}>
            <button
              onClick={onClose}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all border ${colors.buttonSecondary} ${colors.buttonSecondaryText} ${colors.buttonSecondaryHover} ${colors.border}`}
            >
              Cancel
            </button>
            <button
              onClick={onCreate}
              className={`group relative flex-1 py-3 px-6 rounded-xl font-semibold transition-all overflow-hidden ${colors.buttonPrimary} ${colors.buttonPrimaryText} ${colors.buttonPrimaryHover} ${colors.shadowCard} hover:${colors.shadowHover}`}
            >
              {/* Paper Texture Layer */}
              <div className={`absolute inset-0 opacity-[0.02] ${colors.paperTexture}`}></div>
              
              {/* Internal Glow Layer */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                   style={{ boxShadow: `inset 0 0 20px var(--glow-primary)` }}>
              </div>
              
              <span className="relative z-10">Create {itemType}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}