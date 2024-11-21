import pkg from 'crypto-js';
import CONSTANT from '@/Constant';

const { AES, enc } = pkg

class CryptoJsHelper {
  encrypt(value: string) {
    return AES.encrypt(value, CONSTANT.CRYPTO_JS_KEY).toString()
  }

  decrypt(cipherText: string) {
    const bytes  = AES.decrypt(cipherText, CONSTANT.CRYPTO_JS_KEY);
    return bytes.toString(enc.Utf8)
  }
}

export default CryptoJsHelper