import { useState, useEffect } from 'react'
import { 
  Plus, 
  Building2, 
  Users, 
  Settings, 
  Trash2, 
  Edit,
  UserPlus,
  Search,
  Filter,
  MoreHorizontal,
  Shield,
  Crown,
  User as UserIcon
} from 'lucide-react'
import Layout from '../components/Layout'
import { User, Business } from '../types'
import { blink } from '../lib/blink'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'

interface AdminPanelProps {
  user: User
}

const roleConfig = {
  admin: { label: 'Admin', icon: Crown, color: 'bg-purple-100 text-purple-800' },
  manager: { label: 'Manager', icon: Shield, color: 'bg-blue-100 text-blue-800' },
  staff: { label: 'Staff', icon: UserIcon, color: 'bg-gray-100 text-gray-800' }
}

export default function AdminPanel({ user }: AdminPanelProps) {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateBusinessDialogOpen, setIsCreateBusinessDialogOpen] = useState(false)
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false)
  const [newBusiness, setNewBusiness] = useState({ name: '', description: '' })
  const [newUser, setNewUser] = useState({ 
    name: '', 
    email: '', 
    role: 'staff' as User['role'], 
    businessId: '' 
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load businesses
        const businessData = await blink.db.businesses.list({
          orderBy: { createdAt: 'desc' }
        })
        setBusinesses(businessData)

        // Load user profiles
        const userProfiles = await blink.db.userProfiles.list({
          orderBy: { createdAt: 'desc' }
        })
        
        // Convert to User format
        const userData = userProfiles.map(profile => ({
          id: profile.userId,
          email: profile.userId, // In real app, you'd get this from auth
          name: profile.name,
          role: profile.role as User['role'],
          businessId: profile.businessId,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt
        }))
        setUsers(userData)
      } catch (error) {
        console.error('Error loading admin data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleCreateBusiness = async () => {
    if (!newBusiness.name) return

    try {
      const id = `business_${Date.now()}`
      await blink.db.businesses.create({
        id,
        name: newBusiness.name,
        description: newBusiness.description || null,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const business: Business = {
        id,
        name: newBusiness.name,
        description: newBusiness.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      setBusinesses(prev => [business, ...prev])
      setNewBusiness({ name: '', description: '' })
      setIsCreateBusinessDialogOpen(false)
    } catch (error) {
      console.error('Error creating business:', error)
    }
  }

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.businessId) return

    try {
      const id = `profile_${Date.now()}`
      await blink.db.userProfiles.create({
        id,
        userId: newUser.email, // Using email as userId for demo
        businessId: newUser.businessId,
        role: newUser.role,
        name: newUser.name,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const userData: User = {
        id: newUser.email,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        businessId: newUser.businessId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      setUsers(prev => [userData, ...prev])
      setNewUser({ name: '', email: '', role: 'staff', businessId: '' })
      setIsCreateUserDialogOpen(false)
    } catch (error) {
      console.error('Error creating user:', error)
    }
  }

  const handleDeleteBusiness = async (businessId: string) => {
    try {
      await blink.db.businesses.delete(businessId)
      setBusinesses(prev => prev.filter(b => b.id !== businessId))
    } catch (error) {
      console.error('Error deleting business:', error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      // Delete user profile
      const profiles = await blink.db.userProfiles.list({
        where: { userId },
        limit: 1
      })
      if (profiles.length > 0) {
        await blink.db.userProfiles.delete(profiles[0].id)
      }
      setUsers(prev => prev.filter(u => u.id !== userId))
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const filteredBusinesses = businesses.filter(business =>
    business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getBusinessName = (businessId: string) => {
    const business = businesses.find(b => b.id === businessId)
    return business?.name || 'Unknown Business'
  }

  const getUsersByBusiness = (businessId: string) => {
    return users.filter(u => u.businessId === businessId)
  }

  const getProjectStats = async (businessId: string) => {
    try {
      const projects = await blink.db.projects.list({
        where: { businessId }
      })
      return {
        total: projects.length,
        active: projects.filter(p => p.status === 'in_progress').length,
        completed: projects.filter(p => p.status === 'completed').length
      }
    } catch (error) {
      return { total: 0, active: 0, completed: 0 }
    }
  }

  if (loading) {
    return (
      <Layout user={user}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading admin panel...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600 mt-1">Manage businesses, users, and system settings</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Businesses</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{businesses.length}</div>
              <p className="text-xs text-muted-foreground">
                Organizations in the system
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">
                Active user accounts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Crown className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {users.filter(u => u.role === 'admin').length}
              </div>
              <p className="text-xs text-muted-foreground">
                System administrators
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="businesses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="businesses">Businesses</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Businesses Tab */}
          <TabsContent value="businesses" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search businesses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
              <Dialog open={isCreateBusinessDialogOpen} onOpenChange={setIsCreateBusinessDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Business
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Business</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name *
                      </Label>
                      <Input
                        id="name"
                        value={newBusiness.name}
                        onChange={(e) => setNewBusiness(prev => ({ ...prev, name: e.target.value }))}
                        className="col-span-3"
                        placeholder="Enter business name"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={newBusiness.description}
                        onChange={(e) => setNewBusiness(prev => ({ ...prev, description: e.target.value }))}
                        className="col-span-3"
                        placeholder="Enter business description"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateBusinessDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateBusiness} disabled={!newBusiness.name}>
                      Create Business
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBusinesses.map((business) => (
                <Card key={business.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">{business.name}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDeleteBusiness(business.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      {business.description || 'No description provided'}
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Users:</span>
                        <span className="font-medium">{getUsersByBusiness(business.id).length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Created:</span>
                        <span className="font-medium">
                          {new Date(business.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
              <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="userName" className="text-right">
                        Name *
                      </Label>
                      <Input
                        id="userName"
                        value={newUser.name}
                        onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                        className="col-span-3"
                        placeholder="Enter user name"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="userEmail" className="text-right">
                        Email *
                      </Label>
                      <Input
                        id="userEmail"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                        className="col-span-3"
                        placeholder="Enter user email"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="userRole" className="text-right">
                        Role *
                      </Label>
                      <Select
                        value={newUser.role}
                        onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value as User['role'] }))}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="userBusiness" className="text-right">
                        Business *
                      </Label>
                      <Select
                        value={newUser.businessId}
                        onValueChange={(value) => setNewUser(prev => ({ ...prev, businessId: value }))}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select business" />
                        </SelectTrigger>
                        <SelectContent>
                          {businesses.map((business) => (
                            <SelectItem key={business.id} value={business.id}>
                              {business.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateUserDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateUser} 
                      disabled={!newUser.name || !newUser.email || !newUser.businessId}
                    >
                      Create User
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const RoleIcon = roleConfig[user.role].icon
                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatarUrl} alt={user.name} />
                              <AvatarFallback>
                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={roleConfig[user.role].color}>
                            <RoleIcon className="h-3 w-3 mr-1" />
                            {roleConfig[user.role].label}
                          </Badge>
                        </TableCell>
                        <TableCell>{getBusinessName(user.businessId || '')}</TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  System Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">System settings and configuration options will be available here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}