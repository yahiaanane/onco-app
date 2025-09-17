import { 
  type Patient, 
  type InsertPatient,
  type ProtocolTemplate,
  type InsertProtocolTemplate,
  type ProtocolItem,
  type InsertProtocolItem,
  type PatientProtocol,
  type InsertPatientProtocol,
  type PatientProtocolItem,
  type InsertPatientProtocolItem,
  type AdherenceRecord,
  type InsertAdherenceRecord,
  type LabTest,
  type InsertLabTest,
  type TimelineEntry,
  type InsertTimelineEntry,
  type User,
  type InsertUser,
  users,
  patients,
  protocolTemplates,
  protocolItems,
  patientProtocols,
  patientProtocolItems,
  adherenceRecords,
  labTests,
  timelineEntries
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, like, sql } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { patientProtocols } from "@shared/schema";
export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Patient methods
  getPatients(): Promise<Patient[]>;
  getPatient(id: string): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: string, patient: Partial<InsertPatient>): Promise<Patient | undefined>;
  deletePatient(id: string): Promise<boolean>;
  searchPatients(query: string): Promise<Patient[]>;

  // Protocol template methods
  getProtocolTemplates(): Promise<ProtocolTemplate[]>;
  getProtocolTemplate(id: string): Promise<ProtocolTemplate | undefined>;
  createProtocolTemplate(template: InsertProtocolTemplate): Promise<ProtocolTemplate>;
  updateProtocolTemplate(id: string, template: Partial<InsertProtocolTemplate>): Promise<ProtocolTemplate | undefined>;
  deleteProtocolTemplate(id: string): Promise<boolean>;

  // Protocol item methods
  getProtocolItems(templateId: string): Promise<ProtocolItem[]>;
  createProtocolItem(item: InsertProtocolItem): Promise<ProtocolItem>;
  updateProtocolItem(id: string, item: Partial<InsertProtocolItem>): Promise<ProtocolItem | undefined>;
  deleteProtocolItem(id: string): Promise<boolean>;

  // Patient protocol methods
  getPatientProtocols(patientId: string): Promise<PatientProtocol[]>;
  getPatientProtocol(id: string): Promise<PatientProtocol | undefined>;
  createPatientProtocol(protocol: InsertPatientProtocol): Promise<PatientProtocol>;
  updatePatientProtocol(id: string, protocol: Partial<InsertPatientProtocol>): Promise<PatientProtocol | undefined>;
  deletePatientProtocol(id: string): Promise<boolean>;

  // Patient protocol item methods
  getPatientProtocolItems(patientProtocolId: string): Promise<PatientProtocolItem[]>;
  createPatientProtocolItem(item: InsertPatientProtocolItem): Promise<PatientProtocolItem>;
  updatePatientProtocolItem(id: string, item: Partial<InsertPatientProtocolItem>): Promise<PatientProtocolItem | undefined>;

  // Adherence methods
  getAdherenceRecords(patientProtocolItemId: string, startDate?: string, endDate?: string): Promise<AdherenceRecord[]>;
  createAdherenceRecord(record: InsertAdherenceRecord): Promise<AdherenceRecord>;
  updateAdherenceRecord(id: string, record: Partial<InsertAdherenceRecord>): Promise<AdherenceRecord | undefined>;
  getPatientAdherenceStats(patientId: string, days: number): Promise<{ totalItems: number; completedItems: number; percentage: number }>;

  // Lab test methods
  getLabTests(patientId: string): Promise<LabTest[]>;
  getLabTest(id: string): Promise<LabTest | undefined>;
  createLabTest(test: InsertLabTest): Promise<LabTest>;
  updateLabTest(id: string, test: Partial<InsertLabTest>): Promise<LabTest | undefined>;
  deleteLabTest(id: string): Promise<boolean>;

  // Timeline methods
  getTimelineEntries(patientId: string): Promise<TimelineEntry[]>;
  createTimelineEntry(entry: InsertTimelineEntry): Promise<TimelineEntry>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    totalPatients: number;
    activeProtocols: number;
    recentLabs: number;
    averageAdherence: number;
  }>;
  
  // Dashboard adherence chart data
  getDashboardAdherenceData(): Promise<Array<{
    week: string;
    overall: number;
    medication: number;
  }>>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Patient methods
  async getPatients(): Promise<Patient[]> {
    return await db.select().from(patients);
  }

  async getPatient(id: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient || undefined;
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const [patient] = await db.insert(patients).values(insertPatient as any).returning();
    
    // Create timeline entry
    await this.createTimelineEntry({
      patientId: patient.id,
      type: 'note',
      title: 'Patient Created',
      description: `Patient ${patient.name} was added to the system`,
      date: new Date().toISOString().split('T')[0]
    });

    return patient;
  }

  async updatePatient(id: string, updatePatient: Partial<InsertPatient>): Promise<Patient | undefined> {
    const [patient] = await db.update(patients)
      .set(updatePatient as any)
      .where(eq(patients.id, id))
      .returning();
    
    if (patient) {
      await this.createTimelineEntry({
        patientId: patient.id,
        type: 'note',
        title: 'Patient Updated',
        description: 'Patient information was updated',
        date: new Date().toISOString().split('T')[0]
      });
    }

    return patient || undefined;
  }

  async deletePatient(id: string): Promise<boolean> {
    const result = await db.delete(patients).where(eq(patients.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async searchPatients(query: string): Promise<Patient[]> {
    return await db.select().from(patients)
      .where(like(patients.name, `%${query}%`));
  }

  // Protocol template methods
  async getProtocolTemplates(): Promise<ProtocolTemplate[]> {
    return await db.select().from(protocolTemplates);
  }

  async getProtocolTemplate(id: string): Promise<ProtocolTemplate | undefined> {
    const [template] = await db.select().from(protocolTemplates).where(eq(protocolTemplates.id, id));
    return template || undefined;
  }

  async createProtocolTemplate(insertTemplate: InsertProtocolTemplate): Promise<ProtocolTemplate> {
    const [template] = await db.insert(protocolTemplates).values(insertTemplate).returning();
    return template;
  }

  async updateProtocolTemplate(id: string, updateTemplate: Partial<InsertProtocolTemplate>): Promise<ProtocolTemplate | undefined> {
    const [template] = await db.update(protocolTemplates)
      .set(updateTemplate)
      .where(eq(protocolTemplates.id, id))
      .returning();
    return template || undefined;
  }

  async deleteProtocolTemplate(id: string): Promise<boolean> {
    const result = await db.delete(protocolTemplates).where(eq(protocolTemplates.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Protocol item methods
  async getProtocolItems(templateId: string): Promise<ProtocolItem[]> {
    return await db.select().from(protocolItems)
      .where(eq(protocolItems.templateId, templateId));
  }

  async createProtocolItem(insertItem: InsertProtocolItem): Promise<ProtocolItem> {
    const [item] = await db.insert(protocolItems).values(insertItem).returning();
    return item;
  }

  async updateProtocolItem(id: string, updateItem: Partial<InsertProtocolItem>): Promise<ProtocolItem | undefined> {
    const [item] = await db.update(protocolItems)
      .set(updateItem)
      .where(eq(protocolItems.id, id))
      .returning();
    return item || undefined;
  }

  async deleteProtocolItem(id: string): Promise<boolean> {
    const result = await db.delete(protocolItems).where(eq(protocolItems.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Patient protocol methods
  async getPatientProtocols(patientId: string): Promise<PatientProtocol[]> {
    return await db.select().from(patientProtocols)
      .where(eq(patientProtocols.patientId, patientId));
  }

  async getPatientProtocol(id: string): Promise<PatientProtocol | undefined> {
    const [protocol] = await db.select().from(patientProtocols).where(eq(patientProtocols.id, id));
    return protocol || undefined;
  }

  async createPatientProtocol(insertProtocol: InsertPatientProtocol): Promise<PatientProtocol> {
    const [protocol] = await db.insert(patientProtocols).values(insertProtocol).returning();
    
    // Create timeline entry
    await this.createTimelineEntry({
      patientId: protocol.patientId!,
      type: 'protocol_change',
      title: 'Protocol Assigned',
      description: `Protocol "${protocol.name}" was assigned`,
      date: protocol.startDate
    });

    return protocol;
  }

  async updatePatientProtocol(id: string, updateProtocol: Partial<InsertPatientProtocol>): Promise<PatientProtocol | undefined> {
    const [protocol] = await db.update(patientProtocols)
      .set(updateProtocol)
      .where(eq(patientProtocols.id, id))
      .returning();
    
    if (protocol && updateProtocol.status) {
      await this.createTimelineEntry({
        patientId: protocol.patientId!,
        type: 'protocol_change',
        title: 'Protocol Status Changed',
        description: `Protocol "${protocol.name}" status changed to ${updateProtocol.status}`,
        date: new Date().toISOString().split('T')[0]
      });
    }

    return protocol || undefined;
  }

  // Patient protocol item methods
  async getPatientProtocolItems(patientProtocolId: string): Promise<PatientProtocolItem[]> {
    return await db.select().from(patientProtocolItems)
      .where(eq(patientProtocolItems.patientProtocolId, patientProtocolId));
  }

  async createPatientProtocolItem(insertItem: InsertPatientProtocolItem): Promise<PatientProtocolItem> {
    const [item] = await db.insert(patientProtocolItems).values(insertItem).returning();
    return item;
  }

  async updatePatientProtocolItem(id: string, updateItem: Partial<InsertPatientProtocolItem>): Promise<PatientProtocolItem | undefined> {
    const [item] = await db.update(patientProtocolItems)
      .set(updateItem)
      .where(eq(patientProtocolItems.id, id))
      .returning();
    return item || undefined;
  }

  // Adherence methods
  async getAdherenceRecords(patientProtocolItemId: string, startDate?: string, endDate?: string): Promise<AdherenceRecord[]> {
    if (startDate && endDate) {
      return await db.select().from(adherenceRecords)
        .where(
          and(
            eq(adherenceRecords.patientProtocolItemId, patientProtocolItemId),
            gte(adherenceRecords.date, startDate),
            lte(adherenceRecords.date, endDate)
          )
        );
    }

    return await db.select().from(adherenceRecords)
      .where(eq(adherenceRecords.patientProtocolItemId, patientProtocolItemId));
  }

  async createAdherenceRecord(insertRecord: InsertAdherenceRecord): Promise<AdherenceRecord> {
    const [record] = await db.insert(adherenceRecords).values(insertRecord).returning();
    return record;
  }

  async updateAdherenceRecord(id: string, updateRecord: Partial<InsertAdherenceRecord>): Promise<AdherenceRecord | undefined> {
    const [record] = await db.update(adherenceRecords)
      .set(updateRecord)
      .where(eq(adherenceRecords.id, id))
      .returning();
    return record || undefined;
  }

  async getPatientAdherenceStats(patientId: string, days: number): Promise<{ totalItems: number; completedItems: number; percentage: number }> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all patient protocols for this patient
    const protocols = await db.select().from(patientProtocols)
      .where(eq(patientProtocols.patientId, patientId));

    let totalItems = 0;
    let completedItems = 0;

    for (const protocol of protocols) {
      // Get all items for this protocol
      const items = await db.select().from(patientProtocolItems)
        .where(eq(patientProtocolItems.patientProtocolId, protocol.id));

      for (const item of items) {
        // Get adherence records for this item in the date range
        const records = await this.getAdherenceRecords(
          item.id,
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        );

        totalItems += records.length;
        completedItems += records.filter(r => r.status === 'done').length;
      }
    }

    const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    return { totalItems, completedItems, percentage };
  }

  // Lab test methods
  async getLabTests(patientId: string): Promise<LabTest[]> {
    return await db.select().from(labTests)
      .where(eq(labTests.patientId, patientId));
  }

  async getLabTest(id: string): Promise<LabTest | undefined> {
    const [test] = await db.select().from(labTests).where(eq(labTests.id, id));
    return test || undefined;
  }

  async createLabTest(insertTest: InsertLabTest): Promise<LabTest> {
    const [test] = await db.insert(labTests).values(insertTest).returning();

    // Create timeline entry
    await this.createTimelineEntry({
      patientId: test.patientId!,
      type: 'lab_result',
      title: 'Lab Results Added',
      description: `${test.testName}: ${test.value} ${test.unit}`,
      date: test.testDate
    });

    return test;
  }

  async updateLabTest(id: string, updateTest: Partial<InsertLabTest>): Promise<LabTest | undefined> {
    const [test] = await db.update(labTests)
      .set(updateTest)
      .where(eq(labTests.id, id))
      .returning();
    return test || undefined;
  }

  async deleteLabTest(id: string): Promise<boolean> {
    const result = await db.delete(labTests).where(eq(labTests.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Timeline methods
  async getTimelineEntries(patientId: string): Promise<TimelineEntry[]> {
    return await db.select().from(timelineEntries)
      .where(eq(timelineEntries.patientId, patientId))
      .orderBy(sql`${timelineEntries.date} DESC`);
  }

  async createTimelineEntry(insertEntry: InsertTimelineEntry): Promise<TimelineEntry> {
    const [entry] = await db.insert(timelineEntries).values(insertEntry).returning();
    return entry;
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    totalPatients: number;
    activeProtocols: number;
    recentLabs: number;
    averageAdherence: number;
  }> {
    // Get total patients
    const totalPatientsResult = await db.select({ count: sql<number>`count(*)` }).from(patients);
    const totalPatients = Number(totalPatientsResult[0]?.count || 0);
    
    // Get active protocols
    const activeProtocolsResult = await db.select({ count: sql<number>`count(*)` })
      .from(patientProtocols)
      .where(eq(patientProtocols.status, 'active'));
    const activeProtocols = Number(activeProtocolsResult[0]?.count || 0);
    
    // Get recent labs (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentLabsResult = await db.select({ count: sql<number>`count(*)` })
      .from(labTests)
      .where(gte(labTests.testDate, sevenDaysAgo.toISOString().split('T')[0]));
    const recentLabs = Number(recentLabsResult[0]?.count || 0);

    // Calculate average adherence across all active patients
    const allPatients = await this.getPatients();
    let totalAdherence = 0;
    let patientsWithProtocols = 0;

    for (const patient of allPatients) {
      const adherenceStats = await this.getPatientAdherenceStats(patient.id, 30);
      if (adherenceStats.totalItems > 0) {
        totalAdherence += adherenceStats.percentage;
        patientsWithProtocols++;
      }
    }

    const averageAdherence = patientsWithProtocols > 0 ? Math.round(totalAdherence / patientsWithProtocols) : 0;

    return {
      totalPatients,
      activeProtocols,
      recentLabs,
      averageAdherence
    };
  }

  async getDashboardAdherenceData(): Promise<Array<{ week: string; overall: number; medication: number; }>> {
    const weeks = [];
    const currentDate = new Date();
    
    // Generate data for the last 6 weeks
    for (let i = 5; i >= 0; i--) {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const weekLabel = `Week ${6 - i}`;
      
      // Get all adherence records for this week
      const weekStartStr = weekStart.toISOString().split('T')[0];
      const weekEndStr = weekEnd.toISOString().split('T')[0];
      
      // Get all patient protocol items with adherence records in this week
      const allItems = await db.select()
        .from(patientProtocolItems)
        .innerJoin(patientProtocols, eq(patientProtocolItems.patientProtocolId, patientProtocols.id))
        .where(eq(patientProtocols.status, 'active'));
      
      let totalRecords = 0;
      let completedRecords = 0;
      let medicationRecords = 0;
      let completedMedicationRecords = 0;
      
      for (const item of allItems) {
        const records = await db.select()
          .from(adherenceRecords)
          .where(
            and(
              eq(adherenceRecords.patientProtocolItemId, item.patient_protocol_items.id),
              gte(adherenceRecords.date, weekStartStr),
              lte(adherenceRecords.date, weekEndStr)
            )
          );
        
        totalRecords += records.length;
        completedRecords += records.filter(r => r.status === 'done').length;
        
        // Count medication-specific items
        if (item.patient_protocol_items.type === 'drug' || item.patient_protocol_items.type === 'supplement') {
          medicationRecords += records.length;
          completedMedicationRecords += records.filter(r => r.status === 'done').length;
        }
      }
      
      const overall = totalRecords > 0 ? Math.round((completedRecords / totalRecords) * 100) : 0;
      const medication = medicationRecords > 0 ? Math.round((completedMedicationRecords / medicationRecords) * 100) : 0;
      
      weeks.push({
        week: weekLabel,
        overall,
        medication
      });
    }
    
    return weeks;
  }
}

export const storage = new DatabaseStorage();
