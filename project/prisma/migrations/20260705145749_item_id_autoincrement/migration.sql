-- Make item.id auto-increment (SERIAL-style) and the table's primary key.
CREATE SEQUENCE IF NOT EXISTS "item_id_seq";
ALTER TABLE "item" ALTER COLUMN "id" SET DEFAULT nextval('item_id_seq');
ALTER SEQUENCE "item_id_seq" OWNED BY "item"."id";
SELECT setval('item_id_seq', COALESCE((SELECT MAX(id) FROM "item"), 0) + 1, false);

DROP INDEX IF EXISTS "item_id_key";
ALTER TABLE "item" ADD CONSTRAINT "item_pkey" PRIMARY KEY ("id");
