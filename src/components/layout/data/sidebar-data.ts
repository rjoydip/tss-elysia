import {
  LayoutDashboard,
  Monitor,
  ListTodo,
  HelpCircle,
  Bell,
  Package,
  Palette,
  Settings,
  Wrench,
  UserCog,
  Users,
  MessagesSquare,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
} from "lucide-react";
import { type SidebarData } from "../types";
import { APP_NAME } from "~/config";

export const sidebarData: SidebarData = {
  user: {
    name: "satnaing",
    email: "tss@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: `${APP_NAME} Admin`,
      logo: Command,
      plan: "",
    },
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
  ],
  navGroups: [
    {
      title: "General",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Tasks",
          url: "/dashboard/tasks",
          icon: ListTodo,
        },
        {
          title: "Apps",
          url: "/dashboard/apps",
          icon: Package,
        },
        {
          title: "Chats",
          url: "/dashboard/chats",
          badge: "3",
          icon: MessagesSquare,
        },
        {
          title: "Users",
          url: "/dashboard/users",
          icon: Users,
        },
      ],
    },
    {
      title: "Other",
      items: [
        {
          title: "Settings",
          icon: Settings,
          items: [
            {
              title: "Profile",
              url: "/dashboard/settings",
              icon: UserCog,
            },
            {
              title: "Account",
              url: "/dashboard/settings/account",
              icon: Wrench,
            },
            {
              title: "Appearance",
              url: "/dashboard/settings/appearance",
              icon: Palette,
            },
            {
              title: "Notifications",
              url: "/dashboard/settings/notifications",
              icon: Bell,
            },
            {
              title: "Display",
              url: "/dashboard/settings/display",
              icon: Monitor,
            },
          ],
        },
        {
          title: "Help Center",
          url: "/help-center",
          icon: HelpCircle,
        },
      ],
    },
  ],
};