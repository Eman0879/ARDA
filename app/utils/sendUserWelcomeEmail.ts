// utils/sendUserWelcomeEmail.ts
import sendEmail from './sendEmail';
import { buildWelcomeEmailTemplate, buildWelcomeEmailText } from './userEmailTemplates';

/**
 * Sends welcome email to newly created user with credentials
 * @param userData - User data object containing email, name, username, password, etc.
 * @returns Promise<void>
 */
export const sendUserWelcomeEmail = async (userData: {
  email: string;
  name: string;
  username: string;
  password: string;
  department: string;
  title: string;
}): Promise<void> => {
  try {
    const { email, name, username, password, department, title } = userData;

    if (!email || !name || !username || !password) {
      throw new Error('Missing required user data for welcome email');
    }

    // Build email content
    const emailHtml = buildWelcomeEmailTemplate({
      recipientName: name,
      username,
      password,
      department,
      title,
    });

    const emailText = buildWelcomeEmailText({
      recipientName: name,
      username,
      password,
      department,
      title,
    });

    // Send email
    await sendEmail(
      email,
      'Welcome to ARDA - Your Account Credentials',
      emailText,
      emailHtml
    );

    console.log(`✅ Welcome email sent to: ${email} (${name})`);
  } catch (error) {
    console.error(`❌ Failed to send welcome email to ${userData.email}:`, error);
    throw error;
  }
};

export default sendUserWelcomeEmail;