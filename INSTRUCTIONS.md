# Setup Instructions for CCC SmartAssist Backend

You have requested a PHP/MySQL backend for your system. Here are the steps to set it up in your XAMPP environment:

## 1. Create the Database
- Open **phpMyAdmin** (usually at `http://localhost/phpmyadmin`).
- Click on the **SQL** tab.
- Copy and paste the contents of `backend/schema.sql` into the SQL editor and click **Go**.
- This will create the `ccc_smartassist` database and all required tables.

## 2. Configure PHP
- The system is configured to connect to MySQL using the default XAMPP credentials:
  - **Host**: `localhost`
  - **Database**: `ccc_smartassist`
  - **User**: `root`
  - **Password**: (blank)
- If you have changed your MySQL password, update it in `backend/db.php`.

## 3. Verify Backend
- Ensure your project is in `C:\xampp\htdocs\ccc-smartassist`.
- You can test if the API is working by visiting: `http://localhost/ccc-smartassist/backend/api.php?request=settings`
- You should see a JSON object with the default settings.

## 4. Add your Gemini API Key
- Go to the **Admin Portal** in the application.
- Navigate to **Settings**.
- Paste your **Gemini API Key** into the API Key field and click **Save**.
- The chatbot will now use this key for all AI responses.

## 5. Remove Demo Data
- The demo data has already been removed from `constants.ts`.
- You can now add your own official school data via the **Admin Portal** (Manual Rules or PDF Upload).

## Changes Made:
- **Backend**: Created `backend/` directory with `db.php` (connection), `schema.sql` (DB structure), and `api.php` (REST API).
- **Gemini Integration**: Moved Gemini API calls from the frontend to the PHP backend for better security and to use the database-stored API key.
- **Frontend**: Created `services/apiService.ts` and updated `App.tsx` to use the new backend endpoints instead of `localStorage`.
- **Cleanup**: Cleared `INITIAL_KNOWLEDGE_BASE` and `INITIAL_MANUAL_RULES` in `constants.ts`.
