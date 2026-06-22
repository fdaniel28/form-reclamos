ALTER TABLE "clients" ADD COLUMN "complaint_number" SERIAL NOT NULL;
ALTER TABLE "clients" ADD CONSTRAINT "clients_complaint_number_key" UNIQUE ("complaint_number");
