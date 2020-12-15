ALTER TABLE ONLY "public"."page" ALTER COLUMN "createdAt" DROP DEFAULT;
ALTER TABLE "public"."page" ALTER COLUMN "createdAt" SET NOT NULL;
