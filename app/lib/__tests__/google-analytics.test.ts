// @vitest-environment node
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
import { GOOGLE_ANALYTICS_BOOTSTRAP, GA_MEASUREMENT_ID } from "../google-analytics";

function run(hostname: string, protocol = "https:") {
  const scripts: Record<string, unknown>[] = [];
  const window = { location: { hostname, protocol }, dataLayer: [] as IArguments[] };
  runInNewContext(GOOGLE_ANALYTICS_BOOTSTRAP, {
    window,
    document: { createElement: () => ({}), head: { appendChild: (tag: Record<string, unknown>) => scripts.push(tag) } },
  });
  return { scripts, commands: window.dataLayer.map((args) => Array.from(args)) };
}

describe("GA4 production integration", () => {
  it("loads the approved tag asynchronously and configures one initial page view", () => {
    const result = run("www.destinationfinderai.com");
    expect(result.scripts).toEqual([{ async: true, src: `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}` }]);
    expect(result.commands.map((command) => command[0])).toEqual(["js", "config"]);
    expect(result.commands[1]).toEqual(["config", "G-LNLWYCJQTQ"]);
  });
  it.each(["localhost", "127.0.0.1", "horizon-atlas-v2.vercel.app", "www.destinationfinderai.com.example.org"])("does not send Preview/local traffic from %s", (host) => {
    expect(run(host)).toEqual({ scripts: [], commands: [] });
  });
  it("requires HTTPS", () => {
    expect(run("www.destinationfinderai.com", "http:")).toEqual({ scripts: [], commands: [] });
  });
});
