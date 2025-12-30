// app/(Dashboard)/admin/components/ManageUsersContent/BulkUserUpload.tsx
'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Download, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

interface BulkUserUploadProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkUserUpload({ onClose, onSuccess }: BulkUserUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [results, setResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResults(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls') || droppedFile.name.endsWith('.csv'))) {
      setFile(droppedFile);
      setResults(null);
    } else {
      alert('Please drop a valid Excel (.xlsx, .xls) or CSV (.csv) file');
    }
  };

  const downloadTemplate = () => {
    // Create empty template with just headers - exact column names
    const templateData = [
      {
        username: '',
        password: '',
        department: '',
        title: '',
        isDeptHead: '',
        employeeNumber: '',
        name: '',
        fatherName: '',
        gender: '',
        religion: '',
        nationality: '',
        age: '',
        maritalStatus: '',
        CNIC: '',
        birthCountry: '',
        dateOfBirth: '',
        drivingLicense: '',
        drivingLicenseNumber: '',
        dateOfMarriage: '',
        bloodGroup: '',
        EOBI: '',
        contactNumber: '',
        telephoneNumber: '',
        email: '',
        addressLine1: '',
        addressLine2: '',
        postalCode: '',
        district: '',
        country: '',
        emergencyNumber: '',
        emergencyRelation: '',
        employeeGroup: '',
        employeeSubGroup: '',
        joiningDate: '',
        personnelArea: '',
        basicDetailsTitle: ''
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users Template');
    
    // Set column widths for better readability
    ws['!cols'] = [
      { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 12 }, { wch: 15 },
      { wch: 20 }, { wch: 20 }, { wch: 10 }, { wch: 15 }, { wch: 12 }, { wch: 5 },
      { wch: 15 }, { wch: 18 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 18 },
      { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, 
      { wch: 20 }, { wch: 20 }, { wch: 10 }, { wch: 15 }, { wch: 10 }, { wch: 15 }, 
      { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 20 }
    ];

    XLSX.writeFile(wb, 'pepsi_users_template.xlsx');
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }

    setUploading(true);
    setResults(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const response = await fetch('/api/admin/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: jsonData })
      });

      const result = await response.json();
      
      if (response.ok) {
        setResults(result);
        if (result.success > 0) {
          setTimeout(() => {
            onSuccess();
            if (result.failed === 0) {
              onClose();
            }
          }, 2000);
        }
      } else {
        alert(result.error || 'Failed to upload users');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to process file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border-2 border-[#0000FF]/40 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Upload className="h-8 w-8 text-[#87CEEB]" />
            <h3 className="text-3xl font-black text-white">Bulk User Upload</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-all"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-[#0000FF]/10 border border-[#0000FF]/30 rounded-xl p-4 mb-6">
          <h4 className="text-[#87CEEB] font-bold mb-2 flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Instructions
          </h4>
          <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
            <li>Download the empty template file</li>
            <li>Fill in your user data following the column headers</li>
            <li><strong>Required fields:</strong> username, password, name, department</li>
            <li>isDeptHead should be TRUE or FALSE (case insensitive)</li>
            <li>Save as Excel (.xlsx) or CSV (.csv) file</li>
            <li>Upload the file to add all users at once</li>
          </ul>
        </div>

        {/* Download Template Button */}
        <button
          onClick={downloadTemplate}
          className="w-full mb-6 px-6 py-4 bg-gradient-to-r from-[#0000FF] to-[#6495ED] hover:from-[#6495ED] hover:to-[#0000FF] rounded-xl text-white font-bold transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Download className="h-5 w-5" />
          Download Empty Template
        </button>

        {/* Drag & Drop File Upload Area */}
        <div className="mb-6">
          <label className="block text-[#87CEEB] font-bold mb-3">Upload File</label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-[#0000FF] bg-[#0000FF]/10'
                : 'border-[#0000FF]/40 hover:border-[#0000FF]/60'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
              id="bulk-upload-input"
            />
            <Upload className={`h-12 w-12 mx-auto mb-3 transition-colors ${
              isDragging ? 'text-[#0000FF]' : 'text-gray-400'
            }`} />
            <div>
              <p className="text-white font-semibold">
                {file ? file.name : 'Click or drag & drop your file here'}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Excel (.xlsx, .xls) or CSV (.csv)
              </p>
              {file && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setResults(null);
                  }}
                  className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm font-semibold transition-colors"
                >
                  Remove File
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className={`w-full px-6 py-4 rounded-xl text-white font-bold transition-all flex items-center justify-center gap-3 ${
            !file || uploading
              ? 'bg-gray-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFA500] hover:to-[#FFD700] shadow-lg hover:shadow-xl transform hover:scale-105'
          }`}
        >
          {uploading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="h-5 w-5" />
              Upload Users
            </>
          )}
        </button>

        {/* Results */}
        {results && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-[#228B22]/20 border border-[#228B22]/40 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-[#90EE90]" />
                  <div>
                    <p className="text-[#90EE90] font-bold text-lg">{results.success}</p>
                    <p className="text-gray-400 text-sm">Users Created</p>
                  </div>
                </div>
              </div>

              {results.failed > 0 && (
                <div className="flex-1 bg-[#FF0000]/20 border border-[#FF0000]/40 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-6 w-6 text-[#FF6B6B]" />
                    <div>
                      <p className="text-[#FF6B6B] font-bold text-lg">{results.failed}</p>
                      <p className="text-gray-400 text-sm">Failed</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {results.errors.length > 0 && (
              <div className="bg-[#FF0000]/10 border border-[#FF0000]/30 rounded-lg p-4 max-h-40 overflow-y-auto">
                <p className="text-[#FF6B6B] font-bold mb-2">Errors:</p>
                <ul className="text-gray-300 text-sm space-y-1">
                  {results.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}