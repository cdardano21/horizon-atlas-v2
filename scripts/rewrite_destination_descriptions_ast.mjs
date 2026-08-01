import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const filePath = path.resolve('app/lib/destinations.ts');
const sourceText = fs.readFileSync(filePath, 'utf8');
const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

const stripQuotes = (value) => {
  if (!value) return '';
  return value.replace(/^['\"]|['\"]$/g, '').trim();
};

const getStringLiteral = (node) => {
  if (ts.isStringLiteralLike(node)) return node.text;
  return '';
};

const extractProperty = (objectLiteral, name) => {
  const property = objectLiteral.properties.find((prop) => ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name) && prop.name.text === name);
  if (!property || !ts.isPropertyAssignment(property)) return '';
  return getStringLiteral(property.initializer);
};

const getNestedProperty = (objectLiteral, parentName, childName) => {
  const parentProp = objectLiteral.properties.find((prop) => ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name) && prop.name.text === parentName);
  if (!parentProp || !ts.isPropertyAssignment(parentProp) || !ts.isObjectLiteralExpression(parentProp.initializer)) return '';
  return extractProperty(parentProp.initializer, childName);
};

const collapseWhitespace = (value) => value.replace(/\s+/g, ' ').trim();

const makeDescription = (city, country, overview, lifestyle, researchOverview) => {
  const candidates = [researchOverview, overview, lifestyle].filter(Boolean);
  const rawText = candidates[0] || '';
  if (!rawText) return `${city} in ${country} is a place worth a serious look.`;

  const firstSentence = collapseWhitespace(rawText.split(/(?<=[.!?])\s+/)[0] || rawText).replace(/^"|"$/g, '').trim();
  let sentence = firstSentence.replace(/\.$/, '').trim();
  if (!sentence) return `${city} in ${country} is a place worth a serious look.`;

  sentence = sentence
    .replace(/\bworks best for people who want\b/gi, 'is')
    .replace(/\bworks best when\b/gi, 'is best when')
    .replace(/\bworks best\b/gi, 'is')
    .replace(/\bIt feels\b/gi, `${city} in ${country} feels`)
    .replace(/\bThe city feels\b/gi, `${city} in ${country} feels`)
    .replace(/\bThe place\b/gi, `${city} in ${country} is`)
    .replace(/\bThis\b/gi, `${city} in ${country} is`);

  if (!sentence.toLowerCase().includes(city.toLowerCase())) {
    sentence = `${city} in ${country} ${sentence}`;
  }
  if (!/[.!?]$/.test(sentence)) sentence += '.';
  return sentence;
};

const destinationArray = sourceFile.statements.find((statement) => ts.isVariableStatement(statement) && statement.declarationList.declarations.some((declaration) => ts.isIdentifier(declaration.name) && declaration.name.text === 'destinations'));
if (!destinationArray) {
  throw new Error('Could not find destinations array');
}

const declaration = destinationArray.declarationList.declarations.find((item) => ts.isIdentifier(item.name) && item.name.text === 'destinations');
if (!declaration || !ts.isVariableDeclaration(declaration) || !declaration.initializer || !ts.isArrayLiteralExpression(declaration.initializer)) {
  throw new Error('destinations is not an array literal');
}

const edits = [];
for (const element of declaration.initializer.elements) {
  if (!ts.isObjectLiteralExpression(element)) continue;
  const slug = extractProperty(element, 'slug');
  const city = extractProperty(element, 'city');
  const country = extractProperty(element, 'country');
  const overview = extractProperty(element, 'overview');
  const lifestyle = extractProperty(element, 'lifestyle');
  const researchOverview = getNestedProperty(element, 'researchProfile', 'overview');
  if (!slug || !city || !country) continue;
  const description = makeDescription(city, country, overview, lifestyle, researchOverview);
  edits.push({ slug, description, node: element.properties.find((prop) => ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name) && prop.name.text === 'description') });
}

const printer = ts.createPrinter({ removeComments: false, newLine: ts.NewLineKind.LineFeed });
let updatedText = sourceText;
for (const edit of edits) {
  if (!edit.node || !ts.isPropertyAssignment(edit.node) || !ts.isStringLiteralLike(edit.node.initializer)) continue;
  const start = edit.node.initializer.getStart(sourceFile);
  const end = edit.node.initializer.getEnd();
  const replacement = `"${edit.description.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  updatedText = updatedText.slice(0, start) + replacement + updatedText.slice(end);
}

fs.writeFileSync(filePath, updatedText, 'utf8');
console.log(`Updated ${edits.length} destination descriptions via AST rewrite.`);
