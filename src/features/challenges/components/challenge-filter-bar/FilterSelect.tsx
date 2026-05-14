'use client'

import { THEME_PRIMARY_BG_CLASS } from '@/shared/styles'

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
        className={`w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 ${isActive ? `${THEME_PRIMARY_BG_CLASS} text-white` : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100'} ${isDirty ? 'ring-2' : ''}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  )
}
