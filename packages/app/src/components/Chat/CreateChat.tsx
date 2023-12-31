import { cn, logout } from "@/lib/utils";
import { ArrowLeft, Bot, FileText, Theater, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  FlexColEnd,
  FlexColStart,
  FlexRowCenterBtw,
  FlexRowStart,
  FlexRowStartBtw,
  FlexRowStartCenter,
} from "../Flex";
import { Spinner } from "../Spinner";
import { useMutation } from "@tanstack/react-query";
import { createChat, extractLinks } from "@/lib/http/requests";
import toast from "react-hot-toast";
import { ResponseData } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ChatPreview from "./Preview";

const Tabs = ["Widget", "Training Data"] as const;

interface Props {
  goBack: () => void;
}

function CreateChat({ goBack }: Props) {
  const [activeTab, setActiveTab] = useState<(typeof Tabs)[number]>("Widget");
  const [links, setLinks] = useState<{ url: string; content: string }[] | []>(
    []
  );
  const [activeView, setActiveView] = useState<"view-chats" | "create-chat">(
    "view-chats"
  );
  const [datasourceType, setDatasourceType] = useState<"file" | "webpage">(
    "webpage"
  );
  const [fileteredLinks, setFilteredLinks] = useState<string[]>([]);
  const [webpageUrl, setWebPageUrl] = useState("");
  const [botDetails, setBotDetails] = useState({
    name: "",
    agent_name: "",
  });
  const extractPageLinkMutation = useMutation({
    mutationFn: async (data: any) => await extractLinks(data),
  });
  const createChatMutation = useMutation({
    mutationFn: async (data: any) => await createChat(data),
  });

  const extractWebpageUrlLinks = () => {
    if (!webpageUrl) return toast.error("Please enter a valid url");

    extractPageLinkMutation.mutate({ url: webpageUrl });
  };

  const filterLinks = (url: string) => {
    const filtered = links.filter((link) => link.url !== url);
    setLinks(filtered);
    const _prev = fileteredLinks;
    const comb = [..._prev, url] as string[];
    setFilteredLinks(comb);
  };

  const disableButton = () => {
    if (links.length === 0) return true;
    if (botDetails.name === "") return true;
    if (botDetails.agent_name === "") return true;
    if (createChatMutation.isPending) return true;
    return false;
  };

  useEffect(() => {
    if (extractPageLinkMutation.error) {
      const data = (extractPageLinkMutation.error as any)?.response
        ?.data as ResponseData;
      toast.error(data?.message as string);
    }
    if (extractPageLinkMutation.data) {
      const data = extractPageLinkMutation.data as ResponseData;
      setLinks(data.data);
    }
  }, [
    extractPageLinkMutation.data,
    extractPageLinkMutation.isPending,
    extractPageLinkMutation.error,
  ]);

  useEffect(() => {
    if (createChatMutation.error) {
      const data = (createChatMutation.error as any)?.response
        ?.data as ResponseData;
      console.log({ code: data.code });
      if (data.code === "UNAUTHORIZED") {
        toast.error("Please login to continue");
        logout();
        return;
      }
      toast.error(data?.message as string);
    }
    if (createChatMutation.data) {
      const data = createChatMutation.data as ResponseData;

      if (!data.errorStatus) {
        toast.success(`Chatbot created successfully`);
        createChatMutation.reset();

        setLinks([]);
        setWebPageUrl("");
        setBotDetails({ name: "", agent_name: "" });
        setFilteredLinks([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    createChatMutation.data,
    createChatMutation.isPending,
    createChatMutation.error,
  ]);

  function handleCreateChat() {
    const payload = {
      name: botDetails.name,
      agent_name: botDetails.agent_name,
      filtered_links: fileteredLinks,
      webpage_url: webpageUrl,
      type: datasourceType,
    };

    if (!payload.name) return toast.error("Please enter a valid name");
    if (!payload.agent_name)
      return toast.error("Please enter a valid agent name");

    createChatMutation.mutate(payload);
  }

  return (
    <FlexColStart className="w-full h-screen px-5 py-2">
      <button onClick={goBack}>
        <FlexRowStartCenter>
          <ArrowLeft size={15} className="text-white-100" />
          <span className="text-white-200 font-jbR text-[12px] underline">
            back
          </span>
        </FlexRowStartCenter>
      </button>
      <FlexRowCenterBtw className="w-full">
        <h1 className="text-white-100 font-jbEB">Create chatbot</h1>
        <Button
          variant={"primary"}
          className=" text-white-100 gap-3 font-jbEB py-2 text-[12px]"
          disabled={disableButton()}
          onClick={handleCreateChat}
        >
          {createChatMutation.isPending ? (
            <Spinner color="#fff" size={15} />
          ) : (
            <Bot className="" size={20} />
          )}
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

      {activeTab === "Widget" && (
        <ChatWidget botDetails={botDetails} setBotDetails={setBotDetails} />
      )}
      {activeTab === "Training Data" && (
        <ChatTrainingData
          extractPageLinkMutation={extractPageLinkMutation}
          links={links}
          setLinks={setLinks}
          webpageUrl={webpageUrl}
          setWebPageUrl={setWebPageUrl}
          extractWebpageUrlLinks={extractWebpageUrlLinks}
          filterLinks={filterLinks}
        />
      )}
    </FlexColStart>
  );
}

export default CreateChat;

interface ChatWidgetProps {
  botDetails: {
    name: string;
    agent_name: string;
  };
  setBotDetails: React.Dispatch<
    React.SetStateAction<{
      name: string;
      agent_name: string;
    }>
  >;
}

function ChatWidget({ botDetails, setBotDetails }: ChatWidgetProps) {
  return (
    <FlexColStart className="w-full h-screen">
      <FlexRowStartBtw className="w-full h-screen overflow-h-scroll">
        <FlexColStart className="w-fit min-w-[300px] h-full">
          <FlexColStart className="w-full">
            <p className="text-white-100 font-jbSB">Chatbot Widget</p>
            <p className="text-gray-100 font-jbSB text-[12px] ">
              Create chatbot widget
            </p>
          </FlexColStart>
          <br />
          <Input
            className="text-[13px] text-white-100 border-none placeholder:text-white-300 placeholder:opacity-[.6] font-jbSB bg-dark-200"
            placeholder="Name"
            value={botDetails.name}
            onChange={(e) =>
              setBotDetails((prev) => ({ ...prev, name: e.target.value }))
            }
          />
          <Input
            className="text-[13px] text-white-100 border-none placeholder:text-white-300 placeholder:opacity-[.6] font-jbSB bg-dark-200"
            placeholder="Agent Name"
            value={botDetails.agent_name}
            onChange={(e) =>
              setBotDetails((prev) => ({
                ...prev,
                agent_name: e.target.value,
              }))
            }
          />
        </FlexColStart>
        <FlexColEnd className="w-full h-auto px-9 overflow-h-scroll ">
          <ChatPreview botName={botDetails?.name} />
          <br />
        </FlexColEnd>
      </FlexRowStartBtw>
    </FlexColStart>
  );
}

interface ChatTrainingDataProps {
  links: { url: string; content: string }[];
  setLinks: React.Dispatch<
    React.SetStateAction<{ url: string; content: string }[]>
  >;
  webpageUrl: string;
  setWebPageUrl: React.Dispatch<React.SetStateAction<string>>;
  extractPageLinkMutation: any;
  extractWebpageUrlLinks: () => void;
  filterLinks: (url: string) => void;
}

function ChatTrainingData({
  links,
  setLinks,
  webpageUrl,
  setWebPageUrl,
  extractPageLinkMutation,
  extractWebpageUrlLinks,
  filterLinks,
}: ChatTrainingDataProps) {
  const [selectedDataType, setSelectedDataType] = useState<"file" | "webpage">(
    "file"
  );

  return (
    <FlexColStart className="w-full h-screen overflow-auto">
      <FlexRowStartCenter>
        <p className="text-white-100 font-jbSB">Training Data</p>
      </FlexRowStartCenter>
      <br />
      {/* Tags to differentiate choosen selected data type */}

      <FlexRowStart className="w-full h-fit">
        <Button
          variant="appeal"
          className="text-white-100 text-[8px] scale-[.95] font-jbSB"
          disabled
        >
          Upload File
        </Button>
        <Button
          variant="appeal"
          className="text-white-100 text-[8px] scale-[.95] font-jbSB"
        >
          Webpage
        </Button>
      </FlexRowStart>

      {/* Input field to enter webpage url */}
      <FlexRowStart className="w-full mt-3">
        <Input
          placeholder="Enter webpage url"
          type="url"
          className="w-auto min-w-[300px] bg-dark-200 border-none text-white-100 placeholder:text-white-300 text-[12px] font-ppR"
          onChange={(e: any) => setWebPageUrl(e.target.value)}
          value={webpageUrl}
        />
        <Button
          variant="primary"
          className="text-white-100 text-[8px] scale-[.95] font-jbSB"
          onClick={extractWebpageUrlLinks}
          disabled={extractPageLinkMutation.isPending}
        >
          {extractPageLinkMutation.isPending ? "Loading..." : "Fetch Links"}
        </Button>
      </FlexRowStart>

      {/* fetched urls */}
      <FlexColStart className="w-full h-full overflow-auto">
        {links.length > 0 &&
          !extractPageLinkMutation.isPending &&
          links.map((link, i) => (
            <FlexRowCenterBtw className="" key={i}>
              <a href="#" className="text-white-300 text-[12px] font-jbSB">
                {link?.url.length > 100
                  ? link?.url.slice(0, 100).concat("...")
                  : link?.url}
              </a>
              <button onClick={() => filterLinks(link.url)}>
                <X className="text-red-305" size={15} />
              </button>
            </FlexRowCenterBtw>
          ))}
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
