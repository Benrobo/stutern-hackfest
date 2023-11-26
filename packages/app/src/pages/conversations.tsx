import {
  FlexColCenter,
  FlexColEnd,
  FlexColStart,
  FlexRowCenter,
  FlexRowCenterBtw,
  FlexRowStart,
  FlexRowStartBtw,
  FlexRowStartCenter,
} from "@/components/Flex";
import Layout from "@/components/Layout";
import Modal from "@/components/Modal";
import { Spinner } from "@/components/Spinner";
import { Input } from "@/components/ui/input";
import {
  adminReplyToConversation,
  deleteConversation,
  getAllChats,
  getConversationMessages,
  getConversations,
  takeControl,
} from "@/lib/http/requests";
import { cn } from "@/lib/utils";
import { ResponseData } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Bot, RefreshCcw, RefreshCw, SendHorizonal, User2 } from "lucide-react";
import React, { useEffect } from "react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import MarkdownRenderer from "@/components/MarkdownRender";
import { useSelectedLayoutSegments } from "next/navigation";
import Image from "next/image";
dayjs.extend(relativeTime);

type ConversationsData = {
  id: string;
  anonymous_id: string;
  chatId: string;
  userId: string;
  in_control: "AI" | "USER";
  createdAt: string;
  lastMessage: string;
  chat: {
    id: string;
    userId: string;
    name: string;
    agent_name: string;
    createdAt: string;
  };
};

type ConversationMessages = {
  id: string;
  userId: string | null;
  message: string;
  sender_type: "ANONYMOUS" | "ADMIN" | "AI";
  conversation_id: string;
  createdAt: string;
  user: null | {
    id: string;
    name: string;
    email: string;
    image: string;
  };
  metadata: string | null;
};

type ChatDetails = {
  id: string;
  name: string;
  agent_name: string;
  userId: string;
  createdAt: string;
};

function Conversations() {
  const [conversations, setConversations] = React.useState<ConversationsData[]>(
    []
  );
  const [selectedConversation, setSelectedConversation] =
    React.useState<ConversationsData | null>(null);
  const [messages, setMessages] = React.useState<ConversationMessages[]>([]);
  const [chatdetails, setChatDetails] = React.useState<ChatDetails[]>([]);
  const [selectedChat, setSelectedChat] = React.useState<ChatDetails | null>(
    null
  );
  const [adminReply, setAdminReply] = React.useState("");
  const getChatQuery = useQuery({
    queryFn: async () => await getAllChats(),
    queryKey: ["getAllChats"],
  });
  const getConvMutation = useMutation({
    mutationFn: async (query: string) => getConversations(query),
  });
  const deleteConvMutation = useMutation({
    mutationFn: async (query: string) => deleteConversation(query),
  });
  const getConvMessagesMutation = useMutation({
    mutationFn: async (conv_id: string) => getConversationMessages(conv_id),
  });
  const takeConvControlMut = useMutation({
    mutationFn: async (conv_id: string) => takeControl(conv_id),
  });
  const replyToConvMut = useMutation({
    mutationFn: async (data: any) => adminReplyToConversation(data),
  });

  const messageList = React.useRef(null);

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
      getConvMutation.mutate("all");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getChatQuery.data, getChatQuery.isPending, getChatQuery.error]);

  useEffect(() => {
    if (getConvMutation.error) {
      const data = (getConvMutation.error as any)?.response
        ?.data as ResponseData;
      toast.error(data?.message as string);
    }
    if (getConvMutation.data) {
      const data = getConvMutation.data as ResponseData;
      const conversations = data.data;
      setConversations(conversations);
      conversations?.length > 0 && setSelectedConversation(conversations[0]);
    }
  }, [getConvMutation.data, getConvMutation.isPending, getConvMutation.error]);

  useEffect(() => {
    if (getConvMessagesMutation.error) {
      const data = (getConvMessagesMutation.error as any)?.response
        ?.data as ResponseData;
      toast.error(data?.message as string);
    }
    if (getConvMessagesMutation.data) {
      const data = getConvMessagesMutation.data as ResponseData;
      const messages = data.data;
      setMessages(messages);
      scrollToBottom();
    }
  }, [
    getConvMessagesMutation.data,
    getConvMessagesMutation.isPending,
    getConvMessagesMutation.error,
  ]);

  // take conversation control effect
  useEffect(() => {
    if (takeConvControlMut.error) {
      const data = (takeConvControlMut.error as any)?.response
        ?.data as ResponseData;
      toast.error(data?.message as string);
    }
    if (takeConvControlMut.data) {
      // refetch conversations
      getConvMutation.mutate(selectedChat?.id as string ?? "all");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    takeConvControlMut.data,
    takeConvControlMut.isPending,
    takeConvControlMut.error,
  ]);

  // delete conversation effect
  useEffect(() => {
    if (deleteConvMutation.error) {
      const data = (deleteConvMutation.error as any)?.response
        ?.data as ResponseData;
      toast.error(data?.message as string);
    }
    if (deleteConvMutation.data) {
      // refetch conversations
      getConvMutation.mutate((selectedChat?.id as string) ?? "all");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    deleteConvMutation.data,
    deleteConvMutation.isPending,
    deleteConvMutation.error,
  ]);

  // reply to conversation
  useEffect(() => {
    if (replyToConvMut.error) {
      const data = (replyToConvMut.error as any)?.response
        ?.data as ResponseData;
      replyToConvMut.reset();
      toast.error(data?.message as string);
    }
    if (replyToConvMut.data) {
      // refetch conversations
      replyToConvMut.reset()
      getConvMessagesMutation.mutate(selectedConversation?.id as string);
      scrollToBottom()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    replyToConvMut.data,
    replyToConvMut.isPending,
    replyToConvMut.error,
  ]);

  useEffect(() => {
    if (selectedConversation) {
      // fetch conversation messages
      getConvMessagesMutation.mutate(selectedConversation.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation]);

  // on first render, scroll to bottom
  useEffect(() => {
    if(conversations.length === 0) return;
    setTimeout(() => {
      scrollToBottom();
    }, 1000);
  }, [conversations, selectedConversation]);

  const scrollToBottom = () => {
    if (!messageList?.current) return;
    const scrollHeight = (messageList?.current as any)?.scrollHeight;
    const height = (messageList?.current as any)?.clientHeight;
    const maxScrollTop = scrollHeight - height;
    (messageList?.current as any).scrollTop =
      maxScrollTop > 0 ? maxScrollTop : 0;
    (messageList?.current as any).style = "scroll-behavior: smooth";
  };

  return (
    <Layout activePage="conversations" className="bg-white-100">
      <FlexRowStart className="w-full h-full gap-0 p-0 m-0">
        {/* chat sidebar */}
        <FlexColStart className="w-full max-w-[250px] h-full overflow-y-scroll hideScrollBar p-0 m-0 gap-0">
          <FlexColStart className="w-full px-4 py-3 mb-2 border-b-solid border-b-white-300 border-b-[.5px] ">
            <select
              className="w-fit border-none outline-none bg-white-300 rounded-md text-[10px] font-ppReg px-2 py-1 "
              disabled={getChatQuery.isPending}
              onChange={(e) => {
                const chat = chatdetails.find(
                  (chat) => chat.id === e.target.value
                );
                setSelectedChat(chat || null);
                getConvMutation.mutate(e.target.value);
              }}
            >
              <option value="all">
                {getChatQuery.isPending ? "Loading..." : "All chats"}
              </option>
              {chatdetails.map((chat) => (
                <option key={chat.id} value={chat.id}>
                  {chat.name}
                </option>
              ))}
            </select>
          </FlexColStart>
          {getChatQuery.isPending || getConvMutation.isPending ? (
            <FlexColCenter className="w-full">
              <Spinner color="#000" size={15} />
            </FlexColCenter>
          ) : conversations.length > 0 ? (
            conversations.map((conv) => (
              <button
                className={cn(
                  "w-full border-l-solid border-l-[2px] border-l-transparent ",
                  selectedConversation?.id === conv.id && "border-l-red-305"
                )}
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
              >
                <FlexRowStartCenter
                  className={cn(
                    "w-full px-2 py-4 hover:bg-white-500 transition-all",
                    selectedConversation?.id === conv.id && "bg-white-500"
                  )}
                >
                  <div className="w-auto bg-orange-100  rounded-[50%] p-1">
                    <User2 size={20} className=" text-white-100 " />
                  </div>
                  <FlexColStart className="w-full gap-1">
                    <FlexRowCenterBtw className="w-full gap-5">
                      <p className="text-dark-100 font-ppB text-[12px] ">
                        Anonymous
                      </p>
                      <span className="text-white-400 font-ppR text-[11px] ">
                        {dayjs(conv.createdAt).fromNow()}
                      </span>
                    </FlexRowCenterBtw>
                    <p className="text-white-400 font-ppR text-[12px] leading-none ">
                      {conv.lastMessage.slice(0, 30).concat("...")}
                    </p>
                  </FlexColStart>
                </FlexRowStartCenter>
              </button>
            ))
          ) : (
            <FlexColCenter className="w-full py-7">
              <p className="text-dark-100 font-jbSB text-[12px] ">
                No conversations
              </p>
            </FlexColCenter>
          )}
        </FlexColStart>
        {/* main chat area */}
        <FlexColStart className="w-full h-full bg-white-200/20 relative">
          {/* header */}
          <FlexColStart className="w-full h-auto bg-white-100 shadow-sm">
            <FlexRowCenterBtw className="w-full gap-4 py-2 px-4">
              <FlexColStart className="gap-0">
                <p className="text-white-400 font-ppSB text-[12px]">ChatBot</p>
                <p className="text-dark-100 font-ppSB text-[12px]">
                  {selectedChat?.name}
                </p>
              </FlexColStart>
              <FlexRowCenterBtw>
                <button
                  onClick={() =>
                    getConvMessagesMutation.mutate(
                      selectedConversation?.id as string
                    )
                  }
                >
                  <RefreshCw
                    size={18}
                    className={cn(
                      "bg-dark-100 p-1 rounded-[50%] text-white-100",
                      getConvMessagesMutation.isPending && "animate-spin"
                    )}
                  />
                </button>

                <button>
                  <User2
                    size={18}
                    className="bg-white-400 p-1 rounded-[50%] text-white-100"
                  />
                </button>
                <button
                  className={cn(
                    "px-3 py-1 rounded-md border-solid border-white-400 font-ppSB text-dark-100 border-[1px] text-[9px] ",
                    selectedConversation?.in_control === "AI"
                      ? "bg-purple-100 text-white-100 border-transparent"
                      : "bg-orange-100 text-white-100 border-transparent",
                    takeConvControlMut.isPending ? "opacity-[.5]" : "opacity-1"
                  )}
                  onClick={() => {
                    takeConvControlMut.mutate(
                      selectedConversation?.id as string
                    );
                  }}
                  disabled={takeConvControlMut.isPending}
                >
                  {selectedConversation?.in_control === "AI"
                    ? "Take control"
                    : "Release control"}
                </button>
                <button
                  className={cn(
                    "px-3 py-1 rounded-md bg-red-305 font-ppjbSB text-white-100 text-[9px] "
                  )}
                  onClick={() => {
                    const confirm = window.confirm("Are you sure about this action?")
                    if(confirm){
                      deleteConvMutation.mutate(
                        selectedConversation?.id as string
                      );
                    }
                  }}
                  disabled={deleteConvMutation.isPending}
                >
                  delete
                </button>
              </FlexRowCenterBtw>
            </FlexRowCenterBtw>
          </FlexColStart>

          {getConvMessagesMutation.isPending && (
            <FlexColCenter className="w-auto h-auto absolute top-[5em] right-10 z-[999]">
              <Spinner color="#000" size={20} />
            </FlexColCenter>
          )}

          <FlexColStart
            ref={messageList}
            className="w-full h-full max-h-[550px] overflow-y-scroll gap-5 px-4 py-4 scroll-smooth"
          >
            {messages.length > 0 ? (
              messages.map((msg) => {
                if (msg.sender_type === "ANONYMOUS") {
                  return (
                    <FlexColEnd key={msg.id} className="w-full gap-1">
                      <FlexRowStartBtw className="w-fit">
                        <FlexColStart className={"w-fit gap-1"}>
                          <div className="text-white-100 text-[11px] font-ppSB w-fit max-w-[400px] px-4 py-2 h-auto rounded-lg bg-blue-100 leading-[15px] whitespace-wrap swissai-chat-msg">
                            <MarkdownRenderer content={msg.message} />
                          </div>
                          <p className="text-white-400 font-ppR leading-none text-[10px]">
                            {dayjs(msg.createdAt).fromNow()}
                          </p>
                        </FlexColStart>
                        <User2
                          size={25}
                          className="bg-white-400/20 p-1 rounded-[50%] text-white-100"
                        />
                      </FlexRowStartBtw>
                    </FlexColEnd>
                  );
                } else {
                  return (
                    <>
                      {msg.sender_type === "AI" && (
                        <FlexColStart key={msg.id} className="w-full gap-1">
                          <FlexRowStartBtw className="w-fit">
                            <Bot
                              size={25}
                              className="bg-blue-100 p-1 rounded-[50%] text-white-100"
                            />
                            <FlexColStart className={"w-fit gap-1"}>
                              <div className="text-dark-200 text-[11px] font-ppSB w-fit max-w-[400px] px-4 py-2 h-auto rounded-lg bg-white-400/20 leading-[15px] whitespace-wrap swissai-chat-msg">
                                <MarkdownRenderer content={msg.message} />
                              </div>
                              <p className="text-white-400 font-ppR leading-none text-[10px]">
                                {dayjs(msg.createdAt).fromNow()}
                              </p>
                              <FlexRowStart className="w-full">
                                {msg.metadata && (
                                  <a
                                    target="_blank"
                                    href={msg.metadata}
                                    className="text-dark-100 underline bg-white-400/20 px-2 py-1 text-[10px] rounded-md "
                                  >
                                    {msg.metadata}
                                  </a>
                                )}
                              </FlexRowStart>
                            </FlexColStart>
                          </FlexRowStartBtw>
                        </FlexColStart>
                      )}
                      {msg.sender_type === "ADMIN" && (
                        <FlexColStart key={msg.id} className="w-full gap-1">
                          <FlexRowStartBtw className="w-fit">
                            <Image
                              src={msg.user?.image as string}
                              width={25}
                              height={0}
                              alt="user-image"
                              className="rounded-[50%]"
                            />
                            <FlexColStart className={"w-fit gap-1"}>
                              <div className="text-dark-200 text-[11px] font-ppSB w-fit max-w-[400px] px-4 py-2 h-auto rounded-lg bg-white-400/20 leading-[15px] whitespace-wrap swissai-chat-msg">
                                <MarkdownRenderer content={msg.message} />
                              </div>
                              <p className="text-white-400 font-ppR leading-none text-[10px]">
                                {dayjs(msg.createdAt).fromNow()}
                              </p>
                              <FlexRowStart className="w-full">
                                {msg.metadata && (
                                  <a
                                    target="_blank"
                                    href={msg.metadata}
                                    className="text-dark-100 underline bg-white-400/20 px-2 py-1 text-[10px] rounded-md "
                                  >
                                    {msg.metadata}
                                  </a>
                                )}
                              </FlexRowStart>
                            </FlexColStart>
                          </FlexRowStartBtw>
                        </FlexColStart>
                      )}
                    </>
                  );
                }
              })
            ) : (
              <FlexColCenter className="w-full h-full">
                <p className="text-dark-100 font-jbEB text-[12px] ">
                  No messages
                </p>
              </FlexColCenter>
            )}
          </FlexColStart>

          <FlexColStart className="w-full bg-white-600 backdrop-blur bg-opacity-85 py-2 px-6 ">
            <FlexRowCenter className="w-full px-4 border-solid border-[.5px] border-white-600 rounded-[30px] bg-white-100 shadow-md ">
              <Input
                className="w-full text-[12px] font-jbSB border-none outline-none rounded-none hover:border-none hover:outline-none focus-visible:ring-0 bg-transparent "
                autoFocus
                placeholder="Type a message..."
                onChange={(e) => setAdminReply(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    replyToConvMut.mutate({
                      conversation_id: selectedConversation?.id as string,
                      message: adminReply,
                    });
                    setAdminReply("");
                  }
                }}
                disabled={
                  replyToConvMut.isPending || getConvMessagesMutation.isPending
                }
                value={adminReply}
              />
              <button
                onClick={() => {
                  // addChatMessage(usermsg, "user");
                  // setUserMsg("");
                }}
              >
                <SendHorizonal
                  size={30}
                  className="p-[8px] text-dark-100 rounded-md"
                />
              </button>
            </FlexRowCenter>
          </FlexColStart>

          {!selectedConversation && (
            <FlexColCenter className="w-full h-screen absolute top-0 left-0 bg-white-105">
              <FlexColCenter className="w-full h-full">
                <h1 className="text-dark-100 font-jbEB text-[18px] ">
                  Select conversation
                </h1>
                <p className="text-dark-100 font-jbSB text-[12px] ">
                  Select conversation to view messages
                </p>
              </FlexColCenter>
            </FlexColCenter>
          )}
        </FlexColStart>
      </FlexRowStart>
    </Layout>
  );
}

export default Conversations;
