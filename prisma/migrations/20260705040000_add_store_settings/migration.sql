CREATE TABLE "StoreSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreSetting_pkey" PRIMARY KEY ("key")
);

INSERT INTO "StoreSetting" ("key", "value", "updatedAt")
VALUES ('shippingFeeVnd', '40000', CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;
