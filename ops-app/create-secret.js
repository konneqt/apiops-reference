import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";
import sodium from "tweetsodium";

// Load environment variables from .env file
dotenv.config();

// Initialize Octokit with the GitHub Personal Access Token from .env
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

async function createSecret(secretName, secretValue) {
  const owner = process.env.REPO_OWNER; // Repository owner
  const repo = process.env.REPO_NAME;  // Repository name

  try {
    // Get the repository's public key
    const { data: publicKey } = await octokit.actions.getRepoPublicKey({
      owner,
      repo,
    });

    // Encrypt the secret value using tweetsodium
    const messageBytes = Buffer.from(secretValue);
    const keyBytes = Buffer.from(publicKey.key, "base64");
    const encryptedBytes = sodium.seal(messageBytes, keyBytes);
    const encryptedValue = Buffer.from(encryptedBytes).toString("base64");

    // Create or update the secret
    await octokit.actions.createOrUpdateRepoSecret({
      owner,
      repo,
      secret_name: secretName,
      encrypted_value: encryptedValue,
      key_id: publicKey.key_id,
    });

    console.log(`Secret "${secretName}" created/updated successfully.`);
  } catch (error) {
    console.error("Error creating secret:", error);
  }
}

// Read command-line arguments
const args = process.argv.slice(2); // Skip the first two arguments (node and script path)

if (args.length !== 2) {
  console.error("Usage: node create-secret.js <SECRET_NAME> <SECRET_VALUE>");
  process.exit(1);
}

const secretName = args[0]; // First argument: secret name
const secretValue = args[1]; // Second argument: secret value

// Call the function
createSecret(secretName.toUpperCase(), secretValue);