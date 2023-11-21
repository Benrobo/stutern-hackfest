import { FlexColEnd, FlexColStart, FlexRowCenter, FlexRowCenterBtw, FlexRowStart, FlexRowStartBtw, FlexRowStartCenter } from '@/components/Flex'
import Layout from '@/components/Layout'
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Bot, SendHorizonal, User2 } from 'lucide-react';
import React from 'react'


type ConversationsData = {
  
}

function Conversations() {

  const [conversations, setConversations]  = React.useState<any[]>([]);

  return (
    <Layout activePage="conversations" className="bg-white-100">
      <FlexRowStart className="w-full h-full gap-0 p-0 m-0">
        {/* chat sidebar */}
        <FlexColStart className="w-full max-w-[250px] h-full overflow-y-scroll hideScrollBar p-0 m-0 gap-0">
          <FlexColStart className="w-full px-4 py-3 mb-2 border-b-solid border-b-white-300 border-b-[.5px] ">
            <select className="w-fit border-none outline-none bg-white-300 rounded-md text-[10px] font-ppReg px-2 py-1 ">
              <option value="all">Chatbot: All</option>
            </select>
          </FlexColStart>
          <ChatLists />
        </FlexColStart>
        {/* main chat area */}
        <FlexColStart className="w-full h-full bg-white-200/20 relative">
          {/* header */}
          <FlexColStart className="w-full h-auto bg-white-100 shadow-sm">
            <FlexRowCenterBtw className="w-full gap-4 py-2 px-4">
              <FlexColStart className="gap-0">
                <p className="text-white-400 font-ppSB text-[12px]">ChatBot</p>
                <p className="text-dark-100 font-ppSB text-[12px]">Apple</p>
              </FlexColStart>
              <FlexRowCenterBtw>
                <button>
                  <User2
                    size={18}
                    className="bg-white-400 p-1 rounded-[50%] text-white-100"
                  />
                </button>
                <button className="px-3 py-1 rounded-md border-solid border-white-400 font-ppSB text-dark-100 border-[1px] text-[9px] ">
                  Take control
                </button>
              </FlexRowCenterBtw>
            </FlexRowCenterBtw>
          </FlexColStart>
          <FlexColStart className="w-full h-full max-h-[550px] overflow-y-scroll hideScrollBar gap-5 px-4 py-4">
            {/* user message */}
            <FlexColEnd key={1} className="w-full gap-1">
              <FlexRowStartBtw className="w-fit">
                <FlexColStart className={"w-fit gap-1"}>
                  <div className="text-white-100 text-[11px] font-ppSB w-fit max-w-[400px] px-4 py-2 h-auto rounded-lg bg-blue-100 leading-[15px] whitespace-wrap ">
                    Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                    Mollitia sapiente numquam, accusamus iusto nisi architecto!
                    Voluptates dignissimos placeat sed voluptatum.
                  </div>
                  <p className="text-white-400 font-ppR leading-none text-[10px]">
                    3 minutes ago
                  </p>
                </FlexColStart>
                <User2
                  size={25}
                  className="bg-white-400/20 p-1 rounded-[50%] text-white-100"
                />
              </FlexRowStartBtw>
            </FlexColEnd>

            {/* bot */}
            <FlexColStart key={1} className="w-full gap-1">
              <FlexRowStartBtw className="w-fit">
                <Bot
                  size={25}
                  className="bg-blue-100 p-1 rounded-[50%] text-white-100"
                />
                <FlexColStart className={"w-fit gap-1"}>
                  <div className="text-dark-200 text-[11px] font-ppSB w-fit max-w-[400px] px-4 py-2 h-auto rounded-lg bg-white-400/20 leading-[15px] whitespace-wrap ">
                    Bot message
                  </div>
                  <p className="text-white-400 font-ppR leading-none text-[10px]">
                    3 minutes ago
                  </p>
                </FlexColStart>
              </FlexRowStartBtw>
            </FlexColStart>
          </FlexColStart>

          <FlexColStart className="w-full bg-white-600 backdrop-blur bg-opacity-85 py-2 px-6 ">
            <FlexRowCenter className="w-full px-4 border-solid border-[.5px] border-white-600 rounded-[30px] bg-white-100 shadow-md ">
              <Input
                className="w-full text-[12px] font-jbSB border-none outline-none rounded-none hover:border-none hover:outline-none focus-visible:ring-0 bg-transparent "
                autoFocus
                placeholder="Type a message..."
                // onChange={(e) => setUserMsg(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    // addChatMessage(usermsg, "user");
                    // setUserMsg("");
                  }
                }}
                // value={usermsg}
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
        </FlexColStart>
      </FlexRowStart>
    </Layout>
  );
}

export default Conversations

function ChatLists(){
  return (
    <button className='w-full border-l-solid border-l-[2px] border-l-red-305 '>
      <FlexRowStartCenter className={cn("w-full px-2 py-2", "bg-white-500")}>
        <div className="w-auto bg-orange-100  rounded-[50%] p-1">
          <User2 size={20} className=" text-white-100 " />
        </div>
        <FlexColStart className="w-full gap-1">
          <FlexRowCenterBtw className="w-full gap-5">
            <p className="text-dark-100 font-ppB text-[12px] ">Anonymous</p>
            <span className="text-white-400 font-ppR text-[11px] ">
              an hour ago
            </span>
          </FlexRowCenterBtw>
          <p className="text-white-400 font-ppR text-[12px] leading-none ">
            last message sent ...
          </p>
        </FlexColStart>
      </FlexRowStartCenter>
    </button>
  );
}