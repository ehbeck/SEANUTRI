
'use client';

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface ChartData {
    name: string;
    [key: string]: string | number;
}

interface ChartProps {
    data: ChartData[];
}

export const DashboardChart = ({ data }: ChartProps) => {
    return (
        <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                    dataKey="name" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    interval={0} 
                    tickMargin={10} 
                    angle={-45} 
                    textAnchor="end" 
                    height={80} 
                    tick={{ fontSize: 9 }}
                />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                    contentStyle={{ 
                        fontSize: "12px", 
                        borderRadius: "var(--radius)", 
                        border: "1px solid hsl(var(--border))", 
                        background: "hsl(var(--background))" 
                    }} 
                    cursor={{ fill: 'hsl(var(--accent) / 0.2)' }}
                    formatter={(value, name) => [value, name]}
                    labelFormatter={(label) => `Curso: ${label}`}
                />
                <Legend iconSize={10} wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Bar dataKey="Matriculados" fill="hsl(var(--secondary-foreground))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Concluídos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}


export const ReportsChart = ({ data }: ChartProps) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Concluído" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Em Progresso" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}

