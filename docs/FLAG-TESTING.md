# 🧪 Flag Testing Guide

Panduan untuk testing flag di aplikasi CTFS.

## 🎯 Sample Flags yang Benar

Berdasarkan data di database, berikut adalah flag yang benar:

### 1. Welcome Challenge (100 pts)
- **Flag**: `hello`
- **Hash**: `2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824`
- **Hint**: Flag adalah kata "hello" dalam bahasa Inggris

### 2. SQL Injection Basics (200 pts)
- **Flag**: `sqli123`
- **Hash**: `ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d`
- **Hint**: Coba inject SQL di form login

### 3. Reverse Engineering 101 (300 pts)
- **Flag**: `reverseme`
- **Hash**: `5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5`
- **Hint**: Gunakan tools seperti strings atau hex editor

## 🔍 Cara Testing

### 1. Gunakan Flag Tester
- Buka dashboard
- Scroll ke bawah, ada komponen "Flag Tester"
- Masukkan flag untuk test hash-nya
- Cek apakah hash cocok dengan yang di database

### 2. Test di Browser Console
```javascript
// Import function hash
import { hashFlag } from './src/lib/crypto'

// Test flag
console.log(hashFlag('hello'))
// Output: a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3
```

### 3. Submit Flag
- Klik challenge yang ingin diselesaikan
- Masukkan flag yang benar (tanpa spasi, case-sensitive)
- Klik "Submit Flag"

## ⚠️ Common Mistakes

### Flag yang SALAH:
- `Hello` (huruf besar)
- `HELLO` (semua huruf besar)
- `hello ` (ada spasi di akhir)
- ` hello` (ada spasi di awal)
- `ctf{hello}` (format CTF)
- `flag{hello}` (format flag)

### Flag yang BENAR:
- `hello` (huruf kecil, tanpa spasi)
- `sqli123` (huruf kecil, tanpa spasi)
- `reverseme` (huruf kecil, tanpa spasi)

## 🐛 Debug Info

Jika flag masih salah, cek browser console untuk debug info:
- Flag submitted: [flag yang di-submit]
- Expected hash: [hash yang diharapkan]
- Actual hash: [hash yang dihasilkan]

## 🔧 Troubleshooting

### 1. Flag Tester tidak muncul
- Pastikan sudah login
- Refresh halaman dashboard
- Cek console untuk error

### 2. Hash tidak cocok
- Pastikan flag tanpa spasi
- Pastikan case-sensitive (huruf kecil)
- Cek apakah ada karakter tersembunyi

### 3. Submit gagal
- Cek koneksi internet
- Cek console untuk error
- Pastikan user sudah login

## 📝 Tips

1. **Copy-paste flag** untuk menghindari typo
2. **Gunakan Flag Tester** sebelum submit
3. **Cek hint** jika bingung
4. **Case-sensitive** - huruf besar/kecil berpengaruh
5. **No spaces** - tidak boleh ada spasi di awal/akhir

---

**Happy Testing! 🎉**
