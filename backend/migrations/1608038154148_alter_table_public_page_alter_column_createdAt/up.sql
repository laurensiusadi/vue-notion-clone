ALTER TABLE ONLY "public"."page" ALTER COLUMN "createdAt" SET DEFAULT now();
ALTER TABLE "public"."page" ALTER COLUMN "createdAt" DROP NOT NULL;
