// app/api/admin/users/bulk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import FormData from '@/models/FormData';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const body = await req.json();
    const { users } = body;
    
    console.log('Bulk upload request received. Users count:', users?.length);
    
    if (!users || !Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid data: users array is required' },
        { status: 400 }
      );
    }

    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const rowNum = i + 2;

      console.log(`Processing row ${rowNum}:`, user.username);

      try {
        // Validate required fields
        if (!user.username || !user.password || !user.name || !user.department) {
          errors.push(`Row ${rowNum}: Missing required fields (username, password, name, department)`);
          failedCount++;
          continue;
        }

        // Check if username already exists
        const existingUser = await FormData.findOne({ username: user.username });
        if (existingUser) {
          errors.push(`Row ${rowNum}: Username '${user.username}' already exists`);
          failedCount++;
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(user.password, 10);

        // Convert isDeptHead string to boolean
        const isDeptHead = typeof user.isDeptHead === 'string' 
          ? user.isDeptHead.toLowerCase() === 'true' 
          : Boolean(user.isDeptHead);

        // Create complete user document
        const userDocument = {
          username: user.username,
          password: hashedPassword,
          department: user.department,
          title: user.title || 'Employee',
          isDeptHead: isDeptHead,
          basicDetails: {
            title: user.basicDetailsTitle || 'Mr',
            name: user.name,
            fatherName: user.fatherName || '',
            gender: user.gender || '',
            religion: user.religion || '',
            nationality: user.nationality || 'PK',
            age: user.age || '',
            maritalStatus: user.maritalStatus || 'Single',
            profileImage: user.profileImage || ''
          },
          identification: {
            CNIC: user.CNIC || '',
            birthCountry: user.birthCountry || 'PK',
            dateOfBirth: user.dateOfBirth || '',
            drivingLicense: user.drivingLicense || '',
            drivingLicenseNumber: user.drivingLicenseNumber || '',
            dateOfMarriage: user.dateOfMarriage || '',
            bloodGroup: user.bloodGroup || '',
            EOBI: user.EOBI || ''
          },
          contactInformation: {
            contactNumber: user.contactNumber || '',
            telephoneNumber: user.telephoneNumber || '',
            email: user.email || user.username,
            addressLine1: user.addressLine1 || '',
            addressLine2: user.addressLine2 || '',
            postalCode: user.postalCode || '',
            district: user.district || '',
            country: user.country || 'PK',
            emergencyNumber: user.emergencyNumber || '',
            emergencyRelation: user.emergencyRelation || ''
          },
          educationalDetails: [],
          certifications: [],
          employmentHistory: [],
          relatives: [{
            name: '0',
            relation: '0',
            designation: '0',
            department: '0'
          }],
          parents: {
            father: {
              name: user.fatherName || '',
              DOB: '',
              CNIC: '0000000000000'
            },
            mother: {
              name: '',
              DOB: '',
              CNIC: '0000000000000'
            }
          },
          dependants: {
            nominees: [{
              name: '0',
              address: '0',
              relationship: '0',
              amount: '0',
              age: '0',
              person: '0'
            }],
            spouses: [{
              name: '0',
              DOB: new Date().toISOString().split('T')[0],
              CNIC: '0000000000000'
            }],
            children: [{
              name: '0',
              DOB: new Date().toISOString().split('T')[0],
              gender: 'Prefer Not to Say',
              CNIC: '0000000000000'
            }]
          },
          employeeGroup: user.employeeGroup || '',
          employeeSubGroup: user.employeeSubGroup || '',
          joiningDate: user.joiningDate || new Date().toISOString().split('T')[0],
          personnelArea: user.personnelArea || '',
          employeeNumber: user.employeeNumber || '',
          status: 'approved',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        console.log(`Creating user: ${user.username}`);
        
        // Use Mongoose create instead of direct collection insert
        // This ensures all middleware and validators run properly
        const newUser = new FormData(userDocument);
        await newUser.save();
        
        console.log(`Successfully created user: ${user.username}`);
        successCount++;
      } catch (error: any) {
        console.error(`Error processing row ${rowNum}:`, error);
        errors.push(`Row ${rowNum}: ${error.message}`);
        failedCount++;
      }
    }

    console.log(`Bulk upload complete. Success: ${successCount}, Failed: ${failedCount}`);

    return NextResponse.json({
      success: successCount,
      failed: failedCount,
      errors: errors,
      message: `${successCount} users created successfully, ${failedCount} failed`
    }, { status: 200 });

  } catch (error) {
    console.error('Error in bulk upload:', error);
    return NextResponse.json(
      { error: 'Failed to process bulk upload' },
      { status: 500 }
    );
  }
}