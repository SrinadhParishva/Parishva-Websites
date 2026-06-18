# Parishva Branding Studio — Blog Subscription Setup Guide

This document describes the steps required to configure, initialize, and deploy the blog subscription and email notification system.

---

## 1. Firebase Setup (Console Configuration)

### A. Create Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** and name it `parishva-branding` (or similar).
3. (Optional) Enable Google Analytics for the project, then click **Create Project**.

### B. Enable Email/Password Authentication
1. In the left sidebar, navigate to **Build** -> **Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, select **Email/Password**.
4. Toggle the status to **Enabled** and click **Save**.

### C. Create Firebase Realtime Database
1. Navigate to **Databases and storage** (or **Build**) -> **Realtime Database**.
2. Click **Create Database**.
3. Choose a database location (e.g., `Singapore` or `United States`) and click **Next**.
4. Select **Start in test mode** (this allows read/write access for testing). Click **Enable**.
5. Once created, copy the database URL (e.g., `https://parishva-web-default-rtdb.firebaseio.com/`). If it differs from the one in your `firebase-config.js`, update the `databaseURL` property inside `firebase-config.js`.
6. Rules for production can be set under the **Rules** tab:
   ```json
   {
     "rules": {
       "users": {
         "$uid": {
           ".read": "auth != null && auth.uid == $uid",
           ".write": "auth != null && auth.uid == $uid"
         }
       },
       "blogs": {
         ".read": "true",
         ".write": "false"
       }
     }
   }
   ```

### D. Obtain Client App Keys
1. In the Firebase console dashboard, click the **Web icon (`</>`)** to register a new Web App.
2. Name the app `Parishva-Web` and click **Register app**.
3. Under **SDK setup and configuration**, select **CDN** or copy the `firebaseConfig` object. It looks like this:
   ```javascript
   const firebaseConfig = {
       apiKey: "AIzaSy...",
       authDomain: "parishva-branding.firebaseapp.com",
       projectId: "parishva-branding",
       storageBucket: "parishva-branding.appspot.com",
       messagingSenderId: "1234567890",
       appId: "1:1234:web:abcd"
   };
   ```
4. Open the file `Practice/firebase-config.js` and paste your custom configuration keys into the `firebaseConfig` variable.

---

## 2. Resend Setup (Email Deliverability)

1. Sign up for a free account at [Resend](https://resend.com/).
2. Navigate to **API Keys** in the sidebar.
3. Click **Create API Key**. Give it full access permissions and copy the key (starts with `re_`).
4. (Optional but recommended for production) Go to **Domains** in Resend, add your domain `parishvabranding.com`, and add the generated DNS records (MX, TXT, SPF) to your domain registrar (e.g., GoDaddy, Namecheap) to verify domain ownership. This allows sending emails from `insights@parishvabranding.com` instead of the default testing domain `onboarding@resend.dev`.

---

## 3. Cloud Functions Backend Deployment

To deploy the Cloud Function, you will need Node.js and the Firebase CLI installed on your local computer.

### A. Install Firebase CLI
Install the Firebase command-line tools globally via terminal:
```bash
npm install -g firebase-tools
```

### B. Login and Initialize Firebase CLI
Navigate to the root of your project directory (`AG Parishva` or `Practice`) and log in to your Google Account:
```bash
firebase login
```

Initialize Firebase in your project folder:
```bash
firebase init
```
1. Select **Functions** (and optionally **Firestore**).
2. Select **Use an existing project** and pick the project you created in Step 1.
3. Choose **JavaScript** for the language.
4. Agree to install dependencies with npm.
5. Choose **No** when asked to overwrite files (so your `functions/package.json` and `functions/index.js` aren't overwritten).

### C. Set Resend API Key Secret
In Firebase Cloud Functions, secrets are the safest way to store sensitive API credentials:
```bash
firebase functions:secrets:set RESEND_API_KEY="your_actual_resend_api_key_here"
```

### D. Deploy Functions
Deploy only the functions package to your Firebase Console:
```bash
firebase deploy --only functions
```
Once deployed, the terminal will show a success message. The Firestore trigger will now be listening live for new blog entries.

---

## 4. Testing the Entire Flow

1. **Register a Test Subscriber**:
   - Open your site locally or on a server.
   - Click the **Subscribe** button in the header navigation or fill out the email input in the **Join the Insight Circle** section in the blogs area.
   - Fill in your details (Name, Email, Phone Number, Password) and click **Create Subscriber Account**.
   - Verify that you are registered successfully (gold particle explosion occurs) and the view transitions to show your **Subscriber Panel** showing "SUBSCRIBED" status.
   - Verify that in your Firebase Console, under **Authentication**, the user is listed, and under **Realtime Database**, a node has been created under `users/{uid}` with `isSubscribed: true`.

2. **Publish a Mock Blog (Send Newsletter)**:
   - Go to your Firebase console -> **Realtime Database**.
   - Navigate to the root node, click the **+ (Add)** button.
   - Add a node under `/blogs`:
     - Set Key to: `blog_test_01` (or click `+` to add fields).
     - Inside it, add fields:
       - Name: `title` -> Value: `Why Clarity is Your Brand's Superpower`
       - Name: `excerpt` -> Value: `We outline why focus beats execution and how to find messaging gaps in a 2-day audit.`
       - Name: `url` -> Value: `https://parishvabranding.com/switching-agencies.html`
       - Name: `publishedAt` -> Value: `1781827200000` (timestamp number)
   - Click **Add**.
   - The node creation will trigger the Cloud Function `sendBlogNotification` in the background. Check the Firebase Console -> **Functions** -> **Logs** to verify execution.
   - Check the subscriber's email inbox. You should receive a beautiful gold/dark HTML notification email listing the title, description, and button linking to the article!
