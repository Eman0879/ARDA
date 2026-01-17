// app/components/ManageUsersContent/AddUserModal.tsx
'use client';

import React, { useState } from 'react';
import { X, User, Mail, Building2, Briefcase, Shield, Calendar, Phone, MapPin, BookOpen, Users as UsersIcon, Heart } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';

interface AddUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
  departments: string[];
}

interface NewUserForm {
  // Authentication
  username: string;
  department: string;
  title: string;
  isDeptHead: boolean;

  // Basic Details
  basicDetails: {
    title: string;
    name: string;
    fatherName: string;
    gender: string;
    religion: string;
    nationality: string;
    age: string;
    maritalStatus: string;
  };

  // Identification
  identification: {
    CNIC: string;
    birthCountry: string;
    dateOfBirth: string;
    drivingLicense: string;
    drivingLicenseNumber: string;
    dateOfMarriage: string;
    bloodGroup: string;
    EOBI: string;
  };

  // Contact Information
  contactInformation: {
    contactNumber: string;
    telephoneNumber: string;
    email: string;
    addressLine1: string;
    addressLine2: string;
    postalCode: string;
    district: string;
    country: string;
    emergencyNumber: string;
    emergencyRelation: string;
  };

  // Employment Details
  joiningDate: string;
  personnelArea: string;
  employeeGroup: string;
  employeeSubGroup: string;
  employeeNumber: string;
}

const initialFormState: NewUserForm = {
  username: '',
  department: '',
  title: '',
  isDeptHead: false,
  basicDetails: {
    title: 'Mr.',
    name: '',
    fatherName: '',
    gender: 'Male',
    religion: '',
    nationality: 'Pakistani',
    age: '',
    maritalStatus: 'Single',
  },
  identification: {
    CNIC: '',
    birthCountry: 'Pakistan',
    dateOfBirth: '',
    drivingLicense: 'No',
    drivingLicenseNumber: '',
    dateOfMarriage: '',
    bloodGroup: '',
    EOBI: '',
  },
  contactInformation: {
    contactNumber: '',
    telephoneNumber: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    postalCode: '',
    district: '',
    country: 'Pakistan',
    emergencyNumber: '',
    emergencyRelation: '',
  },
  joiningDate: '',
  personnelArea: '',
  employeeGroup: '',
  employeeSubGroup: '',
  employeeNumber: '',
};

export default function AddUserModal({ onClose, onSuccess, departments }: AddUserModalProps) {
  const { colors, cardCharacters, showToast } = useTheme();
  const charColors = cardCharacters.informative;

  const [formData, setFormData] = useState<NewUserForm>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);

  const sections = [
    { id: 'auth', label: 'Account', icon: Shield },
    { id: 'basic', label: 'Basic Details', icon: User },
    { id: 'identification', label: 'Identification', icon: Briefcase },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'employment', label: 'Employment', icon: Building2 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Show success toast with credentials info
        showToast(
          `User created! Username: ${data.username}, Password: ${data.password}. Credentials sent to ${formData.contactInformation.email}`,
          'success'
        );
        
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        showToast(`Failed to create user: ${error.message || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      showToast('Failed to create user. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateNestedField = (section: keyof NewUserForm, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }));
  };

  const renderSection = () => {
    switch (sections[currentSection].id) {
      case 'auth':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${colors.textSecondary}`}>
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder}`}
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${colors.textSecondary}`}>
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText}`}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${colors.textSecondary}`}>
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder}`}
                  placeholder="e.g., Senior Developer"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isDeptHead"
                  checked={formData.isDeptHead}
                  onChange={(e) => setFormData({ ...formData, isDeptHead: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isDeptHead" className={`ml-2 text-sm font-semibold ${colors.textSecondary}`}>
                  Department Head
                </label>
              </div>
            </div>
          </div>
        );

      case 'basic':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${colors.textSecondary}`}>
                  Title
                </label>
                <select
                  value={formData.basicDetails.title}
                  onChange={(e) => updateNestedField('basicDetails', 'title', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText}`}
                >
                  <option value="Mr.">Mr.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Dr.">Dr.</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${colors.textSecondary}`}>
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.basicDetails.name}
                  onChange={(e) => updateNestedField('basicDetails', 'name', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder}`}
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${colors.textSecondary}`}>
                  Father's Name
                </label>
                <input
                  type="text"
                  value={formData.basicDetails.fatherName}
                  onChange={(e) => updateNestedField('basicDetails', 'fatherName', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder}`}
                  placeholder="Enter father's name"
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${colors.textSecondary}`}>
                  Gender
                </label>
                <select
                  value={formData.basicDetails.gender}
                  onChange={(e) => updateNestedField('basicDetails', 'gender', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText}`}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${colors.textSecondary}`}>
                  Religion
                </label>
                <input
                  type="text"
                  value={formData.basicDetails.religion}
                  onChange={(e) => updateNestedField('basicDetails', 'religion', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder}`}
                  placeholder="Enter religion"
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${colors.textSecondary}`}>
                  Nationality
                </label>
                <input
                  type="text"
                  value={formData.basicDetails.nationality}
                  onChange={(e) => updateNestedField('basicDetails', 'nationality', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder}`}
                  placeholder="Enter nationality"
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${colors.textSecondary}`}>
                  Age
                </label>
                <input
                  type="number"
                  value={formData.basicDetails.age}
                  onChange={(e) => updateNestedField('basicDetails', 'age', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder}`}
                  placeholder="Enter age"
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${colors.textSecondary}`}>
                  Marital Status
                </label>
                <select
                  value={formData.basicDetails.maritalStatus}
                  onChange={(e) => updateNestedField('basicDetails', 'maritalStatus', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText}`}
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'identification':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${colors.textSecondary}`}>
                  CNIC <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.identification.CNIC}
                  onChange={(e) => updateNestedField('identification', 'CNIC', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder}`}
                  placeholder="xxxxx-xxxxxxx-x"
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${colors.textSecondary}`}>
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.identification.dateOfBirth}
                  onChange={(e) => updateNestedField('identification', 'dateOfBirth', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${colors.textSecondary}`}>
                  Birth Country
                </label>
                <input
                  type="text"
                  value={formData.identification.birthCountry}
                  onChange={(e) => updateNestedField('identification', 'birthCountry', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder}`}
                  placeholder="Enter birth country"
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${colors.textSecondary}`}>
                  Blood Group
                </label>
                <select
                  value={formData.identification.bloodGroup}
                  onChange={(e) => updateNestedField('identification', 'bloodGroup', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText}`}
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${colors.textSecondary}`}>
                  Driving License
                </label>
                <select
                  value={formData.identification.drivingLicense}
                  onChange={(e) => updateNestedField('identification', 'drivingLicense', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText}`}
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              {formData.identification.drivingLicense === 'Yes' && (
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${colors.textSecondary}`}>
                    License Number
                  </label>
                  <input
                    type="text"
                    value={formData.identification.drivingLicenseNumber}
                    onChange={(e) => updateNestedField('identification', 'drivingLicenseNumber', e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-lg border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder}`}
                    placeholder="Enter license number"
                  />
                </div>
              )}

              {formData.basicDetails.maritalStatus === 'Married' && (
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${colors.textSecondary}`}>
                    Date of Marriage
                  </label>
                  <input
                    type="date"
                    value={formData.identification.dateOfMarriage}
                    onChange={(e) => updateNestedField('identification', 'dateOfMarriage', e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-lg border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText}`}
                  />
                </div>
              )}

              <div>
                <label className={`block text-sm font-semibold mb-2 ${colors.textSecondary}`}>
                  EOBI Number
                </label>
                <input
                  type="text"
                  value={formData.identification.EOBI}
                  onChange={(e) => updateNestedField('identification', 'EOBI', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder}`}
                  placeholder="Enter EOBI number"
                />
              </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${colors.textSecondary}`}>
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.contactInformation.email}
                  onChange={(e) => updateNestedField('contactInformation', 'email', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder}`}
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${colors.textSecondary}`}>
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.contactInformation.contactNumber}
                  onChange={(e) => updateNestedField('contactInformation', 'contactNumber', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder}`}
                  placeholder="+92 xxx xxxxxxx"
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${colors.textSecondary}`}>
                  Telephone Number
                </label>
                <input
                  type="tel"
                  value={formData.contactInformation.telephoneNumber}
                  onChange={(e) => updateNestedField('contactInformation', 'telephoneNumber', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder}`}
                  placeholder="Landline number"
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${colors.textSecondary}`}>
                  Emergency Contact
                </label>
                <input
                  type="tel"
                  value={formData.contactInformation.emergencyNumber}
                  onChange={(e) => updateNestedField('contactInformation', 'emergencyNumber', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder}`}
                  placeholder="Emergency contact number"
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${colors.textSecondary}`}>
                  Emergency Relation
                </label>
                <input
                  type="text"
                  value={formData.contactInformation.emergencyRelation}
                  onChange={(e) => updateNestedField('contactInformation', 'emergencyRelation', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder}`}
                  placeholder="e.g., Father, Spouse"
                />
              </div>

              <div className="md:col-span-2">
                <label className={`block text-sm font-semibold mb-2 ${colors.textSecondary}`}>
                  Address Line 1
                </label>
                <input
                  type="text"
                  value={formData.contactInformation.addressLine1}
                  onChange={(e) => updateNestedField('contactInformation', 'addressLine1', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder}`}
                  placeholder="Street address"
                />
              </div>

              <div className="md:col-span-2">
                <label className={`block text-sm font-semibold mb-2 ${colors.textSecondary}`}>
                  Address Line 2
                </label>
                <input
                  type="text"
                  value={formData.contactInformation.addressLine2}
                  onChange={(e) => updateNestedField('contactInformation', 'addressLine2', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder}`}
                  placeholder="Apartment, suite, etc."
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${colors.textSecondary}`}>
                  District
                </label>
                <input
                  type="text"
                  value={formData.contactInformation.district}
                  onChange={(e) => updateNestedField('contactInformation', 'district', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder}`}
                  placeholder="Enter district"
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${colors.textSecondary}`}>
                  Postal Code
                </label>
                <input
                  type="text"
                  value={formData.contactInformation.postalCode}
                  onChange={(e) => updateNestedField('contactInformation', 'postalCode', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder}`}
                  placeholder="Postal code"
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${colors.textSecondary}`}>
                  Country
                </label>
                <input
                  type="text"
                  value={formData.contactInformation.country}
                  onChange={(e) => updateNestedField('contactInformation', 'country', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder}`}
                  placeholder="Enter country"
                />
              </div>
            </div>
          </div>
        );

      case 'employment':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${colors.textSecondary}`}>
                  Joining Date
                </label>
                <input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${colors.textSecondary}`}>
                  Employee Number
                </label>
                <input
                  type="text"
                  value={formData.employeeNumber}
                  onChange={(e) => setFormData({ ...formData, employeeNumber: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder}`}
                  placeholder="Auto-generated if empty"
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${colors.textSecondary}`}>
                  Personnel Area
                </label>
                <input
                  type="text"
                  value={formData.personnelArea}
                  onChange={(e) => setFormData({ ...formData, personnelArea: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder}`}
                  placeholder="Enter personnel area"
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${colors.textSecondary}`}>
                  Employee Group
                </label>
                <input
                  type="text"
                  value={formData.employeeGroup}
                  onChange={(e) => setFormData({ ...formData, employeeGroup: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder}`}
                  placeholder="Enter employee group"
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${colors.textSecondary}`}>
                  Employee Sub-Group
                </label>
                <input
                  type="text"
                  value={formData.employeeSubGroup}
                  onChange={(e) => setFormData({ ...formData, employeeSubGroup: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder}`}
                  placeholder="Enter employee sub-group"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${colors.modalOverlay}`}>
      <div 
        className={`relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border backdrop-blur-lg ${colors.modalBg} ${colors.modalBorder} ${colors.modalShadow}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Paper Texture */}
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>

        {/* Header */}
        <div className={`relative border-b ${colors.modalFooterBorder} ${colors.modalHeaderBg} p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${charColors.bg}`}>
                <User className={`h-6 w-6 ${charColors.iconColor}`} />
              </div>
              <div>
                <h2 className={`text-2xl font-black ${colors.modalHeaderText}`}>Add New User</h2>
                <p className={`text-sm ${colors.textMuted} mt-1`}>Create a new employee account</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`group p-2 rounded-lg transition-all ${colors.buttonGhost} ${colors.buttonGhostText} hover:${colors.buttonGhostHover}`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Section Navigation */}
          <div className="flex items-center space-x-2 mt-6 overflow-x-auto pb-2">
            {sections.map((section, index) => {
              const Icon = section.icon;
              const isActive = currentSection === index;
              const isCompleted = currentSection > index;

              return (
                <button
                  key={section.id}
                  onClick={() => setCurrentSection(index)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                    isActive
                      ? `${charColors.bg} ${charColors.text} ${charColors.border} border`
                      : isCompleted
                      ? `${cardCharacters.completed.bg} ${cardCharacters.completed.text} border ${cardCharacters.completed.border}`
                      : `${colors.cardBg} ${colors.textMuted} border ${colors.borderSubtle}`
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{section.label}</span>
                  {isCompleted && <span className="text-xs">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit}>
          <div className={`relative p-6 overflow-y-auto ${colors.modalContentBg}`} style={{ maxHeight: 'calc(90vh - 250px)' }}>
            {renderSection()}
          </div>

          {/* Footer */}
          <div className={`relative border-t ${colors.modalFooterBorder} ${colors.modalFooterBg} p-6`}>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                disabled={currentSection === 0}
                className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${colors.buttonSecondary} ${colors.buttonSecondaryText} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Previous
              </button>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${colors.buttonGhost} ${colors.buttonGhostText} hover:${colors.buttonGhostHover}`}
                >
                  Cancel
                </button>

                {currentSection < sections.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
                    className={`group relative px-6 py-2.5 rounded-lg font-semibold transition-all overflow-hidden ${colors.buttonPrimary} ${colors.buttonPrimaryText} ${colors.shadowCard} hover:${colors.shadowHover}`}
                  >
                    <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}, inset 0 0 28px ${colors.glowPrimary}` }}
                    ></div>
                    <span className="relative z-10">Next</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className={`group relative px-6 py-2.5 rounded-lg font-semibold transition-all overflow-hidden ${colors.buttonPrimary} ${colors.buttonPrimaryText} ${colors.shadowCard} hover:${colors.shadowHover} disabled:opacity-50`}
                  >
                    <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}, inset 0 0 28px ${colors.glowPrimary}` }}
                    ></div>
                    <span className="relative z-10">
                      {loading ? 'Creating...' : 'Create User'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}