
# CTFS (Capture The Flag Simple)

> 🚩 **Free & Simple CTF Platform** — Deploy seamlessly with **Vercel** + **Supabase**. Perfect for individuals or teams who want a free and lightweight CTF platform.

---

## 🎬 Quick Demo

[https://ctf.ariaf.my.id](https://ctf.ariaf.my.id)

### Page Screenshot
<!-- ![Root Page](images/README/image-18.png) -->
![Home Page](images/README/image-9.png)
![Scoreboard](images/README/image-10.png)
![Admin Dashboard](images/README/image-11.png)
![Admin Overview](images/README/image-17.png)
![Notifications](images/README/image-12.png)

<details>
<summary>📸 More Screenshot Demo (Click to expand)</summary>

### User Features
![Profile Page](images/README/image-13.png)
![Admin Solves](images/README/image-16.png)
![Login](images/README/image-14.png)
![Signup](images/README/image-15.png)

</details>

## 📖 Deployment Guide

### 1. Clone Repository

```bash
git clone https://github.com/ariafatah0711/ctfs
cd ctfs
```

### 2. Supabase Setup

#### Required

1. **Create Supabase Project**
   Log in to [Supabase](https://supabase.com/) and create a new project.

2. **Import Schema**
   Upload `sql/schema.sql` into the **Supabase SQL editor** and run it to set up the database schema.

3. **Disable Email Confirmation**
   Go to **Authentication** in Supabase and disable email confirmation.
   ![Disable Email Confirmation](images/README/image-3.png)

#### Optional

4. **Optional Testing Data**

    - Testing challenges → `sql/testing_challenges.sql`
    - Dummy scoreboard → `sql/dummy_scoreboard/`
       - Dummy challenges → `dummy_user_challenges.sql`
       - Dummy solves → `dummy_solves.sql` (can be generated using `create_solves.py` or use the pre-generated file)
       - Reset dummy data → `dummy_reset.sql`

### 3. Application Configuration

The application can be customized through `src/config.ts`:

```typescript
export const APP = {
  shortName: 'FGTE',              // Short name for your CTF platform
  fullName: 'CTFS Platform',      // Full name of your platform
  description: 'Your description', // Platform description
  flagFormat: 'FGTE{your_flag_here}', // Flag format for challenges
  challengeCategories: [          // Available challenge categories
    'Intro',
    'Misc',
    'Osint',
    'Crypto',
    'Forensics',
    'Web',
    'Reverse',
  ],
  links: {                        // Platform-related links
    github: 'your_github_repo',
    discord: 'your_discord_invite',
    // ... other links
  },
}
```

### 4. Environment Configuration

Create a `.env.local` file at the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

NEXT_PUBLIC_SITE_URL=https://ctf.ariaf.my.id
```

Get these values from your Supabase project dashboard.

### 4. Deployment

#### 1. Local Development & Testing

```bash
# Install dependencies (requires Node.js 18+ and npm 9+)
npm install

# Start development server
npm run dev
```

To test your production build:

```bash
# Build for production
npm run build

# (Optional) Preview production build
npm run start
```

> **Tip:**
> After registering a user, you can make them an administrator by setting `admin` to `true` in the Supabase `users` table via the dashboard.

![Set Admin](images/README/image.png)

---

#### 2. Deploy to Vercel

##### Using Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Log in to Vercel
vercel login

# Link your project
vercel link

# Set environment variables (can also be done in Vercel dashboard)
vercel env add

# Deploy to production
vercel --prod
```

##### Using Vercel Dashboard

1. Push the project to GitHub.
2. Log in to [Vercel](https://vercel.com/) and import the repository.
3. Set environment variables in Vercel (from `.env.local`).
4. Deploy!

### 5. Authentication Setup (Google Login)

1. **Enable Google Provider in Supabase**
   Dashboard → Authentication → Providers → Google → Enable.
   Enter **Client ID** and **Client Secret** from Google Cloud Console.

2. **Create OAuth Client in Google Cloud Console**

   * APIs & Services → Credentials → Create OAuth Client ID.
   * Application type: **Web**.
   * Authorized redirect URIs:

     ```
     https://<YOUR_PROJECT_REF>.supabase.co/auth/v1/callback
     ```

   ![Google OAuth](images/README/image-1.png)

3. **Configure Redirect URL**
   Dashboard → Authentication → URL Configuration → Site URL.
   Set this to your domain, for example:

   ```
   https://ctf.ariaf.my.id
   ```

   ![Site URL](images/README/image-2.png)

## 6. Opsional Supabase Reset Emils
```html
<table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
   <tr>
      <td style="padding: 32px; text-align: center;">
      <h2 style="color: #111827; margin-bottom: 16px;">Reset Password</h2>
      <p style="color: #374151; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
         Kamu menerima email ini karena ada permintaan untuk reset password akunmu.
         Klik tombol di bawah untuk membuat password baru.
      </p>
      <a href="{{ .ConfirmationURL }}"
         style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 15px;">
         Reset Password
      </a>
      <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin-top: 24px;">
         Jika kamu tidak meminta reset password, abaikan email ini.
      </p>
      </td>
   </tr>
</table>
<p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 16px;">{{ .SiteURL }}
   © {{ .SiteURL }} - Semua hak dilindungi
</p>
```

---

## 🗄️ Supabase Backup (GitHub Actions)

Automate daily backup of your Supabase database to GitHub using [matheusbcprog/supabase-backup](https://github.com/matheusbcprog/supabase-backup).

### Setup Steps

1. **Fork or copy the workflow:**
   - Go to [supabase-backup](https://github.com/matheusbcprog/supabase-backup).
   - Copy `.github/workflows/backup.yml` into your repo.

2. **Add required secrets in your GitHub repository:**
   - `SUPABASE_URL` — your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` — service role key (from Supabase dashboard)
   - `GITHUB_TOKEN` — default GitHub Actions token

3. **Customize schedule (optional):**
   - Edit the `cron` in `backup.yml` to set backup frequency.

4. **Restore:**
   - Backups are saved in your repo under `/backups`. Restore via Supabase SQL editor.

---

## ⚠️ Notes

* If you modify the schema, re-run the Supabase SQL setup and redeploy to Vercel.
* **Warning:** Schema changes may wipe existing data.
* **Backup regularly!**

---
