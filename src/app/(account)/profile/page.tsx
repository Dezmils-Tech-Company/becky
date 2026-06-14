'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { updatePassword } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPasswordChange, setShowPasswordChange] = useState(false)

  const [profileData, setProfileData] = useState({
    displayName: '',
    phone: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      country: '',
      postalCode: '',
    }
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Redirect unauthenticated users (after render, not during)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  // Fetch user data from API to get phone and address (which are not in Firebase user object)
  useEffect(() => {
    if (isAuthenticated) {
      const fetchUserData = async () => {
        try {
          const res = await fetch(`/api/users/me`, {
            credentials: 'include',
          })
          if (!res.ok) {
            throw new Error('Failed to fetch user data')
          }
          const data = await res.json()
          if (!data.success) throw new Error(data.error?.message || 'Failed to fetch user data')

          setProfileData({
            displayName: data.data.displayName || '',
            phone: data.data.phone || '',
            address: {
              line1: data.data.address?.line1 || '',
              line2: data.data.address?.line2 || '',
              city: data.data.address?.city || '',
              country: data.data.address?.country || '',
              postalCode: data.data.address?.postalCode || '',
            }
          })
        } catch (err) {
          console.error('Error fetching user profile:', err)
          setError('Failed to load profile data')
        }
      }
      fetchUserData()
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (user) {
      // Update displayName from Firebase user object (in case it changed via Google sign-in etc.)
      setProfileData(prev => ({ ...prev, displayName: user.displayName || '' }))
    }
  }, [user])

  // Auto-clear success/error messages after a few seconds
  useEffect(() => {
    if (!success && !error) return
    const timer = setTimeout(() => {
      setSuccess(null)
      setError(null)
    }, 5000)
    return () => clearTimeout(timer)
  }, [success, error])

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddressChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, address: { ...prev.address, [field]: value } }))
  }

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
  }

  // Simple client-side validation before submitting profile
  const validateProfile = (): string | null => {
    if (!profileData.displayName.trim()) return 'Display name is required'
    if (!profileData.address.line1.trim()) return 'Address line 1 is required'
    if (!profileData.address.city.trim()) return 'City is required'
    if (!profileData.address.country.trim()) return 'Country is required'
    if (!profileData.address.postalCode.trim()) return 'Postal code is required'

    if (profileData.phone && !/^\+?[0-9\s\-()]{7,15}$/.test(profileData.phone)) {
      return 'Enter a valid phone number'
    }

    return null
  }

  // Simple password strength check
  const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    if (score <= 1) return 'weak'
    if (score <= 3) return 'medium'
    return 'strong'
  }

  const validatePassword = (): string | null => {
    if (!passwordData.currentPassword) return 'Current password is required'
    if (passwordData.newPassword.length < 8) return 'New password must be at least 8 characters'
    if (passwordData.newPassword !== passwordData.confirmPassword) return 'Passwords do not match'
    if (passwordData.newPassword === passwordData.currentPassword) {
      return 'New password must be different from current password'
    }
    return null
  }

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const validationError = validateProfile()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsUpdating(true)

    try {
      const res = await fetch(`/api/users/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: profileData.displayName,
          phone: profileData.phone,
          address: profileData.address,
        }),
        credentials: 'include',
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error?.message || 'Failed to update profile')
      }

      const data = await res.json()
      if (!data.success) throw new Error(data.error?.message || 'Failed to update profile')

      setSuccess('Profile updated successfully')
      // Update the local state with the returned data (optional, but keeps UI in sync)
      setProfileData({
        displayName: data.data.displayName,
        phone: data.data.phone,
        address: data.data.address,
      })
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const validationError = validatePassword()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsUpdating(true)

    try {
      if (!auth.currentUser) {
        throw new Error('No current user. Please log in again.')
      }

      await updatePassword(auth.currentUser, passwordData.newPassword)
      setSuccess('Password updated successfully')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowPasswordChange(false)
    } catch (err: any) {
      if (err?.code === 'auth/requires-recent-login') {
        setError('For security, please log out and log back in before changing your password.')
      } else if (err?.code === 'auth/weak-password') {
        setError('Password is too weak. Choose a stronger one.')
      } else {
        setError(err.message || 'Failed to update password.')
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const passwordStrength = getPasswordStrength(passwordData.newPassword)

  const strengthColor = {
    weak: 'bg-rose-400',
    medium: 'bg-amber-400',
    strong: 'bg-emerald-400',
  }[passwordStrength]

  const strengthLabel = {
    weak: 'Weak',
    medium: 'Medium',
    strong: 'Strong',
  }[passwordStrength]

  // Loading state while auth resolves
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-pink-50">
        <div className="flex flex-col items-center gap-3 text-pink-600">
          <svg className="h-8 w-8 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          <p className="text-sm font-medium">Loading your profile…</p>
        </div>
      </div>
    )
  }

  // Redirect handled via useEffect; render nothing while redirecting
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-pink-900">Profile</h1>

        {error && (
          <div className="mb-4 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-start justify-between gap-4">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-rose-500 hover:text-rose-700 font-bold"
              aria-label="Dismiss error"
            >
              &times;
            </button>
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-pink-100 border border-pink-300 text-pink-800 rounded-lg flex items-start justify-between gap-4">
            <span>{success}</span>
            <button
              type="button"
              onClick={() => setSuccess(null)}
              className="text-pink-500 hover:text-pink-700 font-bold"
              aria-label="Dismiss message"
            >
              &times;
            </button>
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
            <h2 className="text-xl font-semibold mb-4 text-pink-900">Profile Information</h2>
            <form onSubmit={handleSubmitProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Display Name</label>
                <Input
                  id="displayName"
                  value={profileData.displayName}
                  onChange={(e) => handleProfileChange('displayName', e.target.value)}
                  className="focus:ring-pink-400 focus:border-pink-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Phone Number</label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                  placeholder="+254 7XX XXX XXX"
                  className="focus:ring-pink-400 focus:border-pink-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Address Line 1</label>
                <Input
                  id="addressLine1"
                  value={profileData.address.line1}
                  onChange={(e) => handleAddressChange('line1', e.target.value)}
                  className="focus:ring-pink-400 focus:border-pink-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Address Line 2 (optional)</label>
                <Input
                  id="addressLine2"
                  value={profileData.address.line2}
                  onChange={(e) => handleAddressChange('line2', e.target.value)}
                  className="focus:ring-pink-400 focus:border-pink-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">City</label>
                  <Input
                    id="addressCity"
                    value={profileData.address.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    className="focus:ring-pink-400 focus:border-pink-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Country</label>
                  <Input
                    id="addressCountry"
                    value={profileData.address.country}
                    onChange={(e) => handleAddressChange('country', e.target.value)}
                    className="focus:ring-pink-400 focus:border-pink-400"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Postal Code</label>
                <Input
                  id="addressPostalCode"
                  value={profileData.address.postalCode}
                  onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                  className="focus:ring-pink-400 focus:border-pink-400"
                  required
                />
              </div>
              <div className="flex items-center justify-between pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isUpdating}
                  className="w-full md:w-auto bg-pink-500 hover:bg-pink-600 text-white"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-pink-900">Change Password</h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowPasswordChange(!showPasswordChange)
                  setError(null)
                  setSuccess(null)
                }}
                className="border-pink-300 text-pink-700 hover:bg-pink-50"
              >
                {showPasswordChange ? 'Hide' : 'Change Password'}
              </Button>
            </div>

            {showPasswordChange && (
              <form onSubmit={handleSubmitPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Current Password</label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    className="focus:ring-pink-400 focus:border-pink-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">New Password</label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    className="focus:ring-pink-400 focus:border-pink-400"
                    required
                    minLength={8}
                  />
                  {passwordData.newPassword && (
                    <div className="mt-2">
                      <div className="h-1.5 w-full rounded-full bg-neutral-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${strengthColor}`}
                          style={{
                            width:
                              passwordStrength === 'weak'
                                ? '33%'
                                : passwordStrength === 'medium'
                                ? '66%'
                                : '100%',
                          }}
                        />
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">
                        Password strength: <span className="font-medium">{strengthLabel}</span>
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Confirm New Password</label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    className="focus:ring-pink-400 focus:border-pink-400"
                    required
                  />
                  {passwordData.confirmPassword &&
                    passwordData.newPassword !== passwordData.confirmPassword && (
                      <p className="text-xs text-rose-500 mt-1">Passwords do not match</p>
                    )}
                </div>
                <div className="flex items-center justify-between pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isUpdating}
                    className="w-full md:w-auto bg-pink-500 hover:bg-pink-600 text-white"
                  >
                    {isUpdating ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}