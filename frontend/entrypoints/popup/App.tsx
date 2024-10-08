import Separator from "@/components/separator";
import { Switch } from "@headlessui/react";
import { WalletButton } from "@rainbow-me/rainbowkit";
import { CloudCogIcon, GlobeLockIcon, WalletIcon } from "lucide-react";
import "~/assets/tailwind.css";
import Button from "@/components/button";
import { useAccount, useDisconnect } from "wagmi";
import { formatAddress } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";
import { saveAs } from 'file-saver';

function App() {
  const { disconnect } = useDisconnect();
  const { isConnected, address } = useAccount();
  const [enabled, setEnabled] = useState(true);
  const [data, setData] = useState<chrome.tabs.Tab | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);
  const [ipfsHash, setIpfsHash] = useState<string | null>(null);

  useEffect(() => {
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      ([tab]) => {
        setData(tab);
      }
    );
  }, []);

  const handleSave = useCallback(() => {
    if (!data || !data.id) return;

    setIsSaving(true);
    setSaveStatus(null);
    setDisplayUrl(null);
    setIpfsHash(null);

    chrome.tabs.sendMessage(data.id, { action: "saveMHTML" }, async (response) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        setIsSaving(false);
        setSaveStatus("Error: " + chrome.runtime.lastError.message);
        setTimeout(() => setSaveStatus(null), 5000);
        return;
      }

      if (!response || response.error) {
        console.error("Failed to get MHTML data:", response?.error);
        setIsSaving(false);
        setSaveStatus("Error: Failed to get MHTML data");
        setTimeout(() => setSaveStatus(null), 5000);
        return;
      }

      const blob = new Blob([response.mhtmlData], { type: "application/x-mimearchive" });

      const uid = address ?? "0x0000000000000000000000000000000000000000";
      const url = data.url ?? "";
      const body = new FormData();
      body.append("uid", uid);
      body.append("url", url);
      body.append("file", blob, "snapshot.mhtml");

      try {
        const result = await fetch("http://35.209.74.136:9000/snapshot/upload", {
          method: "POST",
          body: body,
        });

        const jsonResult = await result.json();

        if (result.ok) {
          setSaveStatus("Success");
          setDisplayUrl(jsonResult.display_url.replace("localhost", "35.209.74.136"));
          setIpfsHash(jsonResult.ipfs_hash);
        } else {
          setSaveStatus("Error: " + jsonResult.message);
        }

        setIsSaving(false);
        setTimeout(() => {
          setSaveStatus(null);
          setDisplayUrl(null);
          setIpfsHash(null);
        }, 5000);
      } catch (error) {
        console.error(error);
        setIsSaving(false);
        setSaveStatus("Error: " + (error instanceof Error ? error.message : String(error)));
        setTimeout(() => setSaveStatus(null), 5000);
      }
    });
  }, [data, address]);

  // todo: add the landing page of the blank page

  return (
    <div className="p-6 bg-zinc-800 text-white w-[400px] min-h-[800px]">
      <div className="flex flex-col items-start gap-6">
        <div className="flex items-center gap-4">
          {!data?.favIconUrl ? (
            <div className="w-8 h-8 bg-orange-400 rounded-full" />
          ) : (
            <img
              src={data?.favIconUrl ?? "https://www.google.com/favicon.ico"}
              className="object-cover rounded-full"
              alt="favicon"
              width={32}
              height={32}
            />
          )}
          <div className="flex flex-col -space-y-0">
            <span className="text-sm truncate max-w-[300px]">
              {data?.title ?? "Untitled"}
            </span>
            <span className="text-xs truncate opacity-60 max-w-[200px]">
              {data?.url ?? "No URL"}
            </span>
          </div>
        </div>
        <Separator />
        <div className="flex flex-col items-start w-full gap-4">
          <div className="flex items-center justify-between w-full gap-4">
            <div className="flex items-center gap-4">
              <GlobeLockIcon />
              <span className="text-sm capitalize">Auto bypass paywall</span>
            </div>
            <Switch
              checked={enabled}
              onChange={setEnabled}
              className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-[checked]:bg-orange-400"
            >
              <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
            </Switch>
          </div>
          <div className="flex items-center justify-between w-full gap-4">
            <div className="flex items-center gap-4">
              <CloudCogIcon />
              <span className="text-sm capitalize max-w-[200px] truncate">
                Archive {data?.title ?? "Untitled"}
              </span>
            </div>
            <Button onClick={handleSave}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
          {saveStatus && (
            <div className="w-full text-sm">
              <p>Status: {saveStatus}</p>
              {displayUrl && (
                <p>Display URL: <a href={displayUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{displayUrl}</a></p>
              )}
              {ipfsHash && <p>IPFS Hash: {ipfsHash}</p>}
            </div>
          )}
        </div>
        <Separator />
        {isConnected ? (
          <div className="flex items-center justify-between w-full gap-4">
            <div className="flex items-center gap-4">
              <WalletIcon />
              <span className="text-sm capitalize">
                GM, {formatAddress(address ?? "")}
              </span>
            </div>
            <Button onClick={disconnect}>Disconnect</Button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full gap-4">
            <div className="flex items-center gap-4">
              <WalletIcon />
              <span className="text-sm capitalize">Connect your account</span>
            </div>
            <WalletButton.Custom wallet="walletConnect">
              {({ connect }) => {
                return <Button onClick={connect}>Connect</Button>;
              }}
            </WalletButton.Custom>
          </div>
        )}
        <Separator />
        <span className="text-xs truncate opacity-60">
          Made with ❤️ by The Elephant Tribe
        </span>
      </div>
    </div>
  );
}

export default App;
