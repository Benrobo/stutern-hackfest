import React from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { logout } from "@/lib/utils";

function TopBar() {
  const { user } = useUser();
  return (
    <div className="w-full flex items-center justify-end border-b-solid border-b-[1px] border-b-dark-400 py-2 px-4">
      <div className="w-auto flex">
        <UserButton />
      </div>
    </div>
  );
}

export default TopBar;
