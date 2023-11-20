import {
  FlexColCenter,
  FlexColStart,
  FlexRowCenterBtw,
  FlexRowStart,
  FlexRowStartBtw,
} from "@/components/Flex";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FileText, Theater } from "lucide-react";
import React, { useState } from "react";

const Tabs = ["Widget", "Training Data"] as const;

function Chat() {
  const [activeTab, setActiveTab] = useState<(typeof Tabs)[number]>("Widget");

  return (
    <Layout activePage="chatbots">
      <FlexColStart className="w-full px-5 py-5">
        <FlexRowCenterBtw className="w-full">
          <h1 className="text-white-100 font-ppSB">Create chatbot</h1>
          <Button
            variant={"primary"}
            className=" text-white-100 font-ppSB text-[13px]"
          >
            Create Bot
          </Button>
        </FlexRowCenterBtw>

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
        {activeTab === "Training Data" && <ChatTrainingData />}
      </FlexColStart>
    </Layout>
  );
}

export default Chat;

function ChatWidget() {
  return (
    <FlexRowStartBtw className="w-full h-full">
      <FlexColStart className="w-full h-full">
        <Input placeholder="Name" />
        <Input placeholder="Agent Name" />
      </FlexColStart>
      <FlexColStart className="w-fit h-full min-h-[400px] min-w-[400px] bg-blue-200 ">
        output comp
      </FlexColStart>
    </FlexRowStartBtw>
  );
}

function ChatTrainingData() {
  const [selectedDataType, setSelectedDataType] = useState<"file" | "webpage">(
    "file"
  );
  const [links, setLinks] = useState([])

  return (
    <FlexColStart className="w-full h-full">
      <p className="text-white-100">Training Data</p>
      {/* Tags to differentiate choosen selected data type */}

      <FlexRowStart className="w-full h-fit">
        <Button
          variant="primary"
          className="text-white-100 text-[8px] scale-[.95] font-ppSB"
          disabled
        >
          Upload File
        </Button>
        <Button
          variant="primary"
          className="text-white-100 text-[8px] scale-[.95] font-ppSB"
        >
          Webpage
        </Button>
      </FlexRowStart>

      {/* Input field to enter webpage url */}
      <FlexRowStart className="w-full mt-3">
        <Input placeholder="Enter webpage url" type="url" className="w-auto min-w-[300px] bg-dark-200 border-none text-white-100 placeholder:text-white-300 text-[12px] font-ppR" />
        <Button
          variant="primary"
          className="text-white-100 text-[8px] scale-[.95] font-ppSB"
        >
          Fetch Links
        </Button>
      </FlexRowStart>

      {/* fetched urls */}
      <FlexColStart className="w-full">
        <li className="">
          <a href="#" className="text-white-300 text-[12px] font-ppSB">
            https://www.example.com
          </a>
        </li>
      </FlexColStart>
    </FlexColStart>
  );
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
