import "@unocss/reset/tailwind.css";
import "../style.css";
import "react-day-picker/dist/style.css";

import { QueryClientProvider } from "@tanstack/react-query";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import Head from "next/head";

import { Layout } from "../components/Layout";
import { queryClient } from "../lib/client/queryClient";

// eslint-disable-next-line new-cap
const inter = Inter({ subsets: ["latin"] });

const App: NextPage<AppProps> = ({ Component, pageProps }) => (
  <>
    <Head>
      <title>Hood</title>
    </Head>
    <main className={inter.className}>
      <QueryClientProvider client={queryClient}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </QueryClientProvider>
    </main>
  </>
);

export default App;
