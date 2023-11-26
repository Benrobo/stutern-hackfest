import { ComponentLayout } from "@/components/Layout";
import { jbEB, jbR, jbSB, ppB, ppEB, ppL, ppReg, ppSB } from "@/config/font";
import DataContextProvider from "@/context/DataContext";
import LayoutContextProvider from "@/context/LayoutContext";
import "@/styles/globals.css";
import "@radix-ui/themes/styles.css";
import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";
import { Theme } from "@radix-ui/themes";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router } from "next/router";
// import nProgress from "nprogress";
import "../styles/nprogress.css";

const queryClient = new QueryClient();

// Router.events.on("routeChangeStart", nProgress.start);
// Router.events.on("routeChangeError", nProgress.done);
// Router.events.on("routeChangeComplete", nProgress.done);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style jsx global>
        {`
          :root {
            --font-ppReg: ${ppReg.style.fontFamily};
            --font-ppB: ${ppB.style.fontFamily};
            --font-ppEB: ${ppEB.style.fontFamily};
            --font-ppSB: ${ppSB.style.fontFamily};
            --font-ppL: ${ppL.style.fontFamily};
            --font-jbR: ${jbR.style.fontFamily};
            --font-jbSB: ${jbSB.style.fontFamily};
            --font-jbEB: ${jbEB.style.fontFamily};
          }
        `}
      </style>
      <ClerkProvider>
        <QueryClientProvider client={queryClient}>
          <DataContextProvider>
            <LayoutContextProvider>
                <ComponentLayout>
                  <Theme>
                    <Component {...pageProps} />
                  </Theme>
                </ComponentLayout>
                <Toaster />
            </LayoutContextProvider>
          </DataContextProvider>
        </QueryClientProvider>
      </ClerkProvider>
    </>
  );
}
