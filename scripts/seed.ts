// scripts/seedUsers.ts
// Run this with: npx ts-node scripts/seedUsers.ts
// Or add to package.json: "seed": "ts-node scripts/seedUsers.ts"
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import FormData from '../models/FormData';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/EmployeeCentralHub';

async function seedUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const sampleEmployees = [
      {
        // Regular Employee (Sales)
        username: 'employee.other',
        password: await bcrypt.hash('3265', 10),
        department: 'Sales',
        title: 'Sales Representative',
        isDeptHead: false,
        basicDetails: {
          title: 'Mr.',
          name: 'John Smith',
          fatherName: 'Robert Smith',
          gender: 'Male',
          religion: 'Christianity',
          nationality: 'American',
          age: '32',
          maritalStatus: 'Married',
          profileImage: '/profiles/john-smith.jpg',
        },
        identification: {
          CNIC: '12345-6789012-3',
          birthCountry: 'United States',
          dateOfBirth: '1992-05-15',
          drivingLicense: 'Yes',
          drivingLicenseNumber: 'DL123456789',
          bloodGroup: 'O+',
          EOBI: 'EOBI123456',
        },
        contactInformation: {
          contactNumber: '+1 (555) 123-4567',
          telephoneNumber: '+1 (555) 123-4568',
          email: 'john.smith@pepsi.com',
          addressLine1: '123 Main Street',
          addressLine2: 'Apt 4B',
          postalCode: '10001',
          district: 'Manhattan',
          country: 'United States',
          emergencyNumber: '+1 (555) 999-0001',
          emergencyRelation: 'Spouse',
        },
        employeeNumber: 'EMP001',
        employeeGroup: 'Sales',
        employeeSubGroup: 'Field Sales',
        joiningDate: '2020-01-15',
        personnelArea: 'New York Office',
        status: 'approved',
      },
      {
        // Department Head (Sales)
        username: 'depthead.other',
        password: await bcrypt.hash('3265', 10),
        department: 'Sales',
        title: 'Sales Director',
        isDeptHead: true,
        basicDetails: {
          title: 'Ms.',
          name: 'Sarah Johnson',
          fatherName: 'David Johnson',
          gender: 'Female',
          religion: 'Christianity',
          nationality: 'American',
          age: '38',
          maritalStatus: 'Single',
          profileImage: '/profiles/sarah-johnson.jpg',
        },
        identification: {
          CNIC: '23456-7890123-4',
          birthCountry: 'United States',
          dateOfBirth: '1986-08-22',
          drivingLicense: 'Yes',
          drivingLicenseNumber: 'DL987654321',
          bloodGroup: 'A+',
          EOBI: 'EOBI234567',
        },
        contactInformation: {
          contactNumber: '+1 (555) 234-5678',
          telephoneNumber: '+1 (555) 234-5679',
          email: 'sarah.johnson@pepsi.com',
          addressLine1: '456 Park Avenue',
          postalCode: '10002',
          district: 'Manhattan',
          country: 'United States',
          emergencyNumber: '+1 (555) 888-0002',
          emergencyRelation: 'Sister',
        },
        employeeNumber: 'EMP002',
        employeeGroup: 'Sales',
        employeeSubGroup: 'Management',
        joiningDate: '2015-03-10',
        personnelArea: 'New York Office',
        status: 'approved',
      },
      {
        // HR Employee
        username: 'employee.hr',
        password: await bcrypt.hash('3265', 10),
        department: 'Human Resources',
        title: 'HR Specialist',
        isDeptHead: false,
        basicDetails: {
          title: 'Mr.',
          name: 'Mike Brown',
          fatherName: 'James Brown',
          gender: 'Male',
          religion: 'Christianity',
          nationality: 'American',
          age: '29',
          maritalStatus: 'Single',
          profileImage: '/profiles/mike-brown.jpg',
        },
        identification: {
          CNIC: '34567-8901234-5',
          birthCountry: 'United States',
          dateOfBirth: '1995-11-30',
          drivingLicense: 'Yes',
          drivingLicenseNumber: 'DL456789123',
          bloodGroup: 'B+',
          EOBI: 'EOBI345678',
        },
        contactInformation: {
          contactNumber: '+1 (555) 345-6789',
          telephoneNumber: '+1 (555) 345-6790',
          email: 'mike.brown@pepsi.com',
          addressLine1: '789 Broadway',
          postalCode: '10003',
          district: 'Manhattan',
          country: 'United States',
          emergencyNumber: '+1 (555) 777-0003',
          emergencyRelation: 'Father',
        },
        employeeNumber: 'EMP003',
        employeeGroup: 'Human Resources',
        employeeSubGroup: 'Recruitment',
        joiningDate: '2021-06-01',
        personnelArea: 'New York Office',
        status: 'approved',
      },
      {
        // HR Department Head
        username: 'depthead.hr',
        password: await bcrypt.hash('3265', 10),
        department: 'Human Resources',
        title: 'HR Director',
        isDeptHead: true,
        basicDetails: {
          title: 'Ms.',
          name: 'Lisa Davis',
          fatherName: 'William Davis',
          gender: 'Female',
          religion: 'Christianity',
          nationality: 'American',
          age: '42',
          maritalStatus: 'Married',
          profileImage: '/profiles/lisa-davis.jpg',
        },
        identification: {
          CNIC: '45678-9012345-6',
          birthCountry: 'United States',
          dateOfBirth: '1982-04-18',
          drivingLicense: 'Yes',
          drivingLicenseNumber: 'DL789456123',
          bloodGroup: 'AB+',
          EOBI: 'EOBI456789',
        },
        contactInformation: {
          contactNumber: '+1 (555) 456-7890',
          telephoneNumber: '+1 (555) 456-7891',
          email: 'lisa.davis@pepsi.com',
          addressLine1: '321 Fifth Avenue',
          postalCode: '10004',
          district: 'Manhattan',
          country: 'United States',
          emergencyNumber: '+1 (555) 666-0004',
          emergencyRelation: 'Spouse',
        },
        employeeNumber: 'EMP004',
        employeeGroup: 'Human Resources',
        employeeSubGroup: 'Management',
        joiningDate: '2012-09-15',
        personnelArea: 'New York Office',
        status: 'approved',
      },
      {
        // Admin
        username: 'admin',
        password: await bcrypt.hash('3265', 10),
        department: 'IT',
        title: 'System Admin',
        isDeptHead: false,
        basicDetails: {
          title: 'Mr.',
          name: 'Administrator',
          fatherName: 'System',
          gender: 'Male',
          religion: 'N/A',
          nationality: 'American',
          age: '35',
          maritalStatus: 'Single',
          profileImage: '/profiles/admin.jpg',
        },
        identification: {
          CNIC: '00000-0000000-0',
          birthCountry: 'United States',
          dateOfBirth: '1989-01-01',
          drivingLicense: 'Yes',
          drivingLicenseNumber: 'DLADMIN123',
          bloodGroup: 'O+',
          EOBI: 'EOBI000000',
        },
        contactInformation: {
          contactNumber: '+1 (555) 000-0000',
          telephoneNumber: '+1 (555) 000-0001',
          email: 'admin@pepsi.com',
          addressLine1: 'Corporate HQ',
          postalCode: '10000',
          district: 'Manhattan',
          country: 'United States',
          emergencyNumber: '+1 (555) 111-0000',
          emergencyRelation: 'IT Department',
        },
        employeeNumber: 'EMP000',
        employeeGroup: 'IT',
        employeeSubGroup: 'System Administration',
        joiningDate: '2010-01-01',
        personnelArea: 'Corporate HQ',
        status: 'approved',
      },
    ];

    // Clear existing employees (optional - comment out if you want to keep existing data)
    await FormData.deleteMany({});

    // Insert sample employees
    for (const emp of sampleEmployees) {
      const exists = await FormData.findOne({ username: emp.username });
      if (!exists) {
        await FormData.create(emp);
        console.log(`✓ Created employee: ${emp.username} (${emp.basicDetails.name})`);
      } else {
        console.log(`⚠ Employee already exists: ${emp.username}`);
      }
    }

    console.log('\n✅ Sample users created successfully!\n');
    console.log('📋 Login credentials:');
    console.log('━'.repeat(50));
    console.log('Regular Employee:     john.smith / password123');
    console.log('Dept Head (Sales):    sarah.johnson / password123');
    console.log('HR Employee:          mike.brown / password123');
    console.log('HR Head:              lisa.davis / password123');
    console.log('Admin:                admin / admin123');
    console.log('━'.repeat(50));

  } catch (error) {
    console.error('❌ Error seeding users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

seedUsers();