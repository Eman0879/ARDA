import React, { useState, useEffect } from 'react';
import { 
  Plus, X, GripVertical, Trash2, Copy, Settings, 
  Type, AlignLeft, ChevronDown, Circle, CheckSquare,
  Hash, Calendar, Upload, Table, Save, RotateCcw
} from 'lucide-react';
import { FormField, FormSchema } from './types';
import { useTheme } from '@/app/context/ThemeContext';

interface Props {
  initialSchema: FormSchema;
  onSave: (schema: FormSchema) => void;
  onCancel: () => void;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Short Text', icon: Type },
  { value: 'textarea', label: 'Long Text', icon: AlignLeft },
  { value: 'dropdown', label: 'Dropdown', icon: ChevronDown },
  { value: 'radio', label: 'Multiple Choice', icon: Circle },
  { value: 'checkbox', label: 'Checkboxes', icon: CheckSquare },
  { value: 'number', label: 'Number', icon: Hash },
  { value: 'date', label: 'Date', icon: Calendar },
  { value: 'file', label: 'File Upload', icon: Upload },
  { value: 'table', label: 'Table/Grid', icon: Table },
];

export default function FormBuilderModal({ initialSchema, onSave, onCancel }: Props) {
  const { colors, theme } = useTheme();
  
  const getDefaultFields = () => [
    {
      id: 'default-title',
      type: 'text' as const,
      label: 'Title',
      placeholder: 'Enter ticket title',
      required: true,
      order: 0
    },
    {
      id: 'default-description',
      type: 'textarea' as const,
      label: 'Description',
      placeholder: 'Describe the issue in detail',
      required: true,
      order: 1
    },
    {
      id: 'default-urgency',
      type: 'dropdown' as const,
      label: 'Urgency',
      required: true,
      options: ['Low', 'Medium', 'High'],
      order: 2
    },
    {
      id: 'default-urgency-reason',
      type: 'textarea' as const,
      label: 'Reason for High Priority',
      placeholder: 'Explain why this is urgent (required for High priority)',
      required: false,
      order: 3
    },
    {
      id: 'default-attachments',
      type: 'file' as const,
      label: 'Attachments',
      placeholder: 'Upload relevant files',
      required: false,
      order: 4
    }
  ];

  const initializeFields = () => {
    const defaultFieldIds = ['default-title', 'default-description', 'default-urgency', 'default-urgency-reason', 'default-attachments'];
    const customFieldsOnly = initialSchema.fields.filter(f => !defaultFieldIds.includes(f.id));
    
    if (initialSchema.useDefaultFields) {
      return [...getDefaultFields(), ...customFieldsOnly];
    }
    
    return initialSchema.fields;
  };
  
  const [fields, setFields] = useState<FormField[]>(initializeFields());
  const [useDefaultFields, setUseDefaultFields] = useState(initialSchema.useDefaultFields);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [draggedField, setDraggedField] = useState<string | null>(null);

  useEffect(() => {
    const defaultFieldIds = ['default-title', 'default-description', 'default-urgency', 'default-urgency-reason', 'default-attachments'];
    const customFieldsOnly = fields.filter(f => !defaultFieldIds.includes(f.id));
    
    if (useDefaultFields) {
      setFields([...getDefaultFields(), ...customFieldsOnly]);
    } else {
      setFields(customFieldsOnly);
    }
  }, [useDefaultFields]);

  const modalBg = theme === 'dark' ? '#0a0a1a' : '#ffffff';
  const modalBorder = theme === 'dark' ? 'rgba(100, 181, 246, 0.2)' : 'rgba(33, 150, 243, 0.2)';
  const fieldBg = theme === 'dark' ? 'rgba(100, 181, 246, 0.05)' : 'rgba(33, 150, 243, 0.03)';
  const fieldBgHover = theme === 'dark' ? 'rgba(100, 181, 246, 0.1)' : 'rgba(33, 150, 243, 0.06)';
  const fieldBgSelected = theme === 'dark' ? 'rgba(100, 181, 246, 0.15)' : 'rgba(33, 150, 243, 0.12)';
  const sidebarBg = theme === 'dark' ? 'rgba(26, 26, 46, 0.6)' : 'rgba(245, 247, 250, 0.8)';

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type,
      label: `New ${FIELD_TYPES.find(t => t.value === type)?.label || 'Field'}`,
      required: false,
      order: fields.length,
      ...(type === 'dropdown' || type === 'radio' || type === 'checkbox' ? {
        options: ['Option 1', 'Option 2', 'Option 3']
      } : {}),
      ...(type === 'table' ? {
        tableConfig: {
          columns: [
            { id: 'col1', label: 'Column 1', type: 'text' },
            { id: 'col2', label: 'Column 2', type: 'text' }
          ],
          minRows: 1,
          maxRows: 10
        }
      } : {})
    };
    setFields([...fields, newField]);
    setSelectedField(newField.id);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const deleteField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
    if (selectedField === id) setSelectedField(null);
  };

  const duplicateField = (id: string) => {
    const field = fields.find(f => f.id === id);
    if (field) {
      const newField = { 
        ...JSON.parse(JSON.stringify(field)), 
        id: `field-${Date.now()}`,
        order: fields.length 
      };
      setFields([...fields, newField]);
    }
  };

  const handleDragStart = (id: string) => {
    setDraggedField(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedField || draggedField === targetId) return;

    const draggedIdx = fields.findIndex(f => f.id === draggedField);
    const targetIdx = fields.findIndex(f => f.id === targetId);

    const newFields = [...fields];
    const [removed] = newFields.splice(draggedIdx, 1);
    newFields.splice(targetIdx, 0, removed);

    setFields(newFields.map((f, i) => ({ ...f, order: i })));
  };

  const handleDragEnd = () => {
    setDraggedField(null);
  };

  const handleSave = () => {
    const defaultFieldIds = ['default-title', 'default-description', 'default-urgency', 'default-urgency-reason', 'default-attachments'];
    const customFields = fields.filter(f => !defaultFieldIds.includes(f.id));
    
    const defaultFields = fields.filter(f => defaultFieldIds.includes(f.id));
    const allDefaultsPresent = defaultFields.length === 5;
    
    const originalDefaults = [
      { id: 'default-title', label: 'Title', placeholder: 'Enter ticket title', required: true },
      { id: 'default-description', label: 'Description', placeholder: 'Describe the issue in detail', required: true },
      { id: 'default-urgency', label: 'Urgency', required: true },
      { id: 'default-urgency-reason', label: 'Reason for High Priority', placeholder: 'Explain why this is urgent (required for High priority)', required: false },
      { id: 'default-attachments', label: 'Attachments', placeholder: 'Upload relevant files', required: false }
    ];
    
    const defaultsModified = defaultFields.some((field) => {
      const original = originalDefaults.find(d => d.id === field.id);
      if (!original) return true;
      return field.label !== original.label || 
             field.placeholder !== original.placeholder || 
             field.required !== original.required;
    });
    
    if (useDefaultFields && allDefaultsPresent && !defaultsModified) {
      onSave({ 
        fields: customFields, 
        useDefaultFields: true 
      });
    } else if (defaultsModified || !allDefaultsPresent) {
      onSave({ 
        fields: fields,
        useDefaultFields: false
      });
    } else {
      onSave({ 
        fields: customFields, 
        useDefaultFields: false 
      });
    }
  };

  const resetToDefault = () => {
    setUseDefaultFields(true);
    setFields(getDefaultFields());
    setSelectedField(null);
  };

  const selectedFieldData = fields.find(f => f.id === selectedField);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-6xl h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl"
        style={{
          background: modalBg,
          border: `2px solid ${modalBorder}`
        }}
      >
        {/* Header */}
        <div 
          className="p-5 border-b flex items-center justify-between"
          style={{ borderColor: modalBorder }}
        >
          <div>
            <h2 className={`text-2xl font-black ${colors.textPrimary}`}>
              Customize Ticket Form
            </h2>
            <p className={`text-sm ${colors.textSecondary} mt-1`}>
              Add or modify fields that users will fill when raising a ticket
            </p>
          </div>
          <button
            onClick={onCancel}
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors.textSecondary} hover:bg-red-500/20 transition-all duration-300 hover:scale-110`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Field Types */}
          <div 
            className="w-72 p-5 border-r overflow-y-auto"
            style={{ 
              borderColor: modalBorder,
              background: sidebarBg
            }}
          >
            <div className="mb-5">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={useDefaultFields}
                  onChange={(e) => setUseDefaultFields(e.target.checked)}
                  className="w-5 h-5 cursor-pointer"
                />
                <span className={`text-sm font-bold ${colors.textPrimary} group-hover:${colors.textAccent} transition-colors`}>
                  Include Default Fields
                </span>
              </label>
              <p className={`text-xs ${colors.textSecondary} mt-1.5 ml-7`}>
                Title, Description, Urgency, Reason, Attachments
              </p>
            </div>

            <div 
              className="h-px mb-5"
              style={{ background: modalBorder }}
            />

            <p className={`text-xs font-black ${colors.textSecondary} uppercase tracking-wider mb-3`}>
              Add Field
            </p>
            <div className="space-y-2">
              {FIELD_TYPES.map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => addField(type.value as FormField['type'])}
                    className={`w-full p-3 rounded-lg flex items-center gap-3 text-sm font-semibold transition-all duration-200 ${colors.textPrimary}`}
                    style={{
                      background: fieldBg,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = fieldBgHover}
                    onMouseLeave={(e) => e.currentTarget.style.background = fieldBg}
                  >
                    <Icon className="w-4 h-4" style={{ color: colors.brandBlue }} />
                    <span>{type.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={resetToDefault}
              className={`w-full mt-5 p-3 rounded-lg flex items-center justify-center gap-2 text-sm font-bold border-2 transition-all duration-300 hover:scale-105`}
              style={{
                borderColor: modalBorder,
                color: colors.textSecondary,
                background: fieldBg
              }}
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Default
            </button>
          </div>

          {/* Middle Panel - Form Preview */}
          <div className="flex-1 p-6 overflow-y-auto">
            {fields.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Settings className={`w-20 h-20 mx-auto mb-4 ${colors.textMuted}`} />
                  <p className={`text-lg font-bold ${colors.textPrimary} mb-2`}>
                    No Fields Yet
                  </p>
                  <p className={`text-sm ${colors.textSecondary}`}>
                    Enable default fields or add custom fields from the left panel
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {fields.map(field => (
                  <div
                    key={field.id}
                    draggable
                    onDragStart={() => handleDragStart(field.id)}
                    onDragOver={(e) => handleDragOver(e, field.id)}
                    onDragEnd={handleDragEnd}
                    className="p-4 rounded-xl border-2 cursor-pointer transition-all duration-200"
                    style={{
                      background: selectedField === field.id ? fieldBgSelected : fieldBg,
                      borderColor: selectedField === field.id ? colors.brandBlue : modalBorder,
                    }}
                    onClick={() => setSelectedField(field.id)}
                  >
                    <div className="flex items-start gap-3">
                      <GripVertical className={`w-5 h-5 flex-shrink-0 cursor-grab ${colors.textMuted}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-sm font-bold ${colors.textPrimary}`}>
                            {field.label}
                          </span>
                          {field.required && (
                            <span className="text-red-500 text-xs font-bold">*</span>
                          )}
                          <span 
                            className="text-xs px-2 py-1 rounded font-semibold"
                            style={{
                              background: theme === 'dark' ? 'rgba(100,181,246,0.15)' : 'rgba(33,150,243,0.1)',
                              color: colors.brandBlue
                            }}
                          >
                            {FIELD_TYPES.find(t => t.value === field.type)?.label}
                          </span>
                        </div>
                        {field.placeholder && (
                          <p className={`text-xs ${colors.textMuted}`}>{field.placeholder}</p>
                        )}
                        {(field.type === 'dropdown' || field.type === 'radio' || field.type === 'checkbox') && field.options && (
                          <div className="mt-2 space-y-1">
                            {field.options.map((opt, i) => (
                              <div key={i} className={`text-xs ${colors.textSecondary}`}>
                                • {opt}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); duplicateField(field.id); }}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors.textMuted} hover:bg-blue-500/20 transition-all duration-200 hover:scale-110`}
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteField(field.id); }}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors.textMuted} hover:bg-red-500/20 transition-all duration-200 hover:scale-110`}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel - Field Settings */}
          {selectedFieldData && (
            <div 
              className="w-80 p-5 border-l overflow-y-auto"
              style={{ 
                borderColor: modalBorder,
                background: sidebarBg
              }}
            >
              <p className={`text-sm font-black ${colors.textPrimary} mb-5 uppercase tracking-wider`}>
                Field Settings
              </p>

              <div className="space-y-4">
                <div>
                  <label className={`block text-xs font-bold ${colors.textSecondary} mb-2 uppercase tracking-wide`}>
                    Label
                  </label>
                  <input
                    type="text"
                    value={selectedFieldData.label}
                    onChange={(e) => updateField(selectedFieldData.id, { label: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-lg text-sm ${colors.inputBg} border-2 ${colors.inputBorder} ${colors.textPrimary} focus:outline-none focus:border-[#64B5F6]`}
                  />
                </div>

                {selectedFieldData.type !== 'table' && (
                  <div>
                    <label className={`block text-xs font-bold ${colors.textSecondary} mb-2 uppercase tracking-wide`}>
                      Placeholder
                    </label>
                    <input
                      type="text"
                      value={selectedFieldData.placeholder || ''}
                      onChange={(e) => updateField(selectedFieldData.id, { placeholder: e.target.value })}
                      className={`w-full px-3 py-2.5 rounded-lg text-sm ${colors.inputBg} border-2 ${colors.inputBorder} ${colors.textPrimary} focus:outline-none focus:border-[#64B5F6]`}
                    />
                  </div>
                )}

                <div>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedFieldData.required}
                      onChange={(e) => updateField(selectedFieldData.id, { required: e.target.checked })}
                      className="w-5 h-5 cursor-pointer"
                    />
                    <span className={`text-sm font-bold ${colors.textPrimary} group-hover:${colors.textAccent} transition-colors`}>
                      Required Field
                    </span>
                  </label>
                </div>

                {(selectedFieldData.type === 'dropdown' || selectedFieldData.type === 'radio' || selectedFieldData.type === 'checkbox') && (
                  <div>
                    <label className={`block text-xs font-bold ${colors.textSecondary} mb-2 uppercase tracking-wide`}>
                      Options
                    </label>
                    {selectedFieldData.options?.map((opt, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOptions = [...(selectedFieldData.options || [])];
                            newOptions[i] = e.target.value;
                            updateField(selectedFieldData.id, { options: newOptions });
                          }}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm ${colors.inputBg} border-2 ${colors.inputBorder} ${colors.textPrimary} focus:outline-none focus:border-[#64B5F6]`}
                        />
                        <button
                          onClick={() => {
                            const newOptions = selectedFieldData.options?.filter((_, idx) => idx !== i);
                            updateField(selectedFieldData.id, { options: newOptions });
                          }}
                          className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-red-500/20 transition-all duration-200 hover:scale-110"
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newOptions = [...(selectedFieldData.options || []), `Option ${(selectedFieldData.options?.length || 0) + 1}`];
                        updateField(selectedFieldData.id, { options: newOptions });
                      }}
                      className={`text-sm font-semibold flex items-center gap-1 transition-colors hover:opacity-80`}
                      style={{ color: colors.brandBlue }}
                    >
                      <Plus className="w-4 h-4" />
                      Add Option
                    </button>
                  </div>
                )}

                {selectedFieldData.type === 'table' && (
                  <div>
                    <label className={`block text-xs font-bold ${colors.textSecondary} mb-3 uppercase tracking-wide`}>
                      Table Columns
                    </label>
                    {selectedFieldData.tableConfig?.columns.map((col, i) => (
                      <div key={col.id} className="mb-3 p-3 rounded-lg border-2" style={{ borderColor: modalBorder, background: fieldBg }}>
                        <input
                          type="text"
                          value={col.label}
                          onChange={(e) => {
                            const newCols = [...(selectedFieldData.tableConfig?.columns || [])];
                            newCols[i] = { ...newCols[i], label: e.target.value };
                            updateField(selectedFieldData.id, { 
                              tableConfig: { ...selectedFieldData.tableConfig!, columns: newCols }
                            });
                          }}
                          className={`w-full px-3 py-2 rounded-lg text-xs ${colors.inputBg} border ${colors.inputBorder} ${colors.textPrimary} focus:outline-none focus:border-[#64B5F6] mb-2`}
                        />
                        <select
                          value={col.type}
                          onChange={(e) => {
                            const newCols = [...(selectedFieldData.tableConfig?.columns || [])];
                            newCols[i] = { ...newCols[i], type: e.target.value as any };
                            updateField(selectedFieldData.id, { 
                              tableConfig: { ...selectedFieldData.tableConfig!, columns: newCols }
                            });
                          }}
                          className={`w-full px-3 py-2 rounded-lg text-xs ${colors.inputBg} border ${colors.inputBorder} ${colors.textPrimary} focus:outline-none focus:border-[#64B5F6]`}
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="dropdown">Dropdown</option>
                          <option value="date">Date</option>
                        </select>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newCols = [
                          ...(selectedFieldData.tableConfig?.columns || []),
                          { id: `col-${Date.now()}`, label: 'New Column', type: 'text' as const }
                        ];
                        updateField(selectedFieldData.id, { 
                          tableConfig: { ...selectedFieldData.tableConfig!, columns: newCols }
                        });
                      }}
                      className={`text-xs font-semibold flex items-center gap-1 transition-colors hover:opacity-80`}
                      style={{ color: colors.brandBlue }}
                    >
                      <Plus className="w-3 h-3" />
                      Add Column
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div 
          className="p-5 border-t flex items-center justify-between"
          style={{ borderColor: modalBorder }}
        >
          <p className={`text-sm font-semibold ${colors.textSecondary}`}>
            {fields.length} field{fields.length !== 1 ? 's' : ''} configured
            {useDefaultFields && fields.filter(f => f.id.startsWith('field-')).length === 0 && ' (5 defaults)'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className={`px-6 py-3 rounded-xl font-bold text-sm border-2 ${colors.border} ${colors.textPrimary} transition-all duration-300 hover:scale-105`}
              style={{
                background: theme === 'dark' ? 'rgba(100,181,246,0.05)' : 'rgba(33,150,243,0.03)'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="group relative px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105 flex items-center gap-2 overflow-hidden"
              style={{ 
                background: `linear-gradient(135deg, ${colors.brandBlue}, ${colors.brandLightBlue})`, 
                color: 'white',
                boxShadow: `0 4px 20px ${colors.brandBlue}40`
              }}
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: `inset 0 0 30px ${colors.glowPrimary}` }}
              ></div>
              <Save className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Save Form</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}