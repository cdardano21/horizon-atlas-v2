import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const filePath = path.resolve('app/lib/destinations.ts');
const sourceText = fs.readFileSync(filePath, 'utf8');
const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

const getStringValue = (node) => {
  if (!node) return '';
  if (ts.isStringLiteralLike(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  return '';
};

const getPropertyValue = (objectLiteral, name) => {
  const property = objectLiteral.properties.find(
    (prop) => ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name) && prop.name.text === name,
  );
  if (!property || !ts.isPropertyAssignment(property)) return '';
  return getStringValue(property.initializer);
};

const getStringArrayValue = (objectLiteral, name) => {
  const property = objectLiteral.properties.find(
    (prop) => ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name) && prop.name.text === name,
  );
  if (!property || !ts.isPropertyAssignment(property) || !ts.isArrayLiteralExpression(property.initializer)) return [];
  return property.initializer.elements
    .filter((element) => ts.isStringLiteralLike(element) || ts.isNoSubstitutionTemplateLiteral(element))
    .map((element) => element.text);
};

const getNestedPropertyValue = (objectLiteral, parentName, childName) => {
  const parentProperty = objectLiteral.properties.find(
    (prop) => ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name) && prop.name.text === parentName,
  );
  if (!parentProperty || !ts.isPropertyAssignment(parentProperty) || !ts.isObjectLiteralExpression(parentProperty.initializer)) return '';
  return getPropertyValue(parentProperty.initializer, childName);
};

const collapseWhitespace = (value) => value.replace(/\s+/g, ' ').trim();
const stripQuotes = (value) => value.replace(/^['\"]|['\"]$/g, '').trim();

const firstSentence = (value) => {
  const cleaned = collapseWhitespace(stripQuotes(value || ''));
  if (!cleaned) return '';
  return cleaned.split(/(?<=[.!?])\s+/)[0].replace(/[.!?]$/, '').trim();
};

const buildDescription = (city, country, overview, lifestyle, researchOverview, tags) => {
  const candidate = firstSentence(researchOverview || overview || lifestyle) || firstSentence(overview || lifestyle) || '';
  const normalized = `${candidate} ${lifestyle}`.toLowerCase();
  const tagSet = new Set(tags);

  let descriptor = 'a place with a strong sense of everyday livability';
  let clause = 'where daily life feels easy to sustain';

  if (tagSet.has('beach') || tagSet.has('coast') || tagSet.has('summer escape') || /coast|sea|harbor|waterfront|marina|bay|beach/.test(normalized)) {
    descriptor = 'a coastal base with a relaxed daily rhythm';
    clause = 'where sea air and everyday routines stay closely linked';
  } else if (tagSet.has('culture') || /historic|heritage|old-town|traditional|history/.test(normalized)) {
    descriptor = 'a culturally rich base with real sense of place';
    clause = 'where historic texture gives everyday life more character';
  } else if (tagSet.has('walkability') || /walk|compact|pedestrian|small-scale/.test(normalized)) {
    descriptor = 'a compact and walkable base';
    clause = 'where errands, cafés, and neighborhood life stay easy';
  } else if (tagSet.has('nature') || /mountain|nature|landscape|outdoor|green/.test(normalized)) {
    descriptor = 'a nature-forward base';
    clause = 'where the landscape is part of the everyday rhythm';
  } else if (tagSet.has('healthcare') || tagSet.has('safety') || /practical|services|routine/.test(normalized)) {
    descriptor = 'a practical and well-supported base';
    clause = 'where everyday logistics and comfort are a real advantage';
  } else if (tagSet.has('value') || /value|affordable|budget/.test(normalized)) {
    descriptor = 'a strong-value base';
    clause = 'where the lifestyle feels rewarding without excess';
  } else if (tagSet.has('expat-friendly') || /international|services|urban|city/.test(normalized)) {
    descriptor = 'a well-served urban base';
    clause = 'where everyday services make long-stay living easier';
  }

  const sentence = `${city} in ${country} is ${descriptor} ${clause}.`;
  return sentence.replace(/\s+/g, ' ').trim();
};

const findDestinationsArray = () => {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    const declaration = statement.declarationList.declarations.find(
      (item) => ts.isIdentifier(item.name) && item.name.text === 'destinations',
    );
    if (!declaration || !ts.isVariableDeclaration(declaration) || !declaration.initializer || !ts.isArrayLiteralExpression(declaration.initializer)) {
      continue;
    }
    return declaration.initializer;
  }
  throw new Error('Could not find destinations array');
};

const destinationsArray = findDestinationsArray();
const edits = [];

for (const element of destinationsArray.elements) {
  if (!ts.isObjectLiteralExpression(element)) continue;
  const slug = getPropertyValue(element, 'slug');
  const city = getPropertyValue(element, 'city');
  const country = getPropertyValue(element, 'country');
  if (!slug || !city || !country) continue;

  const overview = getPropertyValue(element, 'overview');
  const lifestyle = getPropertyValue(element, 'lifestyle');
  const researchOverview = getNestedPropertyValue(element, 'researchProfile', 'overview');
  const tags = getStringArrayValue(element, 'tags');
  const description = buildDescription(city, country, overview, lifestyle, researchOverview, tags);

  const descriptionProperty = element.properties.find(
    (prop) => ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name) && prop.name.text === 'description',
  );
  if (!descriptionProperty || !ts.isPropertyAssignment(descriptionProperty) || !ts.isStringLiteralLike(descriptionProperty.initializer)) continue;

  edits.push({
    start: descriptionProperty.initializer.getStart(sourceFile),
    end: descriptionProperty.initializer.getEnd(),
    replacement: JSON.stringify(description),
  });
}

let updatedText = sourceText;
for (const edit of edits.sort((a, b) => b.start - a.start)) {
  updatedText = updatedText.slice(0, edit.start) + edit.replacement + updatedText.slice(edit.end);
}

fs.writeFileSync(filePath, updatedText, 'utf8');
console.log(`Updated ${edits.length} destination descriptions with source-derived prose.`);
