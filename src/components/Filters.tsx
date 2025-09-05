import React from 'react'

export type Filter = {
  id: string
  name: string
  cssFilter: string
}

export const filters: Filter[] = [
  { id: 'none', name: 'None', cssFilter: 'none' },
  { id: 'vintage', name: 'Vintage', cssFilter: 'sepia(0.4) contrast(1.1) saturate(0.9)' },
  { id: 'cool', name: 'Cool', cssFilter: 'hue-rotate(200deg) saturate(1.1) contrast(1.05)' },
  { id: 'warm', name: 'Warm', cssFilter: 'hue-rotate(330deg) saturate(1.1) brightness(1.05)' },
  { id: 'mono', name: 'Mono', cssFilter: 'grayscale(1) contrast(1.2)' },
  { id: 'film', name: 'Film', cssFilter: 'sepia(0.2) contrast(1.15) brightness(0.98)' },
]

interface FiltersProps {
  selectedFilter: string
  onFilterSelect: (filter: Filter) => void
  isVisible: boolean
}

const FilterBadge: React.FC<{ active: boolean; label: string; style: React.CSSProperties; onClick: () => void }>
= ({ active, label, style, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-2 p-2 rounded-xl border transition-all duration-200 ${
      active ? 'border-purple-400 bg-purple-50' : 'border-purple-200/40 bg-white/70 hover:bg-purple-50/60'
    }`}
  >
    <div className="w-16 h-10 rounded-md bg-gray-300" style={style} />
    <span className="text-xs text-gray-700">{label}</span>
  </button>
)

const Filters: React.FC<FiltersProps> = ({ selectedFilter, onFilterSelect, isVisible }) => {
  if (!isVisible) return null
  return (
    <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-40 bg-white/90 backdrop-blur-lg border border-purple-200/50 rounded-2xl shadow-xl p-4">
      <div className="flex items-center gap-3">
        {filters.map((f) => (
          <FilterBadge
            key={f.id}
            active={selectedFilter === f.id}
            label={f.name}
            style={{ filter: f.cssFilter }}
            onClick={() => onFilterSelect(f)}
          />
        ))}
      </div>
    </div>
  )
}

export interface EnhancementValues {
  brightness: number
  contrast: number
  saturation: number
  sharpness: number
  smoothing: number
  shadows: number
}

interface EnhancementPanelProps {
  isVisible: boolean
  values: EnhancementValues
  onChange: (next: EnhancementValues) => void
  onClose: () => void
  onApply?: () => void
  onReset?: () => void
}

const Slider: React.FC<{ label: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void }>
= ({ label, min, max, step, value, onChange }) => (
  <div className="flex items-center gap-3">
    <span className="w-28 text-sm text-gray-700">{label}</span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-64 accent-purple-500"
    />
    <span className="w-12 text-right text-sm text-gray-600">{value.toFixed(2)}</span>
  </div>
)

export const EnhancementPanel: React.FC<EnhancementPanelProps> = ({ isVisible, values, onChange, onClose, onApply, onReset }) => {
  if (!isVisible) return null
  return (
    <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur-lg border border-purple-200/50 rounded-2xl shadow-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">AI Enhancement</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
      </div>
      <div className="space-y-3">
        <Slider label="Brightness" min={0.5} max={1.5} step={0.01} value={values.brightness} onChange={(v) => onChange({ ...values, brightness: v })} />
        <Slider label="Contrast" min={0.5} max={1.8} step={0.01} value={values.contrast} onChange={(v) => onChange({ ...values, contrast: v })} />
        <Slider label="Saturation" min={0.5} max={1.8} step={0.01} value={values.saturation} onChange={(v) => onChange({ ...values, saturation: v })} />
        <Slider label="Shadows" min={0} max={1} step={0.01} value={values.shadows} onChange={(v) => onChange({ ...values, shadows: v })} />
        <Slider label="Sharpness" min={0} max={1} step={0.01} value={values.sharpness} onChange={(v) => onChange({ ...values, sharpness: v })} />
        <Slider label="Smoothing" min={0} max={1} step={0.01} value={values.smoothing} onChange={(v) => onChange({ ...values, smoothing: v })} />
      </div>
      <div className="flex items-center justify-end gap-3 pt-2">
        {onReset && (
          <button onClick={onReset} className="px-3 py-2 text-sm border rounded-lg text-gray-700 hover:bg-gray-50">Reset</button>
        )}
        {onApply && (
          <button onClick={onApply} className="px-3 py-2 text-sm rounded-lg text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow">
            Apply Enhancement
          </button>
        )}
      </div>
    </div>
  )
}

export default Filters
