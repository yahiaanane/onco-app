import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, date, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (existing)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Patients table
export const patients = pgTable("patients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  dateOfBirth: date("date_of_birth").notNull(),
  sex: text("sex").notNull(), // 'male', 'female', 'other'
  height: decimal("height", { precision: 5, scale: 2 }), // in cm
  weight: decimal("weight", { precision: 5, scale: 2 }), // in kg
  cancerType: text("cancer_type").notNull(),
  cancerStage: text("cancer_stage").notNull(),
  diagnosisDate: date("diagnosis_date").notNull(),
  metastasisLocations: jsonb("metastasis_locations").$type<string[]>().default([]),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Protocol templates
export const protocolTemplates = pgTable("protocol_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  cancerType: text("cancer_type"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Protocol items (supplements, drugs, lifestyle)
export const protocolItems = pgTable("protocol_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar("template_id").references(() => protocolTemplates.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'supplement', 'drug', 'lifestyle', 'therapy'
  category: text("category").notNull(), // 'diet_fasting', 'repurposed_drugs', 'nutraceuticals', 'topical', 'exercise', 'sleep', 'stress', 'toxins', 'optional_therapies'
  priority: text("priority").notNull().default("core"), // 'core', 'additional', 'optional'
  dosage: text("dosage"),
  frequency: text("frequency"),
  timing: text("timing"), // 'with_food', 'empty_stomach', 'before_bed', 'any_time'
  duration: text("duration"),
  rationale: text("rationale"),
  cautions: text("cautions"),
  instructions: text("instructions"), // Detailed instructions for complex protocols
  foodRequirement: text("food_requirement"), // 'with_food', 'empty_stomach', 'no_restriction'
  order: integer("order").default(0),
});

// Patient protocols (assigned protocols)
export const patientProtocols = pgTable("patient_protocols", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").references(() => patients.id, { onDelete: "cascade" }),
  templateId: varchar("template_id").references(() => protocolTemplates.id),
  name: text("name").notNull(),
  status: text("status").notNull().default("active"), // 'active', 'paused', 'completed'
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  assignedAt: timestamp("assigned_at").defaultNow(),
});

// Patient protocol items (customized per patient)
export const patientProtocolItems = pgTable("patient_protocol_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientProtocolId: varchar("patient_protocol_id").references(() => patientProtocols.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  category: text("category").notNull(),
  priority: text("priority").notNull().default("core"),
  dosage: text("dosage"),
  frequency: text("frequency"),
  timing: text("timing"),
  duration: text("duration"),
  rationale: text("rationale"),
  cautions: text("cautions"),
  instructions: text("instructions"),
  foodRequirement: text("food_requirement"),
  order: integer("order").default(0),
  isActive: boolean("is_active").default(true),
});

// Adherence tracking
export const adherenceRecords = pgTable("adherence_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientProtocolItemId: varchar("patient_protocol_item_id").references(() => patientProtocolItems.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  status: text("status").notNull(), // 'done', 'skipped', 'missed'
  notes: text("notes"),
  recordedAt: timestamp("recorded_at").defaultNow(),
});

// Lab tests
export const labTests = pgTable("lab_tests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").references(() => patients.id, { onDelete: "cascade" }),
  testName: text("test_name").notNull(),
  testDate: date("test_date").notNull(),
  value: decimal("value", { precision: 12, scale: 4 }),
  unit: text("unit"),
  referenceRangeMin: decimal("reference_range_min", { precision: 12, scale: 4 }),
  referenceRangeMax: decimal("reference_range_max", { precision: 12, scale: 4 }),
  status: text("status"), // 'normal', 'low', 'high', 'critical'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Timeline entries for patient history
export const timelineEntries = pgTable("timeline_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").references(() => patients.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'protocol_change', 'lab_result', 'note', 'observation'
  title: text("title").notNull(),
  description: text("description"),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Create insert schemas
export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  createdAt: true,
});

export const insertProtocolTemplateSchema = createInsertSchema(protocolTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertProtocolItemSchema = createInsertSchema(protocolItems).omit({
  id: true,
});

export const insertPatientProtocolSchema = createInsertSchema(patientProtocols).omit({
  id: true,
  assignedAt: true,
});

export const insertPatientProtocolItemSchema = createInsertSchema(patientProtocolItems).omit({
  id: true,
});

export const insertAdherenceRecordSchema = createInsertSchema(adherenceRecords).omit({
  id: true,
  recordedAt: true,
});

export const insertLabTestSchema = createInsertSchema(labTests).omit({
  id: true,
  createdAt: true,
});

export const insertTimelineEntrySchema = createInsertSchema(timelineEntries).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Types
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;

export type ProtocolTemplate = typeof protocolTemplates.$inferSelect;
export type InsertProtocolTemplate = z.infer<typeof insertProtocolTemplateSchema>;

export type ProtocolItem = typeof protocolItems.$inferSelect;
export type InsertProtocolItem = z.infer<typeof insertProtocolItemSchema>;

export type PatientProtocol = typeof patientProtocols.$inferSelect;
export type InsertPatientProtocol = z.infer<typeof insertPatientProtocolSchema>;

export type PatientProtocolItem = typeof patientProtocolItems.$inferSelect;
export type InsertPatientProtocolItem = z.infer<typeof insertPatientProtocolItemSchema>;

export type AdherenceRecord = typeof adherenceRecords.$inferSelect;
export type InsertAdherenceRecord = z.infer<typeof insertAdherenceRecordSchema>;

export type LabTest = typeof labTests.$inferSelect;
export type InsertLabTest = z.infer<typeof insertLabTestSchema>;

export type TimelineEntry = typeof timelineEntries.$inferSelect;
export type InsertTimelineEntry = z.infer<typeof insertTimelineEntrySchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  // Add any user relations if needed in the future
}));

export const patientsRelations = relations(patients, ({ many }) => ({
  protocols: many(patientProtocols),
  labTests: many(labTests),
  timelineEntries: many(timelineEntries),
}));

export const protocolTemplatesRelations = relations(protocolTemplates, ({ many }) => ({
  items: many(protocolItems),
  patientProtocols: many(patientProtocols),
}));

export const protocolItemsRelations = relations(protocolItems, ({ one }) => ({
  template: one(protocolTemplates, {
    fields: [protocolItems.templateId],
    references: [protocolTemplates.id],
  }),
}));

export const patientProtocolsRelations = relations(patientProtocols, ({ one, many }) => ({
  patient: one(patients, {
    fields: [patientProtocols.patientId],
    references: [patients.id],
  }),
  template: one(protocolTemplates, {
    fields: [patientProtocols.templateId],
    references: [protocolTemplates.id],
  }),
  items: many(patientProtocolItems),
}));

export const patientProtocolItemsRelations = relations(patientProtocolItems, ({ one, many }) => ({
  patientProtocol: one(patientProtocols, {
    fields: [patientProtocolItems.patientProtocolId],
    references: [patientProtocols.id],
  }),
  adherenceRecords: many(adherenceRecords),
}));

export const adherenceRecordsRelations = relations(adherenceRecords, ({ one }) => ({
  patientProtocolItem: one(patientProtocolItems, {
    fields: [adherenceRecords.patientProtocolItemId],
    references: [patientProtocolItems.id],
  }),
}));

export const labTestsRelations = relations(labTests, ({ one }) => ({
  patient: one(patients, {
    fields: [labTests.patientId],
    references: [patients.id],
  }),
}));

export const timelineEntriesRelations = relations(timelineEntries, ({ one }) => ({
  patient: one(patients, {
    fields: [timelineEntries.patientId],
    references: [patients.id],
  }),
}));
