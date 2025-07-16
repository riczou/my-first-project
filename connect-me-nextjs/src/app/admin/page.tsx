'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { apiClient } from '@/lib/api-client'
import { 
  Users, 
  Activity, 
  TrendingUp, 
  Network, 
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react'
import AnalyticsCharts from '@/components/admin/analytics-charts'

interface DashboardOverview {
  total_users: number
  active_users: number
  new_users_this_month: number
  total_connections: number
  new_connections_this_month: number
  platform_distribution: Array<{
    platform: string
    users: number
  }>
  user_growth: Array<{
    month: string
    new_users: number
  }>
  activity_rate: number
}

interface UserData {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  subscription_tier: string
  subscription_status: string
  is_active: boolean
  is_verified: boolean
  created_at: string
  connection_count: number
  connected_platforms: number
}

interface UsersListResponse {
  users: UserData[]
  pagination: {
    current_page: number
    total_pages: number
    total_count: number
    has_next: boolean
    has_previous: boolean
  }
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [users, setUsers] = useState<UsersListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [filterTier, setFilterTier] = useState('')
  const [downloadingCSV, setDownloadingCSV] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchTerm, filterTier])

  const fetchDashboardData = async () => {
    try {
      const response = await apiClient.getAdminDashboardOverview()
      if (response.error) {
        setError(response.error)
        return
      }
      setOverview(response.data)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await apiClient.getAdminUsersList(currentPage, 20, searchTerm || undefined)
      if (response.error) {
        setError(response.error)
        return
      }
      setUsers(response.data)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users')
    }
  }

  const handleDownloadCSV = async () => {
    setDownloadingCSV(true)
    try {
      await apiClient.exportUsersCSV(
        searchTerm || undefined,
        filterTier || undefined,
        undefined // is_active filter not implemented in UI yet
      )
    } catch (err: any) {
      setError(err.message || 'Failed to download CSV')
    } finally {
      setDownloadingCSV(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading admin dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-600">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor and manage your networking application
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {overview && (
            <>
              {/* Key Metrics Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overview.total_users}</div>
                    <p className="text-xs text-muted-foreground">
                      +{overview.new_users_this_month} this month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overview.active_users}</div>
                    <p className="text-xs text-muted-foreground">
                      {overview.activity_rate}% activity rate
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Connections</CardTitle>
                    <Network className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overview.total_connections}</div>
                    <p className="text-xs text-muted-foreground">
                      +{overview.new_connections_this_month} this month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {overview.user_growth.length > 1 ? 
                        Math.round(((overview.user_growth[overview.user_growth.length - 1]?.new_users || 0) / 
                        (overview.user_growth[overview.user_growth.length - 2]?.new_users || 1)) * 100) : 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">vs last month</p>
                  </CardContent>
                </Card>
              </div>

              {/* Platform Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Platform Distribution</CardTitle>
                  <CardDescription>Users connected to each platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {overview.platform_distribution.map((platform) => (
                      <div key={platform.platform} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="font-medium">{platform.platform}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-sm text-muted-foreground">{platform.users} users</div>
                          <div className="w-24 bg-secondary h-2 rounded-full">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ 
                                width: `${overview.total_users > 0 ? (platform.users / overview.total_users) * 100 : 0}%` 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Search and manage registered users</CardDescription>
                </div>
                <Button
                  onClick={handleDownloadCSV}
                  disabled={downloadingCSV}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {downloadingCSV ? 'Downloading...' : 'Download CSV'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <select 
                  className="px-3 py-2 border rounded-md"
                  value={filterTier}
                  onChange={(e) => setFilterTier(e.target.value)}
                >
                  <option value="">All Tiers</option>
                  <option value="free">Free</option>
                  <option value="professional">Professional</option>
                  <option value="executive">Executive</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              {users && (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Connections</TableHead>
                        <TableHead>Platforms</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.first_name} {user.last_name}</div>
                              <div className="text-sm text-muted-foreground">@{user.username}</div>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.subscription_tier === 'free' ? 'secondary' : 'default'}>
                              {user.subscription_tier}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Badge variant={user.is_active ? 'default' : 'destructive'}>
                                {user.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                              {user.is_verified && (
                                <Badge variant="secondary">Verified</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{user.connection_count}</TableCell>
                          <TableCell>{user.connected_platforms}</TableCell>
                          <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {((users.pagination.current_page - 1) * 20) + 1} to{' '}
                      {Math.min(users.pagination.current_page * 20, users.pagination.total_count)} of{' '}
                      {users.pagination.total_count} users
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={!users.pagination.has_previous}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => p + 1)}
                        disabled={!users.pagination.has_next}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsCharts />
        </TabsContent>
      </Tabs>
    </div>
  )
}