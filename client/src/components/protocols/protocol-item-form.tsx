import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProtocolItemSchema } from "@shared/schema";
import type { InsertProtocolItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface ProtocolItemFormProps {
  templateId: string;
  onSubmit: (data: InsertProtocolItem) => void;
  onCancel: () => void;
  isLoading?: boolean;
  defaultValues?: Partial<InsertProtocolItem>;
}

export default function ProtocolItemForm({ 
  templateId, 
  onSubmit, 
  onCancel, 
  isLoading, 
  defaultValues 
}: ProtocolItemFormProps) {
  const form = useForm<InsertProtocolItem>({
    resolver: zodResolver(insertProtocolItemSchema),
    defaultValues: {
      templateId,
      name: defaultValues?.name || "",
      type: defaultValues?.type || "supplement",
      category: defaultValues?.category || "nutraceuticals",
      priority: defaultValues?.priority || "core",
      dosage: defaultValues?.dosage || "",
      frequency: defaultValues?.frequency || "",
      timing: defaultValues?.timing || "",
      duration: defaultValues?.duration || "",
      rationale: defaultValues?.rationale || "",
      cautions: defaultValues?.cautions || "",
      instructions: defaultValues?.instructions || "",
      foodRequirement: defaultValues?.foodRequirement || "",
      order: defaultValues?.order || 0,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Name *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="e.g., Vitamin D3, Carboplatin"
                    data-testid="input-item-name" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-item-type">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="supplement">Supplement</SelectItem>
                    <SelectItem value="drug">Drug</SelectItem>
                    <SelectItem value="lifestyle">Lifestyle</SelectItem>
                    <SelectItem value="therapy">Therapy</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-item-category">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="diet_fasting">Diet & Fasting</SelectItem>
                    <SelectItem value="repurposed_drugs">Repurposed Drugs</SelectItem>
                    <SelectItem value="nutraceuticals">Nutraceuticals</SelectItem>
                    <SelectItem value="topical">Topical</SelectItem>
                    <SelectItem value="exercise">Exercise</SelectItem>
                    <SelectItem value="sleep">Sleep</SelectItem>
                    <SelectItem value="stress">Stress</SelectItem>
                    <SelectItem value="toxins">Toxins</SelectItem>
                    <SelectItem value="optional_therapies">Optional Therapies</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-item-priority">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="core">Core</SelectItem>
                    <SelectItem value="additional">Additional</SelectItem>
                    <SelectItem value="optional">Optional</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dosage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dosage</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="e.g., 4000 IU, 200mg/m²"
                    data-testid="input-dosage" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frequency</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="e.g., Daily, Every 3 weeks"
                    data-testid="input-frequency" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="timing"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timing</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="e.g., With meals, IV infusion"
                    data-testid="input-timing" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="e.g., Ongoing, 4 cycles"
                    data-testid="input-duration" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="instructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instructions</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  rows={3}
                  placeholder="Detailed instructions for this protocol item..."
                  data-testid="textarea-instructions"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="foodRequirement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Food Requirement</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-food-requirement">
                      <SelectValue placeholder="Select food requirement" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="with_food">With Food</SelectItem>
                    <SelectItem value="empty_stomach">Empty Stomach</SelectItem>
                    <SelectItem value="no_restriction">No Restriction</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="order"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Order</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    type="number"
                    value={field.value || 0}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    data-testid="input-order" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="rationale"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rationale</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  rows={3}
                  placeholder="Explain why this item is included in the protocol..."
                  data-testid="textarea-rationale"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cautions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cautions</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  rows={3}
                  placeholder="List any warnings, side effects, or monitoring requirements..."
                  data-testid="textarea-cautions"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
            {isLoading ? "Saving..." : "Save Item"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
