import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import ReportGenerator from "@/components/reports/report-generator";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye, Calendar, Activity } from "lucide-react";
import type { Patient } from "@shared/schema";

export default function Reports() {
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [reportType, setReportType] = useState<string>("complete");
  const [dateRange, setDateRange] = useState<string>("90");
  const [showPreview, setShowPreview] = useState(false);

  const { data: patients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const selectedPatientData = patients?.find(p => p.id === selectedPatient);

  const handleGenerateReport = () => {
    if (!selectedPatient) return;
    
    // In a real application, this would generate and download a PDF
    console.log("Generating report:", {
      patientId: selectedPatient,
      reportType,
      dateRange
    });
  };

  const handlePreviewReport = () => {
    if (!selectedPatient) return;
    setShowPreview(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

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

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Reports" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Reports</h3>
              <p className="text-sm text-muted-foreground">Generate and download patient reports</p>
            </div>
            <Button 
              onClick={handleGenerateReport}
              disabled={!selectedPatient}
              data-testid="button-generate-report"
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>

          {/* Report Generation Options */}
          <Card>
            <CardContent className="p-6">
              <h4 className="text-lg font-semibold text-foreground mb-4">Generate Patient Report</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Select Patient</label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger data-testid="select-patient">
                      <SelectValue placeholder="Choose patient..." />
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
                  <label className="block text-sm font-medium text-foreground mb-2">Report Type</label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger data-testid="select-report-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="complete">Complete Summary</SelectItem>
                      <SelectItem value="adherence">Protocol Adherence</SelectItem>
                      <SelectItem value="labs">Lab Results Summary</SelectItem>
                      <SelectItem value="treatment">Treatment History</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Date Range</label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger data-testid="select-date-range">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="90">Last 90 days</SelectItem>
                      <SelectItem value="180">Last 180 days</SelectItem>
                      <SelectItem value="365">Last 365 days</SelectItem>
                      <SelectItem value="all">All time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Format</label>
                  <Select defaultValue="pdf">
                    <SelectTrigger data-testid="select-format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-6 flex items-center space-x-3">
                <Button 
                  onClick={handleGenerateReport}
                  disabled={!selectedPatient}
                  data-testid="button-generate"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
                <Button 
                  variant="outline"
                  onClick={handlePreviewReport}
                  disabled={!selectedPatient}
                  data-testid="button-preview"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sample Report Preview */}
          {showPreview && selectedPatientData && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-foreground">
                    Report Preview - {selectedPatientData.name}
                  </h4>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowPreview(false)}
                    data-testid="button-close-preview"
                  >
                    Close Preview
                  </Button>
                </div>
                <div className="space-y-6 max-h-96 overflow-y-auto border rounded-lg p-4">
                  {/* Patient Info Section */}
                  <div className="border-b border-border pb-4">
                    <h5 className="font-semibold text-foreground mb-3 flex items-center">
                      <Activity className="h-4 w-4 mr-2" />
                      Patient Information
                    </h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Name:</p>
                        <p className="font-medium text-foreground">{selectedPatientData.name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Date of Birth:</p>
                        <p className="font-medium text-foreground">
                          {formatDate(selectedPatientData.dateOfBirth)} (Age {calculateAge(selectedPatientData.dateOfBirth)})
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Cancer Type:</p>
                        <p className="font-medium text-foreground">{selectedPatientData.cancerType}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Stage:</p>
                        <p className="font-medium text-foreground">{selectedPatientData.cancerStage}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Diagnosis Date:</p>
                        <p className="font-medium text-foreground">{formatDate(selectedPatientData.diagnosisDate)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Sex:</p>
                        <p className="font-medium text-foreground capitalize">{selectedPatientData.sex}</p>
                      </div>
                      {selectedPatientData.metastasisLocations && selectedPatientData.metastasisLocations.length > 0 && (
                        <div className="col-span-2">
                          <p className="text-muted-foreground mb-1">Metastasis Locations:</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedPatientData.metastasisLocations.map((location, index) => (
                              <Badge key={index} variant="outline">{location}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact Information */}
                  {(selectedPatientData.email || selectedPatientData.phone) && (
                    <div className="border-b border-border pb-4">
                      <h5 className="font-semibold text-foreground mb-3">Contact Information</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {selectedPatientData.email && (
                          <div>
                            <p className="text-muted-foreground">Email:</p>
                            <p className="font-medium text-foreground">{selectedPatientData.email}</p>
                          </div>
                        )}
                        {selectedPatientData.phone && (
                          <div>
                            <p className="text-muted-foreground">Phone:</p>
                            <p className="font-medium text-foreground">{selectedPatientData.phone}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Physical Information */}
                  {(selectedPatientData.height || selectedPatientData.weight) && (
                    <div className="border-b border-border pb-4">
                      <h5 className="font-semibold text-foreground mb-3">Physical Information</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {selectedPatientData.height && (
                          <div>
                            <p className="text-muted-foreground">Height:</p>
                            <p className="font-medium text-foreground">{selectedPatientData.height} cm</p>
                          </div>
                        )}
                        {selectedPatientData.weight && (
                          <div>
                            <p className="text-muted-foreground">Weight:</p>
                            <p className="font-medium text-foreground">{selectedPatientData.weight} kg</p>
                          </div>
                        )}
                        {selectedPatientData.height && selectedPatientData.weight && (
                          <div>
                            <p className="text-muted-foreground">BMI:</p>
                            <p className="font-medium text-foreground">
                              {(parseFloat(selectedPatientData.weight.toString()) / Math.pow(parseFloat(selectedPatientData.height.toString()) / 100, 2)).toFixed(1)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Protocol Status */}
                  <div className="border-b border-border pb-4">
                    <h5 className="font-semibold text-foreground mb-3">Current Protocol Status</h5>
                    <div className="bg-muted/30 p-4 rounded-lg text-center">
                      <p className="text-muted-foreground">No active protocols assigned</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Protocol information will appear here when protocols are assigned to the patient
                      </p>
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedPatientData.notes && (
                    <div>
                      <h5 className="font-semibold text-foreground mb-3">Notes</h5>
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <p className="text-sm text-foreground">{selectedPatientData.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Report Generation Info */}
                  <div className="border-t border-border pt-4 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>Report generated on: {new Date().toLocaleDateString()}</span>
                      <span>MedTracker Cancer Patient Management System</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Patient Selected State */}
          {!selectedPatient && (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <div className="text-muted-foreground">
                  <p className="text-lg mb-2">Select a patient to generate reports</p>
                  <p className="text-sm">Choose a patient from the dropdown above to create comprehensive reports</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
