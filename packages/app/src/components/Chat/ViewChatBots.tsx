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
import { Bot, SendHorizonal } from "lucide-react";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { sleep } from "@/pages/api/utils";

function ViewChatBots() {
  return (
    <FlexColStart className="w-full h-full">
      <FlexRowStartBtw className="w-fit px-4">
        <select className="w-auto px-3 rounded-md py-2 bg-dark-200 text-white-100 font-jbSB text-[12px]">
          <option value="">Select created chatbots</option>
        </select>
      </FlexRowStartBtw>
      <FlexRowStartBtw className="w-full h-full gap-2">
        <FlexColStart className="w-full h-full px-4 border-r-solid border-r-[.5px] border-r-white-600 ">
          <br />
          <p className="text-gray-100 font-jbR text-[12px] ">chatbot name</p>
          <p className="text-white-100 font-jbEB">Againbot</p>
          <p className="text-gray-100 font-jbR text-[12px] ">agent name</p>
          <p className="text-white-100 font-jbEB">Agentname</p>
        </FlexColStart>
        <FlexStartColCenter className="w-full h-full px-7 py-5 hideScrollBar overflow-y-scroll bg-white-100 pb-9">
          <FunctionalPreviewChatInterface botName="Benrobo" />
        </FlexStartColCenter>
      </FlexRowStartBtw>
    </FlexColStart>
  );
}

export default ViewChatBots;

interface IChatProps {
  botName: string;
}

const messages = [
  {
    type: "bot",
    message: "Hello, how can I help you?",
  },
  {
    type: "user",
    message: "I'm looking for information on your products.",
  },
  {
    type: "bot",
    message:
      "Sure, we have a variety of products. Can you specify the category?",
  },
  {
    type: "user",
    message: "I'm interested in electronics.",
  },
  {
    type: "bot",
    message:
      "Great! We have a wide range of electronic products. Are you looking for something specific like laptops, smartphones, or something else?",
  },
  {
    type: "user",
    message: "I'm looking for a laptop.",
  },
  {
    type: "bot",
    message:
      "We have a variety of laptops. What specifications are you looking for?",
  },
  {
    type: "user",
    message:
      "I need a laptop with at least 16GB RAM, an i7 processor, and a 1TB SSD.",
  },
  {
    type: "bot",
    message:
      "Sure, we have several laptops that match your specifications. Would you like to see the options?",
  },
  {
    type: "user",
    message: "Yes, please.",
  },
  {
    type: "bot",
    message: "Here are some options for you: [Laptop 1, Laptop 2, Laptop 3].",
  },
  {
    type: "user",
    message: "I like the second option. How much does it cost?",
  },
  {
    type: "bot",
    message:
      "Laptop 2 costs $1200. Would you like to proceed with the purchase?",
  },
  {
    type: "user",
    message: "Yes, I would like to buy it.",
  },
  {
    type: "bot",
    message: "Great! I'll guide you through the purchase process.",
  },
  {
    type: "user",
    message: "Thank you.",
  },
  {
    type: "bot",
    message:
      "You're welcome! If you have any other questions, feel free to ask.",
  },
] satisfies Message[];

type Message = {
  type: "user" | "bot";
  message: string;
};

function FunctionalPreviewChatInterface({ botName }: IChatProps) {
  const [chatMessages, setChatMessages] = useState<Message[]>(messages);
  const [usermsg, setUserMsg] = useState<string>("");

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
    const newMessage = { message, type };
    setChatMessages([...chatMessages, newMessage]);
    scrollToBottom();
  };

  //   on first render, scroll to bottom
  useEffect(() => {
    setTimeout(() => {
      scrollToBottom();
    }, 2000);
  }, []);

  useEffect(() => {
    if (chatMessages[chatMessages.length - 1].type === "user") {
      setTimeout(() => {
        addChatMessage("Bot reply here", "bot");
        scrollToBottom();
      }, 1000);
    }
  }, [chatMessages]);

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
        {/* <FlexRowStartCenter className="px-5 gap-5">
          <Bot
            size={25}
            className="bg-blue-100 p-1 rounded-[50%] text-white-100"
          />
          <div className="dot-falling"></div>
        </FlexRowStartCenter> */}
        {chatMessages.map((m, i) => {
          if (m.type === "user") {
            return (
              <FlexColEnd key={i} className="w-full">
                <FlexRowCenterBtw className="w-fit">
                  <FlexColStart
                    className={
                      "w-fit max-w-[200px] px-4 py-2 h-auto rounded-lg bg-blue-100"
                    }
                  >
                    <span className="text-white-100 text-[11px] font-ppR ">
                      {m.message}
                    </span>
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
                    <span className="text-dark-200 text-[11px] font-ppR w-fit max-w-[200px] px-4 py-2 h-auto rounded-lg bg-white-500 leading-[15px] ">
                      {m.message}
                    </span>
                    {/* <span className="text-dark-300 font-jbB text-[8px] leadine-none">1hr ago</span> */}
                  </FlexColStart>
                </FlexRowStartBtw>
              </FlexColStart>
            );
          }
        })}

        {/* <div style={{ float: "left", clear: "both" }} /> */}
        <div className="pb-[9em]" />
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
