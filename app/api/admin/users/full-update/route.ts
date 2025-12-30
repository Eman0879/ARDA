// app/api/admin/users/full-update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import mongoose from 'mongoose';

export async function PATCH(request: NextRequest) {
  try {
    const { userId, userData } = await request.json();

    if (!userId || !userData) {
      return NextResponse.json(
        { error: 'Missing userId or userData' },
        { status: 400 }
      );
    }

    await dbConnect();
    const db = mongoose.connection.db;
    
    // Use formdatas collection instead of users
    const formdatasCollection = db.collection('formdatas');

    // Prepare update object, excluding _id
    const updateData: any = {};

    // Top-level fields
    if (userData.username !== undefined) updateData.username = userData.username;
    if (userData.department !== undefined) updateData.department = userData.department;
    if (userData.title !== undefined) updateData.title = userData.title;
    if (userData.isDeptHead !== undefined) updateData.isDeptHead = userData.isDeptHead;
    if (userData.isApproved !== undefined) updateData.isApproved = userData.isApproved;
    if (userData.employeeNumber !== undefined) updateData.employeeNumber = userData.employeeNumber;
    if (userData.joiningDate !== undefined) updateData.joiningDate = userData.joiningDate;
    if (userData.employeeGroup !== undefined) updateData.employeeGroup = userData.employeeGroup;
    if (userData.employeeSubGroup !== undefined) updateData.employeeSubGroup = userData.employeeSubGroup;
    if (userData.personnelArea !== undefined) updateData.personnelArea = userData.personnelArea;
    if (userData.status !== undefined) updateData.status = userData.status;

    // Nested fields - basicDetails
    if (userData.basicDetails) {
      if (userData.basicDetails.title !== undefined) updateData['basicDetails.title'] = userData.basicDetails.title;
      if (userData.basicDetails.name !== undefined) updateData['basicDetails.name'] = userData.basicDetails.name;
      if (userData.basicDetails.fatherName !== undefined) updateData['basicDetails.fatherName'] = userData.basicDetails.fatherName;
      if (userData.basicDetails.gender !== undefined) updateData['basicDetails.gender'] = userData.basicDetails.gender;
      if (userData.basicDetails.religion !== undefined) updateData['basicDetails.religion'] = userData.basicDetails.religion;
      if (userData.basicDetails.nationality !== undefined) updateData['basicDetails.nationality'] = userData.basicDetails.nationality;
      if (userData.basicDetails.age !== undefined) updateData['basicDetails.age'] = userData.basicDetails.age;
      if (userData.basicDetails.maritalStatus !== undefined) updateData['basicDetails.maritalStatus'] = userData.basicDetails.maritalStatus;
      if (userData.basicDetails.profileImage !== undefined) updateData['basicDetails.profileImage'] = userData.basicDetails.profileImage;
    }

    // Nested fields - identification
    if (userData.identification) {
      if (userData.identification.CNIC !== undefined) updateData['identification.CNIC'] = userData.identification.CNIC;
      if (userData.identification.birthCountry !== undefined) updateData['identification.birthCountry'] = userData.identification.birthCountry;
      if (userData.identification.dateOfBirth !== undefined) updateData['identification.dateOfBirth'] = userData.identification.dateOfBirth;
      if (userData.identification.bloodGroup !== undefined) updateData['identification.bloodGroup'] = userData.identification.bloodGroup;
      if (userData.identification.drivingLicense !== undefined) updateData['identification.drivingLicense'] = userData.identification.drivingLicense;
      if (userData.identification.drivingLicenseNumber !== undefined) updateData['identification.drivingLicenseNumber'] = userData.identification.drivingLicenseNumber;
      if (userData.identification.dateOfMarriage !== undefined) updateData['identification.dateOfMarriage'] = userData.identification.dateOfMarriage;
      if (userData.identification.EOBI !== undefined) updateData['identification.EOBI'] = userData.identification.EOBI;
    }

    // Nested fields - contactInformation
    if (userData.contactInformation) {
      if (userData.contactInformation.contactNumber !== undefined) updateData['contactInformation.contactNumber'] = userData.contactInformation.contactNumber;
      if (userData.contactInformation.telephoneNumber !== undefined) updateData['contactInformation.telephoneNumber'] = userData.contactInformation.telephoneNumber;
      if (userData.contactInformation.email !== undefined) updateData['contactInformation.email'] = userData.contactInformation.email;
      if (userData.contactInformation.addressLine1 !== undefined) updateData['contactInformation.addressLine1'] = userData.contactInformation.addressLine1;
      if (userData.contactInformation.addressLine2 !== undefined) updateData['contactInformation.addressLine2'] = userData.contactInformation.addressLine2;
      if (userData.contactInformation.postalCode !== undefined) updateData['contactInformation.postalCode'] = userData.contactInformation.postalCode;
      if (userData.contactInformation.district !== undefined) updateData['contactInformation.district'] = userData.contactInformation.district;
      if (userData.contactInformation.country !== undefined) updateData['contactInformation.country'] = userData.contactInformation.country;
      if (userData.contactInformation.emergencyNumber !== undefined) updateData['contactInformation.emergencyNumber'] = userData.contactInformation.emergencyNumber;
      if (userData.contactInformation.emergencyRelation !== undefined) updateData['contactInformation.emergencyRelation'] = userData.contactInformation.emergencyRelation;
    }

    // Array fields - educationalDetails
    if (userData.educationalDetails !== undefined) {
      updateData.educationalDetails = userData.educationalDetails;
    }

    // Array fields - certifications
    if (userData.certifications !== undefined) {
      updateData.certifications = userData.certifications;
    }

    // Array fields - employmentHistory
    if (userData.employmentHistory !== undefined) {
      updateData.employmentHistory = userData.employmentHistory;
    }

    // Array fields - relatives
    if (userData.relatives !== undefined) {
      updateData.relatives = userData.relatives;
    }

    // Nested fields - parents
    if (userData.parents) {
      if (userData.parents.father) {
        if (userData.parents.father.name !== undefined) updateData['parents.father.name'] = userData.parents.father.name;
        if (userData.parents.father.DOB !== undefined) updateData['parents.father.DOB'] = userData.parents.father.DOB;
        if (userData.parents.father.CNIC !== undefined) updateData['parents.father.CNIC'] = userData.parents.father.CNIC;
      }
      if (userData.parents.mother) {
        if (userData.parents.mother.name !== undefined) updateData['parents.mother.name'] = userData.parents.mother.name;
        if (userData.parents.mother.DOB !== undefined) updateData['parents.mother.DOB'] = userData.parents.mother.DOB;
        if (userData.parents.mother.CNIC !== undefined) updateData['parents.mother.CNIC'] = userData.parents.mother.CNIC;
      }
    }

    // Nested fields - dependants
    if (userData.dependants) {
      if (userData.dependants.nominees !== undefined) updateData['dependants.nominees'] = userData.dependants.nominees;
      if (userData.dependants.spouses !== undefined) updateData['dependants.spouses'] = userData.dependants.spouses;
      if (userData.dependants.children !== undefined) updateData['dependants.children'] = userData.dependants.children;
    }

    // Add updatedAt timestamp
    updateData.updatedAt = new Date();

    // Perform the update using MongoDB ObjectId
    const { ObjectId } = require('mongodb');
    const result = await formdatasCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'User updated successfully', modified: result.modifiedCount },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}