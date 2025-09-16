import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLabTestSchema } from "@shared/schema";
import type { InsertLabTest, Patient } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";

interface LabFormProps {
  onSubmit: (data: InsertLabTest) => void;
  onCancel: () => void;
  isLoading?: boolean;
  patients: Patient[];
  defaultValues?: Partial<InsertLabTest>;
}

const formSchema = insertLabTestSchema.extend({
  value: insertLabTestSchema.shape.value.optional(),
  referenceRangeMin: insertLabTestSchema.shape.referenceRangeMin.optional(),
  referenceRangeMax: insertLabTestSchema.shape.referenceRangeMax.optional(),
});

export default function LabForm({ onSubmit, onCancel, isLoading, patients, defaultValues }: LabFormProps) {
  const form = useForm<InsertLabTest>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: "",
      testName: "",
      testDate: new Date().toISOString().split('T')[0],
      value: null,
      unit: "",
      referenceRangeMin: null,
      referenceRangeMax: null,
      status: "not-specified",
      notes: "",
      ...defaultValues,
    },
  });

  const handleSubmit = (data: InsertLabTest) => {
    const formattedData = {
      ...data,
      value: data.value ? data.value.toString() : null,
      referenceRangeMin: data.referenceRangeMin ? data.referenceRangeMin.toString() : null,
      referenceRangeMax: data.referenceRangeMax ? data.referenceRangeMax.toString() : null,
    };
    onSubmit(formattedData);
  };

  const commonTests = [
    "Hemoglobin",
    "White Blood Cells",
    "Platelets",
    "Hematocrit",
    "Neutrophils",
    "Lymphocytes",
    "Glucose",
    "Creatinine",
    "BUN",
    "AST",
    "ALT",
    "Albumin",
    "Total Protein",
    "Calcium",
    "Sodium",
    "Potassium",
    "Chloride",
    "CO2",
    "CEA",
    "CA 19-9",
    "CA 15-3",
    "CA 125",
    "PSA",
    "AFP"
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Lab Test Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-patient">
                          <SelectValue placeholder="Select patient..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="testDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-test-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="testName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Name *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-test-name">
                          <SelectValue placeholder="Select or type test name..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {commonTests.map((test) => (
                          <SelectItem key={test} value={test}>
                            {test}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        {...field}
                        value={field.value || ''}
                        data-testid="input-value" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="e.g., g/dL, mg/dL, K/μL"
                        data-testid="input-unit" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || "not-specified"}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue placeholder="Select status..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="not-specified">Not specified</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Reference Range</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="referenceRangeMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Value</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        {...field}
                        value={field.value || ''}
                        data-testid="input-ref-min" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="referenceRangeMax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Value</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        {...field}
                        value={field.value || ''}
                        data-testid="input-ref-max" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      rows={4}
                      placeholder="Additional notes about the test results..."
                      data-testid="textarea-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            data-testid="button-submit"
          >
            {isLoading ? "Saving..." : "Save Lab Results"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
