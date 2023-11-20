import Layout from "@/components/Layout";
import DataContextProvider from "@/context/DataContext";
import "@/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <DataContextProvider>
        <ClerkProvider>
          <Component {...pageProps} />
        </ClerkProvider>
      </DataContextProvider>
    </Layout>
  );
}
