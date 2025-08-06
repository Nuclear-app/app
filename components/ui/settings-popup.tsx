"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, User, CreditCard, Loader2 } from "lucide-react"
import { getCurrentUserAction, updateUserNameAction } from "@/app/dashboard/actions"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

interface SettingsPopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface User {
  id: string
  name: string | null
  email: string
  subscriptionStatus: 'TRIAL' | 'PAID' | 'EXPIRED'
}

export function SettingsPopup({ open, onOpenChange }: SettingsPopupProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdatingName, setIsUpdatingName] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [newName, setNewName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (open) {
      loadUser()
    }
  }, [open])

  const loadUser = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const userData = await getCurrentUserAction()
      if (userData) {
        setUser(userData)
        setNewName(userData.name || "")
      }
    } catch (error) {
      setError("Failed to load user data")
      console.error("Error loading user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateName = async () => {
    if (!user || !newName.trim()) return

    setIsUpdatingName(true)
    setError(null)
    setSuccess(null)

    try {
      await updateUserNameAction(newName.trim())
      setUser({ ...user, name: newName.trim() })
      setSuccess("Name updated successfully!")
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      setError("Failed to update name. Please try again.")
      console.error("Error updating name:", error)
      
      // Clear error message after 5 seconds
      setTimeout(() => setError(null), 5000)
    } finally {
      setIsUpdatingName(false)
    }
  }

  const handleCancelMembership = async () => {
    if (!user) return

    setIsCancelling(true)
    setError(null)

    try {
      // For now, we'll just sign out the user
      // In a real implementation, you would integrate with Stripe to cancel the subscription
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      setError("Failed to cancel membership")
      console.error("Error cancelling membership:", error)
      setIsCancelling(false)
    }
  }

  const getSubscriptionStatusText = (status: string) => {
    switch (status) {
      case 'TRIAL':
        return 'Trial'
      case 'PAID':
        return 'Active'
      case 'EXPIRED':
        return 'Expired'
      default:
        return 'Unknown'
    }
  }

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'TRIAL':
        return 'text-yellow-500'
      case 'PAID':
        return 'text-green-500'
      case 'EXPIRED':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your account settings and subscription.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {user && (
          <div className="space-y-6">
            {/* Profile Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <h3 className="font-medium">Profile</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user.email}
                    disabled
                  />
                </div>
                
                <div>
                  <Label htmlFor="name">Name</Label>
                  <div className="flex gap-2">
                    <Input
                      id="name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Enter your name"
                    />
                    <Button
                      onClick={handleUpdateName}
                      disabled={isUpdatingName || !newName.trim() || newName.trim() === user.name}
                      size="sm"
                    >
                      {isUpdatingName ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Update"
                      )}
                    </Button>
                  </div>
                  
                  {/* Animated success message */}
                  <AnimatePresence>
                    {success && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="flex items-center gap-2 p-2 mt-2 rounded-md text-green-700"
                      >
                        <span className="text-sm">{success}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Animated error message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="flex items-center gap-2 p-2 mt-2 rounded-md text-red-700"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm">{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <Separator />

            {/* Subscription Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <h3 className="font-medium">Subscription</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-md">
                  <span className="text-sm font-medium">Status</span>
                  <span className={`text-sm font-medium ${getSubscriptionStatusColor(user.subscriptionStatus)}`}>
                    {getSubscriptionStatusText(user.subscriptionStatus)}
                  </span>
                </div>
                
                <Button
                  variant="destructive"
                  onClick={handleCancelMembership}
                  disabled={isCancelling}
                  className="w-full"
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Cancelling...
                    </>
                  ) : (
                    "Cancel Membership"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 