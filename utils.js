// utils.js
export const generateUserId = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 90 + 10); // 10-99
    return timestamp.slice(-4) + random.toString();
};