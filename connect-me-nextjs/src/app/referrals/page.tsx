"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Network, 
  ArrowLeft,
  Gift,
  Users,
  Trophy,
  Star,
  Share2,
  Copy,
  Mail,
  Twitter,
  Linkedin,
  Crown,
  Zap,
  Target,
  Award,
  Calendar,
  TrendingUp
} from "lucide-react";
import { apiClient } from "../api-client";
import type { User } from "@/types";

interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  totalEarned: number;
  pendingRewards: number;
  currentStreak: number;
  rank: string;
  nextMilestone: number;
}

interface ReferralReward {
  type: 'free_month' | 'discount' | 'upgrade' | 'cash';
  amount: number;
  description: string;
  requirements: number;
}

interface Referral {
  id: string;
  email: string;
  status: 'pending' | 'signed_up' | 'subscribed';
  dateInvited: string;
  dateJoined?: string;
  rewardEarned: number;
}

export default function ReferralsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState("");
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (!apiClient.isAuthenticated()) {
        router.push("/login");
        return;
      }

      const userResult = await apiClient.getCurrentUser();
      if (userResult.error) {
        router.push("/login");
        return;
      }

      setUser(userResult.data!);
      
      // Generate referral code based on user data
      const code = generateReferralCode(userResult.data!);
      setReferralCode(code);
      
      // Mock referral data - in real app, this would come from backend
      const mockStats = generateMockStats();
      setReferralStats(mockStats);
      
      const mockReferrals = generateMockReferrals();
      setReferrals(mockReferrals);
    } catch (error) {
      console.error("Failed to load referral data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateReferralCode = (user: User): string => {
    // Generate a unique referral code based on user data
    const base = user.username.toUpperCase().slice(0, 3);
    const id = user.id.toString().slice(-3);
    return `${base}${id}`;
  };

  const generateMockStats = (): ReferralStats => {
    return {
      totalReferrals: 12,
      successfulReferrals: 8,
      totalEarned: 240, // $240 in credits
      pendingRewards: 60,
      currentStreak: 3,
      rank: "Ambassador",
      nextMilestone: 15
    };
  };

  const generateMockReferrals = (): Referral[] => {
    return [
      {
        id: "1",
        email: "john.doe@email.com",
        status: "subscribed",
        dateInvited: "2024-01-15",
        dateJoined: "2024-01-16",
        rewardEarned: 30
      },
      {
        id: "2", 
        email: "sarah.wilson@email.com",
        status: "signed_up",
        dateInvited: "2024-01-10",
        dateJoined: "2024-01-12",
        rewardEarned: 15
      },
      {
        id: "3",
        email: "mike.chen@email.com",
        status: "pending",
        dateInvited: "2024-01-05",
        rewardEarned: 0
      }
    ];
  };

  const rewards: ReferralReward[] = [
    {
      type: 'free_month',
      amount: 1,
      description: '1 month free for each successful referral',
      requirements: 1
    },
    {
      type: 'discount',
      amount: 50,
      description: '50% off for 3 months (5 referrals)',
      requirements: 5
    },
    {
      type: 'upgrade',
      amount: 1,
      description: 'Free upgrade to Executive plan (10 referrals)',
      requirements: 10
    },
    {
      type: 'cash',
      amount: 500,
      description: '$500 cash reward (25 referrals)',
      requirements: 25
    }
  ];

  const handleCopyCode = () => {
    const referralUrl = `https://connectme.com/register?ref=${referralCode}`;
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmailInvite = () => {
    if (!emailInput.trim()) return;
    
    // In real app, this would send an API request
    const newReferral: Referral = {
      id: Date.now().toString(),
      email: emailInput,
      status: 'pending',
      dateInvited: new Date().toISOString().split('T')[0],
      rewardEarned: 0
    };
    
    setReferrals([newReferral, ...referrals]);
    setEmailInput("");
  };

  const shareToSocial = (platform: 'twitter' | 'linkedin') => {
    const text = "I'm using ConnectMe to transform my professional network into career opportunities. Join me and get your first month 50% off!";
    const url = `https://connectme.com/register?ref=${referralCode}`;
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    };
    
    window.open(shareUrls[platform], '_blank', 'width=550,height=420');
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Ambassador': return 'text-purple-600';
      case 'Champion': return 'text-blue-600';
      case 'Legend': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getRankIcon = (rank: string) => {
    switch (rank) {
      case 'Ambassador': return Crown;
      case 'Champion': return Trophy;
      case 'Legend': return Star;
      default: return Users;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="glassmorphism p-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <h3 className="text-lg font-semibold">Loading Referrals...</h3>
          </div>
        </Card>
      </div>
    );
  }

  const RankIcon = getRankIcon(referralStats?.rank || '');

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glassmorphism border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Network className="h-8 w-8 text-gradient" />
              <span className="text-xl font-bold text-gradient">ConnectMe</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              {user && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    {user.first_name.charAt(0)}{user.last_name?.charAt(0) || ''}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-20 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-gradient">Referral Program</h1>
            <p className="text-muted-foreground">
              Share ConnectMe with friends and earn amazing rewards
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="glassmorphism">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <RankIcon className={`h-8 w-8 ${getRankColor(referralStats?.rank || '')}`} />
                </div>
                <div className="text-2xl font-bold text-gradient">{referralStats?.rank}</div>
                <div className="text-sm text-muted-foreground">Current Rank</div>
              </CardContent>
            </Card>

            <Card className="glassmorphism">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gradient">{referralStats?.successfulReferrals}</div>
                <div className="text-sm text-muted-foreground">Successful Referrals</div>
              </CardContent>
            </Card>

            <Card className="glassmorphism">
              <CardContent className="p-6 text-center">
                <Gift className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gradient">${referralStats?.totalEarned}</div>
                <div className="text-sm text-muted-foreground">Total Earned</div>
              </CardContent>
            </Card>

            <Card className="glassmorphism">
              <CardContent className="p-6 text-center">
                <Zap className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gradient">{referralStats?.currentStreak}</div>
                <div className="text-sm text-muted-foreground">Current Streak</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="invite" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 glassmorphism">
              <TabsTrigger value="invite">Invite Friends</TabsTrigger>
              <TabsTrigger value="rewards">Rewards</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            </TabsList>

            {/* Invite Tab */}
            <TabsContent value="invite" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glassmorphism">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Share2 className="h-5 w-5 mr-2" />
                      Your Referral Link
                    </CardTitle>
                    <CardDescription>
                      Share this link and earn rewards when friends subscribe
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex space-x-2">
                      <Input 
                        value={`https://connectme.com/register?ref=${referralCode}`}
                        readOnly
                        className="glassmorphism"
                      />
                      <Button onClick={handleCopyCode} variant="outline">
                        {copied ? <span className="text-green-600">✓</span> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => shareToSocial('twitter')}
                        variant="outline" 
                        className="flex-1"
                      >
                        <Twitter className="h-4 w-4 mr-2" />
                        Twitter
                      </Button>
                      <Button 
                        onClick={() => shareToSocial('linkedin')}
                        variant="outline" 
                        className="flex-1"
                      >
                        <Linkedin className="h-4 w-4 mr-2" />
                        LinkedIn
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glassmorphism">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Mail className="h-5 w-5 mr-2" />
                      Invite by Email
                    </CardTitle>
                    <CardDescription>
                      Send a personal invitation to your contacts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex space-x-2">
                      <Input 
                        placeholder="friend@email.com"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="glassmorphism"
                      />
                      <Button onClick={handleEmailInvite}>
                        Send
                      </Button>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      💡 Personal invites convert 3x better than link shares
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Progress to Next Milestone */}
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Target className="h-5 w-5 mr-2" />
                      Progress to Next Milestone
                    </span>
                    <Badge variant="secondary">
                      {referralStats?.successfulReferrals}/{referralStats?.nextMilestone}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress 
                    value={(referralStats?.successfulReferrals || 0) / (referralStats?.nextMilestone || 15) * 100} 
                    className="h-3 mb-3"
                  />
                  <p className="text-sm text-muted-foreground">
                    {(referralStats?.nextMilestone || 15) - (referralStats?.successfulReferrals || 0)} more referrals to unlock your next reward tier
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Rewards Tab */}
            <TabsContent value="rewards" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rewards.map((reward, index) => {
                  const isUnlocked = (referralStats?.successfulReferrals || 0) >= reward.requirements;
                  
                  return (
                    <Card key={index} className={`glassmorphism ${isUnlocked ? 'ring-2 ring-green-500 ring-opacity-50' : ''}`}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center">
                            {reward.type === 'free_month' && <Calendar className="h-5 w-5 mr-2 text-blue-600" />}
                            {reward.type === 'discount' && <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />}
                            {reward.type === 'upgrade' && <Crown className="h-5 w-5 mr-2 text-yellow-600" />}
                            {reward.type === 'cash' && <Award className="h-5 w-5 mr-2 text-green-600" />}
                            {reward.requirements} Referral{reward.requirements > 1 ? 's' : ''}
                          </CardTitle>
                          {isUnlocked && (
                            <Badge variant="default" className="bg-green-600">
                              Unlocked
                            </Badge>
                          )}
                        </div>
                        <CardDescription>{reward.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            Progress: {Math.min(referralStats?.successfulReferrals || 0, reward.requirements)}/{reward.requirements}
                          </div>
                          <Progress 
                            value={Math.min((referralStats?.successfulReferrals || 0) / reward.requirements * 100, 100)}
                            className="h-2 w-24"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6">
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle>Your Referrals</CardTitle>
                  <CardDescription>
                    Track the status of your referrals and earned rewards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {referrals.map((referral) => (
                      <div key={referral.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {referral.email.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{referral.email}</p>
                            <p className="text-sm text-muted-foreground">
                              Invited {new Date(referral.dateInvited).toLocaleDateString()}
                              {referral.dateJoined && ` • Joined ${new Date(referral.dateJoined).toLocaleDateString()}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge variant={
                            referral.status === 'subscribed' ? 'default' :
                            referral.status === 'signed_up' ? 'secondary' : 'outline'
                          }>
                            {referral.status === 'subscribed' ? 'Subscribed' :
                             referral.status === 'signed_up' ? 'Signed Up' : 'Pending'}
                          </Badge>
                          {referral.rewardEarned > 0 && (
                            <span className="text-sm font-medium text-green-600">
                              +${referral.rewardEarned}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {referrals.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No referrals yet. Start inviting friends to earn rewards!
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Leaderboard Tab */}
            <TabsContent value="leaderboard" className="space-y-6">
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="h-5 w-5 mr-2" />
                    Top Referrers This Month
                  </CardTitle>
                  <CardDescription>
                    See how you stack up against other ConnectMe advocates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { rank: 1, name: "Sarah Chen", referrals: 47, reward: "$1,410" },
                      { rank: 2, name: "Michael Rodriguez", referrals: 38, reward: "$1,140" },
                      { rank: 3, name: "Alex Thompson", referrals: 29, reward: "$870" },
                      { rank: 4, name: `${user?.first_name} ${user?.last_name}`, referrals: referralStats?.successfulReferrals || 8, reward: `$${referralStats?.totalEarned || 240}`, isUser: true },
                      { rank: 5, name: "Jessica Wang", referrals: 22, reward: "$660" },
                    ].map((person) => (
                      <div key={person.rank} className={`flex items-center justify-between p-4 rounded-lg ${person.isUser ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-muted/30'}`}>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-sm">
                            {person.rank}
                          </div>
                          <div>
                            <p className={`font-medium ${person.isUser ? 'text-blue-600' : ''}`}>
                              {person.name} {person.isUser && '(You)'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {person.referrals} successful referrals
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">{person.reward}</p>
                          <p className="text-sm text-muted-foreground">earned</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}