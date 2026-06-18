const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Resend } = require('resend');

admin.initializeApp();

/**
 * Cloud Function: Send Blog Notification
 * Triggered when a new document is created under the 'blogs' collection.
 * Sends an email notification to all subscribed users via the Resend API.
 */
exports.sendBlogNotification = functions.database
    .ref('/blogs/{blogId}')
    .onCreate(async (snapshot, context) => {
        const blogData = snapshot.val();
        
        if (!blogData) {
            console.error("No blog data found in the database write event.");
            return null;
        }

        const title = blogData.title || "New Article Published";
        const excerpt = blogData.excerpt || "We have just published a new article on our blog. Read the details on our website.";
        const blogUrl = blogData.url || "https://parishvabranding.com/blogs";

        console.log(`New blog detected: "${title}". Retrieving subscribers list...`);

        try {
            // 1. Fetch all users who are currently subscribed
            const usersRef = admin.database().ref('users');
            const usersSnapshot = await usersRef
                .orderByChild('isSubscribed')
                .equalTo(true)
                .once('value');

            const usersData = usersSnapshot.val();

            if (!usersData) {
                console.log("No active subscribers found. Notification aborted.");
                return null;
            }

            const emails = Object.values(usersData)
                .map(user => user.email)
                .filter(email => typeof email === 'string' && email.includes('@'));

            if (emails.length === 0) {
                console.log("Subscribers list resolved to 0 valid emails.");
                return null;
            }

            console.log(`Found ${emails.length} subscriber(s). Initializing Resend client...`);

            // 2. Resolve Resend API Key from Environment/Config
            // Recommended setup: firebase functions:secrets:set RESEND_API_KEY="your-key"
            // Fallback: functions.config().resend.key
            const resendApiKey = process.env.RESEND_API_KEY || (functions.config().resend && functions.config().resend.key);

            if (!resendApiKey || resendApiKey === "YOUR_RESEND_API_KEY_HERE") {
                console.error("Resend API key is missing. Set the RESEND_API_KEY environment variable.");
                return null;
            }

            const resend = new Resend(resendApiKey);

            // 3. Construct the Luxury Dark & Gold HTML Template
            const emailHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>New Insight from Parishva</title>
                <style>
                    body {
                        margin: 0;
                        padding: 0;
                        background-color: #0b1215;
                        color: #edebeb;
                        font-family: 'Jost', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                        -webkit-font-smoothing: antialiased;
                    }
                    .wrapper {
                        width: 100%;
                        background-color: #0b1215;
                        padding: 40px 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #0e181c;
                        border: 1px solid rgba(212, 162, 77, 0.2);
                        padding: 40px;
                        text-align: left;
                    }
                    .header {
                        border-bottom: 1px solid rgba(212, 162, 77, 0.15);
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                    }
                    .logo {
                        font-size: 14px;
                        font-weight: bold;
                        letter-spacing: 0.3em;
                        color: #d4a24d;
                        text-transform: uppercase;
                        margin: 0;
                    }
                    .logo span {
                        display: block;
                        font-size: 8px;
                        letter-spacing: 0.4em;
                        color: rgba(212, 162, 77, 0.4);
                        margin-top: 4px;
                    }
                    .eyebrow {
                        font-size: 9px;
                        letter-spacing: 0.2em;
                        color: #d4a24d;
                        text-transform: uppercase;
                        margin-bottom: 12px;
                    }
                    h1 {
                        font-family: 'Cormorant Garamond', 'Georgia', serif;
                        font-size: 28px;
                        font-weight: 300;
                        line-height: 1.3;
                        color: #edebeb;
                        margin: 0 0 20px 0;
                    }
                    h1 em {
                        font-style: italic;
                        color: #e5bf7e;
                    }
                    p {
                        font-size: 15px;
                        line-height: 1.7;
                        color: rgba(237, 235, 235, 0.75);
                        margin: 0 0 25px 0;
                        font-weight: 300;
                    }
                    .cta-wrapper {
                        margin-top: 30px;
                        margin-bottom: 30px;
                    }
                    .btn-primary {
                        display: inline-block;
                        font-size: 9px;
                        font-weight: bold;
                        letter-spacing: 0.25em;
                        color: #0b1215 !important;
                        background-color: #d4a24d;
                        padding: 16px 28px;
                        text-decoration: none;
                        text-transform: uppercase;
                        transition: background-color 0.3s;
                    }
                    .footer {
                        border-top: 1px solid rgba(212, 162, 77, 0.1);
                        padding-top: 20px;
                        margin-top: 40px;
                        font-size: 11px;
                        color: rgba(237, 235, 235, 0.4);
                        line-height: 1.6;
                    }
                    .footer-address {
                        margin-top: 10px;
                        font-size: 10px;
                    }
                    .footer a {
                        color: #d4a24d;
                        text-decoration: none;
                    }
                </style>
            </head>
            <body>
                <div class="wrapper">
                    <div class="container">
                        <div class="header">
                            <div class="logo">
                                Parishva
                                <span>Branding Studio</span>
                            </div>
                        </div>
                        <div class="eyebrow">// INSIGHTS PUBLISHED</div>
                        <h1>We just published: <em>${title}</em></h1>
                        <p>${excerpt}</p>
                        <div class="cta-wrapper">
                            <a href="${blogUrl}" class="btn-primary" target="_blank">Read Full Article</a>
                        </div>
                        <p>We build brands on structured logic, not guesswork. Thank you for being a part of our Insight Circle.</p>
                        <div class="footer">
                            <div>© 2026 Parishva Branding Studio. All rights reserved.</div>
                            <div class="footer-address">KPHB - 114, KPHB Phase 7, Kukatpally, Hyderabad, TS 500072</div>
                            <div style="margin-top: 15px;">
                                You are receiving this because you subscribed to Parishva blog updates.
                                To modify notifications, sign in to your profile on our <a href="${blogUrl.split('/').slice(0, 3).join('/')}">website</a> and toggle blog alerts off.
                            </div>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            `;

            // 4. Send Emails via Resend API
            // Note: In development/free tier, Resend might require sending from 'onboarding@resend.dev'
            // and you can only send to your verified domain or registered account email.
            // When in production, change to 'insights@yourdomain.com' and use verified domain.
            const fromEmail = resendApiKey.startsWith('re_') && resendApiKey.includes('test')
                ? "Parishva Insights <onboarding@resend.dev>"
                : "Parishva Insights <insights@parishvabranding.com>"; // Replace with verified domain sender

            const sendResponse = await resend.emails.send({
                from: fromEmail,
                to: "subscribers@parishvabranding.com", // Generic placeholder for privacy
                bcc: emails, // Send to all subscribers via BCC to hide subscriber emails
                subject: `New Insight: ${title}`,
                html: emailHtml,
            });

            console.log(`Notification sent successfully to ${emails.length} subscriber(s). Resend ID: ${sendResponse.id || sendResponse.data.id}`);
            return { success: true, count: emails.length, id: sendResponse.id || (sendResponse.data && sendResponse.data.id) };

        } catch (error) {
            console.error("Failed to send blog publication emails:", error);
            return { success: false, error: error.message };
        }
    });
