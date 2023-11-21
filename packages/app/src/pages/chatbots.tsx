import CreateChat from "@/components/Chat/CreateChat";
import ViewChatBots from "@/components/Chat/ViewChatBots";
import { FlexColStart } from "@/components/Flex";
import Layout from "@/components/Layout";
import React, { useEffect, useState } from "react";

function Chat() {
  const [activeView, setActiveView] = useState<"view-chatbots" | "create-chat">(
    "view-chatbots"
  );

  return (
    <Layout activePage="chatbots" className="overflow-hidden">
      {activeView === "view-chatbots" && (
        <FlexColStart className="w-full px-4 py-4">
          <p className="text-white-100 font-jbEB text-[12px] ">
            Flexible ChatBot Agents.
          </p>
          <p className="text-gray-100 font-jbR text-[12px] ">
            Get started by creating your first{" "}
            <span
              onClick={() => setActiveView("create-chat")}
              className="underline cursor-pointer text-white-100"
            >
              chatbot agent
            </span>
            .
          </p>
        </FlexColStart>
      )}
      {activeView === "view-chatbots" && <ViewChatBots />}
      {activeView === "create-chat" && <CreateChat goBack={()=> setActiveView("view-chatbots")} />}
    </Layout>
  );
}

export default Chat;
