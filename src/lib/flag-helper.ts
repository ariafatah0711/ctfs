import { hashFlag } from './crypto'

/**
 * Helper untuk generate hash flag
 * Gunakan function ini untuk membuat hash dari flag sebelum disimpan ke database
 */

// Contoh penggunaan:
// const flag = "ctf{hello_world}"
// const flagHash = hashFlag(flag)
// console.log(flagHash) // Output: hash SHA256

export function generateFlagHash(flag: string): string {
  return hashFlag(flag)
}

// Contoh flag dan hash-nya untuk testing
export const SAMPLE_FLAGS = {
  'hello': 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
  'sqli123': 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
  'reverseme': '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5'
}

// Function untuk test flag validation
export function testFlagValidation() {
  console.log('Testing flag validation...')
  
  Object.entries(SAMPLE_FLAGS).forEach(([flag, expectedHash]) => {
    const actualHash = hashFlag(flag)
    const isValid = actualHash === expectedHash
    
    console.log(`Flag: "${flag}"`)
    console.log(`Expected: ${expectedHash}`)
    console.log(`Actual:   ${actualHash}`)
    console.log(`Valid: ${isValid ? '✅' : '❌'}`)
    console.log('---')
  })
}
