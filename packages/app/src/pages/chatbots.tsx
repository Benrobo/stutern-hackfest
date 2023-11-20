import { FlexColCenter, FlexColStart, FlexRowCenterBtw, FlexRowStart, FlexRowStartBtw } from '@/components/Flex'
import Layout from '@/components/Layout'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { FileText, Theater } from 'lucide-react';
import React, { useState } from 'react'

const Tabs = ["Widget", "Training Data"] as const;


function Chat() {
const [activeTab, setActiveTab] =
  useState<(typeof Tabs)[number]>("Widget");
  

  return (
    <Layout activePage="chatbots">
      <FlexColStart className="w-full px-5 py-5">
        <FlexRowStart className="w-fit mt-9 border-b-solid border-b-[1px] border-b-white-600 gap-0 ">
          {Tabs.map((t) => (
            <Button
              key={t}
              className={cn(
                "bg-transparent text-[13px] text-white-100 rounded-t-[10px] rounded-b-none rounded-l-none rounded-r-none group transition-all gap-2 border-solid border-[1px]",
                activeTab === t
                  ? " border-b-transparent border-t-white-600 border-l-white-600 border-r-white-600 bg-dark-200 hover:bg-dark-200 "
                  : "border-transparent text-gray-100 hover:bg-transparent"
              )}
              onClick={() => {
                setActiveTab(t);
                // setProjectOptions(t === "Fine-Tuned" ? "FineTuned" : t);
              }}
            >
              {renderBaseTabIcon(t, activeTab)}
              <span
                className={cn(
                  "font-ppR group-hover:text-white-100 text-[10px] transition-all",
                  activeTab === t ? "text-white-100" : "text-gray-100"
                )}
              >
                {t}
              </span>
            </Button>
          ))}
        </FlexRowStart>

        {activeTab === "Widget" && <ChatWidget />}
          
      </FlexColStart>
    </Layout>
  );
}

export default Chat


function ChatWidget(){
  return (
    <FlexRowStartBtw className='w-full h-full'>
      <FlexColStart className='w-full h-full'>
        <Input placeholder='Name' />
        <Input placeholder='Agent Name' />
      </FlexColStart>
      <FlexColStart className='w-fit h-full min-h-[400px] min-w-[400px] bg-blue-200 '>
        output comp
      </FlexColStart>
    </FlexRowStartBtw>
  )
}


function renderBaseTabIcon(
  tab: (typeof Tabs)[number],
  activeTab: (typeof Tabs)[number]
) {
  let icon = null;
  if (tab === "Widget") {
    icon = (
      <Theater
        className={cn(
          "group-hover:text-white-100 text-white-300",
          tab === activeTab && "text-white-100"
        )}
        width={15}
        height={15}
      />
    );
  }
  if (tab === "Training Data") {
    icon = (
      <FileText
        className={cn(
          "group-hover:text-white-100 text-white-300",
          tab === activeTab && "text-white-100"
        )}
        width={15}
        height={15}
      />
    );
  }
  return icon;
}