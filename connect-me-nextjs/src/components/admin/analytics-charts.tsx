'use client'

import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiClient } from '../api-client'

interface UserAnalytics {
  period: {
    start_date: string
    end_date: string
    days: number
  }
  daily_signups: Array<{
    date: string
    signups: number
  }>
  subscription_distribution: Array<{
    tier: string
    count: number
  }>
  user_status: Array<{
    active: boolean
    verified: boolean
    count: number
  }>
  average_connections_per_user: number
}

interface ConnectionAnalytics {
  period: {
    start_date: string
    end_date: string
    days: number
  }
  daily_connections: Array<{
    date: string
    connections: number
  }>
  platform_distribution: Array<{
    platform: string
    connections: number
  }>
  top_users_by_connections: Array<{
    username: string
    name: string
    connection_count: number
  }>
  relationship_strength_distribution: Array<{
    strength: number
    count: number
  }>
}

interface PlatformStats {
  platform_overview: Array<{
    platform_id: number
    platform_name: string
    connected_users: number
    total_connections: number
    recent_connections: number
  }>
  total_platforms: number
  most_popular_platform: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function AnalyticsCharts() {
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null)
  const [connectionAnalytics, setConnectionAnalytics] = useState<ConnectionAnalytics | null>(null)
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30')

  useEffect(() => {
    fetchAnalytics()
  }, [selectedPeriod])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)

      // Fetch all analytics data
      const [userResponse, connectionResponse, platformResponse] = await Promise.all([
        apiClient.get(`/admin/users/analytics?days=${selectedPeriod}`),
        apiClient.get(`/admin/connections/analytics?days=${selectedPeriod}`),
        apiClient.get('/admin/platforms/stats')
      ])

      if (userResponse.data) setUserAnalytics(userResponse.data)
      if (connectionResponse.data) setConnectionAnalytics(connectionResponse.data)
      if (platformResponse.data) setPlatformStats(platformResponse.data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">Loading analytics...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="connections">Connection Analytics</TabsTrigger>
          <TabsTrigger value="platforms">Platform Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          {userAnalytics && (
            <>
              {/* User Signups Over Time */}
              <Card>
                <CardHeader>
                  <CardTitle>Daily User Signups</CardTitle>
                  <CardDescription>New user registrations over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={userAnalytics.daily_signups}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(label) => formatDate(label)}
                        formatter={(value: number) => [value, 'New Users']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="signups" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Subscription Tier Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Subscription Tiers</CardTitle>
                    <CardDescription>Distribution of user subscription levels</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={userAnalytics.subscription_distribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ tier, percent }) => `${tier} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="tier"
                        >
                          {userAnalytics.subscription_distribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* User Status Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>User Status</CardTitle>
                    <CardDescription>Active vs inactive and verified users</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={userAnalytics.user_status.map(status => ({
                        status: `${status.active ? 'Active' : 'Inactive'} ${status.verified ? '& Verified' : '& Unverified'}`,
                        count: status.count
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="status" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Key Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>User Engagement Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {userAnalytics.average_connections_per_user}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Average Connections per User
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {userAnalytics.daily_signups.reduce((sum, day) => sum + day.signups, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Signups (Period)
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round(userAnalytics.daily_signups.reduce((sum, day) => sum + day.signups, 0) / userAnalytics.period.days * 100) / 100}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Average Daily Signups
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="connections" className="space-y-6">
          {connectionAnalytics && (
            <>
              {/* Daily Connections */}
              <Card>
                <CardHeader>
                  <CardTitle>Daily Connection Creation</CardTitle>
                  <CardDescription>New connections added over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={connectionAnalytics.daily_connections}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(label) => formatDate(label)}
                        formatter={(value: number) => [value, 'New Connections']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="connections" 
                        stroke="#00C49F" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Platform Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Connections by Platform</CardTitle>
                    <CardDescription>Where connections are being imported from</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={connectionAnalytics.platform_distribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ platform, percent }) => `${platform} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="connections"
                          nameKey="platform"
                        >
                          {connectionAnalytics.platform_distribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Relationship Strength */}
                <Card>
                  <CardHeader>
                    <CardTitle>Relationship Strength</CardTitle>
                    <CardDescription>Distribution of connection strength ratings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={connectionAnalytics.relationship_strength_distribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="strength" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#FF8042" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Top Users */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Connected Users</CardTitle>
                  <CardDescription>Users with the most connections</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {connectionAnalytics.top_users_by_connections.slice(0, 5).map((user, index) => (
                      <div key={user.username} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">@{user.username}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{user.connection_count}</div>
                          <div className="text-sm text-muted-foreground">connections</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="platforms" className="space-y-6">
          {platformStats && (
            <>
              {/* Platform Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Platform Performance</CardTitle>
                  <CardDescription>Engagement across different platforms</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={platformStats.platform_overview}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="platform_name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="connected_users" fill="#8884d8" name="Connected Users" />
                      <Bar dataKey="total_connections" fill="#82ca9d" name="Total Connections" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Platform Summary */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Total Platforms</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{platformStats.total_platforms}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Most Popular</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{platformStats.most_popular_platform}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Total Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {platformStats.platform_overview.reduce((sum, platform) => sum + platform.connected_users, 0)}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}