import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import ProtocolForm from "@/components/protocols/protocol-form";
import ProtocolItemForm from "@/components/protocols/protocol-item-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, Edit, Trash, Plus, Eye, Search, Filter, Package, Activity, Leaf, FlaskConical, Dumbbell, Moon, Heart, ShieldX } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import type { ProtocolTemplate, InsertProtocolTemplate, ProtocolItem, InsertProtocolItem } from "@shared/schema";
import { apiRequest } from "@/lib/api";

export default function Protocols() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [showEditTemplateDialog, setShowEditTemplateDialog] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState<ProtocolTemplate | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ProtocolTemplate | null>(null);
  const [selectedItem, setSelectedItem] = useState<ProtocolItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("templates");
  const { toast } = useToast();
  const queryClient = useQueryClient();
// —— Patient-specific mode (no router hooks) ——
 // Patient item dialog state
const [showPatientItemDialog, setShowPatientItemDialog] = useState(false);
const [selectedPatientItem, setSelectedPatientItem] = useState<any | null>(null);

// Create / Update for patient protocol items (re-using the same shape as template form)
const createPatientItemMutation = useMutation({
  mutationFn: async (payload: any) => {
    // payload will come from ProtocolItemForm; we just inject patientProtocolId
    const res = await apiRequest("POST", "/api/patient-protocol-items", {
      ...payload,
      patientProtocolId, // tie to the patient’s protocol
    });
    return res.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/patient-protocols/items", patientProtocolId] });
    setShowPatientItemDialog(false);
    setSelectedPatientItem(null);
  },
});

const updatePatientItemMutation = useMutation({
  mutationFn: async ({ id, data }: { id: string; data: any }) => {
    const res = await apiRequest("PUT", `/api/patient-protocol-items/${id}`, data);
    return res.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/patient-protocols/items", patientProtocolId] });
    setShowPatientItemDialog(false);
    setSelectedPatientItem(null);
  },
});
  
const patientProtocolId =
  typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("patientProtocolId")
    : null;
const isPatientMode = Boolean(patientProtocolId);

// Load the patient protocol + its items when in patient mode
const { data: patientProtocol } = useQuery({
  queryKey: ["/api/patient-protocols", patientProtocolId],
  enabled: isPatientMode,
  queryFn: async () => {
    const res = await apiRequest("GET", `/api/patient-protocols/${patientProtocolId}`);
    return res.json();
  },
});

const { data: patientItems } = useQuery({
  queryKey: ["/api/patient-protocols/items", patientProtocolId],
  enabled: isPatientMode,
  queryFn: async () => {
    const res = await apiRequest("GET", `/api/patient-protocols/${patientProtocolId}/items`);
    return res.json();
  },
});

// Fetch patient to display name in title
const { data: patient } = useQuery({
  queryKey: ["/api/patients", patientProtocol?.patientId],
  enabled: isPatientMode && !!patientProtocol?.patientId,
  queryFn: async () => {
    const res = await apiRequest("GET", `/api/patients/${patientProtocol!.patientId}`);
    return res.json();
  },
});

// Mutations for patient-specific items
const addPatientItem = useMutation({
  mutationFn: async (payload: any) => {
    const res = await apiRequest("POST", "/api/patient-protocol-items", {
      patientProtocolId,
      name: payload.name,
      type: payload.type ?? "supplement",
      dosage: payload.dosage ?? null,
      frequency: payload.frequency ?? null,
      timing: payload.timing ?? null,
      duration: payload.duration ?? null,
      category: payload.category ?? null,
      priority: payload.priority ?? "core",
      order: payload.order ?? 0,
    });
    return res.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/patient-protocols/items", patientProtocolId] });
  },
});

const updatePatientItem = useMutation({
  mutationFn: async ({ id, data }: { id: string; data: any }) => {
    const res = await apiRequest("PUT", `/api/patient-protocol-items/${id}`, data);
    return res.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/patient-protocols/items", patientProtocolId] });
  },
});

const deletePatientItem = useMutation({
  mutationFn: async (id: string) => {
    const res = await apiRequest("DELETE", `/api/patient-protocol-items/${id}`);
    return res.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/patient-protocols/items", patientProtocolId] });
  },
});

// Quick-add state (must be top-level hooks)
const [newName, setNewName] = useState("");
const [newType, setNewType] = useState<"supplement" | "drug" | "lifestyle">("supplement");
const [newDosage, setNewDosage] = useState("");
const [newFrequency, setNewFrequency] = useState("");

// Load the patient protocol + items when in patient mode

  const { data: templates, isLoading } = useQuery<ProtocolTemplate[]>({
    queryKey: ["/api/protocol-templates"],
  });

  const { data: protocolItems, isLoading: isLoadingItems } = useQuery<ProtocolItem[]>({
    queryKey: [`/api/protocol-templates/${selectedTemplate?.id}/items`],
    enabled: !!selectedTemplate?.id,
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: InsertProtocolTemplate) => {
      const response = await apiRequest("POST", "/api/protocol-templates", templateData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/protocol-templates"] });
      setShowCreateDialog(false);
      toast({
        title: "Success",
        description: "Protocol template created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create protocol template",
        variant: "destructive",
      });
    },
  });

  const createItemMutation = useMutation({
    mutationFn: async (itemData: InsertProtocolItem) => {
      const response = await apiRequest("POST", "/api/protocol-items", itemData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/protocol-templates/${selectedTemplate?.id}/items`] });
      setShowItemDialog(false);
      setSelectedItem(null);
      toast({
        title: "Success",
        description: "Protocol item created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create protocol item",
        variant: "destructive",
      });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, ...itemData }: { id: string; [key: string]: any }) => {
      const response = await apiRequest("PATCH", `/api/protocol-items/${id}`, itemData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/protocol-templates/${selectedTemplate?.id}/items`] });
      setShowItemDialog(false);
      setSelectedItem(null);
      toast({
        title: "Success",
        description: "Protocol item updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update protocol item",
        variant: "destructive",
      });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await apiRequest("DELETE", `/api/protocol-items/${itemId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/protocol-templates/${selectedTemplate?.id}/items`] });
      toast({
        title: "Success",
        description: "Protocol item deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete protocol item",
        variant: "destructive",
      });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, ...templateData }: { id: string; [key: string]: any }) => {
      const response = await apiRequest("PATCH", `/api/protocol-templates/${id}`, templateData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/protocol-templates"] });
      setShowEditTemplateDialog(false);
      setTemplateToEdit(null);
      toast({
        title: "Success",
        description: "Protocol template updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update protocol template",
        variant: "destructive",
      });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const response = await apiRequest("DELETE", `/api/protocol-templates/${templateId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/protocol-templates"] });
      setSelectedTemplate(null);
      toast({
        title: "Success",
        description: "Protocol template deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete protocol template",
        variant: "destructive",
      });
    },
  });

  // Helper functions
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "diet_fasting": return <Leaf className="h-4 w-4" />;
      case "repurposed_drugs": return <FlaskConical className="h-4 w-4" />;
      case "nutraceuticals": return <Package className="h-4 w-4" />;
      case "topical": return <Activity className="h-4 w-4" />;
      case "optional_therapies": return <Heart className="h-4 w-4" />;
      case "exercise": return <Dumbbell className="h-4 w-4" />;
      case "sleep": return <Moon className="h-4 w-4" />;
      case "stress": return <Heart className="h-4 w-4" />;
      case "toxins": return <ShieldX className="h-4 w-4" />;
      default: return <ClipboardList className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "diet_fasting": return "bg-green-100 text-green-800 border-green-200";
      case "repurposed_drugs": return "bg-blue-100 text-blue-800 border-blue-200";
      case "nutraceuticals": return "bg-purple-100 text-purple-800 border-purple-200";
      case "topical": return "bg-orange-100 text-orange-800 border-orange-200";
      case "optional_therapies": return "bg-pink-100 text-pink-800 border-pink-200";
      case "exercise": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "sleep": return "bg-slate-100 text-slate-800 border-slate-200";
      case "stress": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "toxins": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "core": return "bg-red-100 text-red-800 border-red-200";
      case "additional": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "optional": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Filter protocol items based on search and filters
  const filteredItems = protocolItems?.filter(item => {
    const matchesSearch = searchQuery === "" || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.instructions?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.dosage?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesPriority = priorityFilter === "all" || item.priority === priorityFilter;
    
    return matchesSearch && matchesCategory && matchesPriority;
  }) || [];

   const formatDate = (d?: string | Date | null) => {
    if (!d) return "-";
    const dt = new Date(d);
    return Number.isNaN(dt.getTime()) ? "-" : dt.toLocaleDateString();
  };
  
  if (patientProtocolId) {

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title={patient ? `${patient.name} — ${patientProtocol?.name ?? "Protocol"}` : "Patient Protocol"}
        onQuickAdd={() => {
          setSelectedPatientItem(null);
          setShowPatientItemDialog(true);
        }}
      />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {(patient && patientProtocol)
                  ? `${patient.name} — ${patientProtocol.name}`
                  : (patientProtocol?.name ?? "Patient Protocol")}
              </h3>
              {patientProtocol && (
                <p className="text-sm text-muted-foreground">
                  Status: <b>{patientProtocol?.status ?? "-"}</b>{" "}
                  • Start: {formatDate(patientProtocol?.startDate)}
                  {patientProtocol?.endDate && <> • End: {formatDate(patientProtocol.endDate)}</>}
               </p>
              )}
            </div>
            <Button variant="outline" onClick={() => { window.location.href = "/protocols"; }}>
              Back to Templates
            </Button>
          </div>

          {/* Toolbar (patient mode) */}
          <div className="flex items-center justify-between">
            <div />
            <Button
              onClick={() => {
                setSelectedPatientItem(null);
                setShowPatientItemDialog(true);
              }}
            >
              Add Item
            </Button>
          </div>

          {/* Items grid */}
          {!patientItems ? (
            <div className="text-center py-12">
              <div className="text-lg text-muted-foreground">Loading protocol items...</div>
            </div>
          ) : patientItems.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-muted-foreground">
                  <p className="text-lg mb-2">No items yet</p>
                  <p className="text-sm">Use the quick add row above to add the first item</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patientItems.map((it: any) => (
                <Card key={it.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h5 className="font-medium text-foreground text-sm">{it.name}</h5>
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedPatientItem(it);
                            setShowPatientItemDialog(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deletePatientItem.mutate(it.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                    {it.dosage && <p className="text-xs text-muted-foreground mb-1"><b>Dosage:</b> {it.dosage}</p>}
                    {it.frequency && <p className="text-xs text-muted-foreground"><b>Frequency:</b> {it.frequency}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        title="Protocol Management" 
        onQuickAdd={() => setShowCreateDialog(true)}
      />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Protocol Management</h3>
              <p className="text-sm text-muted-foreground">Manage protocol templates and individual protocol items</p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-protocol">
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="templates" data-testid="tab-templates">Protocol Templates</TabsTrigger>
              <TabsTrigger value="items" data-testid="tab-items" disabled={!selectedTemplate}>
                Protocol Items {selectedTemplate ? `(${selectedTemplate.name})` : ''}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-md font-medium text-foreground">Available Templates</h4>
                  <p className="text-sm text-muted-foreground">Select a template to view and manage its protocol items</p>
                </div>
              </div>

          {/* Protocol Templates Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-lg text-muted-foreground">Loading protocols...</div>
            </div>
          ) : !templates || templates.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <ClipboardList className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <div className="text-muted-foreground">
                  <p className="text-lg mb-2">No protocol templates found</p>
                  <p className="text-sm">Create your first protocol template to get started</p>
                </div>
                <Button 
                  onClick={() => setShowCreateDialog(true)} 
                  className="mt-4"
                  data-testid="button-create-first-protocol"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Protocol Template
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow" data-testid={`card-protocol-${template.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <ClipboardList className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground" data-testid={`text-protocol-name-${template.id}`}>
                            {template.name}
                          </h4>
                          {template.cancerType && (
                            <p className="text-sm text-muted-foreground">{template.cancerType}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => {
                            setTemplateToEdit(template);
                            setShowEditTemplateDialog(true);
                          }}
                          data-testid={`button-edit-protocol-${template.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this template? This will also delete all its items.')) {
                              deleteTemplateMutation.mutate(template.id);
                            }
                          }}
                          data-testid={`button-delete-protocol-${template.id}`}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {template.description && (
                      <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                    )}

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Created:</span>
                        <span className="font-medium text-foreground">
                          {formatDate(template.createdAt!)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setActiveTab("items");
                        }}
                        data-testid={`button-view-items-${template.id}`}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Protocol
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
            </TabsContent>

            <TabsContent value="items" className="space-y-6">
              {selectedTemplate && (
                <>
                  {/* Protocol Header */}
                  <div className="border-b pb-4 mb-6">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <ClipboardList className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground" data-testid="text-selected-protocol-name">
                          {selectedTemplate.name}
                        </h3>
                        {selectedTemplate.description && (
                          <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                        )}
                        {selectedTemplate.cancerType && (
                          <p className="text-xs text-muted-foreground">Cancer Type: {selectedTemplate.cancerType}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Manage protocol items for this template. Items can be added, edited, or removed.
                    </p>
                  </div>

                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search protocol items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-items"
                      />
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-category-filter">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="diet_fasting">Diet & Fasting</SelectItem>
                        <SelectItem value="repurposed_drugs">Repurposed Drugs</SelectItem>
                        <SelectItem value="nutraceuticals">Nutraceuticals</SelectItem>
                        <SelectItem value="topical">Topical</SelectItem>
                        <SelectItem value="optional_therapies">Optional Therapies</SelectItem>
                        <SelectItem value="exercise">Exercise</SelectItem>
                        <SelectItem value="sleep">Sleep</SelectItem>
                        <SelectItem value="stress">Stress</SelectItem>
                        <SelectItem value="toxins">Toxins</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-full sm:w-[150px]" data-testid="select-priority-filter">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="core">Core</SelectItem>
                        <SelectItem value="additional">Additional</SelectItem>
                        <SelectItem value="optional">Optional</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => {
                        setSelectedItem(null);
                        setShowItemDialog(true);
                      }}
                      data-testid="button-add-item"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>

                  {/* Protocol Items Grid */}
                  {isLoadingItems ? (
                    <div className="text-center py-12">
                      <div className="text-lg text-muted-foreground">Loading protocol items...</div>
                    </div>
                  ) : filteredItems.length === 0 ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <div className="text-muted-foreground">
                          <p className="text-lg mb-2">No protocol items found</p>
                          <p className="text-sm">Add protocol items to this template or adjust your filters</p>
                        </div>
                        <Button
                          onClick={() => {
                            setSelectedItem(null);
                            setShowItemDialog(true);
                          }}
                          className="mt-4"
                          data-testid="button-add-first-item"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Item
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredItems.map((item) => (
                        <Card key={item.id} className="hover:shadow-lg transition-shadow" data-testid={`card-item-${item.id}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                {getCategoryIcon(item.category)}
                                <h5 className="font-medium text-foreground text-sm" data-testid={`text-item-name-${item.id}`}>
                                  {item.name}
                                </h5>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Button size="sm" variant="ghost" onClick={() => {
                                  setSelectedItem(item);
                                  setShowItemDialog(true);
                                }} data-testid={`button-edit-item-${item.id}`}>
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => deleteItemMutation.mutate(item.id)} data-testid={`button-delete-item-${item.id}`}>
                                  <Trash className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1 mb-3">
                              <Badge variant="outline" className={`text-xs ${getCategoryColor(item.category)}`}>
                                {item.category.replace('_', ' ')}
                              </Badge>
                              <Badge variant="outline" className={`text-xs ${getPriorityColor(item.priority)}`}>
                                {item.priority}
                              </Badge>
                              {item.type && (
                                <Badge variant="secondary" className="text-xs">
                                  {item.type}
                                </Badge>
                              )}
                            </div>

                            {item.dosage && (
                              <p className="text-xs text-muted-foreground mb-2">
                                <span className="font-medium">Dosage:</span> {item.dosage}
                              </p>
                            )}

                            {item.frequency && (
                              <p className="text-xs text-muted-foreground mb-2">
                                <span className="font-medium">Frequency:</span> {item.frequency}
                              </p>
                            )}

                            {item.foodRequirement && (
                              <p className="text-xs text-muted-foreground mb-2">
                                <span className="font-medium">Food:</span> {item.foodRequirement.replace('_', ' ')}
                              </p>
                            )}

                            {item.instructions && (
                              <p className="text-xs text-muted-foreground line-clamp-3">
                                {item.instructions}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Create Protocol Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Protocol Template</DialogTitle>
            </DialogHeader>
            <ProtocolForm
              onSubmit={(data) => createTemplateMutation.mutate(data)}
              onCancel={() => setShowCreateDialog(false)}
              isLoading={createTemplateMutation.isPending}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Protocol Template Dialog */}
        <Dialog open={showEditTemplateDialog} onOpenChange={setShowEditTemplateDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Protocol Template</DialogTitle>
            </DialogHeader>
            {templateToEdit && (
              <ProtocolForm
                onSubmit={(data) => updateTemplateMutation.mutate({ id: templateToEdit.id, ...data })}
                onCancel={() => {
                  setShowEditTemplateDialog(false);
                  setTemplateToEdit(null);
                }}
                isLoading={updateTemplateMutation.isPending}
                defaultValues={{
                  name: templateToEdit.name,
                  description: templateToEdit.description || '',
                  cancerType: templateToEdit.cancerType || ''
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Protocol Item Dialog */}
        <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedItem ? 'Edit Protocol Item' : 'Add Protocol Item'}</DialogTitle>
            </DialogHeader>
            {selectedTemplate && (
              <ProtocolItemForm
                templateId={selectedTemplate.id}
                onSubmit={(data) => {
                  if (selectedItem) {
                    updateItemMutation.mutate({ id: selectedItem.id, ...data });
                  } else {
                    createItemMutation.mutate(data);
                  }
                }}
                onCancel={() => {
                  setShowItemDialog(false);
                  setSelectedItem(null);
                }}
                isLoading={selectedItem ? updateItemMutation.isPending : createItemMutation.isPending}
                defaultValues={selectedItem || undefined}
              />
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
