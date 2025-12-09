import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveBar } from "@nivo/bar";

// Componente que renderiza um gráfico de barras com base nos dados fornecidos
const Overview = ({ data }) => {
  return (
    <div style={{ height: "300px" }}>
      <ResponsiveBar
        data={data}
        keys={["value"]}
        indexBy="name"
        margin={{ top: 10, right: 10, bottom: 60, left: 40 }}
        padding={0.3}
        valueScale={{ type: "linear" }}
        indexScale={{ type: "band", round: true }}
        colors={{ scheme: "nivo" }}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 20,
          legend: "",
          legendPosition: "middle",
          legendOffset: 32,
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
        animate={true}
        motionStiffness={90}
        motionDamping={15}
      />
    </div>
  );
};

// Página principal do painel do administrador
export default function AdminPanel() {
  // Dados de exemplo para o gráfico
  const data = [
    { name: "Produto A", value: 100 },
    { name: "Produto B", value: 200 },
    { name: "Produto C", value: 150 },
    { name: "Produto D", value: 80 },
    { name: "Produto E", value: 120 },
  ];

  return (
    <div className="p-4">
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
        </TabsList>

        {/* Aba do Dashboard */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold">Total de Vendas</h3>
                <p className="text-2xl font-bold">R$ 10.000</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold">Novos Clientes</h3>
                <p className="text-2xl font-bold">150</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold">Produtos Ativos</h3>
                <p className="text-2xl font-bold">120</p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de visão geral */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">Visão Geral</h3>
              <Overview data={data} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Produtos */}
        <TabsContent value="produtos">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">Gerenciar Produtos</h3>
              {/* Conteúdo da aba de produtos vai aqui */}
              <p>Aqui você pode adicionar, editar ou remover produtos.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Usuários */}
        <TabsContent value="usuarios">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Permitir Cadastro</Label>
                  <p className="text-sm text-muted-foreground">
                    Ativa ou desativa novos cadastros de usuários.
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notificações</Label>
                  <p className="text-sm text-muted-foreground">
                    Ativa notificações para novos usuários.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
