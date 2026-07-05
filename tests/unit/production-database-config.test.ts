import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const readProjectFile = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

describe("production database configuration", () => {
  it("uses PostgreSQL for Prisma and documented local setup", () => {
    const schema = readProjectFile("prisma/schema.prisma");
    const envExample = readProjectFile(".env.example");
    const homePage = readProjectFile("app/page.tsx");
    const packageJson = JSON.parse(readProjectFile("package.json")) as {
      scripts: Record<string, string>;
    };

    expect(schema).toContain('provider = "postgresql"');
    expect(homePage).toContain("export const revalidate = 300;");
    expect(homePage).not.toContain('export const dynamic = "force-dynamic";');
    expect(envExample).toContain("postgresql://");
    expect(envExample).not.toContain("file:../dev.db");
    expect(packageJson.scripts["db:setup"]).toBe("prisma migrate dev && prisma db seed");
    expect(packageJson.scripts["db:push"]).toBe("prisma db push && prisma db seed");
  });
});
