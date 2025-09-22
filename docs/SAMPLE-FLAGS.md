# Sample Flags untuk Testing

Berikut adalah sample flags yang bisa digunakan untuk testing aplikasi CTFS:

## 🎯 Challenge Flags

### 1. Welcome Challenge (100 pts)
- **Flag**: `hello`
- **Hash**: `a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3`
- **Difficulty**: Easy
- **Hint**: Flag adalah kata "hello" dalam bahasa Inggris

### 2. SQL Injection Basics (200 pts)
- **Flag**: `sqli123`
- **Hash**: `ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d`
- **Difficulty**: Medium
- **Hint**: Coba inject SQL di form login

### 3. Reverse Engineering 101 (300 pts)
- **Flag**: `reverseme`
- **Hash**: `5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5`
- **Difficulty**: Hard
- **Hint**: Gunakan tools seperti strings atau hex editor

## 🧪 Cara Testing

1. **Login ke aplikasi**
2. **Buka challanges**
3. **Lihat daftar challenges**
4. **Submit flag sesuai dengan challenge**

## 🔧 Generate Hash Baru

Jika ingin membuat challenge baru, gunakan function ini:

```javascript
import { hashFlag } from './src/lib/crypto'

const newFlag = "ctf{my_new_flag}"
const hash = hashFlag(newFlag)
console.log(`Flag: ${newFlag}`)
console.log(`Hash: ${hash}`)
```

## 📝 Format Flag

- **Plain text**: `hello`, `sqli123`, `reverseme`
- **CTF format**: `ctf{flag_content}`
- **Custom format**: Sesuai kebutuhan

## ⚠️ Catatan

- Semua flag disimpan sebagai hash SHA256 di database
- User submit flag asli, sistem akan hash dan bandingkan
- Flag case-sensitive (huruf besar/kecil berpengaruh)
