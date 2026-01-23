// app/components/ProjectManagement/depthead/CreateSprintModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { X, Zap, Loader2, CheckCircle, Users, Search, Paperclip, FileText } from 'lucide-react';

interface Employee {
  _id: string;
  username: string;
  'basicDetails.name': string;
  'basicDetails.profileImage'?: string;
  title: string;
  department: string;
}

interface DepartmentHead {
  userId: string;
  username: string;
  name: string;
  department: string;
}

interface Project {
  _id: string;
  projectNumber: string;
  title: string;
}

interface Attachment {
  name: string;
  data: string;
  type: string;
  size: number;
}

interface CreateSprintModalProps {
  department: string;
  userId: string;
  userName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateSprintModal({
  department,
  userId,
  userName,
  onClose,
  onSuccess
}: CreateSprintModalProps) {
  const { colors, cardCharacters, showToast, getModalStyles } = useTheme();
  const charColors = cardCharacters.interactive;

  useEffect(() => {
    console.log('CreateSprintModal props:', { department, userId, userName });
    
    if (!department) {
      console.error('Department is undefined in CreateSprintModal!');
      showToast('Error: Department not provided', 'error');
    }
  }, [department, userId, userName]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [groupLead, setGroupLead] = useState('');
  const [defaultActionTitle, setDefaultActionTitle] = useState('Sprint Kickoff');
  const [defaultActionDescription, setDefaultActionDescription] = useState('Initialize sprint and define goals');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  // Department employees (shown by default)
  const [deptEmployees, setDeptEmployees] = useState<Employee[]>([]);
  const [deptEmployeeSearch, setDeptEmployeeSearch] = useState('');
  
  // Org-wide employees (searchable)
  const [orgEmployees, setOrgEmployees] = useState<Employee[]>([]);
  const [orgSearchQuery, setOrgSearchQuery] = useState('');
  const [filteredOrgEmployees, setFilteredOrgEmployees] = useState<Employee[]>([]);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  
  const [departmentHeads, setDepartmentHeads] = useState<Map<string, DepartmentHead>>(new Map());
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingDeptEmployees, setFetchingDeptEmployees] = useState(true);
  const [fetchingOrgEmployees, setFetchingOrgEmployees] = useState(false);
  const [fetchingProjects, setFetchingProjects] = useState(true);

  useEffect(() => {
    fetchDeptEmployees();
    fetchDepartmentHeads();
    fetchOrgEmployees();
    fetchProjects();
  }, [department]);

  // Filter org employees based on search
  useEffect(() => {
    if (!orgSearchQuery.trim()) {
      setFilteredOrgEmployees([]);
      return;
    }

    const query = orgSearchQuery.toLowerCase();
    const filtered = orgEmployees.filter(emp => {
      // Don't show already selected employees
      if (selectedMembers.includes(emp._id)) {
        return false;
      }
      
      // Don't show department employees (they're already in the dept section)
      if (emp.department === department) {
        return false;
      }
      
      // Search by name, username, title, or department
      return (
        (emp['basicDetails.name'] || emp.username || '').toLowerCase().includes(query) ||
        (emp.title || '').toLowerCase().includes(query) ||
        (emp.department || '').toLowerCase().includes(query)
      );
    });

    setFilteredOrgEmployees(filtered.slice(0, 10)); // Limit to 10 results
  }, [orgSearchQuery, orgEmployees, selectedMembers, department]);

  const filteredDeptEmployees = deptEmployees.filter(emp => {
    if (!deptEmployeeSearch) return true;
    const searchLower = deptEmployeeSearch.toLowerCase();
    const name = (emp['basicDetails.name'] || emp.username || '').toLowerCase();
    const title = (emp.title || '').toLowerCase();
    return name.includes(searchLower) || title.includes(searchLower);
  });

  const fetchDeptEmployees = async () => {
    try {
      setFetchingDeptEmployees(true);
      const response = await fetch(`/api/dept-employees?department=${encodeURIComponent(department)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch department employees');
      }

      const data = await response.json();
      console.log('Fetched department employees:', data);
      
      if (data.success && Array.isArray(data.employees)) {
        setDeptEmployees(data.employees);
      } else {
        setDeptEmployees([]);
        console.warn('Unexpected data format:', data);
      }
    } catch (error) {
      console.error('Error fetching department employees:', error);
      showToast('Failed to fetch department employees', 'error');
      setDeptEmployees([]);
    } finally {
      setFetchingDeptEmployees(false);
    }
  };

  const fetchOrgEmployees = async () => {
    try {
      setFetchingOrgEmployees(true);
      const response = await fetch('/api/org-employees');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch employees');
      }

      const data = await response.json();
      
      if (data.success && Array.isArray(data.employees)) {
        setOrgEmployees(data.employees);
      } else {
        setOrgEmployees([]);
      }
    } catch (error) {
      console.error('Error fetching org employees:', error);
      setOrgEmployees([]);
    } finally {
      setFetchingOrgEmployees(false);
    }
  };

  const fetchProjects = async () => {
    try {
      setFetchingProjects(true);
      const response = await fetch(`/api/ProjectManagement/depthead/projects?department=${encodeURIComponent(department)}&status=active`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setFetchingProjects(false);
    }
  };

  const fetchDepartmentHeads = async () => {
    try {
      const response = await fetch('/api/dept-heads');
      
      if (!response.ok) {
        throw new Error('Failed to fetch department heads');
      }

      const data = await response.json();
      
      if (data.success && Array.isArray(data.departmentHeads)) {
        const headsMap = new Map<string, DepartmentHead>();
        data.departmentHeads.forEach((head: DepartmentHead) => {
          headsMap.set(head.department, head);
        });
        setDepartmentHeads(headsMap);
      }
    } catch (error) {
      console.error('Error fetching department heads:', error);
    }
  };

  const handleMemberToggle = (employeeId: string) => {
    const employee = [...deptEmployees, ...orgEmployees].find(e => e._id === employeeId);
    if (!employee) return;

    setSelectedMembers(prev => {
      if (prev.includes(employeeId)) {
        // Removing member
        const newMembers = prev.filter(id => id !== employeeId);
        if (groupLead === employeeId) {
          setGroupLead(newMembers[0] || '');
        }
        return newMembers;
      } else {
        // Adding member
        const newMembers = [...prev, employeeId];
        
        // Auto-add department head if employee is from different department
        if (employee.department !== department) {
          const deptHead = departmentHeads.get(employee.department);
          if (deptHead && !newMembers.includes(deptHead.userId)) {
            console.log(`Auto-adding dept head for ${employee.department}:`, deptHead);
            newMembers.push(deptHead.userId);
          }
        }
        
        if (!groupLead) {
          setGroupLead(employeeId);
        }
        return newMembers;
      }
    });
  };

  const addOrgEmployee = (employee: Employee) => {
    handleMemberToggle(employee._id);
    setOrgSearchQuery('');
    setShowOrgDropdown(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    console.log(`📎 Starting file upload for ${files.length} file(s)`);

    const maxSize = 10 * 1024 * 1024; // 10MB
    const fileArray = Array.from(files);
    
    // Process all files and wait for completion
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
            console.log(`✅ Processed file: ${file.name} (${file.size} bytes)`);
            resolve({
              name: file.name,
              data: base64Data.split(',')[1], // Remove data:image/png;base64, prefix
              type: file.type,
              size: file.size
            });
          };
          reader.onerror = () => {
            console.error(`❌ Failed to read file: ${file.name}`);
            showToast(`Failed to read file ${file.name}`, 'error');
            resolve(null);
          };
          reader.readAsDataURL(file);
        });
      })
    );

    // Filter out null values and update state
    const validFiles = processedFiles.filter((f): f is Attachment => f !== null);
    
    if (validFiles.length > 0) {
      setAttachments((prev) => {
        const updated = [...prev, ...validFiles];
        console.log(`📋 Total attachments now: ${updated.length}`);
        return updated;
      });
      showToast(`${validFiles.length} file(s) attached successfully`, 'success');
    }

    // Reset input
    e.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    showToast('Attachment removed', 'info');
  };

  const getEmployeeDepartmentBadge = (emp: Employee) => {
    if (emp.department === department) {
      return null;
    }
    return (
      <span className={`text-xs px-2 py-0.5 rounded ${colors.badge} ${colors.badgeText}`}>
        {emp.department}
      </span>
    );
  };

  const isDeptHead = (employeeId: string) => {
    return Array.from(departmentHeads.values()).some(head => head.userId === employeeId);
  };

  const getSelectedEmployee = (id: string) => {
    return [...deptEmployees, ...orgEmployees].find(e => e._id === id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !startDate || !endDate || selectedMembers.length === 0 || !groupLead) {
      showToast('Please fill in all required fields', 'warning');
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      showToast('End date must be after start date', 'warning');
      return;
    }

    try {
      setLoading(true);

      const allEmployees = [...deptEmployees, ...orgEmployees];
      const members = selectedMembers.map(id => {
        const employee = allEmployees.find(e => e._id === id);
        const isHead = isDeptHead(id);
        return {
          userId: id,
          name: employee?.['basicDetails.name'] || employee?.username || 'Unknown',
          role: id === groupLead ? 'lead' : (isHead ? 'dept-head' : 'member'),
          department: employee?.department || department
        };
      });

      const selectedProject = projects.find(p => p._id === projectId);

      console.log('📤 Submitting sprint with attachments:', {
        attachmentCount: attachments.length,
        attachments: attachments.map(a => ({ name: a.name, size: a.size, type: a.type }))
      });

      const response = await fetch('/api/ProjectManagement/depthead/sprints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          department,
          projectId: projectId || undefined,
          projectNumber: selectedProject?.projectNumber || undefined,
          createdBy: userId,
          createdByName: userName,
          members,
          groupLead,
          startDate,
          endDate,
          defaultAction: {
            title: defaultActionTitle,
            description: defaultActionDescription
          },
          attachments: attachments.length > 0 ? attachments : undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create sprint');
      }

      const result = await response.json();
      console.log('✅ Sprint created successfully:', result);

      showToast('Sprint created successfully!', 'success');
      onSuccess();
    } catch (error) {
      console.error('❌ Error creating sprint:', error);
      showToast('Failed to create sprint', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={getModalStyles()}>
      {/* Backdrop click to close */}
      <div 
        className="absolute inset-0 modal-backdrop" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal Container */}
      <div 
        className={`
          relative rounded-2xl border ${colors.modalBorder}
          ${colors.modalBg} ${colors.modalShadow}
          w-full max-w-3xl
          modal-content
        `}
        style={{ overflow: 'hidden' }}
      >
        {/* Paper Texture Overlay */}
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03] pointer-events-none`}></div>

        {/* Modal Header */}
        <div className={`
          relative px-6 py-4 border-b ${colors.modalFooterBorder}
          ${colors.modalHeaderBg}
        `}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${charColors.bg}`}>
                <Zap className={`h-5 w-5 ${charColors.iconColor}`} />
              </div>
              <div>
                <h2 className={`text-2xl font-black ${colors.modalHeaderText}`}>
                  Create New Sprint
                </h2>
                <p className={`text-sm ${colors.textSecondary} flex items-center gap-2 flex-wrap mt-1`}>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r ${charColors.bg} ${charColors.text} border ${charColors.border}`}>
                    {department}
                  </span>
                  <span className={colors.textMuted}>• Set up a sprint with team members</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`group relative p-2 rounded-lg transition-all duration-300 ${colors.buttonGhost} ${colors.buttonGhostText}`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className={`relative p-6 ${colors.modalContentBg} max-h-[calc(90vh-240px)] overflow-y-auto`}>
          <form onSubmit={handleSubmit} className={`space-y-6 ${colors.modalContentText}`}>
            {/* Project Link (Optional) */}
            <div>
              <label className={`block text-sm font-bold ${colors.textPrimary} mb-2`}>
                Link to Project (Optional)
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg text-sm transition-all ${colors.inputBg} border ${colors.inputBorder} ${colors.inputText}`}
                disabled={fetchingProjects}
              >
                <option value="">Standalone Sprint</option>
                {projects.map(project => (
                  <option key={project._id} value={project._id}>
                    {project.projectNumber} - {project.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className={`block text-sm font-bold ${colors.textPrimary} mb-2`}>
                Sprint Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter sprint title"
                className={`w-full px-4 py-2.5 rounded-lg text-sm transition-all ${colors.inputBg} border ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder}`}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className={`block text-sm font-bold ${colors.textPrimary} mb-2`}>
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the sprint goals and objectives"
                rows={4}
                className={`w-full px-4 py-2.5 rounded-lg text-sm transition-all ${colors.inputBg} border ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder} resize-none`}
                required
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-bold ${colors.textPrimary} mb-2`}>
                  Start Date *
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg text-sm transition-all ${colors.inputBg} border ${colors.inputBorder} ${colors.inputText}`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-bold ${colors.textPrimary} mb-2`}>
                  End Date *
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className={`w-full px-4 py-2.5 rounded-lg text-sm transition-all ${colors.inputBg} border ${colors.inputBorder} ${colors.inputText}`}
                  required
                />
              </div>
            </div>

            {/* Default Action */}
            <div className={`rounded-lg border-2 ${colors.border} p-4 space-y-3`}>
              <h3 className={`text-sm font-black ${colors.textPrimary} flex items-center gap-2`}>
                <CheckCircle className="w-4 h-4" />
                Default Action
              </h3>
              <input
                type="text"
                value={defaultActionTitle}
                onChange={(e) => setDefaultActionTitle(e.target.value)}
                placeholder="Action title"
                className={`w-full px-3 py-2 rounded-lg text-sm ${colors.inputBg} border ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder}`}
              />
              <textarea
                value={defaultActionDescription}
                onChange={(e) => setDefaultActionDescription(e.target.value)}
                placeholder="Action description"
                rows={2}
                className={`w-full px-3 py-2 rounded-lg text-sm ${colors.inputBg} border ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder} resize-none`}
              />
            </div>

            {/* Attachments */}
            <div>
              <label className={`block text-sm font-bold ${colors.textPrimary} mb-2 flex items-center gap-2`}>
                <Paperclip className="w-4 h-4" />
                Attachments (Optional)
              </label>
              <p className={`text-xs ${colors.textSecondary} mb-3`}>
                Upload sprint documents, specifications, or reference materials (Max 10MB per file)
              </p>
              
              <label className={`group relative cursor-pointer block`}>
                <div className={`relative overflow-hidden p-4 rounded-xl border-2 border-dashed transition-all duration-300 ${colors.inputBorder} hover:${colors.border} ${colors.inputBg}`}>
                  <div className="flex items-center justify-center gap-3">
                    <Paperclip className={`w-5 h-5 ${colors.textMuted}`} />
                    <span className={`text-sm font-semibold ${colors.textPrimary}`}>
                      Click to upload files
                    </span>
                  </div>
                </div>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="*/*"
                />
              </label>

              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className={`text-xs font-semibold ${colors.textPrimary}`}>
                    Attached Files ({attachments.length})
                  </p>
                  {attachments.map((att, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 bg-gradient-to-br ${charColors.bg} ${charColors.border}`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className={`w-4 h-4 flex-shrink-0 ${charColors.iconColor}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold ${charColors.text} truncate`}>
                            {att.name}
                          </p>
                          <p className={`text-xs ${colors.textMuted}`}>
                            {(att.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className={`ml-2 p-1.5 rounded-lg transition-all duration-300 hover:scale-110 ${colors.buttonGhost} ${colors.buttonGhostText}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Department Team Members */}
            <div>
              <label className={`block text-sm font-bold ${colors.textPrimary} mb-2`}>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{department} Team Members *</span>
                </div>
              </label>
              
              {fetchingDeptEmployees ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className={`w-6 h-6 animate-spin ${colors.textMuted}`} />
                </div>
              ) : deptEmployees.length === 0 ? (
                <div className={`p-4 rounded-lg border ${colors.border} ${colors.cardBg} text-center`}>
                  <p className={`text-sm ${colors.textMuted}`}>No employees found in {department}</p>
                </div>
              ) : (
                <div className={`rounded-lg border ${colors.border} overflow-hidden`}>
                  {/* Search Input */}
                  <div className={`p-3 border-b ${colors.border}`}>
                    <input
                      type="text"
                      value={deptEmployeeSearch}
                      onChange={(e) => setDeptEmployeeSearch(e.target.value)}
                      placeholder="Search by name or title..."
                      className={`w-full px-3 py-2 rounded-lg text-sm transition-all ${colors.inputBg} border ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder}`}
                    />
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto">
                    {filteredDeptEmployees.length === 0 ? (
                      <div className="p-4 text-center">
                        <p className={`text-sm ${colors.textMuted}`}>No employees match your search</p>
                      </div>
                    ) : (
                      filteredDeptEmployees.map((employee) => (
                        <div
                          key={employee._id}
                          className={`flex items-center justify-between p-3 border-b last:border-b-0 ${colors.borderSubtle} ${
                            selectedMembers.includes(employee._id)
                              ? `bg-gradient-to-r ${cardCharacters.informative.bg}`
                              : `${colors.cardBg} hover:${colors.cardBgHover}`
                          } transition-all cursor-pointer`}
                          onClick={() => handleMemberToggle(employee._id)}
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                                selectedMembers.includes(employee._id)
                                  ? `${cardCharacters.informative.border} ${cardCharacters.informative.bg}`
                                  : colors.border
                              }`}
                            >
                              {selectedMembers.includes(employee._id) && (
                                <CheckCircle className={`w-3.5 h-3.5 ${cardCharacters.informative.iconColor}`} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-bold ${colors.textPrimary}`}>
                                {employee['basicDetails.name'] || employee.username}
                              </p>
                              <p className={`text-xs ${colors.textMuted}`}>{employee.title || 'Employee'}</p>
                            </div>
                          </div>
                          
                          {selectedMembers.includes(employee._id) && !isDeptHead(employee._id) && (
                            <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="radio"
                                name="groupLead"
                                checked={groupLead === employee._id}
                                onChange={() => setGroupLead(employee._id)}
                                className="cursor-pointer w-4 h-4"
                              />
                              <span className={`text-xs font-bold ${colors.textMuted}`}>Lead</span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Add Organization Members */}
            <div>
              <label className={`block text-sm font-bold ${colors.textPrimary} mb-2 flex items-center gap-2`}>
                <Search className="w-4 h-4" />
                Add Members from Other Departments (Optional)
              </label>
              <p className={`text-xs ${colors.textSecondary} mb-3`}>
                💡 Adding employees from other departments will automatically include their department heads
              </p>
              
              <div className="relative">
                <div className={`relative rounded-xl border-2 ${colors.inputBorder} ${colors.inputBg}`}>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Search className={`w-5 h-5 ${colors.textMuted}`} />
                  </div>
                  <input
                    type="text"
                    value={orgSearchQuery}
                    onChange={(e) => {
                      setOrgSearchQuery(e.target.value);
                      setShowOrgDropdown(true);
                    }}
                    onFocus={() => setShowOrgDropdown(true)}
                    placeholder="Search by name, username, title, or department..."
                    className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-transparent border-none outline-none ${colors.inputText} ${colors.inputPlaceholder}`}
                  />
                </div>
                
                {/* Search Results Dropdown */}
                {showOrgDropdown && orgSearchQuery && filteredOrgEmployees.length > 0 && (
                  <div className={`absolute z-50 w-full mt-2 rounded-xl border-2 shadow-lg max-h-64 overflow-y-auto ${colors.inputBg} ${colors.inputBorder}`}>
                    {filteredOrgEmployees.map(employee => (
                      <button
                        key={employee._id}
                        type="button"
                        onClick={() => addOrgEmployee(employee)}
                        className={`w-full text-left p-3 hover:bg-opacity-50 transition-all duration-200 border-b last:border-b-0 ${colors.borderSubtle}`}
                      >
                        <p className={`text-sm font-semibold ${colors.textPrimary}`}>
                          {employee['basicDetails.name'] || employee.username}
                        </p>
                        <p className={`text-xs ${colors.textMuted} mt-1`}>
                          {employee.department} {employee.title && `• ${employee.title}`}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
                
                {showOrgDropdown && orgSearchQuery && filteredOrgEmployees.length === 0 && (
                  <div className={`absolute z-50 w-full mt-2 rounded-xl border-2 shadow-lg p-4 text-center ${colors.inputBg} ${colors.inputBorder}`}>
                    <p className={`text-sm ${colors.textMuted}`}>
                      No employees found matching "{orgSearchQuery}"
                    </p>
                  </div>
                )}
              </div>

              {/* Selected Cross-Department Members */}
              {selectedMembers.filter(id => {
                const emp = getSelectedEmployee(id);
                return emp && emp.department !== department;
              }).length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className={`text-xs font-semibold ${colors.textPrimary}`}>
                    Cross-Department Members ({selectedMembers.filter(id => getSelectedEmployee(id)?.department !== department).length})
                  </p>
                  {selectedMembers.filter(id => {
                    const emp = getSelectedEmployee(id);
                    return emp && emp.department !== department;
                  }).map((memberId) => {
                    const member = getSelectedEmployee(memberId);
                    if (!member) return null;
                    return (
                      <div
                        key={memberId}
                        className={`flex items-center justify-between p-3 rounded-lg border-2 bg-gradient-to-br ${cardCharacters.informative.bg} ${cardCharacters.informative.border}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`text-sm font-semibold ${cardCharacters.informative.text} truncate`}>
                              {member['basicDetails.name'] || member.username}
                            </p>
                            {getEmployeeDepartmentBadge(member)}
                            {isDeptHead(memberId) && (
                              <span className={`text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400`}>
                                Dept Head
                              </span>
                            )}
                          </div>
                          <p className={`text-xs ${colors.textMuted} truncate`}>
                            {member.title}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleMemberToggle(memberId)}
                          className={`ml-2 p-1.5 rounded-lg transition-all duration-300 hover:scale-110 ${colors.buttonGhost} ${colors.buttonGhostText}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedMembers.length > 0 && (
              <p className={`text-xs ${colors.textMuted}`}>
                Total Selected: {selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''}
                {groupLead && ` • Lead: ${getSelectedEmployee(groupLead)?.['basicDetails.name'] || 'Unknown'}`}
              </p>
            )}
          </form>
        </div>

        {/* Modal Footer */}
        <div className={`
          relative px-6 py-4 border-t ${colors.modalFooterBorder}
          ${colors.modalFooterBg} flex justify-end gap-3
        `}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className={`group relative px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 overflow-hidden border-2 ${colors.buttonSecondary} ${colors.buttonSecondaryText} disabled:opacity-50`}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || selectedMembers.length === 0 || !groupLead}
            className={`group relative px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 overflow-hidden border-2 bg-gradient-to-r ${colors.buttonPrimary} ${colors.buttonPrimaryText} disabled:opacity-50 flex items-center space-x-2`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Create Sprint</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}