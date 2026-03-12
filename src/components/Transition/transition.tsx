import { useRef } from 'react'
import { CSSTransition } from 'react-transition-group'
import type { TransitionProps } from './transition.types'
export type { AnimationName, TransitionProps } from './transition.types'

const Transition = (props: TransitionProps) => {
  const {
    children,
    classNames: classNamesProp,
    animation,
    wrapper = false,
    unmountOnExit = true,
    appear = true,
    addEndListener,
    ...restProps
  } = props
  const cls = animation ? animation : classNamesProp
  const nodeRef = useRef<HTMLDivElement>(null)

  const transitionProps: any = {
    classNames: cls,
    unmountOnExit,
    appear,
    ...restProps,
  }
  if (addEndListener) transitionProps.addEndListener = addEndListener

  return (
    <CSSTransition nodeRef={nodeRef} {...transitionProps}>
      {/* React 19 下避免 findDOMNode：始终提供一个可 ref 的 wrapper */}
      <div ref={nodeRef} data-transition-wrapper={wrapper ? 'true' : 'false'}>
        {children}
      </div>
    </CSSTransition>
  )
}

export default Transition

