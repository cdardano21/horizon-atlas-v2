import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import ts from 'typescript';
import { buildExternalNarrativeSet } from './external-source-narrative.mjs';

const filePath = path.resolve('app/lib/destinations.ts');
const sourceText = fs.readFileSync(filePath, 'utf8');
const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const requestTimeoutMs = 3500;
const externalContextCache = new Map();

const getJson = (url) =>
  new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy(new Error('timeout'));
    });
  });

const getWikiSummary = async (city, country) => {
  const candidates = [city, `${city} ${country}`, `${city}, ${country}`];
  const seen = new Set();
  for (const candidate of candidates) {
    if (seen.has(candidate)) continue;
    seen.add(candidate);
    const title = encodeURIComponent(candidate);
    try {
      const summary = await getJson(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`);
      if (summary && summary.extract) return summary;
    } catch {
      // try next candidate
    }
    try {
      const search = await getJson(`https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&srsearch=${encodeURIComponent(candidate)}&srlimit=3`);
      const match = search?.query?.search?.[0]?.title;
      if (match) {
        const summary = await getJson(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(match)}`);
        if (summary && summary.extract) return summary;
      }
    } catch {
      // ignore and continue
    }
    await delay(200);
  }
  return null;
};

const fetchHtml = (url) =>
  new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy(new Error('timeout'));
    });
  });

const stripHtml = (html) => collapseWhitespace(
  String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, ' & ')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, ' '),
);

const extractSearchSnippet = (html, engine) => {
  const normalizedHtml = String(html || '');
  const candidates = [];

  if (engine === 'google') {
    const googlePatterns = [
      /class="[^"]*(?:BNeawe|s3v9rd|AP7Wnd|VwiC3b)[^"]*"[^>]*>([^<]{20,180})/gi,
      /<span[^>]*>([^<]{20,180})<\/span>/gi,
    ];
    for (const pattern of googlePatterns) {
      let match;
      while ((match = pattern.exec(normalizedHtml)) !== null) {
        const value = collapseWhitespace(match[1]);
        if (value && value.length > 20) candidates.push(value);
      }
    }
  } else {
    const yahooPatterns = [
      /class="[^"]*(?:lh-16|fz-ms|lc-2|spt)[^"]*"[^>]*>([^<]{20,180})/gi,
      /<p[^>]*>([^<]{20,180})<\/p>/gi,
    ];
    for (const pattern of yahooPatterns) {
      let match;
      while ((match = pattern.exec(normalizedHtml)) !== null) {
        const value = collapseWhitespace(match[1]);
        if (value && value.length > 20) candidates.push(value);
      }
    }
  }

  if (candidates.length === 0) {
    const text = stripHtml(normalizedHtml);
    const sentences = text.split(/(?<=[.!?])\s+/).map((item) => collapseWhitespace(item)).filter(Boolean);
    for (const sentence of sentences) {
      if (sentence.length > 20 && sentence.length < 220) candidates.push(sentence);
    }
  }

  const best = candidates.find((value) => /city|town|island|harbor|harbour|waterfront|promenade|beach|coast|market|café|cafe|museum|historic|ancient|park|garden|airport|rail|metro|tram|station|culture|food|neighborhood|district|port|sea|shore/i.test(value))
    || candidates[0]
    || '';
  return collapseWhitespace(best || '');
};

const getExternalSignals = async (city, country) => {
  const query = `${city} ${country}`;
  const cached = externalContextCache.get(query);
  if (cached) return cached;

  const wikiSummary = await getWikiSummary(city, country);
  const googleQuery = encodeURIComponent(`${city} ${country}`);
  const yahooQuery = encodeURIComponent(`${city} ${country}`);

  const [googleHtml, yahooHtml] = await Promise.allSettled([
    fetchHtml(`https://www.google.com/search?q=${googleQuery}`),
    fetchHtml(`https://search.yahoo.com/search?p=${yahooQuery}`),
  ]);

  const googleSnippet = googleHtml.status === 'fulfilled' ? extractSearchSnippet(googleHtml.value, 'google') : '';
  const yahooSnippet = yahooHtml.status === 'fulfilled' ? extractSearchSnippet(yahooHtml.value, 'yahoo') : '';
  const result = {
    wiki: wikiSummary?.extract || '',
    google: googleSnippet,
    yahoo: yahooSnippet,
    text: [wikiSummary?.extract || '', googleSnippet, yahooSnippet].filter(Boolean).join(' '),
  };
  externalContextCache.set(query, result);
  return result;
};

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

const sanitizeSummary = (summaryText) => {
  const clean = collapseWhitespace(summaryText || '').replace(/^\"|\"$/g, '').trim();
  if (!clean) return '';
  return clean.replace(/\s+/g, ' ').trim();
};

const buildNarrativeSet = (city, country, summary, tags, slug, externalSignals = {}) => {
  const summaryText = sanitizeSummary(summary?.extract || summary || '');
  const externalText = String(externalSignals?.text || '');
  const narrative = buildExternalNarrativeSet(city, country, summaryText, externalText, tags);

  return {
    description: narrative.description.replace(/\s+/g, ' ').trim(),
    overview: narrative.overview.replace(/\s+/g, ' ').trim(),
    climate: (narrative.climate || 'The climate shapes daily life and comfort planning.').replace(/\s+/g, ' ').trim(),
    lifestyle: (narrative.lifestyle || 'Daily life usually centers on local routines, neighborhood life, and practical comforts.').replace(/\s+/g, ' ').trim(),
    transportation: (narrative.transportation || 'Mobility is strongest when the home base keeps everyday services and arrivals close.').replace(/\s+/g, ' ').trim(),
  };
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
let updated = 0;
console.log(`Rewriting ${destinationsArray.elements.length} destinations using Wikipedia + search signals...`);
for (const element of destinationsArray.elements) {
  if (!ts.isObjectLiteralExpression(element)) continue;
  const slug = getPropertyValue(element, 'slug');
  const city = getPropertyValue(element, 'city');
  const country = getPropertyValue(element, 'country');
  if (!slug || !city || !country) continue;
  const overview = getPropertyValue(element, 'overview');
  const lifestyle = getPropertyValue(element, 'lifestyle');
  const tags = getStringArrayValue(element, 'tags');
  const summary = await getWikiSummary(city, country);
  const externalSignals = await getExternalSignals(city, country);
  const narrative = buildNarrativeSet(city, country, summary, tags, slug, externalSignals);
  const descriptionProperty = element.properties.find(
    (prop) => ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name) && prop.name.text === 'description',
  );
  const overviewProperty = element.properties.find(
    (prop) => ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name) && prop.name.text === 'overview',
  );
  const climateProperty = element.properties.find(
    (prop) => ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name) && prop.name.text === 'climate',
  );
  const lifestyleProperty = element.properties.find(
    (prop) => ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name) && prop.name.text === 'lifestyle',
  );
  const transportationProperty = element.properties.find(
    (prop) => ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name) && prop.name.text === 'transportation',
  );
  const propertiesToUpdate = [
    { property: descriptionProperty, value: narrative.description },
    { property: overviewProperty, value: narrative.overview },
    { property: climateProperty, value: narrative.climate },
    { property: lifestyleProperty, value: narrative.lifestyle },
    { property: transportationProperty, value: narrative.transportation },
  ];
  if (updated % 50 === 0 || updated === destinationsArray.elements.length - 1) {
    console.log(`Processed ${updated + 1}/${destinationsArray.elements.length}: ${slug}`);
  }
  for (const entry of propertiesToUpdate) {
    if (!entry.property || !ts.isPropertyAssignment(entry.property) || !ts.isStringLiteralLike(entry.property.initializer)) continue;
    edits.push({
      start: entry.property.initializer.getStart(sourceFile),
      end: entry.property.initializer.getEnd(),
      replacement: JSON.stringify(entry.value),
    });
  }
  updated += 1;
}

let updatedText = sourceText;
for (const edit of edits.sort((a, b) => b.start - a.start)) {
  updatedText = updatedText.slice(0, edit.start) + edit.replacement + updatedText.slice(edit.end);
}

fs.writeFileSync(filePath, updatedText, 'utf8');
console.log(`Updated ${updated} destination descriptions with Wikipedia-backed prose.`);
