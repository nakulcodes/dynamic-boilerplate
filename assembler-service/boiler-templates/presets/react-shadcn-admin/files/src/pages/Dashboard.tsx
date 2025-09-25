import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Users,
  Activity,
  CreditCard,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart,
  Settings,
} from 'lucide-react'

const stats = [
  {
    title: 'Total Users',
    value: '2,345',
    change: '+12%',
    changeType: 'positive' as const,
    icon: Users,
  },
  {
    title: 'Active Sessions',
    value: '1,234',
    change: '+8%',
    changeType: 'positive' as const,
    icon: Activity,
  },
  {
    title: 'Revenue',
    value: '$12,345',
    change: '+23%',
    changeType: 'positive' as const,
    icon: CreditCard,
  },
  {
    title: 'Growth Rate',
    value: '18.2%',
    change: '-2%',
    changeType: 'negative' as const,
    icon: TrendingUp,
  },
]

const quickActions = [
  {
    title: 'View Analytics',
    description: 'Check detailed analytics and reports',
    icon: BarChart3,
    action: 'View Reports',
  },
  {
    title: 'User Management',
    description: 'Manage users and permissions',
    icon: Users,
    action: 'Manage Users',
  },
  {
    title: 'System Settings',
    description: 'Configure system preferences',
    icon: Settings,
    action: 'Open Settings',
  },
]

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Here's an overview of your {{projectName}} system.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className={`text-xs ${
                stat.changeType === 'positive'
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Chart Placeholder */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Analytics Overview</CardTitle>
            <CardDescription>
              Monthly performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
              <div className="text-center">
                <LineChart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">Chart component would go here</p>
                <p className="text-sm text-gray-400">
                  Integrate with your preferred charting library
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickActions.map((action) => (
              <div
                key={action.title}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <action.icon className="h-8 w-8 text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  {action.action}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest system events and user actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  action: 'New user registration',
                  user: 'john.doe@example.com',
                  time: '2 minutes ago',
                },
                {
                  action: 'System backup completed',
                  user: 'System',
                  time: '1 hour ago',
                },
                {
                  action: 'Settings updated',
                  user: 'admin@example.com',
                  time: '3 hours ago',
                },
                {
                  action: 'Database maintenance',
                  user: 'System',
                  time: '1 day ago',
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">by {activity.user}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}