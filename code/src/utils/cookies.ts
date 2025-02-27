// 设置 cookie
export function setCookie(name: string, value: string, days: number = 1) {
  const date = new Date()
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
  const expires = `expires=${date.toUTCString()}`
  document.cookie = `${name}=${value};${expires};path=/`
}

// 获取 cookie
export function getCookie(name: string): string | null {
  const cookieName = `${name}=`
  const cookies = document.cookie.split(';')
  for (let cookie of cookies) {
    cookie = cookie.trim()
    if (cookie.indexOf(cookieName) === 0) {
      return cookie.substring(cookieName.length, cookie.length)
    }
  }
  return null
}

// 删除 cookie
export function removeCookie(name: string) {
  setCookie(name, '', -1)
} 