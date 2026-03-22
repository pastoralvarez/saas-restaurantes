import { NextResponse } from 'next/server'

export function proxy(request) {
  const hostname = request.headers.get('host') || ''
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'localhost:3000'
  const isSubdomain = hostname !== baseDomain && hostname !== `www.${baseDomain}` && hostname.includes('.')

  if (isSubdomain && !hostname.startsWith('www.')) {
    const subdominio = hostname.split('.')[0]
    const url = request.nextUrl.clone()
    url.pathname = `/restaurante/${subdominio}${url.pathname}`
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)'],
}