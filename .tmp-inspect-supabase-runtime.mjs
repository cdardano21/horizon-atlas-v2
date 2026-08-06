import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { register } = require('node:module');
try {
  const ts = require('typescript');
  const tsconfig = require('./tsconfig.json');
  const source = fs.readFileSync('./app/lib/supabase.ts', 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, allowJs: true, moduleResolution: ts.ModuleResolutionKind.NodeJs },
  });
  const temp = './.tmp-supabase-runtime.cjs';
  fs.writeFileSync(temp, outputText);
  const mod = require('./.tmp-supabase-runtime.cjs');
  console.log('hasSupabaseConfig', mod.hasSupabaseConfig);
  console.log('getSupabaseConfig', mod.getSupabaseConfig());
  console.log('isSupabaseConfigured', mod.isSupabaseConfigured());
} catch (error) {
  console.error(error);
  console.error(error.stack);
  process.exit(1);
}
