import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Download, Calendar, User, Activity, FlaskConical, ClipboardList } from "lucide-react";
import type { Patient, PatientProtocol, LabTest, AdherenceStats } from "@shared/schema";

interface ReportGeneratorProps {
  patientId: string;
  reportType: string;
  dateRange: string;
  onGenerate: () => void;
  onCancel: () => void;
}

export default function ReportGenerator({ 
  patientId, 
  reportType, 
  dateRange, 
  onGenerate, 
  onCancel 
}: ReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: patient } = useQuery<Patient>({
    queryKey: ["/api/patients", patientId],
    enabled: !!patientId,
  });

  const { data: protocols } = useQuery<PatientProtocol[]>({
    queryKey: ["/api/patients", patientId, "protocols"],
    enabled: !!patientId,
  });

  const { data: labs } = useQuery<LabTest[]>({
    queryKey: ["/api/patients", patientId, "labs"],
    enabled: !!patientId,
  });

  const { data: adherenceStats } = useQuery<AdherenceStats>({
    queryKey: ["/api/patients", patientId, "adherence-stats"],
    enabled: !!patientId,
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Simulate report generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsGenerating(false);
    onGenerate();
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

  const getReportSections = () => {
    switch (reportType) {
      case 'complete':
        return ['Patient Information', 'Treatment History', 'Protocol Adherence', 'Lab Results', 'Clinical Notes'];
      case 'adherence':
        return ['Patient Summary', 'Protocol Adherence', 'Adherence Trends'];
      case 'labs':
        return ['Patient Summary', 'Lab Results', 'Lab Trends'];
      case 'treatment':
        return ['Patient Summary', 'Treatment History', 'Protocol Details'];
      default:
        return ['Patient Information'];
    }
  };

  const getDateRangeText = () => {
    switch (dateRange) {
      case '90':
        return 'Last 90 days';
      case '180':
        return 'Last 180 days';
      case '365':
        return 'Last 365 days';
      case 'all':
        return 'All time';
      default:
        return dateRange;
    }
  };

  if (!patient) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p>Loading patient data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Report Generation
              </h3>
              <p className="text-sm text-muted-foreground">
                Generate comprehensive report for {patient.name}
              </p>
            </div>
            <Badge variant="outline" className="ml-4">
              {reportType === 'complete' ? 'Complete Summary' : 
               reportType === 'adherence' ? 'Protocol Adherence' :
               reportType === 'labs' ? 'Lab Results' : 'Treatment History'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Patient:</span>
              <span className="font-medium">{patient.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Date Range:</span>
              <span className="font-medium">{getDateRangeText()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Generated:</span>
              <span className="font-medium">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      <Card>
        <CardContent className="p-6">
          <h4 className="text-lg font-semibold text-foreground mb-4">Report Preview</h4>
          
          <div className="space-y-4">
            {/* Sections Overview */}
            <div>
              <h5 className="font-medium text-foreground mb-2">Included Sections:</h5>
              <div className="flex flex-wrap gap-2">
                {getReportSections().map((section, index) => (
                  <Badge key={index} variant="secondary">
                    {section}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Data Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                <ClipboardList className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Protocols</p>
                  <p className="text-lg font-bold text-primary">{protocols?.length || 0}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                <FlaskConical className="h-8 w-8 text-secondary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Lab Tests</p>
                  <p className="text-lg font-bold text-secondary">{labs?.length || 0}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                <Activity className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-sm font-medium text-foreground">Adherence</p>
                  <p className="text-lg font-bold text-accent">{adherenceStats?.percentage || 0}%</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Patient Summary */}
            <div>
              <h5 className="font-medium text-foreground mb-2">Patient Summary:</h5>
              <div className="bg-muted/30 p-4 rounded-lg space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <span className="ml-2 font-medium">{patient.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Age:</span>
                    <span className="ml-2 font-medium">{calculateAge(patient.dateOfBirth)} years</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cancer Type:</span>
                    <span className="ml-2 font-medium">{patient.cancerType}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Stage:</span>
                    <span className="ml-2 font-medium">{patient.cancerStage}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Diagnosis Date:</span>
                    <span className="ml-2 font-medium">{formatDate(patient.diagnosisDate)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sex:</span>
                    <span className="ml-2 font-medium capitalize">{patient.sex}</span>
                  </div>
                </div>

                {patient.metastasisLocations && patient.metastasisLocations.length > 0 && (
                  <div className="mt-3">
                    <span className="text-muted-foreground">Metastasis Locations:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {patient.metastasisLocations.map((location, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {location}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <Button 
          variant="outline" 
          onClick={onCancel}
          data-testid="button-cancel-report"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleGenerate}
          disabled={isGenerating}
          data-testid="button-generate-report"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Generate & Download
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
