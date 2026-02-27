'use client'

import { useState, useEffect } from 'react'

interface FundSearchResult {
  _id: string
  CODE: string
  NAME: string
  JP: string
  CATEGORY: number
  CATEGORYDESC: string
  STOCKMARKET: string | null
  BACKCODE: string
  MatchCount: number
  FundBaseInfo: any
  StockHolder: any
  ZTJJInfo: any
  SEARCHWEIGHT: number
  NEWTEXCH: string
}

interface FundSearchResponse {
  ErrCode: number
  ErrMsg: string
  Datas: FundSearchResult[]
}

interface FundValuation {
  name: string
  fundcode: string
  gsz: string
  dwjz: string
  gztime: string
  gszzl: string
}

interface FundItem {
  code: string
  name: string
  valuation: FundValuation | null
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResult, setSearchResult] = useState<FundSearchResult | null>(null)
  const [funds, setFunds] = useState<FundItem[]>([])
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)

  // 获取基金估值的函数
  const fetchFundValuation = async (fundCode: string) => {
    try {
      const response = await fetch(`/api/fund/valuation?code=${fundCode}`)
      const valuation: FundValuation = await response.json()
      
      if (valuation && valuation.fundcode) {
        setFunds(prevFunds =>
          prevFunds.map(fund =>
            fund.code === fundCode ? { ...fund, valuation } : fund
          )
        )
      }
    } catch (error) {
      console.error('获取基金估值失败:', error)
    }
  }

  useEffect(() => {
    // 确保在客户端执行
    if (typeof window === 'undefined') return
    
    try {
      const savedFunds = localStorage.getItem('fundList')
      console.log('从 localStorage 读取:', savedFunds)
      
      if (savedFunds) {
        const parsedFunds: FundItem[] = JSON.parse(savedFunds)
        console.log('解析后的基金列表:', parsedFunds)
        setFunds(parsedFunds)
        
        // 页面加载后，重新获取所有基金的最新估值
        setTimeout(() => {
          parsedFunds.forEach(fund => {
            fetchFundValuation(fund.code)
          })
        }, 500)
      }
      
      // 标记数据已加载
      setIsLoaded(true)
    } catch (error) {
      console.error('读取 localStorage 失败:', error)
      setIsLoaded(true)
    }
  }, [])

  // 使用 ref 来标记是否已经加载过数据
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // 确保在客户端执行，且只有在数据加载后才保存
    if (typeof window === 'undefined' || !isLoaded) return
    
    try {
      console.log('保存基金列表到 localStorage:', funds)
      localStorage.setItem('fundList', JSON.stringify(funds))
    } catch (error) {
      console.error('保存到 localStorage 失败:', error)
    }
  }, [funds, isLoaded])

  const searchFund = async () => {
    if (!searchQuery.trim()) return

    setSearchLoading(true)
    try {
      const response = await fetch(`/api/fund/search?key=${searchQuery}`)
      const data: FundSearchResponse = await response.json()
      
      if (data.ErrCode === 0 && data.Datas.length > 0) {
        const matchedFund = data.Datas.find(fund => fund.CODE === searchQuery.toUpperCase())
        if (matchedFund) {
          setSearchResult(matchedFund)
        } else {
          setSearchResult(data.Datas[0])
        }
      } else {
        setSearchResult(null)
      }
    } catch (error) {
      console.error('搜索基金失败:', error)
      setSearchResult(null)
    } finally {
      setSearchLoading(false)
    }
  }

  const addFund = async () => {
    if (searchResult) {
      const newFund: FundItem = {
        code: searchResult.CODE,
        name: searchResult.NAME,
        valuation: null
      }
      
      if (!funds.some(fund => fund.code === newFund.code)) {
        // 先获取估值数据
        try {
          const response = await fetch(`/api/fund/valuation?code=${newFund.code}`)
          const valuation: FundValuation = await response.json()
          
          if (valuation && valuation.fundcode) {
            newFund.valuation = valuation
          }
        } catch (error) {
          console.error('获取基金估值失败:', error)
        }
        
        // 然后添加到列表（包含估值数据）
        setFunds([...funds, newFund])
      }
      
      setSearchQuery('')
      setSearchResult(null)
    }
  }

  const removeFund = (fundCode: string) => {
    setFunds(funds.filter(fund => fund.code !== fundCode))
  }

  const formatPercentage = (value: string) => {
    const num = parseFloat(value)
    if (isNaN(num)) return value
    const sign = num >= 0 ? '+' : ''
    return `${sign}${value}%`
  }

  const getPercentageColor = (value: string) => {
    const num = parseFloat(value)
    if (isNaN(num)) return 'text-white'
    return num >= 0 ? 'text-red-400' : 'text-green-400'
  }

  const refreshAllFunds = () => {
    funds.forEach(fund => fetchFundValuation(fund.code))
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-gray-700/50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-100">
            基金估值追踪
          </h1>
          <button
            onClick={refreshAllFunds}
            disabled={funds.length === 0}
            className="glass-button px-4 py-2 rounded-lg text-gray-100 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            刷新
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto pt-16">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-100 text-center mb-8 drop-shadow-lg">
          基金估值实时追踪
        </h1>

        <div className="glass-card rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchFund()}
              placeholder="请输入基金代码（如：000001）"
              className="glass-input flex-1 px-4 py-3 rounded-xl text-gray-100 placeholder-gray-500 outline-none focus:ring-2 focus:ring-gray-600"
            />
            <button
              onClick={searchFund}
              disabled={searchLoading}
              className="glass-button px-6 py-3 rounded-xl text-gray-100 font-medium disabled:opacity-50"
            >
              {searchLoading ? '搜索中...' : '搜索'}
            </button>
          </div>

          {searchResult && (
            <div className="mt-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-gray-100">
                    <span className="font-medium">基金名称：</span>
                    {searchResult.NAME}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    <span className="font-medium">基金代码：</span>
                    {searchResult.CODE}
                  </p>
                </div>
                <button
                  onClick={addFund}
                  className="glass-button px-6 py-2 rounded-xl text-gray-100 font-medium whitespace-nowrap"
                >
                  添加到列表
                </button>
              </div>
            </div>
          )}
        </div>

        {funds.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <p className="text-gray-400 text-lg">
              暂无基金，请搜索并添加基金代码
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {funds.map((fund) => (
              <div key={fund.code} className="glass-card rounded-2xl p-5 relative">
                <button
                  onClick={() => removeFund(fund.code)}
                  className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
                >
                  ×
                </button>

                <h3 className="text-gray-100 font-semibold text-lg mb-1 pr-8">
                  {fund.name}
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  {fund.code}
                </p>

                {fund.valuation ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">实时估值</span>
                      <span className="text-gray-100 font-bold text-xl">
                        {fund.valuation.gsz}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">单位净值</span>
                      <span className="text-gray-200">
                        {fund.valuation.dwjz}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">涨跌幅</span>
                      <span className={`font-bold ${getPercentageColor(fund.valuation.gszzl)}`}>
                        {formatPercentage(fund.valuation.gszzl)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                      <span className="text-gray-400">更新时间</span>
                      <span className="text-gray-500 text-sm">
                        {fund.valuation.gztime}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-gray-500">加载中...</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">数据来源：天天基金</p>
        </div>
      </div>
    </div>
  )
}
