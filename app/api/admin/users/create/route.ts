// app/api/admin/users/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import FormData from '@/models/FormData';
import bcrypt from 'bcryptjs';
import { generatePassword } from '@/app/utils/passwordGenerator';
import { sendUserWelcomeEmail } from '@/app/utils/sendUserWelcomeEmail';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    // Validate required fields
    if (!body.username || !body.department || !body.title || !body.contactInformation?.email || !body.basicDetails?.name) {
      return NextResponse.json(
        { message: 'Missing required fields: username, department, title, email, and name are required' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await FormData.findOne({ username: body.username });
    if (existingUser) {
      return NextResponse.json(
        { message: 'Username already exists' },
        { status: 409 }
      );
    }

    // Check if email already exists
    const existingEmail = await FormData.findOne({ 'contactInformation.email': body.contactInformation.email });
    if (existingEmail) {
      return NextResponse.json(
        { message: 'Email already exists' },
        { status: 409 }
      );
    }

    // Generate random password
    const plainPassword = generatePassword(12, {
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
    });

    // Hash the password
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Generate employee number if not provided
    const employeeNumber = body.employeeNumber || `EMP${Date.now().toString().slice(-8)}`;

    // Create new user
    const newUser = new FormData({
      username: body.username,
      password: hashedPassword,
      department: body.department,
      title: body.title,
      isDeptHead: body.isDeptHead || false,
      basicDetails: {
        title: body.basicDetails?.title || 'Mr.',
        name: body.basicDetails?.name || '',
        fatherName: body.basicDetails?.fatherName || '',
        gender: body.basicDetails?.gender || 'Male',
        religion: body.basicDetails?.religion || '',
        nationality: body.basicDetails?.nationality || 'Pakistani',
        age: body.basicDetails?.age || '',
        maritalStatus: body.basicDetails?.maritalStatus || 'Single',
        profileImage: '/default-profile.jpg',
      },
      identification: {
        CNIC: body.identification?.CNIC || '',
        birthCountry: body.identification?.birthCountry || 'Pakistan',
        dateOfBirth: body.identification?.dateOfBirth || '',
        drivingLicense: body.identification?.drivingLicense || 'No',
        drivingLicenseNumber: body.identification?.drivingLicenseNumber || '',
        dateOfMarriage: body.identification?.dateOfMarriage || '',
        bloodGroup: body.identification?.bloodGroup || '',
        EOBI: body.identification?.EOBI || '',
      },
      contactInformation: {
        contactNumber: body.contactInformation?.contactNumber || '',
        telephoneNumber: body.contactInformation?.telephoneNumber || '',
        email: body.contactInformation?.email || '',
        addressLine1: body.contactInformation?.addressLine1 || '',
        addressLine2: body.contactInformation?.addressLine2 || '',
        postalCode: body.contactInformation?.postalCode || '',
        district: body.contactInformation?.district || '',
        country: body.contactInformation?.country || 'Pakistan',
        emergencyNumber: body.contactInformation?.emergencyNumber || '',
        emergencyRelation: body.contactInformation?.emergencyRelation || '',
      },
      educationalDetails: [],
      certifications: [],
      employmentHistory: [],
      relatives: [],
      parents: {
        father: { name: '', DOB: '', CNIC: '' },
        mother: { name: '', DOB: '', CNIC: '' },
      },
      dependants: {
        nominees: [],
        spouses: [],
        children: [],
      },
      joiningDate: body.joiningDate || new Date().toISOString().split('T')[0],
      personnelArea: body.personnelArea || '',
      employeeGroup: body.employeeGroup || '',
      employeeSubGroup: body.employeeSubGroup || '',
      employeeNumber: employeeNumber,
      status: 'approved', // Auto-approve admin-created users
    });

    await newUser.save();

    // Send welcome email with credentials
    try {
      await sendUserWelcomeEmail({
        email: body.contactInformation.email,
        name: body.basicDetails.name,
        username: body.username,
        password: plainPassword,
        department: body.department,
        title: body.title,
      });
      console.log(`✅ Welcome email sent to ${body.contactInformation.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send welcome email:', emailError);
      // Don't fail the user creation if email fails
    }

    return NextResponse.json({
      message: 'User created successfully',
      userId: newUser._id,
      username: body.username,
      password: plainPassword, // Return plain password for admin to see
      employeeNumber: employeeNumber,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { message: 'Failed to create user', error: error.message },
      { status: 500 }
    );
  }
}