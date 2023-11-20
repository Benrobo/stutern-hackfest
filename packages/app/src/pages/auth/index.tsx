import { FlexColCenter } from "@/components/Flex";
import React from "react";
import { SignIn } from "@clerk/nextjs";
import { withoutAuth } from "@/lib/helpers";

function Auth() {
  return (
    <div className="w-full h-screen">
      <FlexColCenter className="w-full h-full">
        <SignIn afterSignInUrl={"/dashboard"} afterSignUpUrl={"/dashboard"} />
      </FlexColCenter>
    </div>
  );
}

export default withoutAuth(Auth);
