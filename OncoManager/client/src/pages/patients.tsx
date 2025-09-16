import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import PatientForm from "@/components/patients/patient-form";
import PatientCard from "@/components/patients/patient-card";
import PatientDetailsDialog from "@/components/patients/patient-details-dialog";
import LabForm from "@/components/labs/lab-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Search, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Patient, InsertPatient, InsertLabTest, ProtocolTemplate } from "@shared/schema";

export default function Patients() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showLabDialog, setShowLabDialog] = useState(false);
  const [showProtocolDialog, setShowProtocolDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cancerTypeFilter, setCancerTypeFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: patients, isLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients", searchQuery],
  });

  const { data: protocolTemplates } = useQuery<ProtocolTemplate[]>({
    queryKey: ["/api/protocol-templates"],
  });

  const createPatientMutation = useMutation({
    mutationFn: async (patientData: InsertPatient) => {
      const response = await apiRequest("POST", "/api/patients", patientData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      setShowAddDialog(false);
      toast({
        title: "Success",
        description: "Patient created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create patient",
        variant: "destructive",
      });
    },
  });

  const updatePatientMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertPatient }) => {
      const response = await apiRequest("PUT", `/api/patients/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      setShowEditDialog(false);
      setSelectedPatient(null);
      toast({
        title: "Success",
        description: "Patient updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update patient",
        variant: "destructive",
      });
    },
  });

  const deletePatientMutation = useMutation({
    mutationFn: async (patientId: string) => {
      const response = await apiRequest("DELETE", `/api/patients/${patientId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      setShowDeleteDialog(false);
      setSelectedPatient(null);
      toast({
        title: "Success",
        description: "Patient deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete patient",
        variant: "destructive",
      });
    },
  });

  const createLabMutation = useMutation({
    mutationFn: async (labData: InsertLabTest) => {
      const response = await apiRequest("POST", "/api/labs", labData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/labs"] });
      // Also invalidate patient-specific lab queries with correct endpoint
      if (selectedPatient) {
        queryClient.invalidateQueries({ queryKey: [`/api/patients/${selectedPatient.id}/labs`] });
      }
      setShowLabDialog(false);
      setSelectedPatient(null);
      toast({
        title: "Success",
        description: "Lab results added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add lab results",
        variant: "destructive",
      });
    },
  });

  const assignProtocolMutation = useMutation({
    mutationFn: async ({ patientId, templateId }: { patientId: string; templateId: string }) => {
      const response = await apiRequest("POST", "/api/patient-protocols", {
        patientId,
        templateId,
        startDate: new Date().toISOString().split('T')[0]
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patient-protocols"] });
      setShowProtocolDialog(false);
      setSelectedPatient(null);
      toast({
        title: "Success",
        description: "Protocol assigned successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to assign protocol",
        variant: "destructive",
      });
    },
  });

  const filteredPatients = patients?.filter((patient) => {
    if (cancerTypeFilter && cancerTypeFilter !== 'all' && patient.cancerType !== cancerTypeFilter) return false;
    if (stageFilter && stageFilter !== 'all' && patient.cancerStage !== stageFilter) return false;
    return true;
  }) || [];

  // Filter out empty/null values to prevent SelectItem errors
  const uniqueCancerTypes = Array.from(new Set((patients?.map(p => p.cancerType) || []))).filter(type => type && type.trim() !== "");
  const uniqueStages = Array.from(new Set((patients?.map(p => p.cancerStage) || []))).filter(stage => stage && stage.trim() !== "");

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        title="Patients" 
        onQuickAdd={() => setShowAddDialog(true)} 
      />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search patients..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-patients"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Select value={cancerTypeFilter} onValueChange={setCancerTypeFilter}>
                    <SelectTrigger className="w-48" data-testid="select-cancer-type">
                      <SelectValue placeholder="All Cancer Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cancer Types</SelectItem>
                      {uniqueCancerTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={stageFilter} onValueChange={setStageFilter}>
                    <SelectTrigger className="w-32" data-testid="select-stage">
                      <SelectValue placeholder="All Stages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stages</SelectItem>
                      {uniqueStages.map((stage) => (
                        <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={() => setShowAddDialog(true)} data-testid="button-add-patient">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Patient
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patients Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-lg text-muted-foreground">Loading patients...</div>
            </div>
          ) : filteredPatients.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-muted-foreground">
                  <p className="text-lg mb-2">No patients found</p>
                  <p className="text-sm">Add your first patient to get started</p>
                </div>
                <Button 
                  onClick={() => setShowAddDialog(true)} 
                  className="mt-4"
                  data-testid="button-add-first-patient"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Patient
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPatients.map((patient) => (
                <PatientCard 
                  key={patient.id} 
                  patient={patient}
                  onViewDetails={(patient) => {
                    setSelectedPatient(patient);
                    setShowDetailsDialog(true);
                  }}
                  onEdit={(patient) => {
                    setSelectedPatient(patient);
                    setShowEditDialog(true);
                  }}
                  onDelete={(patient) => {
                    setSelectedPatient(patient);
                    setShowDeleteDialog(true);
                  }}
                  onAddLab={(patient) => {
                    setSelectedPatient(patient);
                    setShowLabDialog(true);
                  }}
                  onAssignProtocol={(patient) => {
                    setSelectedPatient(patient);
                    setShowProtocolDialog(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add Patient Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
            </DialogHeader>
            <PatientForm
              onSubmit={(data) => createPatientMutation.mutate(data)}
              onCancel={() => setShowAddDialog(false)}
              isLoading={createPatientMutation.isPending}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Patient Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Patient</DialogTitle>
            </DialogHeader>
            {selectedPatient && (
              <PatientForm
                defaultValues={selectedPatient}
                onSubmit={(data) => updatePatientMutation.mutate({ id: selectedPatient.id, data })}
                onCancel={() => {
                  setShowEditDialog(false);
                  setSelectedPatient(null);
                }}
                isLoading={updatePatientMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Patient Details Dialog */}
        <PatientDetailsDialog
          patient={selectedPatient}
          open={showDetailsDialog}
          onOpenChange={(open) => {
            setShowDetailsDialog(open);
            if (!open) setSelectedPatient(null);
          }}
          onAddLab={(patient) => {
            setSelectedPatient(patient);
            setShowDetailsDialog(false);
            setShowLabDialog(true);
          }}
          onAssignProtocol={(patient) => {
            setSelectedPatient(patient);
            setShowDetailsDialog(false);
            setShowProtocolDialog(true);
          }}
        />

        {/* Add Lab Results Dialog */}
        <Dialog open={showLabDialog} onOpenChange={setShowLabDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Lab Results</DialogTitle>
            </DialogHeader>
            {selectedPatient && (
              <LabForm
                patients={patients || []}
                defaultValues={{ patientId: selectedPatient.id }}
                onSubmit={(data) => createLabMutation.mutate(data)}
                onCancel={() => {
                  setShowLabDialog(false);
                  setSelectedPatient(null);
                }}
                isLoading={createLabMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Assign Protocol Dialog */}
        <Dialog open={showProtocolDialog} onOpenChange={setShowProtocolDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Protocol</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Select a protocol template to assign to {selectedPatient?.name}:
              </p>
              {protocolTemplates && protocolTemplates.length > 0 ? (
                <div className="space-y-2">
                  {protocolTemplates.map((template) => (
                    <Card key={template.id} className="cursor-pointer hover:bg-muted/50" 
                          onClick={() => assignProtocolMutation.mutate({ 
                            patientId: selectedPatient!.id, 
                            templateId: template.id 
                          })}
                          data-testid={`protocol-template-${template.id}`}>
                      <CardContent className="p-4">
                        <h4 className="font-medium">{template.name}</h4>
                        {template.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {template.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No protocol templates available. Create one first in the Protocols tab.
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setShowProtocolDialog(false);
                setSelectedPatient(null);
              }}>
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Patient</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedPatient?.name}? This action cannot be undone.
                All associated data including lab results, protocols, and timeline entries will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setShowDeleteDialog(false);
                setSelectedPatient(null);
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => selectedPatient && deletePatientMutation.mutate(selectedPatient.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-testid="confirm-delete-patient"
              >
                Delete Patient
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
