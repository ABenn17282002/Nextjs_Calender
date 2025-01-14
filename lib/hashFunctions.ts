// PBKDF2 を使用してパスワードをハッシュ化する関数
export async function hashPassword(password: string, salt: string): Promise<string> {
    const encoder = new TextEncoder();
    const keyMaterial = encoder.encode(password);
    const saltBuffer = encoder.encode(salt);

    // PBKDF2 キー生成
    const key = await crypto.subtle.importKey(
        "raw",
        keyMaterial,
        { name: "PBKDF2" },
        false,
        ["deriveBits"]
    );

    // ハッシュを生成
    const derivedBits = await crypto.subtle.deriveBits(
    {
        name: "PBKDF2",
        salt: saltBuffer,
        iterations: 100000, // コスト設定
        hash: "SHA-256",
    },
        key,
        256
    );

    // Uint8Array を 16 進数の文字列に変換
    return Array.from(new Uint8Array(derivedBits))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// 入力されたパスワードとハッシュを検証する関数
export async function verifyPassword(
    inputPassword: string,
    salt: string,
    storedHash: string
): Promise<boolean> {
    const hashedInput = await hashPassword(inputPassword, salt);
    return hashedInput === storedHash;
}
