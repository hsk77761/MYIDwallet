import CryptoJS from 'crypto-js'
import { SECRET_ENCRYPTION_CODE } from 'constants/index'
export const encrypt = (message: string): string => {
    const encryptedMessage = CryptoJS.AES.encrypt(
        message,
        SECRET_ENCRYPTION_CODE
    ).toString();
    return encryptedMessage
}

export const decrypt = (encryptedMessage: string): string => {
    try {
        const decryptedBytes = CryptoJS.AES.decrypt(
            encryptedMessage,
            SECRET_ENCRYPTION_CODE
        );
        const msg = decryptedBytes.toString(CryptoJS.enc.Utf8);
        return msg;
    } catch {
        return encryptedMessage

    }
}