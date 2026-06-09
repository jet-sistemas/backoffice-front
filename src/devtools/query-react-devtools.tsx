import type { ComponentProps } from 'react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export default function QueryReactDevtoolsPanel(
  props: ComponentProps<typeof ReactQueryDevtools>,
) {
  return <ReactQueryDevtools {...props} />
}
