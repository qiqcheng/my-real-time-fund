import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const key = searchParams.get('key')

  if (!key) {
    return NextResponse.json({ error: '缺少搜索关键词' }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://fundsuggest.eastmoney.com/FundSearch/api/FundSearchAPI.ashx?m=1&key=${key}`,
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

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('搜索基金失败:', error)
    return NextResponse.json(
      { error: '搜索基金失败', ErrCode: -1, ErrMsg: '搜索失败', Datas: [] },
      { status: 500 }
    )
  }
}
