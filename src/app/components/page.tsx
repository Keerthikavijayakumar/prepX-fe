"use client";

import * as React from "react";
import { Terminal, Waves } from "lucide-react";

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

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <TooltipProvider>
      <div className="container mx-auto p-4 md:p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">
            Component Showcase
          </h1>
          <p className="text-muted-foreground">
            A collection of installed shadcn/ui components.
          </p>
        </header>

        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Forms & Inputs</CardTitle>
              <CardDescription>A collection of form elements.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input size={100} type="email" id="email" placeholder="Email" />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" />
                <Label htmlFor="terms">Accept terms and conditions</Label>
              </div>
              <RadioGroup defaultValue="comfortable">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="default" id="r1" />
                  <Label htmlFor="r1">Default</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="comfortable" id="r2" />
                  <Label htmlFor="r2">Comfortable</Label>
                </div>
              </RadioGroup>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-2">
                <Switch id="airplane-mode" />
                <Label htmlFor="airplane-mode">Airplane Mode</Label>
              </div>
              <Slider defaultValue={[33]} max={100} step={1} />
              <Textarea placeholder="Type your message here." />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Overlays & Dialogs</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">Show Alert Dialog</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Show Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                      Make changes to your profile here.
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Open Dropdown</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Billing</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">Open Popover</Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <p>This is the popover content.</p>
                </PopoverContent>
              </Popover>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover for Tooltip</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Tooltip content</p>
                </TooltipContent>
              </Tooltip>
              <Button variant="outline" onClick={() => {}}>
                Show Toast
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content & Display</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger>Is it accessible?</AccordionTrigger>
                  <AccordionContent>
                    Yes. It adheres to the WAI-ARIA design pattern.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>
                  You can add components to your app using the CLI.
                </AlertDescription>
              </Alert>
              <div className="flex gap-4">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <Badge>Badge</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border self-center"
              />
              <Progress value={progress} />
              <Separator />
              <Tabs defaultValue="account">
                <TabsList>
                  <TabsTrigger value="account">Account</TabsTrigger>
                  <TabsTrigger value="password">Password</TabsTrigger>
                </TabsList>
                <TabsContent value="account">
                  Make changes to your account here.
                </TabsContent>
                <TabsContent value="password">
                  Change your password here.
                </TabsContent>
              </Tabs>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>INV001</TableCell>
                    <TableCell>Paid</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* New section for component variants */}
        <h2 className="text-3xl font-bold tracking-tight mt-12 mb-6">
          Component Variants
        </h2>
        <div className="grid gap-8">
          {/* Button variants */}
          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
              <CardDescription>
                Different button styles and variants.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button variant="default">Default Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="link">Link Button</Button>
              <Button variant="destructive">Destructive Button</Button>
            </CardContent>
          </Card>

          {/* Badge variants */}
          <Card>
            <CardHeader>
              <CardTitle>Badge Variants</CardTitle>
              <CardDescription>
                Different badge styles and variants.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Badge>Default Badge</Badge>
              <Badge variant="secondary">Secondary Badge</Badge>
              <Badge variant="outline">Outline Badge</Badge>
              <Badge variant="destructive">Destructive Badge</Badge>
            </CardContent>
          </Card>

          {/* Alert variants */}
          <Card>
            <CardHeader>
              <CardTitle>Alert Variants</CardTitle>
              <CardDescription>
                Different alert styles and variants.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Default Alert</AlertTitle>
                <AlertDescription>
                  This is the default alert style.
                </AlertDescription>
              </Alert>

              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Destructive Alert</AlertTitle>
                <AlertDescription>
                  This is a destructive alert for critical messages.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Card variants */}
          <Card>
            <CardHeader>
              <CardTitle>Card Variants</CardTitle>
              <CardDescription>
                Different card styles and variants.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Default Card</CardTitle>
                  <CardDescription>
                    This is a default card style.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Card content goes here.</p>
                </CardContent>
                <CardFooter>
                  <Button>Action</Button>
                </CardFooter>
              </Card>

              <div className="bg-secondary p-1 rounded-lg">
                <Card className="border-secondary">
                  <CardHeader className="bg-secondary/50">
                    <CardTitle>Secondary Card</CardTitle>
                    <CardDescription>
                      This is a secondary card style.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Card content goes here.</p>
                  </CardContent>
                  <CardFooter className="bg-secondary/50">
                    <Button variant="secondary">Action</Button>
                  </CardFooter>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Input variants */}
          <Card>
            <CardHeader>
              <CardTitle>Input Variants</CardTitle>
              <CardDescription>
                Different input styles and variants.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="default-input">Default Input</Label>
                <Input
                  type="text"
                  id="default-input"
                  placeholder="Default input"
                />
              </div>

              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="disabled-input">Disabled Input</Label>
                <Input
                  type="text"
                  id="disabled-input"
                  placeholder="Disabled input"
                  disabled
                />
              </div>

              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="with-icon" className="flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  Input with Icon
                </Label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-muted-foreground">
                    <Terminal className="h-4 w-4" />
                  </span>
                  <Input
                    type="text"
                    id="with-icon"
                    className="pl-8"
                    placeholder="Input with icon"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
