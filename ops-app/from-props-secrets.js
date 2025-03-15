import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";
import sodium from "tweetsodium";
import fs from "fs";

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
    console.error(`Error creating secret "${secretName}":`, error);
  }
}

// Read the properties file and create secrets
function createSecretsFromFile(filePath) {
  try {
    // Read the file content
    const fileContent = fs.readFileSync(filePath, "utf8");

    // Split the file content into lines
    const lines = fileContent.split("\n");

    // Process each line
    lines.forEach((line) => {
      // Skip empty lines and comments (lines starting with #)
      if (line.trim() === "" || line.startsWith("#")) {
        return;
      }

      // Split the line into key and value
      const [secretName, secretValue] = line.split("=").map((part) => part.trim());

      if (!secretName || !secretValue) {
        console.error(`Invalid line format: ${line}`);
        return;
      }

      // Create the secret
      createSecret(secretName, secretValue);
    });
  } catch (error) {
    console.error("Error reading properties file:", error);
  }
}

// Read command-line arguments
const args = process.argv.slice(2); // Skip the first two arguments (node and script path)

if (args.length !== 1) {
  console.error("Error! Usage: node from-props-secrets.js <PROPERTIES_FILE>");
  process.exit(1);
}

const propertiesFilePath = args[0]; // Path to the properties file

// Call the function to create secrets from the file
createSecretsFromFile(propertiesFilePath);