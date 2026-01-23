// ============================================
// app/components/ticketing/TicketFormModal.tsx
// Modal for creating tickets with dynamic form
// UPDATED: Fixed email issue + searchable notification recipients
// ============================================

import React, { useState, useEffect } from 'react';
import { X, Send, Loader2, CheckCircle, AlertCircle, UserPlus, Search } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';
import DynamicFormField from './DynamicFormField';

interface Functionality {
  _id: string;
  name: string;
  description: string;
  department: string;
  formSchema: {
    fields: any[];
    useDefaultFields: boolean;
  };
}

interface Props {
  functionality: Functionality;
  onClose: () => void;
  onSuccess: (ticketNumber: string) => void;
}

export default function TicketFormModal({ functionality, onClose, onSuccess }: Props) {
  const { colors, cardCharacters, getModalStyles, showToast } = useTheme();
  const charColors = cardCharacters.informative;
  
  // 🌟 DETECT IF THIS IS A SUPER FUNCTIONALITY
  const isSuper = functionality.department === 'Super Workflow';
  
  // Debug logging to verify detection
  useEffect(() => {
    console.log('🎫 TicketFormModal opened:', {
      functionalityId: functionality._id,
      name: functionality.name,
      department: functionality.department,
      isSuper,
      departmentMatch: functionality.department === 'Super Workflow'
    });
  }, [functionality, isSuper]);
  
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  
  // 📧 Notification recipients state
  const [notificationRecipients, setNotificationRecipients] = useState<any[]>([]);
  const [allEmployees, setAllEmployees] = useState<any[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // 📧 Fetch all organization employees
  useEffect(() => {
    fetchAllEmployees();
  }, []);

  // 📧 Filter employees based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEmployees([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = allEmployees.filter(emp => {
      // Don't show already selected employees
      if (notificationRecipients.some(r => r.userId === emp._id.toString())) {
        return false;
      }
      
      // Search by name, username, title, or department
      return (
        emp.name?.toLowerCase().includes(query) ||
        emp.username?.toLowerCase().includes(query) ||
        emp.title?.toLowerCase().includes(query) ||
        emp.department?.toLowerCase().includes(query)
      );
    });

    setFilteredEmployees(filtered.slice(0, 10)); // Limit to 10 results
  }, [searchQuery, allEmployees, notificationRecipients]);

  const fetchAllEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const response = await fetch('/api/org-employees');
      if (!response.ok) throw new Error('Failed to fetch employees');
      const data = await response.json();
      setAllEmployees(data.employees || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  // 📧 Add recipient from search
  const addRecipient = (employee: any) => {
    // ✅ FIX: Use the email field directly from the employee data
    const newRecipient = {
      userId: employee._id.toString(),
      name: employee.name,
      email: employee.contactInformation?.email || employee.username // Use actual email field
    };
    
    setNotificationRecipients(prev => [...prev, newRecipient]);
    setSearchQuery('');
    setShowDropdown(false);
    
    console.log('📧 Added recipient:', newRecipient);
  };

  // 📧 Remove recipient
  const removeRecipient = (userId: string) => {
    setNotificationRecipients(prev => prev.filter(r => r.userId !== userId));
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    console.log(`🔄 Field "${fieldId}" changed:`, {
      type: typeof value,
      isArray: Array.isArray(value),
      length: Array.isArray(value) ? value.length : 'N/A',
      value: fieldId.includes('attachment') ? 
        (Array.isArray(value) ? `Array with ${value.length} items` : value) : 
        value
    });
    
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  // Debug formData changes
  useEffect(() => {
    if (formData['default-attachments']) {
      console.log('📎 FORMDATA STATE UPDATED - Attachments:', {
        type: typeof formData['default-attachments'],
        isArray: Array.isArray(formData['default-attachments']),
        data: formData['default-attachments']
      });
    }
  }, [formData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    functionality.formSchema.fields.forEach(field => {
      // BACKWARD COMPATIBILITY: Skip validation for hardcoded priority-reason fields
      if (field.id === 'default-priority-reason' || field.id === 'default-urgency-reason') {
        const priorityValue = formData['default-priority'] || formData['default-urgency'];
        if (priorityValue !== 'High') {
          return; // Skip validation if priority is not High
        }
        // If priority IS High, validate that reason is provided
        const reasonValue = formData[field.id];
        if (!reasonValue || (typeof reasonValue === 'string' && !reasonValue.trim())) {
          newErrors[field.id] = `${field.label} is required when Priority is High`;
        }
        return;
      }
      
      // FIXED: Skip validation for conditionally hidden fields
      if (field.conditional) {
        const dependentValue = formData[field.conditional.dependsOn];
        if (!field.conditional.showWhen.includes(dependentValue)) {
          return; // Skip validation for hidden fields
        }
      }
      
      if (field.required) {
        const value = formData[field.id];
        if (!value || (Array.isArray(value) && value.length === 0)) {
          newErrors[field.id] = `${field.label} is required`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('Please fill in all required fields', 'warning');
      return;
    }

    setSubmitting(true);

    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('User not logged in');
      }

      const user = JSON.parse(userData);
      
      const userId = user._id || user.id || user.userId || user.username || user.employeeNumber;
      
      if (!userId) {
        throw new Error('User ID not found. Please log in again.');
      }

      const raisedByData = {
        userId: String(userId),
        name: user.basicDetails?.name || user.displayName || user.username || 'Unknown User',
        email: user.email || user.basicDetails?.email || user.username + '@company.com'
      };

      // Prepare form data
      const preparedFormData = { ...formData };
      
      // 📧 Add notification recipients if any selected
      if (notificationRecipients.length > 0) {
        preparedFormData['notification-recipients'] = notificationRecipients;
        console.log(`📧 Added ${notificationRecipients.length} notification recipients to formData`);
        console.log('📧 Recipients:', notificationRecipients);
      }
      
      // ====== COMPREHENSIVE DEBUG LOGGING ======
      console.log('🔍 ====== FORM SUBMISSION DEBUG ======');
      console.log('🌟 Is Super Functionality?:', isSuper);
      console.log('📋 Functionality Department:', functionality.department);
      console.log('📧 Notification Recipients:', notificationRecipients.length);
      console.log('📋 All form fields:', Object.keys(preparedFormData));
      console.log('📋 Full formData:', preparedFormData);
      
      if (preparedFormData['default-attachments']) {
        console.log('📎 Attachments field exists!');
        console.log('📎 Type:', typeof preparedFormData['default-attachments']);
        console.log('📎 Is Array?:', Array.isArray(preparedFormData['default-attachments']));
        console.log('📎 Value:', preparedFormData['default-attachments']);
        
        if (Array.isArray(preparedFormData['default-attachments'])) {
          console.log('📎 Array length:', preparedFormData['default-attachments'].length);
          preparedFormData['default-attachments'].forEach((item: any, index: number) => {
            console.log(`📎 Item ${index}:`, {
              type: typeof item,
              hasName: item?.name !== undefined,
              hasData: item?.data !== undefined,
              hasContent: item?.content !== undefined,
              value: item
            });
          });
        }
      } else {
        console.log('⚠️ No attachments field in formData!');
      }
      console.log('🔍 ====== END DEBUG ======');
      // ========================================

      const requestBody = {
        functionalityId: functionality._id,
        isSuper, // 🌟 PASS THE isSuper FLAG TO BACKEND
        formData: preparedFormData,
        raisedBy: raisedByData
      };

      console.log('🚀 Sending request with body:', {
        functionalityId: requestBody.functionalityId,
        isSuper: requestBody.isSuper,
        formDataKeys: Object.keys(requestBody.formData),
        attachments: requestBody.formData['default-attachments'],
        notificationRecipients: requestBody.formData['notification-recipients']?.length || 0
      });

      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      let responseData;
      try {
        const text = await response.text();
        responseData = text ? JSON.parse(text) : {};
      } catch (jsonError) {
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(responseData.error || `Server error: ${response.status}`);
      }

      setTicketNumber(responseData.ticket.ticketNumber);
      setSubmitted(true);

      setTimeout(() => {
        onSuccess(responseData.ticket.ticketNumber);
      }, 2500);
    } catch (error) {
      console.error('❌ Submission error:', error);
      showToast(error instanceof Error ? error.message : 'Failed to create ticket. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Success screen
  if (submitted) {
    return (
      <div className={getModalStyles()}>
        <div className="absolute inset-0 modal-backdrop" onClick={onClose} aria-hidden="true" />
        
        <div className={`
          relative rounded-2xl border ${colors.modalBorder}
          ${colors.modalBg} ${colors.modalShadow}
          w-full max-w-md
          modal-content p-10 text-center
        `}
          style={{ overflow: 'hidden' }}
        >
          <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03] pointer-events-none`}></div>
          
          <div className="relative mb-6 flex justify-center">
            <div className="relative">
              <div className={`absolute inset-0 rounded-full blur-3xl opacity-60 animate-pulse`} style={{ backgroundColor: cardCharacters.completed.iconColor.replace('text-', '') }} />
              <CheckCircle className={`relative w-24 h-24 animate-in zoom-in duration-700 ${cardCharacters.completed.iconColor}`} />
            </div>
          </div>
          
          <h2 className={`text-3xl font-black ${cardCharacters.completed.text} mb-3`}>
            Success!
          </h2>
          
          <p className={`text-sm ${colors.textSecondary} mb-6`}>
            Your ticket has been created and submitted to the workflow.
          </p>
          
          <div 
            className={`relative overflow-hidden p-5 rounded-xl mb-8 border-2 bg-gradient-to-r ${cardCharacters.completed.bg} ${cardCharacters.completed.border}`}
          >
            <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
            <p className={`relative text-xs font-semibold ${colors.textSecondary} mb-2`}>
              Ticket Number
            </p>
            <p className={`relative text-3xl font-black tracking-wide ${cardCharacters.completed.text}`}>
              {ticketNumber}
            </p>
          </div>

          <button
            onClick={onClose}
            className={`group relative w-full py-3.5 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 overflow-hidden border-2 bg-gradient-to-r ${colors.buttonPrimary} ${colors.buttonPrimaryText}`}
          >
            <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ boxShadow: `inset 0 0 30px ${colors.glowPrimary}` }}
            ></div>
            <span className="relative z-10">Close</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={getModalStyles()}>
      <div className="absolute inset-0 modal-backdrop" onClick={onClose} aria-hidden="true" />
      
      <div 
        className={`
          relative rounded-2xl border ${colors.modalBorder}
          ${colors.modalBg} ${colors.modalShadow}
          w-full max-w-3xl
          modal-content flex flex-col
        `}
        style={{ overflow: 'hidden' }}
      >
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03] pointer-events-none`}></div>

        {/* Header */}
        <div className={`
          relative px-6 py-4 border-b ${colors.modalFooterBorder}
          ${colors.modalHeaderBg}
        `}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className={`text-2xl font-black ${colors.modalHeaderText} mb-2`}>
                Create New Ticket
              </h2>
              <p className={`text-sm ${colors.textSecondary} flex items-center gap-2 flex-wrap`}>
                <span className={`px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r ${charColors.bg} ${charColors.text} border ${charColors.border}`}>
                  {isSuper && '⚡ '}
                  {functionality.department}
                </span>
                <span>•</span>
                <span>{functionality.name}</span>
              </p>
            </div>
            
            <button
              onClick={onClose}
              className={`group relative p-2 rounded-lg transition-all duration-300 ${colors.buttonGhost} ${colors.buttonGhostText}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className={`relative p-6 ${colors.modalContentBg} max-h-[calc(90vh-240px)] overflow-y-auto`}>
          <form onSubmit={handleSubmit} className={`space-y-6 ${colors.modalContentText}`}>
            {functionality.formSchema.fields.map((field) => {
              // BACKWARD COMPATIBILITY: Handle old workflows without conditional metadata
              if (field.id === 'default-priority-reason' || field.id === 'default-urgency-reason') {
                const priorityValue = formData['default-priority'] || formData['default-urgency'];
                if (priorityValue !== 'High') {
                  return null;
                }
              }
              
              // NEW: Generic conditional field rendering
              if (field.conditional) {
                const dependentValue = formData[field.conditional.dependsOn];
                if (!field.conditional.showWhen.includes(dependentValue)) {
                  return null;
                }
              }

              return (
                <DynamicFormField
                  key={field.id}
                  field={field}
                  value={formData[field.id]}
                  onChange={(value) => handleFieldChange(field.id, value)}
                  error={errors[field.id]}
                />
              );
            })}

            {/* 📧 NEW: Searchable Notification Recipients Selection */}
            <div>
              <label className={`block text-sm font-bold ${colors.textPrimary} mb-2 flex items-center gap-2`}>
                <UserPlus className="w-4 h-4" />
                Additional Email Notifications (Optional)
              </label>
              <p className={`text-xs ${colors.textSecondary} mb-3`}>
                Search and select people who should receive email updates for every action on this ticket
              </p>
              
              {/* Search Input */}
              <div className="relative">
                <div className={`relative rounded-xl border-2 ${colors.inputBorder} ${colors.inputBg}`}>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Search className={`w-5 h-5 ${colors.textMuted}`} />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Search by name, username, title, or department..."
                    className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-transparent border-none outline-none ${colors.inputText} ${colors.inputPlaceholder}`}
                  />
                </div>
                
                {/* Search Results Dropdown */}
                {showDropdown && searchQuery && filteredEmployees.length > 0 && (
                  <div className={`absolute z-50 w-full mt-2 rounded-xl border-2 shadow-lg max-h-64 overflow-y-auto ${colors.inputBg} ${colors.inputBorder}`}>
                    {filteredEmployees.map(employee => (
                      <button
                        key={employee._id}
                        type="button"
                        onClick={() => addRecipient(employee)}
                        className={`w-full text-left p-3 hover:bg-opacity-50 transition-all duration-200 border-b last:border-b-0 ${colors.borderSubtle}`}
                      >
                        <p className={`text-sm font-semibold ${colors.textPrimary}`}>
                          {employee.name}
                        </p>
                        <p className={`text-xs ${colors.textMuted} mt-1`}>
                          {employee.username} • {employee.department} {employee.title && `• ${employee.title}`}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
                
                {showDropdown && searchQuery && filteredEmployees.length === 0 && (
                  <div className={`absolute z-50 w-full mt-2 rounded-xl border-2 shadow-lg p-4 text-center ${colors.inputBg} ${colors.inputBorder}`}>
                    <p className={`text-sm ${colors.textMuted}`}>
                      No employees found matching "{searchQuery}"
                    </p>
                  </div>
                )}
              </div>
              
              {/* Selected Recipients */}
              {notificationRecipients.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className={`text-xs font-semibold ${colors.textPrimary}`}>
                    Selected Recipients ({notificationRecipients.length})
                  </p>
                  {notificationRecipients.map((recipient) => (
                    <div
                      key={recipient.userId}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 bg-gradient-to-br ${charColors.bg} ${charColors.border}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${charColors.text} truncate`}>
                          {recipient.name}
                        </p>
                        <p className={`text-xs ${colors.textMuted} truncate`}>
                          {recipient.email}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRecipient(recipient.userId)}
                        className={`ml-2 p-1.5 rounded-lg transition-all duration-300 hover:scale-110 ${colors.buttonGhost} ${colors.buttonGhostText}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {notificationRecipients.length > 0 && (
                <p className={`text-xs mt-2 ${charColors.text}`}>
                  ✉️ These {notificationRecipients.length} {notificationRecipients.length === 1 ? 'person will' : 'people will'} receive emails for all ticket updates
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className={`
          relative px-6 py-4 border-t ${colors.modalFooterBorder}
          ${colors.modalFooterBg} flex justify-end gap-3
        `}>
          <button
            type="button"
            onClick={onClose}
            className={`group relative px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 overflow-hidden border-2 ${colors.buttonSecondary} ${colors.buttonSecondaryText} disabled:opacity-50`}
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className={`group relative px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden border-2 bg-gradient-to-r ${colors.buttonPrimary} ${colors.buttonPrimaryText}`}
          >
            <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ boxShadow: `inset 0 0 30px ${colors.glowPrimary}` }}
            ></div>
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin relative z-10" />
                <span className="relative z-10">Creating...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Submit Ticket</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}