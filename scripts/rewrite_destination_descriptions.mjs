import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('app/lib/destinations.ts');
const content = fs.readFileSync(filePath, 'utf8');

const extractField = (block, field) => {
  const match = block.match(new RegExp(`^\\s*${field}:\\s*"((?:[^\\"\\\\]|\\\\.)*)"`, 'm'));
  return match ? JSON.parse(`"${match[1]}"`) : null;
};

const collapseWhitespace = (value) => value.replace(/\s+/g, ' ').trim();
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getNestedField = (block, parentKey, field) => {
  const parentMatch = block.match(new RegExp(`${parentKey}:\\s*\\{([\\s\\S]*?)\\n\\s*\\}`, 'm'));
  if (!parentMatch) return null;
  const body = parentMatch[1];
  const match = body.match(new RegExp(`^\\s*${field}:\\s*"((?:[^\\"\\\\]|\\\\.)*)"`, 'm'));
  return match ? JSON.parse(`"${match[1]}"`) : null;
};

const makeDescription = (city, country, overview, lifestyle, researchOverview) => {
  const candidates = [researchOverview, overview, lifestyle].filter(Boolean);
  const rawText = candidates[0] || '';
  if (!rawText) {
    return `${city} in ${country} is a place worth a serious look.`;
  }

  const firstSentence = collapseWhitespace(rawText.split(/(?<=[.!?])\s+/)[0] || rawText);
  let sentence = firstSentence.replace(/^"|"$/g, '').replace(/\.$/, '').trim();
  if (!sentence) {
    return `${city} in ${country} is a place worth a serious look.`;
  }

  sentence = sentence
    .replace(new RegExp(`^${escapeRegex(city)}\\s+works best for people who want`, 'i'), `${city} in ${country} is`)
    .replace(/^It feels/i, `${city} in ${country} feels`)
    .replace(/^The city feels/i, `${city} in ${country} feels`)
    .replace(/^This/i, `${city} in ${country} is`)
    .replace(/^The place/i, `${city} in ${country} is`)
    .replace(/\bworks best for people who want\b/i, 'is')
    .replace(/\bworks best when\b/i, 'is best when')
    .replace(/\bworks best\b/i, 'is');

  if (!sentence.toLowerCase().includes(city.toLowerCase())) {
    sentence = `${city} in ${country} ${sentence}`;
  }

  if (!/[.!?]$/.test(sentence)) {
    sentence = `${sentence}.`;
  }

  return sentence;
};

const topLevelBlocks = [];
const lines = content.split('\n');
let currentBlock = null;
let braceDepth = 0;
let inString = false;
let stringQuote = '';
let escapeNext = false;

for (let i = 0; i < lines.length; i += 1) {
  const line = lines[i];
  if (!currentBlock && /^  \{$/.test(line)) {
    currentBlock = [line];
    braceDepth = 1;
    continue;
  }

  if (!currentBlock) continue;

  currentBlock.push(line);
  let lineDepth = 0;
  for (let j = 0; j < line.length; j += 1) {
    const char = line[j];
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    if (char === '\\') {
      escapeNext = true;
      continue;
    }
    if ((char === '"' || char === "'") && !inString) {
      inString = true;
      stringQuote = char;
      continue;
    }
    if (char === stringQuote && inString) {
      inString = false;
      stringQuote = '';
      continue;
    }
    if (inString) continue;
    if (char === '{') lineDepth += 1;
    if (char === '}') lineDepth -= 1;
  }
  braceDepth += lineDepth;
  if (braceDepth <= 0) {
    topLevelBlocks.push(currentBlock.join('\n'));
    currentBlock = null;
    braceDepth = 0;
    inString = false;
    stringQuote = '';
    escapeNext = false;
  }
}

let updated = 0;
let updatedContent = content;
for (const block of topLevelBlocks) {
  if (!block.includes('slug:')) continue;
  const slug = extractField(block, 'slug');
  const city = extractField(block, 'city');
  const country = extractField(block, 'country');
  if (!slug || !city || !country) continue;

  const overview = extractField(block, 'overview');
  const lifestyle = extractField(block, 'lifestyle');
  const researchOverview = getNestedField(block, 'researchProfile', 'overview');
  const description = makeDescription(city, country, overview, lifestyle, researchOverview);
  const replacement = `description: ${JSON.stringify(description)}`;
  const updatedBlock = block.replace(/description:\s*"(?:[^"\\]|\\.)*"/, replacement);
  if (updatedBlock !== block) {
    updated += 1;
  }
  updatedContent = updatedContent.replace(block, updatedBlock);
}

fs.writeFileSync(filePath, updatedContent, 'utf8');
console.log(`Updated ${updated} destination descriptions in ${filePath}.`);
