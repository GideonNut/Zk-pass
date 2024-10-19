async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const sa = await ethers.deployContract("SampleAttestation");

  const address = await sa.getAddress();

  console.log("SampleAttestation deployed to address:", address);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
