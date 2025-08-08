import React, { useEffect, useMemo, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface Chart24hProps {
  data: Array<{ t: number; price: number }>
}

function formatTime(ts: number) {
  const d = new Date(ts)
  return `${d.getHours().toString().padStart(2, '0')}:00`
}

function formatHms(ts: number) {
  const d = new Date(ts)
  const hh = d.getHours().toString().padStart(2, '0')
  const mm = d.getMinutes().toString().padStart(2, '0')
  const ss = d.getSeconds().toString().padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

export default function Chart24h({ data }: Chart24hProps) {
  const now = Date.now()
  const hourMs = 60 * 60 * 1000
  const minute = 60 * 1000
  const anchorHour = Math.floor(now / hourMs) * hourMs
  const minTs = anchorHour - hourMs // полный час назад, от начала прошлого часа
  const maxTs = anchorHour + hourMs // запас на 1 час вперёд до следующего часа

  // Точки каждые 10 секунд на интервале [minTs, now],
  // исторические точки приходят по минутам — интерполируем линейно между соседями.
  const chartData = useMemo(() => {
    const sorted = [...data].sort((a, b) => a.t - b.t)
    const out: Array<{ t: number; price: number }> = []
    const step = 10 * 1000
    let j = 0
    for (let t = minTs; t <= now; t += step) {
      while (j < sorted.length && sorted[j].t < t) j++
      const next = sorted[j]
      const prev = sorted[j - 1]
      if (prev && next) {
        const span = next.t - prev.t
        const ratio = span > 0 ? (t - prev.t) / span : 0
        const price = prev.price + (next.price - prev.price) * ratio
        out.push({ t, price })
      } else if (prev) {
        out.push({ t, price: prev.price })
      }
      // если нет prev — данных ещё нет, пропускаем точку
    }
    return out
  }, [data, minTs, now])

  // Фиксируем Y-домен на первом монтировании (без прыжков). Паддинг 1%.
  const [yDomain, setYDomain] = useState<[number, number] | null>(null)
  useEffect(() => {
    if (!yDomain && chartData.length) {
      const prices = chartData.map((p) => p.price)
      const min = Math.min(...prices)
      const max = Math.max(...prices)
      const pad = (max - min) * 0.01 || min * 0.01 || 1
      setYDomain([min - pad, max + pad])
    }
  }, [yDomain, chartData])

  // Тики по оси X: каждый полный час
  const startHour = Math.floor(minTs / hourMs) * hourMs
  const endHour = Math.ceil(maxTs / hourMs) * hourMs
  const hourTicks: number[] = []
  for (let t = startHour; t <= endHour; t += hourMs) hourTicks.push(t)
  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="t"
            type="number"
            scale="time"
            domain={[minTs, maxTs]}
            ticks={hourTicks}
            tickFormatter={(v) => formatTime(Number(v))}
          />
          <YAxis domain={yDomain ?? ["auto", "auto"]} tickFormatter={(v) => Number(v).toFixed(0)} />
          <Tooltip
            formatter={(v: any) => Number(v).toFixed(2)}
            labelFormatter={(label: any) => formatHms(Number(label))}
          />
          <Line type="monotone" dataKey="price" stroke="#2563eb" dot={false} strokeWidth={2} isAnimationActive={false} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}


