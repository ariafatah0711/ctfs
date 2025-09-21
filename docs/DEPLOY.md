# Deploy Guide - CTFS

Panduan lengkap untuk deploy aplikasi CTFS ke Vercel.

## 🚀 Quick Deploy

### 1. Persiapan

Pastikan sudah:
- ✅ Project Supabase sudah setup
- ✅ Database schema sudah dijalankan
- ✅ Environment variables sudah siap
- ✅ Code sudah di-push ke GitHub

### 2. Deploy ke Vercel

1. **Login ke Vercel**
   - Buka [vercel.com](https://vercel.com)
   - Login dengan GitHub account

2. **Import Project**
   - Klik "New Project"
   - Pilih repository GitHub yang berisi code CTFS
   - Klik "Import"

3. **Configure Project**
   - Framework Preset: Next.js
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

4. **Environment Variables**
   - Klik "Environment Variables"
   - Tambahkan:
     ```
     NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY = your_anon_key_here
     ```

5. **Deploy**
   - Klik "Deploy"
   - Tunggu proses build selesai
   - Aplikasi akan live di URL yang diberikan

### 3. Update Supabase Settings

Setelah deploy, update settings di Supabase:

1. **Authentication Settings**
   - Buka Supabase Dashboard
   - Settings > Authentication
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/**`

2. **CORS Settings** (jika perlu)
   - Settings > API
   - Tambahkan domain Vercel ke allowed origins

## 🔧 Custom Domain (Optional)

### 1. Add Domain di Vercel

1. Buka project di Vercel dashboard
2. Settings > Domains
3. Add domain: `your-domain.com`
4. Follow instructions untuk setup DNS

### 2. Update Supabase

Update Site URL dan Redirect URLs dengan domain baru.

## 📊 Monitoring

### Vercel Analytics

- Buka project di Vercel
- Tab "Analytics" untuk melihat traffic
- Tab "Functions" untuk melihat API calls

### Supabase Monitoring

- Dashboard > Logs untuk melihat database activity
- Dashboard > API untuk melihat API usage

## 🔄 Auto Deploy

Setiap push ke branch `main` akan otomatis trigger deploy:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

## 🐛 Troubleshooting

### Build Failed

1. **Check logs di Vercel**
   - Buka project > Deployments
   - Klik deployment yang failed
   - Lihat build logs

2. **Common issues:**
   - Missing environment variables
   - TypeScript errors
   - Missing dependencies

### Runtime Errors

1. **Check browser console**
2. **Check Vercel function logs**
3. **Check Supabase logs**

### Environment Variables

Pastikan semua env vars sudah di-set di Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🔒 Security Checklist

- ✅ Environment variables tidak hardcode
- ✅ Supabase RLS policies aktif
- ✅ HTTPS enabled (default di Vercel)
- ✅ CORS settings benar
- ✅ Authentication flow working

## 📱 Testing Deployed App

1. **Test Authentication**
   - Register user baru
   - Login/logout
   - Session persistence

2. **Test Challenges**
   - Lihat daftar challenges
   - Submit flag (gunakan sample flags)
   - Cek score update

3. **Test Scoreboard**
   - Lihat leaderboard
   - Cek ranking update

## 🎯 Performance Tips

1. **Enable Vercel Analytics**
2. **Use Supabase connection pooling**
3. **Optimize images** (jika ada)
4. **Enable caching** di Vercel

## 📞 Support

Jika ada masalah deploy:
1. Check Vercel documentation
2. Check Supabase documentation  
3. Check GitHub issues
4. Create issue di repository

---

**Deploy successful! 🎉**
