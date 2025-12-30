// app/components/universal/settingscomponents/types.ts
export interface EmployeeData {
  username: string;
  department: string;
  title: string;
  isDeptHead: boolean;
  employeeNumber: string;
  basicDetails: {
    title: string;
    name: string;
    fatherName: string;
    gender: string;
    religion: string;
    nationality: string;
    age: string;
    maritalStatus: string;
    profileImage: string;
  };
  identification: {
    CNIC: string;
    birthCountry: string;
    dateOfBirth: string;
    bloodGroup: string;
  };
  contactInformation: {
    contactNumber: string;
    email: string;
    addressLine1: string;
    addressLine2: string;
    district: string;
    country: string;
    emergencyNumber: string;
    emergencyRelation: string;
  };
  educationalDetails: Array<{
    title: string;
    degree: string;
    institute: string;
    specialization: string;
    percentage: string;
  }>;
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
  joiningDate: string;
  employeeGroup: string;
  employeeSubGroup: string;
}