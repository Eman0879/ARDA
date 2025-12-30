// ===== app/components/universal/settingscomponents/ProfileSections.tsx =====
import React from 'react';
import { User, Phone, GraduationCap, Users, Briefcase, Calendar, MapPin, Heart, Mail } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';

interface InfoFieldProps {
  label: string;
  value: string | undefined;
  icon: React.ReactNode;
  fullWidth?: boolean;
}

function InfoField({ label, value, icon, fullWidth }: InfoFieldProps) {
  const { colors } = useTheme();
  
  return (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className={colors.textMuted}>{icon}</div>
        <label className={`text-xs font-bold ${colors.textMuted} uppercase tracking-wide`}>
          {label}
        </label>
      </div>
      <div className={`relative overflow-hidden px-3 py-2.5 rounded-lg border ${colors.inputBorder} ${colors.inputBg}`}>
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
        <p className={`relative ${colors.textPrimary} font-semibold text-sm`}>{value || 'N/A'}</p>
      </div>
    </div>
  );
}

interface BasicInfoSectionProps {
  employeeData: {
    username: string;
    department: string;
    title: string;
    employeeNumber: string;
    joiningDate: string;
    basicDetails: {
      name: string;
      fatherName: string;
      gender: string;
      maritalStatus: string;
      age: string;
      religion: string;
      nationality: string;
    };
  };
}

export function BasicInfoSection({ employeeData }: BasicInfoSectionProps) {
  const { colors, cardCharacters } = useTheme();
  const charColors = cardCharacters.informative;
  
  return (
    <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${charColors.bg} ${charColors.border} ${colors.shadowCard}`}>
      <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
      
      <div className="relative p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className={`p-2.5 rounded-lg bg-gradient-to-r ${charColors.bg}`}>
            <User className={`h-5 w-5 ${charColors.iconColor}`} />
          </div>
          <h3 className={`text-lg font-black ${charColors.text}`}>Basic Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoField label="Full Name" value={employeeData.basicDetails?.name} icon={<User className="h-4 w-4" />} />
          <InfoField label="Employee Number" value={employeeData.employeeNumber} icon={<Briefcase className="h-4 w-4" />} />
          <InfoField label="Username" value={employeeData.username} icon={<User className="h-4 w-4" />} />
          <InfoField label="Department" value={employeeData.department} icon={<Briefcase className="h-4 w-4" />} />
          <InfoField label="Job Title" value={employeeData.title} icon={<Briefcase className="h-4 w-4" />} />
          <InfoField label="Joining Date" value={employeeData.joiningDate ? new Date(employeeData.joiningDate).toLocaleDateString() : 'N/A'} icon={<Calendar className="h-4 w-4" />} />
          <InfoField label="Father's Name" value={employeeData.basicDetails?.fatherName} icon={<Users className="h-4 w-4" />} />
          <InfoField label="Gender" value={employeeData.basicDetails?.gender === '1' ? 'Male' : employeeData.basicDetails?.gender === '2' ? 'Female' : employeeData.basicDetails?.gender} icon={<User className="h-4 w-4" />} />
          <InfoField label="Marital Status" value={employeeData.basicDetails?.maritalStatus} icon={<Heart className="h-4 w-4" />} />
          <InfoField label="Age" value={employeeData.basicDetails?.age} icon={<Calendar className="h-4 w-4" />} />
          <InfoField label="Religion" value={employeeData.basicDetails?.religion} icon={<User className="h-4 w-4" />} />
          <InfoField label="Nationality" value={employeeData.basicDetails?.nationality} icon={<MapPin className="h-4 w-4" />} />
        </div>
      </div>
    </div>
  );
}

interface IdentificationSectionProps {
  identification: {
    CNIC: string;
    dateOfBirth: string;
    birthCountry: string;
    bloodGroup: string;
  };
}

export function IdentificationSection({ identification }: IdentificationSectionProps) {
  const { colors, cardCharacters } = useTheme();
  const charColors = cardCharacters.authoritative;
  
  return (
    <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${charColors.bg} ${charColors.border} ${colors.shadowCard}`}>
      <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
      
      <div className="relative p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className={`p-2.5 rounded-lg bg-gradient-to-r ${charColors.bg}`}>
            <User className={`h-5 w-5 ${charColors.iconColor}`} />
          </div>
          <h3 className={`text-lg font-black ${charColors.text}`}>Identification</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoField label="CNIC" value={identification?.CNIC} icon={<User className="h-4 w-4" />} />
          <InfoField label="Date of Birth" value={identification?.dateOfBirth ? new Date(identification.dateOfBirth).toLocaleDateString() : 'N/A'} icon={<Calendar className="h-4 w-4" />} />
          <InfoField label="Birth Country" value={identification?.birthCountry} icon={<MapPin className="h-4 w-4" />} />
          <InfoField label="Blood Group" value={identification?.bloodGroup} icon={<Heart className="h-4 w-4" />} />
        </div>
      </div>
    </div>
  );
}

interface ContactInfoSectionProps {
  contactInformation: {
    email: string;
    contactNumber: string;
    addressLine1: string;
    addressLine2: string;
    district: string;
    country: string;
    emergencyNumber: string;
    emergencyRelation: string;
  };
}

export function ContactInfoSection({ contactInformation }: ContactInfoSectionProps) {
  const { colors, cardCharacters } = useTheme();
  const charColors = cardCharacters.interactive;
  
  return (
    <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${charColors.bg} ${charColors.border} ${colors.shadowCard}`}>
      <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
      
      <div className="relative p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className={`p-2.5 rounded-lg bg-gradient-to-r ${charColors.bg}`}>
            <Phone className={`h-5 w-5 ${charColors.iconColor}`} />
          </div>
          <h3 className={`text-lg font-black ${charColors.text}`}>Contact Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoField label="Email" value={contactInformation?.email} icon={<Mail className="h-4 w-4" />} />
          <InfoField label="Contact Number" value={contactInformation?.contactNumber} icon={<Phone className="h-4 w-4" />} />
          <InfoField 
            label="Address" 
            value={`${contactInformation?.addressLine1 || ''}${contactInformation?.addressLine2 ? ', ' + contactInformation.addressLine2 : ''}`} 
            icon={<MapPin className="h-4 w-4" />} 
            fullWidth 
          />
          <InfoField label="District" value={contactInformation?.district} icon={<MapPin className="h-4 w-4" />} />
          <InfoField label="Country" value={contactInformation?.country} icon={<MapPin className="h-4 w-4" />} />
          <InfoField label="Emergency Contact" value={contactInformation?.emergencyNumber} icon={<Phone className="h-4 w-4" />} />
          <InfoField label="Emergency Relation" value={contactInformation?.emergencyRelation} icon={<Users className="h-4 w-4" />} />
        </div>
      </div>
    </div>
  );
}

interface EducationSectionProps {
  educationalDetails: Array<{
    title: string;
    degree: string;
    institute: string;
    specialization: string;
    percentage: string;
  }>;
}

export function EducationSection({ educationalDetails }: EducationSectionProps) {
  const { colors, cardCharacters } = useTheme();
  const charColors = cardCharacters.completed;
  
  if (!educationalDetails || educationalDetails.length === 0) {
    return null;
  }

  return (
    <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${charColors.bg} ${charColors.border} ${colors.shadowCard}`}>
      <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
      
      <div className="relative p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className={`p-2.5 rounded-lg bg-gradient-to-r ${charColors.bg}`}>
            <GraduationCap className={`h-5 w-5 ${charColors.iconColor}`} />
          </div>
          <h3 className={`text-lg font-black ${charColors.text}`}>Education</h3>
        </div>

        <div className="space-y-3">
          {educationalDetails.map((edu, index) => (
            <div key={index} className={`relative overflow-hidden rounded-lg p-4 border ${colors.inputBorder} ${colors.inputBg}`}>
              <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
              <div className="relative">
                <h4 className={`text-base font-bold ${colors.textPrimary} mb-2`}>{edu.degree} - {edu.title}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className={colors.textSecondary}>
                    <span className="font-semibold">Institute:</span> <span className={colors.textPrimary}>{edu.institute}</span>
                  </div>
                  <div className={colors.textSecondary}>
                    <span className="font-semibold">Specialization:</span> <span className={colors.textPrimary}>{edu.specialization}</span>
                  </div>
                  <div className={colors.textSecondary}>
                    <span className="font-semibold">Grade:</span> <span className={colors.textPrimary}>{edu.percentage}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ParentsSectionProps {
  parents?: {
    father: {
      name: string;
      DOB: string;
    };
    mother: {
      name: string;
      DOB: string;
    };
  };
}

export function ParentsSection({ parents }: ParentsSectionProps) {
  const { colors, cardCharacters } = useTheme();
  const charColors = cardCharacters.urgent;
  
  if (!parents?.father || !parents?.mother) {
    return null;
  }

  return (
    <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${charColors.bg} ${charColors.border} ${colors.shadowCard}`}>
      <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
      
      <div className="relative p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className={`p-2.5 rounded-lg bg-gradient-to-r ${charColors.bg}`}>
            <Users className={`h-5 w-5 ${charColors.iconColor}`} />
          </div>
          <h3 className={`text-lg font-black ${charColors.text}`}>Parents Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoField label="Father's Name" value={parents.father.name} icon={<User className="h-4 w-4" />} />
          <InfoField label="Father's DOB" value={parents.father.DOB ? new Date(parents.father.DOB).toLocaleDateString() : 'N/A'} icon={<Calendar className="h-4 w-4" />} />
          <InfoField label="Mother's Name" value={parents.mother.name} icon={<User className="h-4 w-4" />} />
          <InfoField label="Mother's DOB" value={parents.mother.DOB ? new Date(parents.mother.DOB).toLocaleDateString() : 'N/A'} icon={<Calendar className="h-4 w-4" />} />
        </div>
      </div>
    </div>
  );
}