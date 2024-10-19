import Web3 from "web3";
import { Res } from "./lib/types";

const web3 = new Web3();
//This is fixed
const EVMTaskAllocator = "0x19a567b3b212a5b35bA0E3B600FbEd5c2eE9083d";

const verifyEvmBasedResult = async (res: Res, schemaId: string) => {
  try {
    const { taskId, uHash, publicFieldsHash, recipient, validatorAddress, allocatorSignature, validatorSignature  } = res;

    // Step 1: Verify Allocator Signature

    // Encode the allocator message struct
    const taskIdHex = Web3.utils.stringToHex(taskId);
    const schemaIdHex = Web3.utils.stringToHex(schemaId);
    const allocatorParams = web3.eth.abi.encodeParameters(
      ["bytes32", "bytes32", "address"],
      [taskIdHex, schemaIdHex, validatorAddress]
    );
    const allocatorParamsHash = Web3.utils.soliditySha3(allocatorParams) as string;

    // Recover the allocator address
    const signedAllocatorAddress = web3.eth.accounts.recover(allocatorParamsHash, allocatorSignature);

    // Verify if the signed allocator address is the expected registered allocator
    const isAllocatorValid = signedAllocatorAddress === EVMTaskAllocator;
    console.log(`Allocator Signature Valid: ${isAllocatorValid}`);

    // Step 2: Verify Validator Signature

    // Encode the validator message struct
    const types = ["bytes32", "bytes32", "bytes32", "bytes32"];
    const values = [taskIdHex, schemaIdHex, uHash, publicFieldsHash];

    // If the recipient (wallet address) was included in the launch process, add it to the parameters
    if (recipient) {
      types.push("address");
      values.push(recipient);
    }

    const validatorParams = web3.eth.abi.encodeParameters(types, values);
    const validatorParamsHash = Web3.utils.soliditySha3(validatorParams) as string;

    // Recover the validator address
    const signedValidatorAddress = web3.eth.accounts.recover(validatorParamsHash, validatorSignature);

    // Verify if the signed validator address matches the one assigned by the allocator
    const isValidatorValid = signedValidatorAddress === validatorAddress;
    console.log(`Validator Signature Valid: ${isValidatorValid}`);

    // Return final validation result
    return isAllocatorValid && isValidatorValid;
  } catch (error) {
    console.error('Verification error:', error);
    return false;
  }
};

export default verifyEvmBasedResult;