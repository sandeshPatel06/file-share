# FileShare — Real-time File & Note Sharing

FileShare is a high-performance, real-time note and file sharing web application built with Next.js (App Router), Tailwind CSS, and Firebase (Firestore + Cloud Storage).

---

## 🛠️ Step-by-Step Guide: Setting Up `.env.local`

To run FileShare locally or deploy to production, create a file named `.env.local` in the root of the project by copying `.env.local.example`:

```bash
cp .env.local.example .env.local
```

Fill in the required variables from your Firebase Console by following the instructions below:

---

### Step 1: Get Client-Side Credentials (Web SDK)

1. Go to the [Firebase Console](https://console.firebase.google.com/) and select your project (or click **Add Project** to create a new one).
2. Click the ⚙️ **Gear Icon** in the top-left sidebar and select **Project Settings**.
3. Under the **General** tab, scroll down to **Your apps**.
4. If you haven't created a web app yet, click the **Web** icon (`</>`), name your app (e.g. `FileShare Web`), and click **Register App**.
5. Locate the `firebaseConfig` object and copy the values into your `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

---

### Step 2: Get Server-Side Admin Credentials (Admin SDK)

1. In **Project Settings**, switch to the **Service Accounts** tab.
2. Ensure **Node.js** is selected, then click **Generate new private key**.
3. Confirm by clicking **Generate Key** — a `.json` key file will download to your computer.
4. Open the downloaded `.json` file in any text editor and map the fields to your `.env.local`:

- `project_id` → `FIREBASE_ADMIN_PROJECT_ID`
- `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`
- `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY`

```env
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC7...\n-----END PRIVATE KEY-----\n"
```

> **Note on Private Key Formatting**: Wrap the `FIREBASE_ADMIN_PRIVATE_KEY` value in double quotes `""` and ensure literal `\n` characters are preserved.

---

### Step 3: Configure Security & App URL

```env
# Generate a random 32+ character secret for JWT token verification:
# Command: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production

# App Base URL (used for generating share links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### Step 4: Enable Firebase Services

1. **Firestore Database**:
   - In Firebase Console left sidebar, click **Build > Firestore Database**.
   - Click **Create Database**, select location, and start in **Test mode** (or Production mode).
2. **Cloud Storage**:
   - In left sidebar, click **Build > Storage**.
   - Click **Get Started**, choose default location, and initialize.

---

## 🚀 Running the Project

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

4. Build for production:
   ```bash
   npm run build
   npm start
   ```

---

## 🎨 Features & Tech Stack

- **Framework**: Next.js 16 (App Router + Turbopack)
- **Styling**: Vanilla CSS + Design Tokens + Tailwind CSS
- **Real-time Sync**: Firestore `onSnapshot` real-time listeners
- **File Uploads**: Direct-to-Storage Firebase Signed URLs (up to 50 MB)
- **Security**: Optional password protection with bcrypt & JWT authentication tokens
- **Responsiveness**: Fully responsive desktop split-view and mobile tabbed view
