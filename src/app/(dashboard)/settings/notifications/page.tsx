"use client";

import { useState, useEffect } from "react";
import { Bell, Mail, Clock, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function NotificationsSettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [reminderDaysBefore, setReminderDaysBefore] = useState("3");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setEmailNotifications(data.emailNotifications ?? true);
          setReminderDaysBefore(String(data.reminderDaysBefore ?? 3));
        }
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailNotifications,
          reminderDaysBefore: Number(reminderDaysBefore),
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Notification settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Notification Settings</h2>
        <p className="text-muted-foreground mt-1">
          Control how and when you receive notifications.
        </p>
      </div>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="h-4 w-4" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Receive email alerts for important events like overdue invoices and signed contracts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notif" className="font-medium">
                Enable email notifications
              </Label>
              <p className="text-sm text-muted-foreground mt-0.5">
                Get notified via email for invoices, contracts, and payment events.
              </p>
            </div>
            <Switch
              id="email-notif"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Invoice Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            Invoice Due Date Reminders
          </CardTitle>
          <CardDescription>
            Automatically remind clients before their invoice is due.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="font-medium">Send reminder before due date</Label>
              <p className="text-sm text-muted-foreground mt-0.5">
                How many days before the due date to send a reminder email to the client.
              </p>
            </div>
            <Select
              value={reminderDaysBefore}
              onValueChange={setReminderDaysBefore}
              disabled={!emailNotifications}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 day</SelectItem>
                <SelectItem value="2">2 days</SelectItem>
                <SelectItem value="3">3 days</SelectItem>
                <SelectItem value="5">5 days</SelectItem>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* In-App Notifications info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4" />
            In-App Notifications
          </CardTitle>
          <CardDescription>
            These are always enabled and appear in the notification bell in the top bar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span>📤</span> Invoice sent to a client
            </li>
            <li className="flex items-center gap-2">
              <span>💰</span> Invoice marked as paid
            </li>
            <li className="flex items-center gap-2">
              <span>⚠️</span> Invoice becomes overdue
            </li>
            <li className="flex items-center gap-2">
              <span>✍️</span> Contract signed by client
            </li>
            <li className="flex items-center gap-2">
              <span>📋</span> Contract sent for signing
            </li>
          </ul>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Settings
      </Button>
    </div>
  );
}
