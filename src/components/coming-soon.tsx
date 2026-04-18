import { Telescope } from "lucide-react";
import { Main } from "~/components/layout/main";
import { Header } from "./layout/header";
import { Search } from "./search";
import { ThemeSwitch } from "./theme-switch";
import { ConfigDrawer } from "./config-drawer";
import { ProfileDropdown } from "./profile-dropdown";

export function ComingSoon() {
  return (
    <>
      <Header fixed>
        <Search />
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>
      <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
        <div className="h-svh">
          <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
            <Telescope size={72} />
            <h1 className="text-4xl leading-tight font-bold">Coming Soon!</h1>
            <p className="text-center text-muted-foreground">
              This page has not been created yet. &nbsp;&nbsp;Stay tuned though!
            </p>
          </div>
        </div>
      </Main>
    </>
  );
}