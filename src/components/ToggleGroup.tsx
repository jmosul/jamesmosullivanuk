interface ToggleGroupProps<T extends string> {
  /** The group's accessible name. */
  label: string
  options: readonly T[]
  labels: Record<T, string>
  value: T
  onChange: (value: T) => void
}

/** A row of buttons where exactly one is pressed. */
export function ToggleGroup<T extends string>({ label, options, labels, value, onChange }: ToggleGroupProps<T>) {
  return (
    <div role="group" aria-label={label} className="toggle-group">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className="toggle"
          aria-pressed={value === option}
          onClick={() => onChange(option)}
        >
          {labels[option]}
        </button>
      ))}
    </div>
  )
}
