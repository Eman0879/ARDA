// utils/userEmailTemplates.ts

/**
 * Builds HTML email template for new user credentials
 */
export const buildWelcomeEmailTemplate = ({
  recipientName,
  username,
  password,
  department,
  title,
}: {
  recipientName: string;
  username: string;
  password: string;
  department: string;
  title: string;
}): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to ARDA</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #2196F3 0%, #64B5F6 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    Welcome to ARDA
                  </h1>
                  <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.95); font-size: 16px;">
                    Employee Central Hub
                  </p>
                </td>
              </tr>

              <!-- Greeting -->
              <tr>
                <td style="padding: 30px 30px 20px 30px;">
                  <h2 style="margin: 0 0 16px 0; color: #2C3E50; font-size: 24px; font-weight: 600;">
                    Hi ${recipientName},
                  </h2>
                  <p style="margin: 0 0 16px 0; color: #546E7A; font-size: 16px; line-height: 1.6;">
                    Your account has been successfully created! You can now access the ARDA Employee Central Hub with the credentials below.
                  </p>
                </td>
              </tr>

              <!-- Credentials Box -->
              <tr>
                <td style="padding: 0 30px 30px 30px;">
                  <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 50%); border-radius: 8px; overflow: hidden;">
                    <tr>
                      <td style="padding: 24px;">
                        <h3 style="margin: 0 0 16px 0; color: #1565C0; font-size: 18px; font-weight: 600; text-align: center;">
                          🔐 Your Login Credentials
                        </h3>
                        
                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid rgba(21, 101, 192, 0.1);">
                              <strong style="color: #1565C0; font-size: 14px; display: block; margin-bottom: 4px;">Username:</strong>
                              <span style="color: #2C3E50; font-size: 16px; font-family: 'Courier New', monospace; background: white; padding: 6px 12px; border-radius: 4px; display: inline-block;">${username}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid rgba(21, 101, 192, 0.1);">
                              <strong style="color: #1565C0; font-size: 14px; display: block; margin-bottom: 4px;">Password:</strong>
                              <span style="color: #2C3E50; font-size: 16px; font-family: 'Courier New', monospace; background: white; padding: 6px 12px; border-radius: 4px; display: inline-block;">${password}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid rgba(21, 101, 192, 0.1);">
                              <strong style="color: #1565C0; font-size: 14px; display: block; margin-bottom: 4px;">Department:</strong>
                              <span style="color: #2C3E50; font-size: 16px;">${department}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0;">
                              <strong style="color: #1565C0; font-size: 14px; display: block; margin-bottom: 4px;">Title:</strong>
                              <span style="color: #2C3E50; font-size: 16px;">${title}</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Security Notice -->
              <tr>
                <td style="padding: 0 30px 30px 30px;">
                  <div style="background: #FFF3E0; border-left: 4px solid #FF9800; padding: 16px; border-radius: 4px;">
                    <p style="margin: 0; color: #E65100; font-size: 14px; line-height: 1.5;">
                      <strong>⚠️ Important:</strong> Please change your password after your first login for security purposes.
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Next Steps -->
              <tr>
                <td style="padding: 0 30px 30px 30px;">
                  <h3 style="margin: 0 0 12px 0; color: #2C3E50; font-size: 18px; font-weight: 600;">
                    Next Steps
                  </h3>
                  <ol style="margin: 0; padding-left: 20px; color: #546E7A; font-size: 15px; line-height: 1.8;">
                    <li>Log in to the ARDA portal with your credentials</li>
                    <li>Complete your profile information</li>
                    <li>Change your password in account settings</li>
                    <li>Explore the features available to you</li>
                  </ol>
                </td>
              </tr>

              <!-- Call to Action -->
              <tr>
                <td style="padding: 0 30px 30px 30px; text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" 
                     style="display: inline-block; background: linear-gradient(135deg, #2196F3 0%, #64B5F6 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);">
                    Access ARDA Portal
                  </a>
                </td>
              </tr>

              <!-- Support -->
              <tr>
                <td style="padding: 0 30px 30px 30px;">
                  <p style="margin: 0; color: #78909C; font-size: 14px; text-align: center; line-height: 1.6;">
                    Need help? Contact your system administrator or IT support.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background: #F5F5F5; padding: 24px 30px; border-top: 1px solid #E0E0E0;">
                  <p style="margin: 0 0 8px 0; color: #78909C; font-size: 13px; text-align: center;">
                    This is an automated message from ARDA Employee Central Hub
                  </p>
                  <p style="margin: 0; color: #B0BEC5; font-size: 12px; text-align: center;">
                    © ${new Date().getFullYear()} ARDA. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

/**
 * Plain text version for email clients that don't support HTML
 */
export const buildWelcomeEmailText = ({
  recipientName,
  username,
  password,
  department,
  title,
}: {
  recipientName: string;
  username: string;
  password: string;
  department: string;
  title: string;
}): string => {
  return `
Welcome to ARDA Employee Central Hub

Hi ${recipientName},

Your account has been successfully created! You can now access the ARDA Employee Central Hub.

LOGIN CREDENTIALS:
------------------
Username: ${username}
Password: ${password}
Department: ${department}
Title: ${title}

IMPORTANT: Please change your password after your first login for security purposes.

NEXT STEPS:
1. Log in to the ARDA portal with your credentials
2. Complete your profile information
3. Change your password in account settings
4. Explore the features available to you

Need help? Contact your system administrator or IT support.

---
This is an automated message from ARDA Employee Central Hub
© ${new Date().getFullYear()} ARDA. All rights reserved.
  `.trim();
};