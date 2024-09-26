import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "@rainbow-me/rainbowkit/styles.css";

import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import { createConfig, http, WagmiProvider } from "wagmi";
import { mainnet } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { walletConnectWallet } from "@rainbow-me/rainbowkit/wallets";

const wallets = [
  {
    groupName: "Recommended",
    wallets: [walletConnectWallet],
  },
];

const connectors = connectorsForWallets(wallets, {
  projectId: "af3e2e9e7f3bdcb753209523f3b24ca0",
  appName: "Sonar",
});

const config = createConfig({
  chains: [mainnet],
  connectors,
  transports: {
    [mainnet.id]: http("https://mainnet.example.com"),
  },
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact" theme={darkTheme()}>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
