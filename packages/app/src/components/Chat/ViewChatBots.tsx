import React, { useEffect, useRef, useState } from "react";
import {
  FlexColCenter,
  FlexColEnd,
  FlexColStart,
  FlexRowCenter,
  FlexRowCenterBtw,
  FlexRowStartBtw,
  FlexRowStartCenter,
  FlexStartColCenter,
} from "../Flex";
import { Bot, Copy, SendHorizonal } from "lucide-react";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { sleep } from "@/pages/api/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteChatbot, getAllChats } from "@/lib/http/requests";
import { ResponseData } from "@/types";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import { Spinner } from "../Spinner";

const messages = [
  {
    type: "bot",
    message: "Hello, how can I help you?",
  },
] satisfies Message[];

type Message = {
  type: "user" | "bot";
  message: string;
};

type ChatDetails = {
  id: string;
  name: string;
  agent_name: string;
  userId: string;
  createdAt: string;
};

function ViewChatBots() {
  const [chatdetails, setChatDetails] = useState<ChatDetails[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatDetails | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>(messages);
  const [usermsg, setUserMsg] = useState<string>("");
  const getChatQuery = useQuery({
    queryFn: async () => await getAllChats(),
    queryKey: ["getAllChats"],
  });
  const deleteChatBotMutation = useMutation({
    mutationFn: async (data: any) => deleteChatbot(data),
  });

  useEffect(() => {
    if (getChatQuery.error) {
      const data = (getChatQuery.error as any)?.response?.data as ResponseData;
      toast.error(data?.message as string);
    }
    if (getChatQuery.data) {
      const data = getChatQuery.data as ResponseData;
      const details = data?.data;
      setChatDetails(details);
      details.length > 0 ? setSelectedChat(details[0]) : setSelectedChat(null);
    }
  }, [getChatQuery.data, getChatQuery.isPending, getChatQuery.error]);

  useEffect(() => {
    if (deleteChatBotMutation.error) {
      const data = (deleteChatBotMutation.error as any)?.response
        ?.data as ResponseData;
      toast.error(data?.message as string);
    }
    if (deleteChatBotMutation.data) {
      getChatQuery.refetch();
      deleteChatBotMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    deleteChatBotMutation.data,
    deleteChatBotMutation.isPending,
    deleteChatBotMutation.error,
  ]);

  const scriptContent = `<script async src="https://cdn.jsdelivr.net/npm/swissai@latest/lib/index.js" data-swissai="${selectedChat?.id}"></script>`;

  return (
    <FlexColStart className="w-full h-full">
      <FlexRowStartBtw className="w-fit px-4">
        <select
          className="w-auto px-3 rounded-md py-2 bg-dark-200 text-white-100 font-jbSB text-[12px] outline-none focus-visible:border-none"
          onChange={(e) => {
            const chat = chatdetails.find((c) => c.id === e.target.value);
            setSelectedChat(chat as ChatDetails);
          }}
          disabled={getChatQuery.isPending}
          value={selectedChat?.id}
        >
          <option value="">
            {getChatQuery.isPending
              ? "Loading..."
              : chatdetails.length > 0
              ? "Select a chatbot"
              : "No chatbot found"}
          </option>
          {chatdetails.map((chat, i) => (
            <option key={i} value={chat.id}>
              {chat.name}
            </option>
          ))}
        </select>
      </FlexRowStartBtw>
      <FlexRowStartBtw className="w-full h-full gap-2">
        {selectedChat && (
          <FlexColStart className="w-full h-full px-4 border-r-solid border-r-[.5px] border-r-white-600 ">
            <br />
            <p className="text-gray-100 font-jbSB text-[12px] ">chatbot name</p>
            <p className="text-white-100 font-jbEB">{selectedChat.name}</p>
            <p className="text-gray-100 font-jbSB text-[12px] ">agent name</p>
            <p className="text-white-100 font-jbEB">
              {selectedChat.agent_name}
            </p>

            <br />
            <p className="text-white-300 font-jbSB text-[11px] ">
              To add the Chat bubble at the corner of your website, paste the
              following JavaScript snippet into the{" "}
              <span className="text-orange-100">{"<head>"}</span> tag of your
              webpage:
            </p>
            <FlexRowStartBtw className="relative w-full p-5 rounded-md bg-dark-200">
              <p className="text-orange-100 font-jbSB text-[12px] ">
                {scriptContent}
              </p>
              <button className="p-1 bg-dark-300 text-white-100 rounded-md absolute top-2 right-2" onClick={()=>{
                navigator.clipboard.writeText(scriptContent)
                toast.success("Copied to clipboard")
              }}>
                <Copy size={13} />
              </button>
            </FlexRowStartBtw>

            <br />
            <Button
              variant={"destructive"}
              className="font-jbSB text-[11px] text-white-100 gap-3"
              onClick={() => {
                deleteChatBotMutation.mutate(selectedChat?.id);
              }}
              disabled={
                deleteChatBotMutation.isPending || getChatQuery.isPending
              }
            >
              {!deleteChatBotMutation.isPending ? (
                <Bot size={15} />
              ) : (
                <Spinner size={15} />
              )}
              Delete chatbot
            </Button>
          </FlexColStart>
        )}
        {selectedChat && (
          <FlexStartColCenter className="w-full h-full px-7 py-5 hideScrollBar overflow-y-scroll bg-white-100 pb-9">
            <FunctionalPreviewChatInterface
              botName="Benrobo"
              messages={messages}
              setUserMsg={setUserMsg}
              usermsg={usermsg}
              // botLoading
            />
          </FlexStartColCenter>
        )}
      </FlexRowStartBtw>
    </FlexColStart>
  );
}

export default ViewChatBots;

interface IChatProps {
  botName: string;
  loading?: boolean;
  botLoading?: boolean;
  messages: Message[];
  setUserMsg: React.Dispatch<React.SetStateAction<string>>;
  usermsg: string;
}

function FunctionalPreviewChatInterface({
  botName,
  loading,
  botLoading,
  messages,
  setUserMsg,
  usermsg,
}: IChatProps) {
  const messageList = useRef(null);

  const scrollToBottom = () => {
    if (!messageList?.current) return;
    const scrollHeight = (messageList?.current as any)?.scrollHeight;
    const height = (messageList?.current as any)?.clientHeight;
    const maxScrollTop = scrollHeight - height;
    (messageList?.current as any).scrollTop =
      maxScrollTop > 0 ? maxScrollTop : 0;
    (messageList?.current as any).style = "scroll-behavior: smooth";
  };

  // add chat messages to state and scroll to bottom
  const addChatMessage = (message: string, type: "user" | "bot") => {
    // const newMessage = { message, type };
    setUserMsg(message);
    scrollToBottom();
  };

  //   on first render, scroll to bottom
  useEffect(() => {
    setTimeout(() => {
      scrollToBottom();
    }, 2000);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  return (
    <FlexColStart className="w-full h-auto min-h-[500px] max-h-[500px] max-w-[350px] rounded-lg bg-white-100 shadow-lg drop-shadow-md overflow-hidden relative ">
      {/* header */}
      <FlexColStart className={cn("w-full h-auto p-4 ", "bg-blue-100")}>
        <p className={cn("text-[15px] text-white-100 font-ppSB")}>
          {botName?.length > 0 ? botName : "ChatBot"}
        </p>
      </FlexColStart>
      <br />
      {/* Messages */}
      <FlexColStart
        ref={messageList}
        className="w-full h-full flex flex-col items-start justify-start gap-3 overflow-y-scroll hideScrollBar px-3 scroll-smooth"
      >
        {/* bot loading */}

        {messages.map((m, i) => {
          if (m.type === "user") {
            return (
              <FlexColEnd key={i} className="w-full">
                <FlexRowCenterBtw className="w-fit">
                  <FlexColStart
                    className={
                      "w-fit max-w-[200px] px-2 py-2 h-auto rounded-lg bg-blue-100 break-words overflow-hidden"
                    }
                  >
                    <p className="text-white-100 h-auto text-[11px] font-ppR break-all ">
                      {m.message}
                    </p>
                  </FlexColStart>
                </FlexRowCenterBtw>
              </FlexColEnd>
            );
          } else {
            return (
              <FlexColStart key={i} className="w-full">
                <FlexRowStartBtw className="w-fit">
                  <Bot
                    size={25}
                    className="bg-blue-100 p-1 rounded-[50%] text-white-100"
                  />
                  <FlexColStart className={"w-fit"}>
                    <div className="text-dark-200 text-[11px] font-ppR w-fit max-w-[200px] px-4 py-2 h-auto rounded-lg bg-white-500 leading-[15px] whitespace-wrap ">
                      {m.message}
                    </div>
                    {/* <span className="text-dark-300 font-jbB text-[8px] leadine-none">1hr ago</span> */}
                  </FlexColStart>
                </FlexRowStartBtw>
              </FlexColStart>
            );
          }
        })}

        {botLoading && (
          <FlexRowStartCenter className=" gap-5">
            <Bot
              size={25}
              className="bg-blue-100 p-1 rounded-[50%] text-white-100"
            />
            <div className="dot-falling"></div>
          </FlexRowStartCenter>
        )}

        {/* <div style={{ float: "left", clear: "both" }} /> */}
        <div className="pb-[8em]" />
      </FlexColStart>

      {/* Bottom Section */}
      <FlexColStart className="w-full absolute bottom-0 bg-white-600 backdrop-blur bg-opacity-85 py-2 ">
        <FlexRowCenter className="w-full px-4 border-t-solid border-b-solid border-t-[.5px] border-b-[.5px] border-t-gray-100/50 border-b-gray-100/50 bg-white-100 ">
          <Input
            className="w-full text-[12px] font-jbSB border-none outline-none rounded-none hover:border-none hover:outline-none focus-visible:ring-0 bg-transparent "
            autoFocus
            placeholder="Type a message..."
            onChange={(e) => setUserMsg(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addChatMessage(usermsg, "user");
                setUserMsg("");
              }
            }}
            value={usermsg}
          />
          <button
            onClick={() => {
              addChatMessage(usermsg, "user");
              setUserMsg("");
            }}
          >
            <SendHorizonal
              size={30}
              className="p-[8px] text-dark-100 rounded-md"
            />
          </button>
        </FlexRowCenter>
        <FlexColCenter className="w-full pb-2  px-4">
          <p className="text-white-400 text-[10px] font-jbSB">
            Powered by <span className="text-dark-100 font-ppSB">SwissAI</span>{" "}
          </p>
        </FlexColCenter>
      </FlexColStart>
    </FlexColStart>
  );
}
