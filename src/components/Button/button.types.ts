/* 组件 API： 规定 Button 可以怎么被使用 */
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from 'react'

export const ButtonSize = {
  Large: 'lg',
  Small: 'sm',
} as const

export type ButtonSize =
  (typeof ButtonSize)[keyof typeof ButtonSize]

export const ButtonType = {
  Primary: 'primary',
  Default: 'default',
  Danger: 'danger',
  Link: 'link',
} as const

export type ButtonType =
  (typeof ButtonType)[keyof typeof ButtonType]

  // Button 的 props
export interface BaseButtonProps {
  className?: string
  disabled?: boolean
  size?: ButtonSize
  btnType?: ButtonType
  children?: ReactNode
  href?: string
}

export type NativeButtonProps = BaseButtonProps &
  ButtonHTMLAttributes<HTMLButtonElement>

export type AnchorButtonProps = BaseButtonProps &
  AnchorHTMLAttributes<HTMLAnchorElement>

export type ButtonProps = Partial<NativeButtonProps & AnchorButtonProps>


