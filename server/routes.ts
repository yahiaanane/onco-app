import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertPatientSchema,
  insertProtocolTemplateSchema,
  insertProtocolItemSchema,
  insertPatientProtocolSchema,
  insertPatientProtocolItemSchema,
  insertAdherenceRecordSchema,
  insertLabTestSchema,
  insertTimelineEntrySchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Patient routes
  app.get("/api/patients", async (req, res) => {
    try {
      const { search } = req.query;
      let patients;
      
      if (search && typeof search === 'string') {
        patients = await storage.searchPatients(search);
      } else {
        patients = await storage.getPatients();
      }
      
      res.json(patients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  app.get("/api/patients/:id", async (req, res) => {
    try {
      const patient = await storage.getPatient(req.params.id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      res.json(patient);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patient" });
    }
  });

  app.post("/api/patients", async (req, res) => {
    try {
      const patientData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(patientData);
      res.status(201).json(patient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid patient data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create patient" });
    }
  });

  app.put("/api/patients/:id", async (req, res) => {
    try {
      const patientData = insertPatientSchema.partial().parse(req.body);
      const patient = await storage.updatePatient(req.params.id, patientData);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      res.json(patient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid patient data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update patient" });
    }
  });

  app.delete("/api/patients/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePatient(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Patient not found" });
      }
      res.json({ message: "Patient deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete patient" });
    }
  });

  // Protocol template routes
  app.get("/api/protocol-templates", async (req, res) => {
    try {
      const templates = await storage.getProtocolTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch protocol templates" });
    }
  });

  app.get("/api/protocol-templates/:id", async (req, res) => {
    try {
      const template = await storage.getProtocolTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Protocol template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch protocol template" });
    }
  });

  app.post("/api/protocol-templates", async (req, res) => {
    try {
      const templateData = insertProtocolTemplateSchema.parse(req.body);
      const template = await storage.createProtocolTemplate(templateData);
      res.status(201).json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid template data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create protocol template" });
    }
  });

  app.patch("/api/protocol-templates/:id", async (req, res) => {
    try {
      const updateData = insertProtocolTemplateSchema.partial().parse(req.body);
      const template = await storage.updateProtocolTemplate(req.params.id, updateData);
      if (!template) {
        return res.status(404).json({ message: "Protocol template not found" });
      }
      res.json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid template data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update protocol template" });
    }
  });

  app.delete("/api/protocol-templates/:id", async (req, res) => {
    try {
      const success = await storage.deleteProtocolTemplate(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Protocol template not found" });
      }
      res.json({ message: "Protocol template deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete protocol template" });
    }
  });

  // Protocol items routes
  app.get("/api/protocol-templates/:templateId/items", async (req, res) => {
    try {
      const items = await storage.getProtocolItems(req.params.templateId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch protocol items" });
    }
  });

  app.post("/api/protocol-items", async (req, res) => {
    try {
      const itemData = insertProtocolItemSchema.parse(req.body);
      const item = await storage.createProtocolItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create protocol item" });
    }
  });

  app.patch("/api/protocol-items/:id", async (req, res) => {
    try {
      const updateData = insertProtocolItemSchema.partial().parse(req.body);
      const item = await storage.updateProtocolItem(req.params.id, updateData);
      if (!item) {
        return res.status(404).json({ message: "Protocol item not found" });
      }
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update protocol item" });
    }
  });

  app.delete("/api/protocol-items/:id", async (req, res) => {
    try {
      const success = await storage.deleteProtocolItem(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Protocol item not found" });
      }
      res.json({ message: "Protocol item deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete protocol item" });
    }
  });

  // Patient protocol routes
  app.get("/api/patients/:patientId/protocols", async (req, res) => {
    try {
      const protocols = await storage.getPatientProtocols(req.params.patientId);
      res.json(protocols);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patient protocols" });
    }
  });

  app.post("/api/patient-protocols", async (req, res) => {
    try {
      const protocolData = insertPatientProtocolSchema.parse(req.body);
      const protocol = await storage.createPatientProtocol(protocolData);
      res.status(201).json(protocol);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid protocol data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to assign protocol" });
    }
  });

  app.patch("/api/patient-protocols/:id", async (req, res) => {
    try {
      const updateData = req.body;
      const protocol = await storage.updatePatientProtocol(req.params.id, updateData);
      if (!protocol) {
        return res.status(404).json({ message: "Protocol not found" });
      }
      res.json(protocol);
    } catch (error) {
      res.status(500).json({ message: "Failed to update protocol" });
    }
  });

  // Patient protocol items routes
  app.get("/api/patient-protocols/:protocolId/items", async (req, res) => {
    try {
      const items = await storage.getPatientProtocolItems(req.params.protocolId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch protocol items" });
    }
  });

  app.post("/api/patient-protocol-items", async (req, res) => {
    try {
      const itemData = insertPatientProtocolItemSchema.parse(req.body);
      const item = await storage.createPatientProtocolItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create protocol item" });
    }
  });

  // Adherence routes
  app.get("/api/adherence/:itemId", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const records = await storage.getAdherenceRecords(
        req.params.itemId,
        startDate as string,
        endDate as string
      );
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch adherence records" });
    }
  });

  app.post("/api/adherence", async (req, res) => {
    try {
      const recordData = insertAdherenceRecordSchema.parse(req.body);
      const record = await storage.createAdherenceRecord(recordData);
      res.status(201).json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid adherence data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to record adherence" });
    }
  });

  app.get("/api/patients/:patientId/adherence-stats", async (req, res) => {
    try {
      const { days = "30" } = req.query;
      const stats = await storage.getPatientAdherenceStats(req.params.patientId, parseInt(days as string));
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch adherence stats" });
    }
  });

  // Lab test routes
  app.get("/api/patients/:patientId/labs", async (req, res) => {
    try {
      const labs = await storage.getLabTests(req.params.patientId);
      res.json(labs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lab tests" });
    }
  });

  app.post("/api/labs", async (req, res) => {
    try {
      const labData = insertLabTestSchema.parse(req.body);
      const lab = await storage.createLabTest(labData);
      res.status(201).json(lab);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid lab data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create lab test" });
    }
  });

  // Timeline routes
  app.get("/api/patients/:patientId/timeline", async (req, res) => {
    try {
      const timeline = await storage.getTimelineEntries(req.params.patientId);
      res.json(timeline);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch timeline" });
    }
  });

  app.post("/api/timeline", async (req, res) => {
    try {
      const entryData = insertTimelineEntrySchema.parse(req.body);
      const entry = await storage.createTimelineEntry(entryData);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid timeline data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create timeline entry" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/dashboard/adherence", async (req, res) => {
    try {
      const adherenceData = await storage.getDashboardAdherenceData();
      res.json(adherenceData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard adherence data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
