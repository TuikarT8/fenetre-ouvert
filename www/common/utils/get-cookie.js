export function getCookie(key) {
    return document.cookie.split(';')
        .find(part => part.trim().startsWith(key))
        ?.split('=')[1]
        ?.trim();
}