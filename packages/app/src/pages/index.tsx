import { FlexColCenter, FlexColStart, FlexRowCenterBtw, FlexRowStart, FlexRowStartBtw } from "@/components/Flex";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { BrainCircuit, Clock4, GaugeCircle } from "lucide-react";
import Image from "next/image";


export default function Home() {
  const {user, isLoaded} = useUser();

  return (
    <FlexColStart className="h-full w-full items-center justify-center">
      <FlexRowCenterBtw className="w-full h-auto gap-2 py-5 px-[4em]">
        <p className="font-jbEB text-white-100">
          Swiss<span className="text-blue-300">AI</span>
        </p>
        {!isLoaded ? (
          <Spinner />
        ) : (
          <a href={user ? "/dashboard" : "/auth"}>
            <p className="text-blue-300 underline text-[13px] font-jbEB">
              {user ? "Dashboard" : "Sign-in"}
            </p>
          </a>
        )}
      </FlexRowCenterBtw>
      <br />
      <FlexRowCenterBtw className="w-full h-full min-h-[400px] gap-4 px-[4em]">
        <FlexColStart className="w-auto h-auto">
          <h1 className="text-white-100 font-jbEB font-extrabold text-4xl">
            Revolutionize Customer Service with{" "}
            <span className="text-blue-100">AI-Powered</span> Chat Agents
          </h1>
          <p className="text-white-100 font-jbSB">
            Shape the Future of Customer Interaction, Enhancing Business
            Efficiency and Client Satisfaction.
          </p>
          <br />
          <button onClick={() => (window.location.href = "/auth")}>
            <Button className="w-auto px-6 font-jbEB" variant={"primary"}>
              Try for free
            </Button>
          </button>
        </FlexColStart>
        <Image
          src={"/images/header1.png"}
          className="w-[400px] rounded-lg border-solid border-[5px] border-blue-100 "
          alt="header-img"
          width={600}
          height={0}
        />
      </FlexRowCenterBtw>
      <br />
      <div className="w-full h-auto bg-dark-300 grid grid-cols-3 grid-rows-1 px-[4em] py-8">
        <FlexColStart className="w-full h-auto max-w-[300px]">
          <FlexRowStart className="w-full h-auto">
            <Clock4 size={15} className="text-red-305" />
            <p className="text-white-100 font-jbEB">24/7 Availability.</p>
          </FlexRowStart>
          <FlexColStart className="w-full h-auto">
            <p className="text-white-100 font-jbSB text-[13px]">
              Our AI chat agent is available round the clock, ensuring
              assistance at any time.
            </p>
          </FlexColStart>
        </FlexColStart>
        <FlexColStart className="w-full h-auto max-w-[300px]">
          <FlexRowStart className="w-full h-auto">
            <BrainCircuit size={15} className="text-blue-100" />
            <p className="text-white-100 font-jbEB">Intuitive Understanding.</p>
          </FlexRowStart>
          <FlexColStart className="w-full h-auto">
            <p className="text-white-100 font-jbSB text-[13px]">
              Intuitively understands and responds to diverse customer needs,
              providing personalized interactions.
            </p>
          </FlexColStart>
        </FlexColStart>
        <FlexColStart className="w-full h-auto max-w-[300px]">
          <FlexRowStart className="w-full h-auto">
            <GaugeCircle size={15} className="text-green-400" />
            <p className="text-white-100 font-jbEB">Enhanced Efficiency.</p>
          </FlexRowStart>
          <FlexColStart className="w-full h-auto">
            <p className="text-white-100 font-jbSB text-[13px]">
              Revolutionize your business efficiency by automating customer
              interactions with cutting-edge AI technology.
            </p>
          </FlexColStart>
        </FlexColStart>
      </div>
    </FlexColStart>
  );
}
