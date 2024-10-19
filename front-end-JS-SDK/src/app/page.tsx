"use client";
import { useState } from "react";
import styles from "./page.module.css";
import TransgateConnect from "@zkpass/transgate-js-sdk";
import JSONPretty from "react-json-pretty";
import { ethers } from "ethers";
import AttestationABI from "./AttestationABI.json";
import { Res } from "./lib/types";
import verifyEvmBasedResult from "./verifyEvmBasedResult";

const FormGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid gap-9 grid-cols-1 max-w-2xl mx-auto my-12">{children}</div>
);

const FormContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col items-center w-full">{children}</div>
);

const FormItem = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col justify-start items-start w-full mb-4">{children}</div>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <div className="text-right text-lg font-bold text-white mb-2">{children}</div>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className="block bg-white rounded h-9 leading-9 w-full px-4 outline-none text-black"
  />
);

const Button = ({ children, disabled, onClick }: { children: React.ReactNode, disabled?: boolean, onClick?: () => void }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`relative block min-w-[120px] h-9 leading-9 px-4 text-center border-none rounded text-sm bg-[#c5ff4a] text-black ${disabled ? "cursor-not-allowed" : "cursor-pointer"} active:border active:border-gray-400 active:text-gray-700`}
  >
    {children}
  </button>
);

const RightContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="col-span-1">{children}</div>
);

const Title = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-white text-center">{children}</h2>
);

declare global {
  interface Window {
    ethereum: any;
  }
}

export default function Home() {
  const [appid1, setAppid1] = useState<string>(
    "fc110457-b954-482a-b73d-710316120d2c"
  );
  const [value1, setValue1] = useState<string>(
    "ec0661b638474c16b59621a44951d14a"
  );
  const [result, setResult] = useState<any>();
  const [attestAtationTx, setAttestAtationTx] = useState<string>();

  const start = async (schemaId: string, appid: string) => {
    try {
      const connector = new TransgateConnect(appid);
      const isAvailable = await connector.isTransgateAvailable();
      if (!isAvailable) {
        return alert("Please install zkPass TransGate");
      }
      if (window.ethereum == null) {
        return alert("MetaMask not installed");
      }
      if (Number(window.ethereum.chainId) !== 2810) {
        return alert("Please switch to Morph network");
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const account = await signer.getAddress();

      const contractAddress = "0x79208010a972D0C0a978a9073bd0dcb659152072";
      const contract = new ethers.Contract(
        contractAddress,
        AttestationABI,
        signer
      );



      const res = await connector.launch(schemaId, account) as Res ;
      setResult(res);

      const isVerified = verifyEvmBasedResult(res, schemaId)

      if (!isVerified) {
        return alert("Invalid result");
      }

      const taskId = ethers.hexlify(ethers.toUtf8Bytes(res.taskId));
      schemaId = ethers.hexlify(ethers.toUtf8Bytes(schemaId));

      const chainParams = {
        taskId,
        schemaId,
        uHash: res.uHash,
        recipient: account,
        publicFieldsHash: res.publicFieldsHash,
        validator: res.validatorAddress,
        allocatorSignature: res.allocatorSignature,
        validatorSignature: res.validatorSignature,
      };

      const t = await contract.attest(chainParams);
      setAttestAtationTx(t.hash);
      alert("Transaction sent successfully!");
    } catch (err) {
      alert(JSON.stringify(err));
      console.log("error", err);
    }
  };

  return (
    <main className={styles.main}>
      <Title>zkPass Transgate JS-SDK Demo(send to evm chain)</Title>
      <FormGrid>
        <FormContainer>
          <FormItem>
            <Label>Appid:</Label>
            <Input
              value={appid1}
              onInput={(e: React.ChangeEvent<HTMLInputElement>) =>
                setAppid1(e.target.value?.trim())
              }
            />
          </FormItem>
          <FormItem>
            <Label>Schema Id:</Label>
            <Input
              value={value1}
              onInput={(e: React.ChangeEvent<HTMLInputElement>) =>
                setValue1(e.target.value?.trim())
              }
            />
          </FormItem>
          <FormItem>
            <RightContainer>
              <Button onClick={() => start(value1, appid1)}>Run</Button>
            </RightContainer>
          </FormItem>
          <FormItem>
            {attestAtationTx && (
              <>
                <Label>AttestationTx:</Label>
                <a href={"https://explorer-holesky.morphl2.io/tx/" + attestAtationTx} target="_blank" rel="noopener noreferrer">
                  {attestAtationTx}
                </a>
              </>
            )}
            {result && (
              <>
                <Label>Result:</Label>
                <JSONPretty
                  themeClassName="custom-json-pretty"
                  id="json-pretty"
                  data={result}
                ></JSONPretty>
              </>
            )}
          </FormItem>
        </FormContainer>
      </FormGrid>
    </main>
  );
}
