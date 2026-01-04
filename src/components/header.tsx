"use client";

import { useSession } from "@hono/auth-js/react";
import {
  Camera,
  Home,
  List,
  LogOut,
  Map as MapIcon,
  Menu,
  Settings,
  Upload,
  User,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Header() {
  const { data: session, status } = useSession();
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";
  const isAuthenticated = status === "authenticated";

  const navigationLinks = [
    { href: "/", label: "ホーム", icon: Home, show: true },
    { href: "/post", label: "投稿一覧", icon: List, show: true },
    { href: "/trip", label: "旅行", icon: MapIcon, show: true },
    { href: "/upload", label: "アップロード", icon: Upload, show: isAdmin },
    { href: "/admin", label: "管理", icon: Settings, show: isAdmin },
  ] as const;

  const visibleLinks = navigationLinks.filter((link) => link.show);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center px-4 md:px-6 lg:px-8 mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 mr-8">
          <Camera className="h-6 w-6" />
          <span className="font-bold text-xl hidden sm:inline-block">
            写真スポット
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 items-center space-x-6">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* User Menu (Desktop) */}
        <div className="hidden md:flex items-center space-x-4 ml-auto">
          {isAuthenticated && session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={session.user.image || undefined}
                      alt={session.user.name || "User"}
                    />
                    <AvatarFallback>
                      {session.user.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session.user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/user/profile/edit">プロフィール</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/api/auth/signout">ログアウト</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>

        {/* Mobile Menu */}
        <div className="flex md:hidden ml-auto">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">メニューを開く</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader className="mb-4">
                <SheetTitle className="text-left">メニュー</SheetTitle>
              </SheetHeader>

              {/* User Profile Section (if authenticated) */}
              {isAuthenticated && session?.user && (
                <div className="flex items-center space-x-3 px-4 py-6 mb-6 pb-6 border-b">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={session.user.image || undefined}
                      alt={session.user.name || "User"}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {session.user.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{session.user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <nav className="flex flex-col space-y-2 mt-2 px-4">
                {visibleLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center space-x-3 px-3 py-4 rounded-lg text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      {link.icon && <link.icon className="h-5 w-5" />}
                      <span>{link.label}</span>
                    </Link>
                  </SheetClose>
                ))}
              </nav>

              {/* User Actions (if authenticated) */}
              {isAuthenticated && (
                <div className="flex flex-col space-y-2 mt-8 pt-8 px-4 border-t">
                  <SheetClose asChild>
                    <Link
                      href="/user/profile/edit"
                      className="flex items-center space-x-3 px-3 py-4 rounded-lg text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <User className="h-5 w-5" />
                      <span>プロフィール</span>
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      href="/api/auth/signout"
                      className="flex items-center space-x-3 px-3 py-4 rounded-lg text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>ログアウト</span>
                    </Link>
                  </SheetClose>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
