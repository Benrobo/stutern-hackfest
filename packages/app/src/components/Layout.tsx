import React, { useContext, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import SideBar from "./Navbar/Sidebar";
import { LayoutContext } from "@/context/LayoutContext";
import TopBar from "./Navbar/TopBar";

interface LayoutProps {
  children?: React.ReactNode;
  className?: React.ComponentProps<"div">["className"];
  activePage: string;
}

function Layout({ children, activePage, className }: LayoutProps) {
  const { setActivePage } = useContext(LayoutContext);

  useEffect(() => {
    setActivePage(activePage);
  }, [activePage]);

  return (
    <div
      className={twMerge("w-full relative h-screen overflow-y-auto", className)}
    >
      {children}
    </div>
  );
}

export default Layout;

export function ComponentLayout({
  children,
}: {
  children: React.ReactElement;
}) {
  const { activePage } = useContext(LayoutContext);
  const [pathname, setPathname] = useState("");
  // pages that uses the default Layout
  const validPages = [
    "dashboard",
    "conversations",
    "chatbots",
    "settings",
    "chat-supports",
  ];

  useEffect(() => {
    const { pathname } = window.location;
    setPathname(pathname.replace("/", ""));
  }, [pathname]);

  return (
    <div
      className={twMerge(
        "w-full relative h-screen overflow-y-auto hideScrollBar bg-dark-100"
      )}
    >
      {validPages.includes(pathname) ? (
        <div className="w-full h-screen flex">
          <SideBar activePage={activePage} />
          <div className="w-full z-upper  overflow-hidden">
            <TopBar />
            {children}
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
