import { FlexColStart, FlexRowStart, FlexRowStartBtw } from "@/components/Flex";
import Layout from "@/components/Layout";
import { withAuth } from "@/lib/helpers";
import { getConversations, getEscallatedConversations } from "@/lib/http/requests";
import { ResponseData } from "@/types";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import toast from "react-hot-toast";

function Dashboard() {

  const [conversations, setConversations] = React.useState(0);
  const [supports, setSupports] = React.useState(0);

  const getEscallatedChatsQuery = useQuery({
    queryFn: async () => getEscallatedConversations(),
    queryKey: ["escallated-chats"],
  });
  const getConversationsQuery = useQuery({
    queryFn: async () => getConversations("all"),
    queryKey: ["conversations"],
  });

  React.useEffect(() => {
    if (getEscallatedChatsQuery.error) {
      const data = (getEscallatedChatsQuery.error as any)?.response
        ?.data as ResponseData;
      toast.error(data?.message as string);
    }
    if (getEscallatedChatsQuery.data) {
      const data = getEscallatedChatsQuery.data as ResponseData;
      const supports = data.data;
      setSupports(supports.length);
    }
  }, [
    getEscallatedChatsQuery.data,
    getEscallatedChatsQuery.isPending,
    getEscallatedChatsQuery.error,
  ]);

  React.useEffect(() => {
    if (getConversationsQuery.error) {
      const data = (getConversationsQuery.error as any)?.response
        ?.data as ResponseData;
      toast.error(data?.message as string);
    }
    if (getConversationsQuery.data) {
      const data = getConversationsQuery.data as ResponseData;
      const conversations = data.data;
      setConversations(conversations.length);
    }
  }, [
    getConversationsQuery.data,
    getConversationsQuery.isPending,
    getConversationsQuery.error,
  ]);


  return (
    <Layout activePage="dashboard">
      <FlexColStart className="w-full h-full px-8 py-4">
        <FlexColStart className="w-full">
          <p className="text-white-100 font-jbEB">Overview</p>
          <p className="text-white-300 font-jbSB text-[12px]">
            Here is an overview of your chatbots and conversations on SwissAI.
          </p>
        </FlexColStart>

        <br />
        <br />

        {/* conversations count card */}
        <FlexRowStart className="w-full">
          <FlexRowStartBtw className="w-auto min-w-[350px] gap-4 px-7 py-[2em] rounded-md bg-dark-300">
            <FlexColStart className="w-auto">
              <p className="text-white-100 font-jbEB">Conversations</p>
              <p className="text-white-200 font-jbSB text-[12px]">
                {getEscallatedChatsQuery.isPending ? "Loading..." : "Total number of conversations"}
              </p>
            </FlexColStart>
            <FlexColStart className="w-auto">
              <p className="text-white-100 font-jbEB text-[30px]">{conversations}</p>
            </FlexColStart>
          </FlexRowStartBtw>

          <FlexRowStartBtw className="w-auto min-w-[350px] gap-4 px-7 py-[2em] rounded-md bg-dark-300">
            <FlexColStart className="w-auto">
              <p className="text-white-100 font-jbEB">Supports</p>
              <p className="text-white-200 font-jbSB text-[12px]">
                {getEscallatedChatsQuery.isPending ? "Loading..." : "Total number of supports"}
              </p>
            </FlexColStart>
            <FlexColStart className="w-auto">
              <p className="text-white-100 font-jbEB text-[30px]">{supports}</p>
            </FlexColStart>
          </FlexRowStartBtw>
        </FlexRowStart>
      </FlexColStart>
    </Layout>
  );
}

export default withAuth(Dashboard);
