"use client";

import * as React from "react";
import { Terminal, Moon, Sun, Briefcase, Users, FileText, TrendingUp, AlertCircle, CheckCircle2, Clock, X } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ComponentsPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [progress, setProgress] = React.useState(13);
  const [isDark, setIsDark] = React.useState(false);
  const [showToast, setShowToast] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  React.useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const candidates = [
    { id: 1, name: "Sarah Johnson", role: "Senior Developer", status: "Interview", avatar: "SJ" },
    { id: 2, name: "Michael Chen", role: "Product Manager", status: "Offer Sent", avatar: "MC" },
    { id: 3, name: "Emily Davis", role: "UX Designer", status: "Screening", avatar: "ED" },
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Header with Dark Mode Toggle */}
        <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">RecruitPro Design System</h1>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsDark(!isDark)}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </header>

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed top-20 right-4 z-50 w-96 animate-in slide-in-from-right">
            <Card className="border-accent bg-card shadow-lg">
              <CardContent className="flex items-start gap-3 p-4">
                <CheckCircle2 className="h-5 w-5 text-accent mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-sm">Application Submitted</p>
                  <p className="text-sm text-muted-foreground">Your job application has been sent successfully.</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setShowToast(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="container mx-auto p-4 md:p-8">
          {/* Hero Section */}
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-bold tracking-tight mb-4">Component Showcase</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A comprehensive collection of UI components designed for modern recruitment platforms.
              Built with accessibility and user experience in mind.
            </p>
          </div>

          {/* Color System */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Color System</CardTitle>
              <CardDescription>
                Professional Trust palette - designed for credibility and modern appeal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-primary" />
                  <div>
                    <p className="font-semibold text-sm">Primary</p>
                    <p className="text-xs text-muted-foreground">Deep Navy Blue</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-secondary" />
                  <div>
                    <p className="font-semibold text-sm">Secondary</p>
                    <p className="text-xs text-muted-foreground">Vibrant Blue</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-accent" />
                  <div>
                    <p className="font-semibold text-sm">Accent</p>
                    <p className="text-xs text-muted-foreground">Success Green</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-destructive" />
                  <div>
                    <p className="font-semibold text-sm">Destructive</p>
                    <p className="text-xs text-muted-foreground">Error Red</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Real-World Example: Job Board */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Active Job Listings
              </CardTitle>
              <CardDescription>Real-world component composition example</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Card className="border-l-4 border-l-accent">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">Senior Full Stack Developer</CardTitle>
                      <CardDescription>Tech Corp • San Francisco, CA • Remote</CardDescription>
                    </div>
                    <Badge variant="secondary">Full-time</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    We're looking for an experienced developer to join our growing team...
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Posted 2 days ago</span>
                    <Separator orientation="vertical" className="h-4" />
                    <Users className="h-4 w-4" />
                    <span>15 applicants</span>
                  </div>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button className="flex-1">Apply Now</Button>
                  <Button variant="outline">Save</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">UX/UI Designer</CardTitle>
                      <CardDescription>Design Studio • New York, NY • Hybrid</CardDescription>
                    </div>
                    <Badge>Contract</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Join our creative team to design beautiful user experiences...
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Posted 1 week ago</span>
                    <Separator orientation="vertical" className="h-4" />
                    <Users className="h-4 w-4" />
                    <span>28 applicants</span>
                  </div>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button className="flex-1">Apply Now</Button>
                  <Button variant="outline">Save</Button>
                </CardFooter>
              </Card>
            </CardContent>
          </Card>

          {/* Candidate Management Table */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Candidate Pipeline
              </CardTitle>
              <CardDescription>Track applicants through the hiring process</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.map((candidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{candidate.avatar}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{candidate.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{candidate.role}</TableCell>
                      <TableCell>
                        <Badge variant={candidate.status === "Offer Sent" ? "default" : "secondary"}>
                          {candidate.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">View Profile</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Loading States */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Loading States</CardTitle>
              <CardDescription>Skeleton loaders for better UX</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <p className="text-sm font-medium">Job Card Loading</p>
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-medium">List Item Loading</p>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Button Variants */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
              <CardDescription>Different button styles for various use cases</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button>Primary Action</Button>
              <Button variant="secondary">Secondary Action</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="link">Link Button</Button>
              <Button variant="destructive">Delete</Button>
              <Button size="sm">Small</Button>
              <Button size="lg">Large</Button>
              <Button disabled>Disabled</Button>
            </CardContent>
          </Card>

          {/* Alerts & Notifications */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Alerts & Notifications</CardTitle>
              <CardDescription>Contextual feedback messages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Information</AlertTitle>
                <AlertDescription>
                  Your profile has been updated successfully.
                </AlertDescription>
              </Alert>

              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Unable to submit application. Please check your connection.
                </AlertDescription>
              </Alert>

              <Alert className="border-accent text-accent-foreground bg-accent/10">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Application submitted! We'll be in touch soon.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Form Elements */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Form Elements</CardTitle>
              <CardDescription>Input components for data collection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Doe" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="john@example.com" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Desired Position</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="developer">Software Developer</SelectItem>
                    <SelectItem value="designer">UX Designer</SelectItem>
                    <SelectItem value="manager">Product Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Slider defaultValue={[5]} max={20} step={1} />
                <p className="text-sm text-muted-foreground">5 years</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover">Cover Letter</Label>
                <Textarea
                  id="cover"
                  placeholder="Tell us why you'd be a great fit..."
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="remote" />
                <Label htmlFor="remote">Open to remote work</Label>
              </div>

              <RadioGroup defaultValue="full-time">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="full-time" id="full-time" />
                  <Label htmlFor="full-time">Full-time</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="part-time" id="part-time" />
                  <Label htmlFor="part-time">Part-time</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="contract" id="contract" />
                  <Label htmlFor="contract">Contract</Label>
                </div>
              </RadioGroup>

              <div className="flex items-center space-x-2">
                <Switch id="notifications" />
                <Label htmlFor="notifications">Email notifications</Label>
              </div>
            </CardContent>
          </Card>

          {/* Dialogs & Overlays */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Dialogs & Overlays</CardTitle>
              <CardDescription>Modal interactions and contextual menus</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">Delete Application</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      application from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Edit Profile</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                      Make changes to your profile here. Click save when you're done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="dialog-name">Name</Label>
                      <Input id="dialog-name" defaultValue="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dialog-email">Email</Label>
                      <Input id="dialog-email" defaultValue="john@example.com" />
                    </div>
                  </div>
                  <Button>Save Changes</Button>
                </DialogContent>
              </Dialog>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">More Actions</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Schedule Interview</DropdownMenuItem>
                  <DropdownMenuItem>Send Message</DropdownMenuItem>
                  <DropdownMenuItem>Export Resume</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">Interview Date</Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                  />
                </PopoverContent>
              </Popover>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover Me</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This is a helpful tooltip</p>
                </TooltipContent>
              </Tooltip>

              <Button variant="outline" onClick={() => setShowToast(true)}>
                Show Toast
              </Button>
            </CardContent>
          </Card>

          {/* Progress & Status */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Progress Indicators</CardTitle>
              <CardDescription>Show application and hiring progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Application Progress</span>
                  <span className="text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>

              <div className="space-y-4">
                <p className="text-sm font-medium">Hiring Pipeline</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-accent" />
                    <span className="text-sm">Application Received</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-accent" />
                    <span className="text-sm">Phone Screening</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-muted" />
                    <span className="text-sm text-muted-foreground">Technical Interview</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-muted" />
                    <span className="text-sm text-muted-foreground">Final Interview</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs & Accordion */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Tabs & Accordion</CardTitle>
              <CardDescription>Organize content efficiently</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="overview">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="applications">Applications</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    View your dashboard overview with key metrics and recent activity.
                  </p>
                </TabsContent>
                <TabsContent value="applications" className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Manage all your job applications in one place.
                  </p>
                </TabsContent>
                <TabsContent value="analytics" className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Track your hiring metrics and performance insights.
                  </p>
                </TabsContent>
              </Tabs>

              <Separator />

              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger>How do I apply for a job?</AccordionTrigger>
                  <AccordionContent>
                    Click the "Apply Now" button on any job listing. You'll need to complete
                    your profile and upload your resume before submitting.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Can I track my applications?</AccordionTrigger>
                  <AccordionContent>
                    Yes! Visit your dashboard to see all applications and their current status
                    in the hiring pipeline.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>How long does the process take?</AccordionTrigger>
                  <AccordionContent>
                    The typical hiring process takes 2-4 weeks, depending on the role and
                    number of interview rounds.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Badges & Avatars */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Badges & Avatars</CardTitle>
              <CardDescription>Status indicators and user representations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge>Applied</Badge>
                <Badge variant="secondary">In Review</Badge>
                <Badge variant="outline">Screening</Badge>
                <Badge variant="destructive">Rejected</Badge>
                <Badge className="bg-accent text-accent-foreground">Hired</Badge>
              </div>

              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback className="bg-accent">HR</AvatarFallback>
                </Avatar>
              </div>
            </CardContent>
          </Card>

          {/* Empty States */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Empty States</CardTitle>
              <CardDescription>Graceful handling of no data scenarios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                  Start applying to jobs to see your applications here. Browse our job board
                  to find opportunities that match your skills.
                </p>
                <Button>Browse Jobs</Button>
              </div>
            </CardContent>
          </Card>

          {/* Dashboard Stats */}
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">245</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-accent">+12%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Candidates</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-accent">+8%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">34%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-accent">+5%</span> from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Typography Scale */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Typography Scale</CardTitle>
              <CardDescription>Hierarchy and text styles using Plus Jakarta Sans</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Heading 1</p>
                <h1 className="text-4xl font-bold tracking-tight">The quick brown fox</h1>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Heading 2</p>
                <h2 className="text-3xl font-bold tracking-tight">The quick brown fox</h2>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Heading 3</p>
                <h3 className="text-2xl font-semibold tracking-tight">The quick brown fox</h3>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Heading 4</p>
                <h4 className="text-xl font-semibold tracking-tight">The quick brown fox</h4>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Body Large</p>
                <p className="text-lg">The quick brown fox jumps over the lazy dog</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Body Default</p>
                <p className="text-base">The quick brown fox jumps over the lazy dog</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Body Small</p>
                <p className="text-sm">The quick brown fox jumps over the lazy dog</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Caption</p>
                <p className="text-xs text-muted-foreground">The quick brown fox jumps over the lazy dog</p>
              </div>
            </CardContent>
          </Card>

          {/* Spacing System */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Spacing System</CardTitle>
              <CardDescription>Consistent spacing scale for layouts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 6, 8, 12, 16].map((space) => (
                  <div key={space} className="flex items-center gap-4">
                    <div className="w-16 text-sm text-muted-foreground">
                      {space * 4}px
                    </div>
                    <div className={`h-8 bg-primary rounded`} style={{ width: `${space * 4}px` }} />
                    <div className="text-sm text-muted-foreground">
                      {space * 0.25}rem / space-{space}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Border Radius */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Border Radius</CardTitle>
              <CardDescription>Rounded corners for modern aesthetics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="h-20 w-20 bg-primary rounded-sm mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Small (0.125rem)</p>
                </div>
                <div className="text-center">
                  <div className="h-20 w-20 bg-primary rounded-md mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Medium (0.375rem)</p>
                </div>
                <div className="text-center">
                  <div className="h-20 w-20 bg-primary rounded-lg mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Large (0.5rem)</p>
                </div>
                <div className="text-center">
                  <div className="h-20 w-20 bg-primary rounded-xl mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">XL (0.75rem)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Accessibility Notes */}
          <Card className="mb-8 border-accent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-accent" />
                Accessibility Features
              </CardTitle>
              <CardDescription>Built-in WCAG 2.1 AA compliance</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>All interactive elements are keyboard navigable</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>Color contrast ratios meet WCAG AA standards</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>Semantic HTML and ARIA labels throughout</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>Focus indicators visible on all focusable elements</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>Screen reader compatible with proper announcements</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Footer */}
          <footer className="mt-16 text-center text-sm text-muted-foreground pb-8">
            <p>RecruitPro Design System • Built with shadcn/ui and Tailwind CSS</p>
            <p className="mt-2">Professional Trust Color Palette • Plus Jakarta Sans Typography</p>
          </footer>
        </div>
      </div>
    </TooltipProvider>
  );
}