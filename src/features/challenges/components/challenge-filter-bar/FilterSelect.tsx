'use client'

import {
  SURFACE_FILTER_ITEM_CLASS,
  SURFACE_FILTER_ITEM_ACTIVE_CLASS,
} from '@/shared/styles'

type FilterSelectProps = {
  id: string
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  isDirty: boolean
  isActive: boolean
  onChange: (value: string) => void
}

export default function FilterSelect({
  id,
  label,
  value,
  options,
  isDirty,
  isActive,
  onChange,
}: FilterSelectProps) {
  return (
    <div className="flex-1 min-w-[140px]">
      <label htmlFor={id} className="sr-only">{label}</label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full px-3 py-2 text-sm rounded-xl focus:outline-none focus:ring-2 ${isActive
          ? `${SURFACE_FILTER_ITEM_ACTIVE_CLASS} focus:ring-blue-500/30 ring-2 ring-blue-500/30`
          : `${SURFACE_FILTER_ITEM_CLASS} focus:ring-blue-500/30`
          }`}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
