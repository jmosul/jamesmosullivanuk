/** Small solid icons drawn in the text colour. Decorative: label the button, not the icon. */

const Icon = ({ d, size = 18 }: { d: string; size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" className="icon">
    <path fill="currentColor" fillRule="evenodd" d={d} />
  </svg>
)

const ARROWS = {
  left: 'M4 12 L13 4.5 V9.4 H20 V14.6 H13 V19.5 Z',
  up: 'M12 4 L19.5 13 H14.6 V20 H9.4 V13 H4.5 Z',
  down: 'M12 20 L4.5 11 H9.4 V4 H14.6 V11 H19.5 Z',
}

export const ArrowIcon = ({ direction }: { direction: keyof typeof ARROWS }) => <Icon d={ARROWS[direction]} size={16} />

export const PlusIcon = () => <Icon d="M10.5 4 H13.5 V10.5 H20 V13.5 H13.5 V20 H10.5 V13.5 H4 V10.5 H10.5 Z" size={16} />

export const TrashIcon = () => <Icon d="M9 3 H15 V5 H20 V7.5 H4 V5 H9 Z M6 9 H18 L17 21 H7 Z" size={16} />

export const WarningIcon = () => <Icon d="M12 3 L22 20 H2 Z M11 9 V14 H13 V9 Z M11 16 V18 H13 V16 Z" />

export const CheckIcon = () => <Icon d="M4 12.5 L6.5 10 L10 13.5 L17.5 6 L20 8.5 L10 18.5 Z" size={20} />
