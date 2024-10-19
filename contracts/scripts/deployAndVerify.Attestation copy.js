const { network, run, ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const sa = await ethers.deployContract("SampleAttestation");

  await sa.waitForDeployment();

  const address = await sa.getAddress();

  console.log("SampleAttestation address:", address);

  console.log("Verifying contract...");

  // The verification call
  try {
    await run("verify:verify", {
      address: address,
      network: network.name,
      constructorArguments: [], // Pass constructor arguments if needed
    });
    console.log("Contract verified successfully!");
  } catch (error) {
    console.error("Verification failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
