import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPatientProtocolSchema } from "@shared/schema";
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

app.post("/api/patient-protocols", async (req, res) => {
  try {
    const { patientId, templateId } = req.body ?? {};

    // Helper: normalize to Date (handles string or Date or missing)
    const toDate = (v: unknown) => {
      if (v instanceof Date) return v;
      if (typeof v === "string") return new Date(v);
      return new Date();
    };

    // Path A: assigning from a template with a minimal payload
    if (templateId) {
      if (!patientId) {
        return res.status(400).json({
          message: "Invalid protocol data",
          errors: [{ path: ["patientId"], message: "patientId is required" }],
        });
      }

      const tpl = await storage.getProtocolTemplate(templateId);
      if (!tpl) return res.status(404).json({ message: "Protocol template not found" });

      const startDate = toDate(req.body?.startDate ?? new Date());

      // Build a complete payload with sensible defaults
      const candidate = {
        patientId,
        templateId,
        name: req.body?.name ?? tpl.name,
        status: req.body?.status ?? "active",
        startDate,
        endDate: req.body?.endDate ? toDate(req.body.endDate) : null,
      };

      // Try strict validation; if Zod is picky about Date, we already coerced it
      let protocolData = candidate as any;
      try {
        protocolData = insertPatientProtocolSchema.parse(candidate);
      } catch {
        // fall back to our normalized candidate
      }

      // Create patient protocol
      const protocol = await storage.createPatientProtocol(protocolData);

      // Copy template items into this patient's protocol
      const tplItems = await storage.getProtocolItems(templateId);
      for (const it of tplItems) {
        await storage.createPatientProtocolItem({
          patientProtocolId: protocol.id,
          name: it.name,
          type: it.type,
          category: it.category,
          priority: it.priority ?? "core",
          dosage: it.dosage ?? null,
          frequency: it.frequency ?? null,
          timing: it.timing ?? null,
          duration: it.duration ?? null,
          rationale: it.rationale ?? null,
          cautions: it.cautions ?? null,
          instructions: it.instructions ?? null,
          foodRequirement: it.foodRequirement ?? null,
          order: it.order ?? 0,
        });
      }

      return res.status(201).json(protocol);
    }

    // Path B: custom protocol creation (expects full fields)
    const protocolData = insertPatientProtocolSchema.parse({
      ...req.body,
      startDate: toDate(req.body?.startDate ?? new Date()),
      endDate: req.body?.endDate ? toDate(req.body.endDate) : null,
    });
    const protocol = await storage.createPatientProtocol(protocolData);

    // If custom items[] provided, create them too
    if (Array.isArray(req.body?.items)) {
      for (const it of req.body.items) {
        await storage.createPatientProtocolItem({
          patientProtocolId: protocol.id,
          name: it.name,
          type: it.type,
          category: it.category,
          priority: it.priority ?? "core",
          dosage: it.dosage ?? null,
          frequency: it.frequency ?? null,
          timing: it.timing ?? null,
          duration: it.duration ?? null,
          rationale: it.rationale ?? null,
          cautions: it.cautions ?? null,
          instructions: it.instructions ?? null,
          foodRequirement: it.foodRequirement ?? null,
          order: it.order ?? 0,
        });
      }
    }

    return res.status(201).json(protocol);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid protocol data", errors: error.errors });
    }
    console.error("Assign protocol failed:", (error as Error).message);
    return res.status(500).json({ message: "Failed to assign protocol" });
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

  app.post("/api/patient-protocol-items", async (req, res) => {
  try {
    const body = req.body ?? {};
    const candidate = {
      patientProtocolId: body.patientProtocolId,
      name: body.name,
      type: body.type ?? "supplement",
      category: body.category ?? null,
      priority: body.priority ?? "core",
      dosage: body.dosage ?? null,
      frequency: body.frequency ?? null,
      timing: body.timing ?? null,
      duration: body.duration ?? null,
      rationale: body.rationale ?? null,
      cautions: body.cautions ?? null,
      instructions: body.instructions ?? null,
      foodRequirement: body.foodRequirement ?? null,
      order: body.order ?? 0,
    };
    const itemData = insertPatientProtocolItemSchema.parse(candidate);
    const item = await storage.createPatientProtocolItem(itemData);
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
  

app.get("/api/patient-protocols/:patientId", async (req, res) => {
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

  // Delete a patient’s protocol assignment (does NOT delete the template)
app.delete("/api/patient-protocols/:protocolId", async (req, res) => {
  try {
    const ok = await storage.deletePatientProtocol(req.params.protocolId);
    if (!ok) return res.status(404).json({ message: "Protocol not found" });
    res.json({ message: "Protocol unassigned" });
  } catch (error) {
    res.status(500).json({ message: "Failed to unassign protocol" });
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
    const body = req.body ?? {};

    // Allow minimal input from the UI and fill safe defaults
    const candidate = {
      patientProtocolId: body.patientProtocolId, // REQUIRED
      name: body.name,                            // REQUIRED
      type: body.type ?? "supplement",
      category: body.category ?? null,
      priority: body.priority ?? "core",
      dosage: body.dosage ?? null,
      frequency: body.frequency ?? null,
      timing: body.timing ?? null,
      duration: body.duration ?? null,
      rationale: body.rationale ?? null,
      cautions: body.cautions ?? null,
      instructions: body.instructions ?? null,
      foodRequirement: body.foodRequirement ?? null,
      order: body.order ?? 0,
    };

    const itemData = insertPatientProtocolItemSchema.parse(candidate);
    const item = await storage.createPatientProtocolItem(itemData);
    res.status(201).json(item);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid item data", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to create protocol item" });
  }
});
  app.put("/api/patient-protocol-items/:itemId", async (req, res) => {
  try {
    // allow partial updates (name, dosage, frequency, timing, etc.)
    const partialSchema = insertPatientProtocolItemSchema.partial();
    const updateData = partialSchema.parse(req.body);

    const item = await storage.updatePatientProtocolItem(req.params.itemId, updateData);
    if (!item) return res.status(404).json({ message: "Protocol item not found" });
    res.json(item);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid item data", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to update protocol item" });
  }
});
  app.delete("/api/patient-protocol-items/:itemId", async (req, res) => {
  try {
    const ok = await storage.deletePatientProtocolItem(req.params.itemId);
    if (!ok) return res.status(404).json({ message: "Protocol item not found" });
    res.json({ message: "Protocol item deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete protocol item" });
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
