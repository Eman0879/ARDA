// app/(Dashboard)/admin/components/DownloadLogs.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Eye, Loader2 } from 'lucide-react';
import LogSelector from './AdminDownloadLogs/LogSelector';
import DownloadButton from './AdminDownloadLogs/DownloadButton';
import LogViewer from './AdminDownloadLogs/LogViewer';

export default function DownloadLogs() {
  const [selectedType, setSelectedType] = useState<'org' | 'dept'>('org');
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Logs viewer state
  const [viewingLogs, setViewingLogs] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [logsError, setLogsError] = useState('');

  // Fetch departments from database
  useEffect(() => {
    const fetchDepartments = async () => {
      setLoadingDepartments(true);
      try {
        const response = await fetch('/api/departments');
        if (response.ok) {
          const data = await response.json();
          setDepartments(data.departments);
          if (data.departments.length > 0) {
            setSelectedDepartment(data.departments[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
        setErrorMessage('Failed to load departments');
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    setStatus('processing');
    setErrorMessage('');

    try {
      const response = await fetch('/api/download-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          department: selectedType === 'dept' ? selectedDepartment : undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate logs');
      }

      // Get the blob and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const filename = selectedType === 'org'
        ? `Org_Announcements_Log_${new Date().toISOString().split('T')[0]}.txt`
        : `${selectedDepartment}_Announcements_Log_${new Date().toISOString().split('T')[0]}.txt`;
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error('Error downloading logs:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to download logs. Please try again.');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    } finally {
      setDownloading(false);
    }
  };

  const handleViewLogs = async () => {
    setLoadingLogs(true);
    setLogsError('');
    setViewingLogs(true);

    try {
      const response = await fetch('/api/view-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          department: selectedType === 'dept' ? selectedDepartment : undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load logs');
      }

      const data = await response.json();
      setLogs(data.announcements);
    } catch (error) {
      console.error('Error loading logs:', error);
      setLogsError(error instanceof Error ? error.message : 'Failed to load logs. Please try again.');
    } finally {
      setLoadingLogs(false);
    }
  };

  // Re-fetch logs when type or department changes
  useEffect(() => {
    if (viewingLogs) {
      handleViewLogs();
    }
  }, [selectedType, selectedDepartment]);

  const isDisabled = selectedType === 'dept' && (loadingDepartments || departments.length === 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-4 bg-gradient-to-br from-[#0000FF]/20 to-[#6495ED]/20 rounded-2xl border-2 border-[#0000FF]/40">
          <FileText className="h-8 w-8 text-[#87CEEB]" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-white">Download Logs</h1>
          <p className="text-[#87CEEB] font-semibold mt-1">
            Export and view comprehensive announcement logs with all comments and history
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-xl rounded-2xl p-8 border-2 border-[#0000FF]/40">
        <div className="space-y-6">
          {/* Log Selector */}
          <LogSelector
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            departments={departments}
            selectedDepartment={selectedDepartment}
            onDepartmentChange={setSelectedDepartment}
            loadingDepartments={loadingDepartments}
          />

          {/* Download Button */}
          <DownloadButton
            selectedType={selectedType}
            selectedDepartment={selectedDepartment}
            downloading={downloading}
            status={status}
            errorMessage={errorMessage}
            onDownload={handleDownload}
            disabled={isDisabled}
          />

          {/* View Logs Button */}
          <button
            onClick={handleViewLogs}
            disabled={loadingLogs || isDisabled}
            className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-3 ${
              loadingLogs || isDisabled
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#6495ED] to-[#87CEEB] hover:from-[#87CEEB] hover:to-[#6495ED] shadow-lg hover:shadow-xl transform hover:scale-105'
            }`}
          >
            {loadingLogs ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading Logs...
              </>
            ) : (
              <>
                <Eye className="h-5 w-5" />
                View {selectedType === 'org' ? 'Organization' : 'Department'} Logs
              </>
            )}
          </button>
        </div>
      </div>

      {/* Logs Viewer */}
      {viewingLogs && (
        <div className="space-y-4">
          {loadingLogs ? (
            <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-xl rounded-2xl p-8 border-2 border-[#0000FF]/40 flex items-center justify-center">
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 text-[#87CEEB] animate-spin" />
                <p className="text-[#87CEEB] font-semibold">Loading logs...</p>
              </div>
            </div>
          ) : logsError ? (
            <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-xl rounded-2xl p-8 border-2 border-red-500/40">
              <p className="text-red-400 font-semibold text-center">{logsError}</p>
            </div>
          ) : (
            <LogViewer
              announcements={logs}
              type={selectedType}
              department={selectedDepartment}
            />
          )}
        </div>
      )}

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-gradient-to-br from-gray-900/60 to-black/60 rounded-xl border-2 border-gray-700/40">
          <h3 className="font-black text-white mb-2">Complete History</h3>
          <p className="text-sm text-gray-400">All announcements from creation to present, including deleted items</p>
        </div>
        <div className="p-6 bg-gradient-to-br from-gray-900/60 to-black/60 rounded-xl border-2 border-gray-700/40">
          <h3 className="font-black text-white mb-2">Full Comments</h3>
          <p className="text-sm text-gray-400">Every comment with author, timestamp, and pinned status</p>
        </div>
        <div className="p-6 bg-gradient-to-br from-gray-900/60 to-black/60 rounded-xl border-2 border-gray-700/40">
          <h3 className="font-black text-white mb-2">Audit Ready</h3>
          <p className="text-sm text-gray-400">Professional format suitable for compliance and auditing</p>
        </div>
      </div>
    </div>
  );
}