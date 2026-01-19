CREATE TABLE "posts" (
	"id" integer PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"user_id" integer NOT NULL,
	CONSTRAINT "posts_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "save-posts-schema" (
	"id" integer PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	CONSTRAINT "save-posts-schema_post_id_unique" UNIQUE("post_id"),
	CONSTRAINT "save-posts-schema_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user-reactions" (
	"id" integer PRIMARY KEY NOT NULL,
	"comment" varchar(500),
	"likes" integer,
	"dislikes" integer NOT NULL,
	"post_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	CONSTRAINT "user-reactions_post_id_unique" UNIQUE("post_id"),
	CONSTRAINT "user-reactions_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(20) NOT NULL,
	"age" integer NOT NULL,
	"email" varchar(50) NOT NULL,
	"password" varchar(20) NOT NULL,
	"photo" text,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "save-posts-schema" ADD CONSTRAINT "save-posts-schema_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "save-posts-schema" ADD CONSTRAINT "save-posts-schema_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user-reactions" ADD CONSTRAINT "user-reactions_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user-reactions" ADD CONSTRAINT "user-reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;