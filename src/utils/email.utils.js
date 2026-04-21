// backend/src/utils/email.utils.js
import dotenv from "dotenv";
dotenv.config();

const sendViaBrevo = async(to,subject,htmlContent)=>{
  console.log("Checking API Key:", process.env.BREVO_API_KEY ? "KEY EXISTS" : "UNDEFINED ❌");
    const response=await fetch("https://api.brevo.com/v3/smtp/email",{
        method:"POST",
        headers:{
            "api-key":process.env.BREVO_API_KEY,
            "Content-Type": "application/json", // 🚨 TYPO FIXED HERE
            "Accept": "application/json"
        },
        body:JSON.stringify({
            sender:{name:"API community",email:process.env.GMAIL_USER},
            to:[{email:to}],
            subject:subject,
            htmlContent:htmlContent,
        }),
    });
    if(!response.ok){
      const errorData = await response.text();
    console.error("Brevo API Error:", errorData);
    throw new Error("Failed to send email via Brevo");  
    }
    console.log(`✅ Email sent successfully via Brevo to: ${to}`); 
}

export const sendOtpEmail=async({to,code})=>{
   const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px 20px; background-color: #f3f4f6;">
      <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 40px 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.03);">
        
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; width: 50px; height: 50px; background-color: #d1fae5; color: #059669; border-radius: 12px; font-size: 20px; font-weight: bold; line-height: 50px; margin-bottom: 12px;">
            PN
          </div>
          <div style="color: #10b981; font-weight: 700; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">
            API Community Security
          </div>
        </div>

        <h1 style="color: #111827; font-size: 24px; font-weight: 700; text-align: center; margin: 0 0 16px;">
          Verify your identity
        </h1>
        
        <p style="color: #4b5563; font-size: 15px; text-align: center; margin: 0 0 32px; line-height: 1.6;">
          Please enter the verification code below to securely access your account. This code will expire in 5 minutes.
        </p>

        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; background-color: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; font-size: 36px; font-weight: 800; letter-spacing: 12px; padding: 16px 32px; border-radius: 8px;">
            ${code}
          </div>
        </div>

        <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 0 0 24px;" />

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0 0 8px; line-height: 1.5;">
          If you didn't request this code, you can safely ignore this email.
        </p>
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          &copy; ${new Date().getFullYear()} API community. All rights reserved.
        </p>
        
      </div>
    </div>
  `; 

  try{
    await sendViaBrevo(to,"Your API community verification code",html);
  }
  catch(error){
    console.error("❌Failed to send OTP Email", error);
     throw error;
  }
 
};

// --- PREMIUM, FULLY RESPONSIVE ADMIN NOTIFICATION EMAIL ---
export const sendAdminNotificationEmail = async ({ name, email, phone, intrest }, adminEmail) => {
    
    // Fallback to localhost if FRONTEND_URL isn't in your .env
    const dashboardUrl = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/admin/login` : 'http://localhost:5173/admin/login';

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        /* Responsive adjustments for mobile devices */
        @media only screen and (max-width: 600px) {
          .main-table { width: 100% !important; border-radius: 0 !important; }
          .wrapper-td { padding: 10px !important; }
          .content-td { padding: 30px 20px !important; }
          .header-td { padding: 35px 20px !important; }
          .h1-title { font-size: 24px !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f5; width: 100%;">
        <tr>
          <td class="wrapper-td" align="center" style="padding: 40px 15px;">
            
            <table class="main-table" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); width: 100%; max-width: 600px; margin: 0 auto;">
              
              <tr>
                <td class="header-td" align="center" style="background: #0A7294; background: linear-gradient(135deg, #0A7294 0%, #22B3AD 100%); padding: 45px 30px;">
                  <div style="background-color: rgba(255,255,255,0.2); display: inline-block; padding: 6px 14px; border-radius: 30px; margin-bottom: 16px;">
                    <span style="color: #ffffff; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">New Application</span>
                  </div>
                  <h1 class="h1-title" style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">The Network is Growing.</h1>
                </td>
              </tr>

              <tr>
                <td class="content-td" style="padding: 40px 35px;">
                  <p style="color: #475569; font-size: 16px; line-height: 24px; margin: 0 0 16px 0; font-weight: 500;">Hello Admin,</p>
                  <p style="color: #475569; font-size: 16px; line-height: 24px; margin: 0 0 32px 0;">A new developer has applied to join The API Community. Here are their details:</p>

                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; width: 100%;">
                    <tr>
                      <td style="padding: 24px;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                          
                          <tr>
                            <td style="padding-bottom: 14px; border-bottom: 1px solid #e2e8f0;">
                              <div style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Applicant Name</div>
                              <div style="color: #0f172a; font-size: 16px; font-weight: 700; word-break: break-word; overflow-wrap: break-word;">${name}</div>
                            </td>
                          </tr>
                          
                          <tr>
                            <td style="padding: 14px 0; border-bottom: 1px solid #e2e8f0;">
                              <div style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Email Address</div>
                              <div style="font-size: 16px; font-weight: 700; word-break: break-word; overflow-wrap: break-word;">
                                <a href="mailto:${email}" style="color: #0A7294; text-decoration: none;">${email}</a>
                              </div>
                            </td>
                          </tr>
                          
                          <tr>
                            <td style="padding: 14px 0; border-bottom: 1px solid #e2e8f0;">
                              <div style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Phone Number</div>
                              <div style="color: #0f172a; font-size: 16px; font-weight: 700; word-break: break-word; overflow-wrap: break-word;">${phone}</div>
                            </td>
                          </tr>
                          
                          <tr>
                            <td style="padding-top: 14px;">
                              <div style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">Role Interest</div>
                              <span style="display: inline-block; background-color: #e0f2fe; color: #0284c7; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">${intrest}</span>
                            </td>
                          </tr>

                        </table>
                      </td>
                    </tr>
                  </table>

                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 40px; width: 100%;">
                    <tr>
                      <td align="center">
                        <a href="${dashboardUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 10px; font-weight: 700; font-size: 15px; letter-spacing: 0.5px;">Open Admin Dashboard</a>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>

              <tr>
                <td align="center" style="background-color: #f8fafc; padding: 24px; border-top: 1px solid #f1f5f9;">
                  <p style="margin: 0; color: #94a3b8; font-size: 12px; font-weight: 600;">&copy; ${new Date().getFullYear()} The API Community.</p>
                  <p style="margin: 6px 0 0 0; color: #cbd5e1; font-size: 11px;">This is an automated system notification.</p>
                </td>
              </tr>

            </table>
            </td>
        </tr>
      </table>
    </body>
    </html>
    `; 

    try {
      await sendViaBrevo(adminEmail, `🔥 New Application: ${name} wants to join!`, html);
    } catch(error) {
      console.error("❌Failed to send Admin Notification Email", error);
    }
};