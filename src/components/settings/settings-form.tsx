"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  profileSchema,
  passwordChangeSchema,
  type ProfileInput,
  type PasswordChangeInput,
} from "@/lib/validations/settings";

export function SettingsContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const profileForm = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
  });

  const passwordForm = useForm<PasswordChangeInput>({
    resolver: zodResolver(passwordChangeSchema),
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/account/profile");
        if (res.status === 401) {
          router.push("/login");
          return;
        }

        if (!res.ok) {
          toast.error("Could not load profile");
          return;
        }

        const profile = (await res.json()) as {
          fullName: string;
          email: string;
          avatarUrl: string | null;
        };

        setEmail(profile.email);
        setAvatarUrl(profile.avatarUrl);
        profileForm.reset({
          fullName: profile.fullName,
          email: profile.email,
        });
      } catch {
        toast.error("Could not load profile");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [profileForm, router]);

  async function onProfileSubmit(data: ProfileInput) {
    setSaving(true);

    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = (await res.json()) as { error?: string };

    if (!res.ok) {
      toast.error(result.error ?? "Failed to update profile");
    } else {
      toast.success("Profile updated");
    }
    setSaving(false);
  }

  async function onPasswordSubmit(data: PasswordChangeInput) {
    setPasswordSaving(true);

    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = (await res.json()) as { error?: string };

      if (!res.ok) {
        toast.error(result.error ?? "Failed to update password");
        return;
      }

      toast.success("Password updated");
      passwordForm.reset();
    } catch {
      toast.error("Failed to update password");
    } finally {
      setPasswordSaving(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);

    try {
      const res = await fetch("/api/account/delete", { method: "DELETE" });
      const result = (await res.json()) as { error?: string };

      if (!res.ok) {
        toast.error(result.error ?? "Failed to delete account");
        setDeleting(false);
        return;
      }

      toast.success("Account deleted");
      window.location.href = "/";
    } catch {
      toast.error("Failed to delete account");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const initials = profileForm
    .watch("fullName")
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <DashboardHeader
        title="Settings"
        description="Manage your account and preferences"
      />

      <div className="mx-auto max-w-2xl space-y-6 p-6 md:p-8">
        <Card className="glow-card border-0">
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex items-center gap-4">
              <Avatar className="size-16">
                <AvatarImage src={avatarUrl ?? undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {initials || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{profileForm.watch("fullName")}</p>
                <p className="text-sm text-muted-foreground">{email}</p>
              </div>
            </div>

            <form
              onSubmit={profileForm.handleSubmit(onProfileSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" {...profileForm.register("fullName")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={email} disabled />
              </div>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
                Save changes
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="glow-card border-0">
          <CardHeader>
            <CardTitle className="text-base">Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  {...passwordForm.register("currentPassword")}
                />
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-xs text-destructive">
                    {passwordForm.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  {...passwordForm.register("newPassword")}
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-xs text-destructive">
                    {passwordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  {...passwordForm.register("confirmPassword")}
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-destructive">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <Button type="submit" disabled={passwordSaving}>
                {passwordSaving && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                Update password
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="glow-card border-0">
          <CardHeader>
            <CardTitle className="text-base">Billing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You are currently on the <strong>Free</strong> plan.
            </p>
            <Button className="mt-4" variant="outline" disabled>
              Upgrade to Pro
            </Button>
          </CardContent>
        </Card>

        <Separator />

        <Card className="glow-card border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base text-destructive">
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all associated data.
            </p>
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button variant="destructive" className="mt-4">
                    <Trash2 className="mr-2 size-4" />
                    Delete account
                  </Button>
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your account, all links, and
                    analytics data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault();
                      void handleDeleteAccount();
                    }}
                    disabled={deleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleting && (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    )}
                    Delete account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
