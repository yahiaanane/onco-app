import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  ClipboardList, 
  FlaskConical, 
  CheckCircle,
  UserPlus,
  Clipboard,
  TestTubeDiagonal,
  ArrowUp,
  AlertCircle,
  Clock,
  Info,
  ChevronRight,
  Edit,
  Activity
} from "lucide-react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import type { DashboardStats } from "@/lib/types";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: adherenceData, isLoading: adherenceLoading } = useQuery<Array<{
    week: string;
    overall: number;
    medication: number;
  }>>({
    queryKey: ["/api/dashboard/adherence"],
  });

  if (statsLoading || adherenceLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Dashboard" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="text-center py-12">
            <div className="text-lg text-muted-foreground">Loading dashboard...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Dashboard" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                    <p className="text-3xl font-bold text-foreground" data-testid="text-total-patients">
                      {stats?.totalPatients || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <p className="text-sm text-green-600 mt-2">
                  <ArrowUp className="h-3 w-3 mr-1 inline" />
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Protocols</p>
                    <p className="text-3xl font-bold text-foreground" data-testid="text-active-protocols">
                      {stats?.activeProtocols || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <ClipboardList className="h-6 w-6 text-secondary" />
                  </div>
                </div>
                <p className="text-sm text-green-600 mt-2">
                  <ArrowUp className="h-3 w-3 mr-1 inline" />
                  +5% from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Recent Labs</p>
                    <p className="text-3xl font-bold text-foreground" data-testid="text-recent-labs">
                      {stats?.recentLabs || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <FlaskConical className="h-6 w-6 text-accent" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Last 7 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Adherence</p>
                    <p className="text-3xl font-bold text-foreground" data-testid="text-avg-adherence">
                      {stats?.averageAdherence || 0}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <p className="text-sm text-green-600 mt-2">
                  <ArrowUp className="h-3 w-3 mr-1 inline" />
                  +3% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="flex items-center justify-start space-x-3 p-4 h-auto"
                  data-testid="button-add-patient"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <UserPlus className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">Add New Patient</p>
                    <p className="text-sm text-muted-foreground">Create patient profile</p>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="flex items-center justify-start space-x-3 p-4 h-auto"
                  data-testid="button-create-protocol"
                >
                  <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Clipboard className="h-5 w-5 text-secondary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">Create Protocol</p>
                    <p className="text-sm text-muted-foreground">New protocol template</p>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="flex items-center justify-start space-x-3 p-4 h-auto"
                  data-testid="button-add-lab"
                >
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <TestTubeDiagonal className="h-5 w-5 text-accent" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">Add Lab Results</p>
                    <p className="text-sm text-muted-foreground">Enter test results</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity & Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No recent activity</p>
                    <p className="text-sm">Activity will appear here as patients are added and protocols are managed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Adherence Overview Chart */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Protocol Adherence Trends</h3>
                {adherenceData && adherenceData.length > 0 && adherenceData.some(d => d.overall > 0 || d.medication > 0) ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={adherenceData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis 
                          dataKey="week" 
                          className="text-sm text-muted-foreground"
                        />
                        <YAxis 
                          domain={[0, 100]}
                          className="text-sm text-muted-foreground"
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: 'var(--radius)',
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="overall" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          name="Overall Adherence %"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="medication" 
                          stroke="hsl(var(--secondary))" 
                          strokeWidth={2}
                          name="Medication Adherence %"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-center text-muted-foreground">
                    <div>
                      <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No adherence data available</p>
                      <p className="text-sm">Assign protocols to patients to start tracking adherence</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Alerts & Notifications */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Alerts & Notifications</h3>
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No alerts at this time</p>
                <p className="text-sm">Important notifications and alerts will appear here</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
