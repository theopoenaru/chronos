-- Drop old columns and add new parts column
ALTER TABLE "chat_message" DROP COLUMN IF EXISTS "content";
ALTER TABLE "chat_message" DROP COLUMN IF EXISTS "tool_steps";
ALTER TABLE "chat_message" ADD COLUMN "parts" jsonb NOT NULL;

-- Change id from serial to text (requires recreating the table)
-- First, drop foreign key constraint
ALTER TABLE "chat_message" DROP CONSTRAINT IF EXISTS "chat_message_session_id_chat_session_id_fk";

-- Drop and recreate table with new schema
DROP TABLE IF EXISTS "chat_message";
CREATE TABLE "chat_message" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"role" text NOT NULL,
	"parts" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_session_id_chat_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."chat_session"("id") ON DELETE cascade ON UPDATE no action;

