export const formatSmartFlag = (input: string, mask: string): string => {
  let result = '';
  let i = 0;
  let m = 0;

  while (i < input.length && m < mask.length) {
    const maskChar = mask[m];
    const inputChar = input[i];

    if (maskChar === '_' || maskChar === '{' || maskChar === '}' || maskChar === '-') {
      if (inputChar === maskChar) {
        result += inputChar;
        i++;
      } else {
        result += maskChar;
      }
      m++;
    } else if (maskChar === 'X') {
      if (/[a-zA-Z]/.test(inputChar)) {
        result += inputChar.toUpperCase();
        m++;
      }
      i++;
    } else if (maskChar === 'x') {
      if (/[a-zA-Z]/.test(inputChar)) {
        result += inputChar.toLowerCase();
        m++;
      }
      i++;
    } else if (maskChar === '0') {
      if (/[0-9]/.test(inputChar)) {
        result += inputChar;
        m++;
      }
      i++;
    } else {
      result += inputChar;
      i++;
      m++;
    }
  }
  return result;
};
