"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { PageFrame, SectionCard } from "@/components/seller/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { changePassword, getProfile, updateProfile } from "@/lib/api";
import { getAssetUrl } from "@/lib/utils";
import { LanguageSelector } from "@/lib/i18n";

type ProfileData = {
  name?: string;
  avatar?: { url?: string };
  image?: string;
  role?: string;
};

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { data } = useQuery<ProfileData>({ queryKey: ["seller-profile"], queryFn: getProfile });

  const profile = data || {};
  const avatar = getAssetUrl(profile.avatar || profile.image);

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      toast.success("Profile updated.");
      queryClient.invalidateQueries({ queryKey: ["seller-profile"] });
    },
  });
  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => toast.success("Password changed."),
  });

  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  return (
    <PageFrame title="Setting" subtitle="Edit your personal information">
      <SectionCard className="mb-6">
        <h2 className="text-[20px] font-semibold text-[#202124]">Language</h2>
        <p className="mt-1 text-[14px] text-[#5b6371]">Choose the language used throughout the seller dashboard.</p>
        <div className="mt-4 max-w-[360px]">
          <LanguageSelector />
        </div>
      </SectionCard>
      <SectionCard>
        <label className="flex cursor-pointer items-center gap-5">
          <div className="relative size-20 overflow-hidden rounded-full bg-[#d6c0aa]">
            {avatar ? (
              <Image src={avatar} alt={profile.name || "Profile"} fill sizes="80px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[24px] font-semibold text-white">
                {(profile.name || "R").charAt(0)}
              </div>
            )}
          </div>
          <div>
            <p className="text-[20px] font-semibold text-[#202124]">{profile.name || "Rani"}</p>
            <p className="text-[14px] text-[#5b6371]">@{profile.role || "seller"}</p>
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const fd = new FormData();
              fd.set("avatar", file);
              updateMutation.mutate(fd);
              event.target.value = "";
            }}
          />
        </label>
      </SectionCard>

      <SectionCard className="mt-6">
        <h2 className="text-[20px] font-semibold text-[#202124]">Change password</h2>
        <form
          className="mt-5 grid gap-4 xl:grid-cols-[1fr_1fr_1fr_auto] xl:items-end"
          onSubmit={(event) => {
            event.preventDefault();
            passwordMutation.mutate(form);
          }}
        >
          <div>
            <label className="mb-2 block text-[14px] font-medium text-[#202124]">Current Password</label>
            <div className="relative">
              <Input
                type={showPasswords.currentPassword ? "text" : "password"}
                value={form.currentPassword}
                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                className="bg-white pr-12"
              />
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7280]"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    currentPassword: !prev.currentPassword,
                  }))
                }
                type="button"
              >
                {showPasswords.currentPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-[14px] font-medium text-[#202124]">New Password</label>
            <div className="relative">
              <Input
                type={showPasswords.newPassword ? "text" : "password"}
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                className="bg-white pr-12"
              />
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7280]"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    newPassword: !prev.newPassword,
                  }))
                }
                type="button"
              >
                {showPasswords.newPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-[14px] font-medium text-[#202124]">Confirm New Password</label>
            <div className="relative">
              <Input
                type={showPasswords.confirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="bg-white pr-12"
              />
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7280]"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    confirmPassword: !prev.confirmPassword,
                  }))
                }
                type="button"
              >
                {showPasswords.confirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="bg-[#6d98c0] hover:bg-[#5f88ae]" disabled={passwordMutation.isPending}>
            {passwordMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </SectionCard>
    </PageFrame>
  );
}
