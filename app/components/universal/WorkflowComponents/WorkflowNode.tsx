import React, { useState } from 'react';
import { Trash2, Users, Play, CheckCircle2 } from 'lucide-react';
import { WorkflowNode as WorkflowNodeType, Employee } from './types';
import { useTheme } from '@/app/context/ThemeContext';

interface Props {
  node: WorkflowNodeType;
  zoom: number;
  pan: { x: number; y: number };
  selected: boolean;
  isConnecting: boolean;
  onClick: () => void;
  onDrag: (nodeId: string, x: number, y: number) => void;
  onConnectionStart: (nodeId: string, x: number, y: number) => void;
  onConnectionEnd: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  employees: Employee[];
}

export default function WorkflowNode({ 
  node, zoom, pan, selected, isConnecting, onClick, onDrag, 
  onConnectionStart, onConnectionEnd, onDelete, employees 
}: Props) {
  const { theme, colors, cardCharacters } = useTheme();
  const [isDragging, setIsDragging] = useState(false);

  const completedChar = cardCharacters.completed;
  const urgentChar = cardCharacters.urgent;
  const informativeChar = cardCharacters.informative;
  const creativeChar = cardCharacters.creative;

  // Connection port color - vibrant and visible
  const portColor = theme === 'dark' ? '#64B5F6' : '#2196F3';
  const portBorder = '#ffffff';
  
  // Delete button with high contrast
  const deleteButtonBg = theme === 'dark' ? '#1E293B' : '#ffffff';
  const deleteButtonIcon = theme === 'dark' ? '#EF9A9A' : '#EF5350';
  const deleteButtonBorder = theme === 'dark' ? '#EF5350' : '#EF5350';
  const deleteButtonHoverBg = theme === 'dark' ? '#EF5350' : '#EF5350';

  const style = {
    position: 'absolute' as const,
    left: `${node.position.x * zoom + pan.x}px`,
    top: `${node.position.y * zoom + pan.y}px`,
    transform: `scale(${zoom})`,
    transformOrigin: '0 0',
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isConnecting) return;
    e.stopPropagation();
    setIsDragging(true);
    onClick();
    const startX = e.clientX, startY = e.clientY;
    const startNodeX = node.position.x, startNodeY = node.position.y;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      onDrag(
        node.id, 
        startNodeX + (moveEvent.clientX - startX) / zoom, 
        startNodeY + (moveEvent.clientY - startY) / zoom
      );
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleConnectionPortMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    onConnectionStart(node.id, rect.left + rect.width / 2, rect.top + rect.height / 2);
  };

  const handleConnectionPortMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onConnectionEnd(node.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Delete' && selected && node.type === 'employee') {
      onDelete(node.id);
    }
  };

  const getGroupMembers = () => 
   //node.data.groupMembers?.map(id => employees.find(emp => emp._id === id)).filter(Boolean) as Employee[] || [];
   node.data.groupMembers ?.map(id => employees.find(emp => emp._id === id)).filter((emp): emp is Employee => Boolean(emp && emp.basicDetails)) || [];
  const getGroupLead = () => 
   //node.data.groupLead ? employees.find(emp => emp._id === node.data.groupLead) : null;
   node.data.groupLead ? employees.find(emp => emp._id === node.data.groupLead) ?? null : null;

  // START NODE
  if (node.type === 'start') {
    return (
      <div style={style} className="pointer-events-auto">
        <div className="relative">
          <div 
            className={`relative w-[120px] h-[120px] rounded-2xl flex flex-col items-center justify-center font-bold text-sm overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} border-4 bg-gradient-to-br ${completedChar.bg} ${colors.shadowCard}`}
            style={{
              borderColor: selected ? portColor : completedChar.border.replace('border-', '')
            }}
            onMouseDown={handleMouseDown}
            onClick={onClick}
          >
            <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.05]`}></div>
            <Play className={`w-12 h-12 mb-2 relative z-10 ${completedChar.iconColor}`} fill="currentColor" />
            <span className={`relative z-10 text-lg font-black ${completedChar.text}`}>START</span>
          </div>
          {/* Connection Port - Enhanced */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-4 cursor-pointer hover:scale-125 transition-all shadow-xl z-20"
            style={{ 
              right: '-14px',
              background: portColor,
              borderColor: portBorder,
              boxShadow: `0 0 16px ${portColor}`
            }}
            onMouseDown={handleConnectionPortMouseDown}
          />
        </div>
      </div>
    );
  }

  // END NODE
  if (node.type === 'end') {
    return (
      <div style={style} className="pointer-events-auto">
        <div className="relative">
          <div 
            className={`relative w-[120px] h-[120px] rounded-2xl flex flex-col items-center justify-center font-bold text-sm overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} border-4 bg-gradient-to-br ${urgentChar.bg} ${colors.shadowCard}`}
            style={{
              borderColor: selected ? portColor : urgentChar.border.replace('border-', '')
            }}
            onMouseDown={handleMouseDown}
            onClick={onClick}
          >
            <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.05]`}></div>
            <CheckCircle2 className={`w-12 h-12 mb-2 relative z-10 ${urgentChar.iconColor}`} />
            <span className={`relative z-10 text-lg font-black ${urgentChar.text}`}>END</span>
          </div>
          {/* Connection Port - Enhanced */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-4 cursor-pointer hover:scale-125 transition-all shadow-xl z-20"
            style={{ 
              left: '-14px',
              background: portColor,
              borderColor: portBorder,
              boxShadow: `0 0 16px ${portColor}`
            }}
            onMouseUp={handleConnectionPortMouseUp}
          />
        </div>
      </div>
    );
  }

  // PARALLEL GROUP NODE
  if (node.data.nodeType === 'parallel') {
    const groupLead = getGroupLead();
    const groupMembers = getGroupMembers();
    
    return (
      <div 
        style={style} 
        className={`pointer-events-auto ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onClick={onClick}
        onMouseDown={handleMouseDown}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <div className="relative">
          <div 
            className={`relative w-[240px] p-5 rounded-xl overflow-hidden bg-gradient-to-br ${creativeChar.bg} border-3 ${colors.shadowCard} backdrop-blur-sm`}
            style={{
              borderColor: selected ? portColor : creativeChar.border.replace('border-', '')
            }}
          >
            <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
            
            <div className="relative space-y-3">
              <div className="flex items-center gap-3 pb-3 border-b-2" style={{ borderColor: creativeChar.border.replace('border-', '') }}>
                <div className={`p-2.5 rounded-lg bg-gradient-to-r ${creativeChar.bg}`}>
                  <Users className={`w-5 h-5 ${creativeChar.iconColor}`} />
                </div>
                <div>
                  <p className={`text-sm font-black ${creativeChar.text}`}>Parallel Group</p>
                  <p className={`text-xs ${colors.textMuted}`}>{groupMembers.length} members</p>
                </div>
              </div>
              
              {groupLead && groupLead.basicDetails && (
                <div>
                  <p className={`text-[10px] font-bold ${colors.textMuted} mb-2 uppercase`}>Lead</p>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md"
                      style={{ background: `linear-gradient(135deg, ${creativeChar.iconColor.replace('text-', '')}, ${creativeChar.accent.replace('text-', '')})` }}
                    >
                      {groupLead.basicDetails.name.charAt(0)}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${creativeChar.text}`}>{groupLead.basicDetails.name}</p>
                      <p className={`text-xs ${colors.textSecondary}`}>{groupLead.title}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <p className={`text-[10px] font-bold ${colors.textMuted} mb-2 uppercase`}>Team</p>
                <div className="flex flex-wrap gap-1.5">
                  {groupMembers.slice(0, 6).map(m => (
                    <div 
                      key={m._id} 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                      style={{ background: `linear-gradient(135deg, ${creativeChar.iconColor.replace('text-', '')}, ${creativeChar.accent.replace('text-', '')})` }}
                      title={m.basicDetails.name}
                    >
                      {m.basicDetails.name.charAt(0)}
                    </div>
                  ))}
                  {groupMembers.length > 6 && (
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: colors.textMuted.replace('text-', '') }}
                    >
                      +{groupMembers.length - 6}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Connection Ports - Enhanced */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-4 cursor-pointer hover:scale-125 transition-all shadow-xl z-20"
            style={{ 
              left: '-14px', 
              background: portColor, 
              borderColor: portBorder,
              boxShadow: `0 0 16px ${portColor}`
            }}
            onMouseUp={handleConnectionPortMouseUp}
          />
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-4 cursor-pointer hover:scale-125 transition-all shadow-xl z-20"
            style={{ 
              right: '-14px', 
              background: portColor, 
              borderColor: portBorder,
              boxShadow: `0 0 16px ${portColor}`
            }}
            onMouseDown={handleConnectionPortMouseDown}
          />
          
          {/* Delete Button - High Contrast */}
          {selected && (
            <button 
              className="group absolute -top-3 -right-3 w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-xl z-30 border-4"
              style={{ 
                background: deleteButtonBg,
                borderColor: deleteButtonBorder
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = deleteButtonHoverBg;
                e.currentTarget.style.transform = 'scale(1.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = deleteButtonBg;
                e.currentTarget.style.transform = 'scale(1)';
              }}
              onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
            >
              <Trash2 
                className="w-5 h-5 transition-colors"
                style={{ color: deleteButtonIcon }}
              />
            </button>
          )}
        </div>
      </div>
    );
  }

  // EMPLOYEE NODE
  return (
    <div 
      style={style} 
      className={`pointer-events-auto ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      onClick={onClick}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="relative">
        <div 
          className={`relative w-[220px] p-4 rounded-xl overflow-hidden bg-gradient-to-br ${informativeChar.bg} border-3 ${colors.shadowCard} backdrop-blur-sm`}
          style={{
            borderColor: selected ? portColor : informativeChar.border.replace('border-', '')
          }}
        >
          <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
          
          <div className="relative flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0 shadow-md"
              style={{ background: `linear-gradient(135deg, ${informativeChar.iconColor.replace('text-', '')}, ${informativeChar.accent.replace('text-', '')})` }}
            >
              {node.data.employeeName?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-black truncate ${informativeChar.text}`}>
                {node.data.employeeName}
              </p>
              <p className={`text-xs truncate ${colors.textSecondary}`}>
                {node.data.employeeTitle}
              </p>
            </div>
          </div>
        </div>
        
        {/* Connection Ports - Enhanced */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-4 cursor-pointer hover:scale-125 transition-all shadow-xl z-20"
          style={{ 
            left: '-14px', 
            background: portColor, 
            borderColor: portBorder,
            boxShadow: `0 0 16px ${portColor}`
          }}
          onMouseUp={handleConnectionPortMouseUp}
        />
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-4 cursor-pointer hover:scale-125 transition-all shadow-xl z-20"
          style={{ 
            right: '-14px', 
            background: portColor, 
            borderColor: portBorder,
            boxShadow: `0 0 16px ${portColor}`
          }}
          onMouseDown={handleConnectionPortMouseDown}
        />
        
        {/* Delete Button - High Contrast */}
        {selected && (
          <button 
            className="group absolute -top-3 -right-3 w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-xl z-30 border-4"
            style={{ 
              background: deleteButtonBg,
              borderColor: deleteButtonBorder
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = deleteButtonHoverBg;
              e.currentTarget.style.transform = 'scale(1.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = deleteButtonBg;
              e.currentTarget.style.transform = 'scale(1)';
            }}
            onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
          >
            <Trash2 
              className="w-5 h-5 transition-colors"
              style={{ color: deleteButtonIcon }}
            />
          </button>
        )}
      </div>
    </div>
  );
}