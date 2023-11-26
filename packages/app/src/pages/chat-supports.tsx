import { FlexColStart } from "@/components/Flex";
import Layout from "@/components/Layout";
import { withAuth } from "@/lib/helpers";
import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getEscallatedConversations } from "@/lib/http/requests";
import toast from "react-hot-toast";
import { ResponseData } from "@/types";
import dayjs from "dayjs";

type EscallatedChats = {
  customer_name: string;
  customer_email: string;
  createdAt: string;
  chat: {
    agent_name: string;
    name: string;
    id: string;
  };
};

function ChatSupports() {

  const [chatSupports, setChatSupports] = React.useState<EscallatedChats[]>([]);
  const getEscallatedChatsQuery = useQuery({
    queryFn: async ()=> getEscallatedConversations(),
    queryKey: ["escallated-chats"],
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
        setChatSupports(supports);
      }
    }, [
      getEscallatedChatsQuery.data,
      getEscallatedChatsQuery.isPending,
      getEscallatedChatsQuery.error,
    ]);




  return (
    <Layout activePage="chat-supports">
      <FlexColStart className="w-full h-full px-4 py-4">
        <FlexColStart className="w-full h-auto">
          {/* heading */}
          <h1 className="text-white-100 font-jbEB">Escallated Chats</h1>
          <p className="text-white-200 font-jbSB text-[12px] ">
            View all requested customers who need human support!.
          </p>
        </FlexColStart>
        <br />
        <br />

        {/* table */}
        <FlexColStart className="w-full">
          <Table>
            <TableCaption className="text-white-300 opacity-[.5] text-[12px] font-jbSB">
              A list of requested human supports.
            </TableCaption>
            <TableHeader className="">
              <TableRow className="group hover:bg-dark-200 hover:text-white-100 bg-dark-200 font-jbEB text-white-100 ">
                <TableHead className=" text-white-100">Chatbot</TableHead>
                <TableHead className=" text-white-100">
                  Customer Email
                </TableHead>
                <TableHead className=" text-white-100">Customer Nmae</TableHead>
                <TableHead className=" text-white-100">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getEscallatedChatsQuery.isPending ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : chatSupports.length > 0 &&
                !getEscallatedChatsQuery.isPending ? (
                chatSupports.map((chat, index) => (
                  <TableRow key={index} className="hover:bg-dark-200/40">
                    <TableCell className="font-jbSB text-white-200">
                      {chat.chat.name}
                    </TableCell>
                    <TableCell className="font-jbSB text-white-200">
                      {chat.customer_name}
                    </TableCell>
                    <TableCell className="font-jbSB text-white-200">
                      <Link href={`mailto:${chat.customer_email}`} className="underline">
                        {chat.customer_email}
                      </Link>
                    </TableCell>
                    <TableCell className="font-jbSB text-white-200">
                      {dayjs(chat.createdAt).format("DD/MM/YYYY")}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center font-jbR">
                    No escallated chats yet!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </FlexColStart>
      </FlexColStart>
    </Layout>
  );
}

export default withAuth(ChatSupports);
