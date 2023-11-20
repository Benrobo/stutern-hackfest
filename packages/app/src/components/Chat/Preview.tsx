import React from 'react'
import { FlexColCenter, FlexColEnd, FlexColStart, FlexRowCenter, FlexRowCenterBtw, FlexRowStart, FlexRowStartBtw } from '../Flex'
import { cn } from '@/lib/utils'
import { Bot, SendHorizonal } from 'lucide-react';
import { Input } from '../ui/input';

interface Props {
    botName: string;      
}

function ChatPreview({botName}: Props) {
  return (
    <FlexColStart className="w-full h-full min-h-[500px] max-w-[350px] rounded-lg bg-white-100 shadow-lg overflow-hidden relative ">
      {/* header */}
      <FlexColStart className={cn("w-full h-auto p-4 ", "bg-blue-100")}>
        <p className={cn("text-[15px] text-white-100 font-ppSB")}>{botName.length > 0 ? botName : "ChatBot"}</p>
      </FlexColStart>
      <br />
      {/* Messages */}
      <FlexColStart className="w-full h-full px-3">
        <FlexColEnd className="w-full">
          <FlexRowCenterBtw className="w-fit">
            <FlexColStart
              className={
                "w-fit max-w-[200px] px-4 py-2 h-auto rounded-lg bg-blue-100"
              }
            >
              <span className="text-white-100 text-[11px] font-ppR ">
                User message here!!
              </span>
            </FlexColStart>
          </FlexRowCenterBtw>
        </FlexColEnd>

        <FlexColStart className="w-full">
          <FlexRowStartBtw className="w-fit">
            <Bot
              size={25}
              className="bg-blue-100 p-1 rounded-[50%] text-white-100"
            />
            <FlexColStart
              className={"w-fit"}
            >
              <span className="text-dark-200 text-[11px] font-ppR w-fit max-w-[200px] px-4 py-2 h-auto rounded-lg bg-white-500 leading-[15px] ">
                Bot messages here, welcome
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Fuga accusantium officiis nobis inventore autem nam, voluptatum ab accusamus aspernatur eveniet?
              </span>
              {/* <span className="text-dark-300 font-jbB text-[8px] leadine-none">1hr ago</span> */}
            </FlexColStart>
          </FlexRowStartBtw>
        </FlexColStart>
      </FlexColStart>

      {/* Input */}
      <FlexColStart className="w-full absolute bottom-0 py-2">
        <FlexRowCenter className="w-full px-4 mt-2 border-t-solid border-b-solid border-t-[.5px] border-b-[.5px] border-t-gray-100/50 border-b-gray-100/50 ">
          <Input
            className="w-full text-[12px] font-jbSB border-none outline-none rounded-none hover:border-none hover:outline-none focus-visible:ring-0 "
            autoFocus
            placeholder='Type a message...'
            disabled
          />
          <button>
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

export default ChatPreview