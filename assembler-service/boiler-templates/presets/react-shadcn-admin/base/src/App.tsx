import { createRouter, RouterProvider } from '@tanstack/react-router'
import { ThemeProvider } from "@/components/theme-provider"
import { DashboardLayout } from "@/layouts/dashboard-layout"

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  context: {
    // Add any context you want to be available to all routes
  }
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="{{projectName}}-theme">
      <DashboardLayout>
        <RouterProvider router={router} />
      </DashboardLayout>
    </ThemeProvider>
  )
}

export default App