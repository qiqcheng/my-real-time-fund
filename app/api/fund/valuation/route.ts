import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json({ error: '缺少基金代码' }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://fundgz.1234567.com.cn/js/${code}.js?rt=${Date.now()}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://fund.eastmoney.com/',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const text = await response.text()
    const match = text.match(/jsonpgz\((.*)\)/)

    if (match) {
      const data = JSON.parse(match[1])
      return NextResponse.json(data)
    } else {
      return NextResponse.json(
        { error: '解析数据失败' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('获取基金估值失败:', error)
    return NextResponse.json(
      { error: '获取基金估值失败' },
      { status: 500 }
    )
  }
}
