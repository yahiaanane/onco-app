import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Phone, Calendar, Heart, Ruler, Weight, MapPin, FileText, TestTube, History, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Patient, LabTest, PatientProtocol, TimelineEntry } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";


interface PatientDetailsDialogProps {
  patient: Patient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddLab?: (patient: Patient) => void;
  onAssignProtocol?: (patient: Patient) => void;
}
function EditAddRow({ onAdd }: { onAdd: (payload: any) => void }) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"supplement" | "drug" | "lifestyle">("supplement");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");

  return (
    <div className="flex items-center gap-2">
      <Input placeholder="name" value={name} onChange={(e) => setName(e.target.value)} className="w-64" />
      <Select value={type} onValueChange={(v) => setType(v as any)}>
        <SelectTrigger className="w-36"><SelectValue placeholder="type" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="supplement">Supplement</SelectItem>
          <SelectItem value="drug">Drug</SelectItem>
          <SelectItem value="lifestyle">Lifestyle</SelectItem>
        </SelectContent>
      </Select>
      <Input placeholder="dosage" value={dosage} onChange={(e) => setDosage(e.target.value)} className="w-40" />
      <Input placeholder="frequency" value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-40" />
      <Button
        size="sm"
        onClick={() => {
          if (!name.trim()) return;
          onAdd({ name, type, dosage, frequency });
          setName(""); setDosage(""); setFrequency("");
        }}
      >
        Add
      </Button>
    </div>
  );
}
export default function PatientDetailsDialog({ 
  patient, 
  open, 
  onOpenChange,
  onAddLab,
  onAssignProtocol
}: PatientDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  const updateProtocolStatusMutation = useMutation({
    mutationFn: async ({ protocolId, status }: { protocolId: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/patient-protocols/${protocolId}`, {
        status,
        endDate: status === 'completed' ? new Date().toISOString().split('T')[0] : null
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patient-protocols"] });
      queryClient.invalidateQueries({ queryKey: ["/api/timeline", patient?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/adherence"] });
      toast({
        title: "Success",
        description: "Protocol status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update protocol status",
        variant: "destructive",
      });
    },
  });

  // Which protocol we're editing
const [editProtocolId, setEditProtocolId] = useState<string | null>(null);

// Load items for the dialog
const { data: editItems } = useQuery({
  queryKey: ["/api/patient-protocols/items", editProtocolId],
  enabled: !!editProtocolId,
  queryFn: async () => {
    const res = await apiRequest("GET", `/api/patient-protocols/${editProtocolId}/items`);
    return res.json() as Promise<any[]>;
  },
});

  const addItemMutation = useMutation({
  mutationFn: async (payload: any) => {
    const res = await apiRequest("POST", "/api/patient-protocol-items", payload);
    return res.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/patient-protocols/items", editProtocolId] });
  },
});

const updateItemMutation = useMutation({
  mutationFn: async ({ id, data }: { id: string; data: any }) => {
    const res = await apiRequest("PUT", `/api/patient-protocol-items/${id}`, data);
    return res.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/patient-protocols/items", editProtocolId] });
  },
});

const deleteItemMutation = useMutation({
  mutationFn: async (id: string) => {
    const res = await apiRequest("DELETE", `/api/patient-protocol-items/${id}`);
    return res.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/patient-protocols/items", editProtocolId] });
  },
});

  
  const deletePatientProtocolMutation = useMutation({
  mutationFn: async (protocolId: string) => {
    const response = await apiRequest("DELETE", `/api/patient-protocols/${protocolId}`);
    return response.json();
  },
  onSuccess: () => {
    // refresh just this patient's protocols + dashboards/timeline
    queryClient.invalidateQueries({ queryKey: ["/api/patient-protocols", patient?.id] });
    queryClient.invalidateQueries({ queryKey: ["/api/timeline", patient?.id] });
    queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    queryClient.invalidateQueries({ queryKey: ["/api/dashboard/adherence"] });
    // If you use toasts in this file already:
    // toast({ title: "Unassigned", description: "Protocol removed for this patient." });
  },
  onError: () => {
    // toast({ title: "Error", description: "Failed to unassign protocol", variant: "destructive" });
    alert("Failed to unassign protocol");
  },
});
  
  const { data: labTests } = useQuery<LabTest[]>({
    queryKey: [`/api/patients/${patient?.id}/labs`],
    enabled: !!patient?.id && open,
  });

  const { data: protocols } = useQuery<PatientProtocol[]>({
    queryKey: ["/api/patient-protocols", patient?.id],
    enabled: !!patient?.id && open,
  });

  // ——— add below your other hooks ———
const [viewProtocolId, setViewProtocolId] = useState<string | null>(null);

const { data: viewDetails } = useQuery({
  queryKey: ["/api/patient-protocols/details", viewProtocolId],
  enabled: !!viewProtocolId,
  queryFn: async () => {
    const res = await fetch(`/api/patient-protocols/${viewProtocolId}/details`);
    if (!res.ok) throw new Error("Failed to load protocol details");
    return res.json() as Promise<{ protocol: PatientProtocol; items: any[] }>;
  },
});

const unassignProtocol = useMutation({
  mutationFn: async (protocolId: string) => {
    const res = await fetch(`/api/patient-protocols/${protocolId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to unassign protocol");
    return res.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/patient-protocols", patient.id] });
    toast?.({ title: "Unassigned", description: "Protocol removed for this patient." });
  },
  onError: (e: any) => {
    const msg = e?.message ?? "Unassign failed";
    toast?.({ title: "Error", description: msg, variant: "destructive" }) ?? alert(msg);
  },
});
  

  const { data: timeline } = useQuery<TimelineEntry[]>({
    queryKey: ["/api/timeline", patient?.id],
    enabled: !!patient?.id && open,
  });

  if (!patient) return null;

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  const calculateBMI = () => {
    if (!patient.height || !patient.weight) return null;
    const heightM = parseFloat(patient.height.toString()) / 100;
    const weightKg = parseFloat(patient.weight.toString());
    return (weightKg / (heightM * heightM)).toFixed(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStageColor = (stage: string) => {
    if (stage.toLowerCase().includes('iv') || stage.toLowerCase().includes('4')) {
      return 'destructive';
    }
    if (stage.toLowerCase().includes('iii') || stage.toLowerCase().includes('3')) {
      return 'secondary';
    }
    if (stage.toLowerCase().includes('ii') || stage.toLowerCase().includes('2')) {
      return 'outline';
    }
    return 'default';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {patient.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
            <div>
              <div className="text-lg font-semibold">{patient.name}</div>
              <div className="text-sm text-muted-foreground">
                {patient.cancerType} • {patient.cancerStage}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" data-testid="tab-overview">
              <User className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="protocols" data-testid="tab-protocols">
              <FileText className="h-4 w-4 mr-2" />
              Protocols
            </TabsTrigger>
            <TabsTrigger value="labs" data-testid="tab-labs">
              <TestTube className="h-4 w-4 mr-2" />
              Labs
            </TabsTrigger>
            <TabsTrigger value="timeline" data-testid="tab-timeline">
              <History className="h-4 w-4 mr-2" />
              Timeline
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 max-h-[60vh] overflow-y-auto">
            <TabsContent value="overview" className="space-y-6 m-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Age</span>
                      <span className="font-medium">{calculateAge(patient.dateOfBirth)} years</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Sex</span>
                      <span className="font-medium capitalize">{patient.sex}</span>
                    </div>
                    {patient.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{patient.email}</span>
                      </div>
                    )}
                    {patient.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{patient.phone}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Medical Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Medical Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Cancer Type</span>
                      <span className="font-medium">{patient.cancerType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Stage</span>
                      <Badge variant={getStageColor(patient.cancerStage)}>
                        {patient.cancerStage}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Diagnosed</span>
                      <span className="font-medium">{formatDate(patient.diagnosisDate)}</span>
                    </div>
                    {patient.height && patient.weight && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Height</span>
                          <span className="font-medium">{patient.height} cm</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Weight</span>
                          <span className="font-medium">{patient.weight} kg</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">BMI</span>
                          <span className="font-medium">{calculateBMI()}</span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Metastasis Information */}
              {patient.metastasisLocations && patient.metastasisLocations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Metastasis Locations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {patient.metastasisLocations.map((location, index) => (
                        <Badge key={index} variant="outline">
                          {location}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Medical Notes */}
              {patient.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Medical Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {patient.notes}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="protocols" className="space-y-4 m-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Assigned Protocols</h3>
                <Button size="sm" onClick={() => onAssignProtocol?.(patient)} data-testid="button-assign-protocol">
                  <Plus className="h-4 w-4 mr-2" />
                  Assign Protocol
                </Button>
              </div>
              {protocols && protocols.length > 0 ? (
                <div className="space-y-4">
                  {protocols.map((protocol) => (
                    <Card key={protocol.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{protocol.name}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant={protocol.status === 'active' ? "default" : protocol.status === 'paused' ? "secondary" : "outline"}>
                              {protocol.status === 'active' ? "Active" : protocol.status === 'paused' ? "Paused" : "Completed"}
                            </Badge>
                            <Select
                              value={protocol.status}
                              onValueChange={(newStatus) => {
                                updateProtocolStatusMutation.mutate({
                                  protocolId: protocol.id,
                                  status: newStatus
                                });
                              }}
                              disabled={updateProtocolStatusMutation.isPending}
                            >
                              <SelectTrigger className="w-32 h-8" data-testid={`select-protocol-status-${protocol.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="paused">Paused</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm("Unassign this protocol from the patient?")) {
                                deletePatientProtocolMutation.mutate(protocol.id);
                              }
                            }}
                          >
                            Unassign
                          </Button> 
                           <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/protocols?patientProtocolId=${protocol.id}`)}
                              >
                                View
                              </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Started: {formatDate(protocol.startDate)}
                        </p>
                        {protocol.endDate && (
                          <p className="text-sm text-muted-foreground">
                            Ended: {formatDate(protocol.endDate)}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground mb-4">No protocols assigned yet</p>
                    <Button onClick={() => onAssignProtocol?.(patient)} data-testid="button-assign-first-protocol">
                      <Plus className="h-4 w-4 mr-2" />
                      Assign First Protocol
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="labs" className="space-y-4 m-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Lab Results</h3>
                <Button size="sm" onClick={() => onAddLab?.(patient)} data-testid="button-add-lab-results">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lab Results
                </Button>
              </div>
              {labTests && labTests.length > 0 ? (
                <div className="space-y-4">
                  {labTests.map((lab) => (
                    <Card key={lab.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{lab.testName}</h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">
                              {lab.value} {lab.unit}
                            </span>
                            {lab.status && (
                              <Badge variant={
                                lab.status === 'normal' ? 'default' :
                                lab.status === 'high' || lab.status === 'low' ? 'secondary' :
                                lab.status === 'critical' ? 'destructive' : 'outline'
                              }>
                                {lab.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(lab.testDate)}
                        </p>
                        {lab.referenceRangeMin && lab.referenceRangeMax && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Reference: {lab.referenceRangeMin} - {lab.referenceRangeMax} {lab.unit}
                          </p>
                        )}
                        {lab.notes && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {lab.notes}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground mb-4">No lab results yet</p>
                    <Button onClick={() => onAddLab?.(patient)} data-testid="button-add-first-lab">
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Lab Result
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4 m-0">
              <h3 className="text-lg font-semibold">Patient Timeline</h3>
              {timeline && timeline.length > 0 ? (
                <div className="space-y-4">
                  {timeline.map((entry) => (
                    <Card key={entry.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{entry.title}</h4>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(entry.date)}
                          </span>
                        </div>
                        {entry.description && (
                          <p className="text-sm text-muted-foreground">
                            {entry.description}
                          </p>
                        )}
                        <Badge variant="outline" className="mt-2 text-xs">
                          {entry.type.replace('_', ' ')}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No timeline entries yet</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </div>
        </Tabs>
        <Dialog open={!!editProtocolId} onOpenChange={(o) => !o && setEditProtocolId(null)}>
  <DialogContent className="max-w-3xl">
    <DialogHeader>
      <DialogTitle>Edit Protocol Items</DialogTitle>
    </DialogHeader>

    {/* Items list */}
    <div className="space-y-3 max-h-[50vh] overflow-auto">
      {(!editItems || editItems.length === 0) ? (
        <p className="text-sm text-muted-foreground">No items yet.</p>
      ) : (
        editItems.map((it: any) => (
          <div key={it.id} className="flex items-center gap-2 text-sm">
            <Input
              defaultValue={it.name}
              onBlur={(e) =>
                e.target.value !== it.name &&
                updateItemMutation.mutate({ id: it.id, data: { name: e.target.value } })
              }
              className="w-64"
            />
            <Input
              placeholder="dosage"
              defaultValue={it.dosage ?? ""}
              onBlur={(e) =>
                (e.target.value ?? "") !== (it.dosage ?? "") &&
                updateItemMutation.mutate({ id: it.id, data: { dosage: e.target.value || null } })
              }
              className="w-40"
            />
            <Input
              placeholder="frequency"
              defaultValue={it.frequency ?? ""}
              onBlur={(e) =>
                (e.target.value ?? "") !== (it.frequency ?? "") &&
                updateItemMutation.mutate({ id: it.id, data: { frequency: e.target.value || null } })
              }
              className="w-40"
            />
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm("Remove this recommendation for this patient?")) {
                  deleteItemMutation.mutate(it.id);
                }
              }}
            >
              Remove
            </Button>
          </div>
        ))
      )}
    </div>

    <Separator className="my-3" />

    {/* Quick add row */}
    <EditAddRow
      onAdd={(payload) =>
        addItemMutation.mutate({
          patientProtocolId: editProtocolId,
          name: payload.name,
          type: payload.type, // 'supplement' | 'drug' | 'lifestyle'
          dosage: payload.dosage || null,
          frequency: payload.frequency || null,
          timing: payload.timing || null,
          duration: payload.duration || null,
          category: payload.category || null,
          priority: payload.priority || "core",
          order: payload.order ?? 0,
        })
      }
    />
  </DialogContent>
</Dialog>
      </DialogContent>
    </Dialog>
  );
}
