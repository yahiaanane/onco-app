import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import LabForm from "@/components/labs/lab-form";
import LabChart from "@/components/labs/lab-chart";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, FlaskConical } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Patient, LabTest, InsertLabTest } from "@shared/schema";

export default function Labs() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [testTypeFilter, setTestTypeFilter] = useState<string>("");
  const [timeRangeFilter, setTimeRangeFilter] = useState<string>("30");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: patients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const { data: labs, isLoading } = useQuery<LabTest[]>({
    queryKey: selectedPatient ? ["/api/patients", selectedPatient, "labs"] : null,
    enabled: !!selectedPatient,
  });

  const createLabMutation = useMutation({
    mutationFn: async (labData: InsertLabTest) => {
      const response = await apiRequest("POST", "/api/labs", labData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      setShowAddDialog(false);
      toast({
        title: "Success",
        description: "Lab results added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add lab results",
        variant: "destructive",
      });
    },
  });

  const filteredLabs = (labs as any[])?.filter((lab: any) => {
    if (testTypeFilter && testTypeFilter !== 'all' && lab.testName !== testTypeFilter) return false;
    
    if (timeRangeFilter !== "all") {
      const daysAgo = parseInt(timeRangeFilter);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
      if (new Date(lab.testDate) < cutoffDate) return false;
    }
    
    return true;
  }) || [];

  const uniqueTestTypes = Array.from(new Set((labs as any[])?.map(l => l.testName) || []));

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'low':
      case 'high':
        return 'secondary';
      case 'critical':
        return 'destructive';
      case 'normal':
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        title="Lab Results" 
        onQuickAdd={() => setShowAddDialog(true)}
      />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Lab Results</h3>
              <p className="text-sm text-muted-foreground">Track and analyze patient lab results</p>
            </div>
            <Button onClick={() => setShowAddDialog(true)} data-testid="button-add-lab">
              <Plus className="h-4 w-4 mr-2" />
              Add Lab Results
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Patient</label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger data-testid="select-patient">
                      <SelectValue placeholder="Select Patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients?.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Test Type</label>
                  <Select value={testTypeFilter} onValueChange={setTestTypeFilter}>
                    <SelectTrigger data-testid="select-test-type">
                      <SelectValue placeholder="All Tests" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tests</SelectItem>
                      {uniqueTestTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Time Range</label>
                  <Select value={timeRangeFilter} onValueChange={setTimeRangeFilter}>
                    <SelectTrigger data-testid="select-time-range">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                      <SelectItem value="365">Last 365 days</SelectItem>
                      <SelectItem value="all">All time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    className="w-full" 
                    variant="secondary"
                    data-testid="button-apply-filters"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chart */}
          {selectedPatient && filteredLabs.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-foreground">
                    Lab Trends - {patients?.find(p => p.id === selectedPatient)?.name}
                  </h4>
                </div>
                <LabChart labs={filteredLabs} />
              </CardContent>
            </Card>
          )}

          {/* Lab Results Table */}
          {selectedPatient ? (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Test
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Reference Range
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                      {isLoading ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-muted-foreground">
                            Loading lab results...
                          </td>
                        </tr>
                      ) : filteredLabs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                            <FlaskConical className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>No lab results found</p>
                            <p className="text-sm">Add lab results to track patient progress</p>
                          </td>
                        </tr>
                      ) : (
                        filteredLabs.map((lab: any) => (
                          <tr key={lab.id} className="hover:bg-muted/50 transition-colors" data-testid={`row-lab-${lab.id}`}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                              {formatDate(lab.testDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                              {lab.testName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                              {lab.value} {lab.unit}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              {lab.referenceRangeMin && lab.referenceRangeMax ? (
                                `${lab.referenceRangeMin}-${lab.referenceRangeMax} ${lab.unit}`
                              ) : (
                                'N/A'
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {lab.status && (
                                <Badge variant={getStatusColor(lab.status)} data-testid={`badge-status-${lab.id}`}>
                                  {lab.status}
                                </Badge>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              {lab.notes || '-'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FlaskConical className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <div className="text-muted-foreground">
                  <p className="text-lg mb-2">Select a patient to view lab results</p>
                  <p className="text-sm">Choose a patient from the dropdown above to see their lab history</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Add Lab Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Lab Results</DialogTitle>
            </DialogHeader>
            <LabForm
              onSubmit={(data) => createLabMutation.mutate(data)}
              onCancel={() => setShowAddDialog(false)}
              isLoading={createLabMutation.isPending}
              patients={patients || []}
            />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
