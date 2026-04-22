import AdmZip from 'adm-zip';
import * as dotenv from 'dotenv';
import { createReadStream, existsSync, readdirSync, rmSync } from 'fs';
import { OpenAI } from 'openai';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sopsDir = join(__dirname, '..', 'data', 'sops');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  console.log('Checking for SOP documents...');

  const zipPath = join(sopsDir, 'sops.zip');
  if (existsSync(zipPath)) {
    console.log('Extracting sops.zip...');
    try {
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(sopsDir, true);
      console.log('Extraction complete.');
    } catch (err) {
      console.error('Failed to extract sops.zip:', err);
      process.exit(1);
    }
  }

  let files: string[] = [];
  try {
    files = readdirSync(sopsDir).filter((f) => f.endsWith('.docx') || f.endsWith('.doc'));
  } catch (err) {
    console.error('Error reading data/sops directory. Make sure it exists and contains the files.', err);
    process.exit(1);
  }

  if (files.length === 0) {
    console.log('No .docx or .doc files found in data/sops. Please add them first.');
    return;
  }

  console.log(`Found ${files.length} document(s). Creating Vector Store...`);

  let vectorStore: any;
  try {
    vectorStore = await openai.vectorStores.create({
      name: 'Godspeed SOPs',
    });
    console.log(`Vector Store created with ID: ${vectorStore.id}`);
  } catch (err) {
    console.error('Failed to create vector store:', err);
    process.exit(1);
  }

  console.log('Uploading files and adding to vector store...');

  const fileStreams = files.map((file) => createReadStream(join(sopsDir, file)));

  try {
    const uploadJob = await openai.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, { files: fileStreams });
    console.log(`Upload complete! Status: ${uploadJob.status}`);
    console.log(`Added ${uploadJob.file_counts.completed} files, ${uploadJob.file_counts.failed} failed.`);

    console.log('\nCleaning up extracted files...');
    for (const file of files) {
      rmSync(join(sopsDir, file));
    }

    console.log('\n--- NEXT STEPS ---');
    console.log('1. Add the following to your .env file:');
    console.log(`OPENAI_VECTOR_STORE_ID=${vectorStore.id}`);
    console.log('2. Then run your bot: npm start');
  } catch (err) {
    console.error('Failed to upload files:', err);
  }
}

main();
