/* 定义 Button 组件可以接收哪些 props（组件 API） */


// 导入了 3 个 React 内置类型
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from 'react'

// TS 导出 两个固定值 'lg' / 'sm'
/*
as const: 把 ButtonSize对象的值 变成不可修改的 字面量类型
  - 如果没有 as const: Large: string
  - 如果有 as const: Large: "lg"
*/
export const ButtonSize = {
  Large: 'lg',
  Small: 'sm',
} as const

// 最终生成的类型: type ButtonSize = "lg" | "sm"
export type ButtonSize =
  (typeof ButtonSize)[keyof typeof ButtonSize]

export const ButtonType = {
  Primary: 'primary',
  Default: 'default',
  Danger: 'danger',
  Link: 'link',
} as const

// 最终生成的类型: type ButtonType = "primary" | "default" | "danger" | "link"
export type ButtonType =
  (typeof ButtonType)[keyof typeof ButtonType]

  // 定义了 Button 支持的 属性Props
  // className: 自定义的 class
export interface BaseButtonProps {
  className?: string
  disabled?: boolean
  size?: ButtonSize
  btnType?: ButtonType
  children?: ReactNode
  href?: string
}

/*
 &：合并两个类型   |: 交叉
 NativeButtonProps = BaseButtonProps + button 所有原生属性（onClick={handleClick}）
*/
export type NativeButtonProps = BaseButtonProps &
  ButtonHTMLAttributes<HTMLButtonElement>

// Button 渲染成 <a>
export type AnchorButtonProps = BaseButtonProps &
  AnchorHTMLAttributes<HTMLAnchorElement>

// ButtonProps（最终类型）：NativeButtonProps & AnchorButtonProps 
// TypeScript 内置工具类型Partial<>：把所有属性变成可选
export type ButtonProps = Partial<NativeButtonProps & AnchorButtonProps>


