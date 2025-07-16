import Link from "next/link"
import { Mail, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function CheckEmail() {
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

        {/* Email Confirmation Card */}
        <Card className="glassmorphism border-blue-500/20">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Mail className="h-16 w-16 text-blue-500" />
            </div>
            <CardTitle className="text-2xl text-blue-600 dark:text-blue-400">
              Check Your Email
            </CardTitle>
            <CardDescription>
              We've sent you a confirmation link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                We've sent a confirmation email to your inbox. Please click the link in the email to verify your account and complete your registration.
              </p>
              
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">What to do next:</p>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside text-left">
                  <li>Check your email inbox</li>
                  <li>Look for an email from ConnectMe</li>
                  <li>Click the confirmation link</li>
                  <li>Sign in to your account</li>
                </ol>
              </div>

              <p className="text-xs text-muted-foreground">
                Didn't receive the email? Check your spam folder or try registering again.
              </p>
            </div>

            <div className="flex flex-col space-y-3">
              <Link href="/login">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Go to Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" className="w-full">
                  Try Registration Again
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Help Card */}
        <Card className="glassmorphism border-green-500/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                Security Notice
              </h3>
              <p className="text-sm text-muted-foreground">
                Email confirmation helps protect your account and ensures we can reach you with important updates.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}