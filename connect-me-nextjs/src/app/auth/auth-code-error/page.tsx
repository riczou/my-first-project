import Link from "next/link"
import { AlertTriangle, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Back to Home */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Error Card */}
        <Card className="glassmorphism border-red-500/20">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <AlertTriangle className="h-16 w-16 text-red-500" />
            </div>
            <CardTitle className="text-2xl text-red-600 dark:text-red-400">
              Authentication Error
            </CardTitle>
            <CardDescription>
              There was a problem confirming your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                The authentication link you clicked is invalid or has expired.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                This can happen when:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>The confirmation link has expired</li>
                <li>The link has already been used</li>
                <li>The link was corrupted during email transmission</li>
              </ul>
            </div>

            <div className="flex flex-col space-y-3">
              <Link href="/register">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Try Registration Again
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Sign In Instead
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Help Card */}
        <Card className="glassmorphism border-blue-500/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                Need Help?
              </h3>
              <p className="text-sm text-muted-foreground">
                If you continue having trouble, please check your spam folder for the confirmation email or try registering again.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}