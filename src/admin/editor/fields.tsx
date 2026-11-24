import { useId, type InputHTMLAttributes, type ReactNode } from 'react'

interface FieldProps {
  label: string
  /** Shown under the input and linked to it as its description. */
  help?: ReactNode
  /** Shown at the end of the help line, e.g. a character count. */
  aside?: ReactNode
  className?: string
}

type TextFieldProps = FieldProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'className'> & {
    value: string | null | undefined
    onChange: (value: string) => void
    /** Renders a textarea with this many rows instead of an input. */
    rows?: number
  }

/** A labelled text input or textarea with optional help, styled by `.field`. */
export function TextField({ label, help, aside, className, value, onChange, rows, ...input }: TextFieldProps) {
  const id = useId()
  const helpId = `${id}-help`
  const shared = {
    id,
    value: value ?? '',
    'aria-describedby': help ? helpId : undefined,
  }

  return (
    <div className={className ? `field ${className}` : 'field'}>
      <label htmlFor={id}>{label}</label>
      {rows ? (
        <textarea {...shared} rows={rows} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input type="text" {...shared} {...input} onChange={(event) => onChange(event.target.value)} />
      )}
      {(help || aside) && (
        <div className="field-help">
          {help && <p id={helpId}>{help}</p>}
          {aside && <p className="field-aside">{aside}</p>}
        </div>
      )}
    </div>
  )
}

/** Empty input means the field is unset. */
export const orNull = (value: string): string | null => (value === '' ? null : value)
