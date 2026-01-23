// app/api/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import FormData from '@/models/FormData';
import sendForgotPasswordEmail from '@/app/utils/forgotPasswordEmail';

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const { username, employeeId } = await req.json();

    // Validate input
    if (!username || !employeeId) {
      return NextResponse.json(
        { success: false, message: 'Username and Employee ID are required' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Find employee by username and employeeNumber
    const employee = await FormData.findOne({ 
      username: username,
      employeeNumber: employeeId 
    }).lean();

    if (!employee) {
      return NextResponse.json(
        { success: false, message: 'Invalid username or Employee ID' },
        { status: 404 }
      );
    }

    // Get email from contactInformation
    const email = employee.contactInformation?.email;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'No email address found for this account. Please contact administrator.' },
        { status: 404 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format in records. Please contact administrator.' },
        { status: 400 }
      );
    }

    // Send password reset email
    const result = await sendForgotPasswordEmail(username, email);

    if (result.success) {
      // Mask email for security (show only first 2 chars and domain)
      const emailParts = email.split('@');
      const maskedEmail = emailParts[0].substring(0, 2) + '***@' + emailParts[1];
      
      return NextResponse.json(
        { 
          success: true, 
          message: `Password reset instructions have been sent to ${maskedEmail}`,
          email: maskedEmail
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Forgot password API error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again later.' },
      { status: 500 }
    );
  }
}