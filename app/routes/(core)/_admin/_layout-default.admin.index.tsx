import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(core)/_admin/_layout-default/admin/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div></div>
}
