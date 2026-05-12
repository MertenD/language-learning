import {Card, CardContent} from "@/components/ui/card";
import React from "react";

type UserStatCardProps = {
    title: string
    value: string | number | undefined
    icon: React.ReactNode
    chartColorNumber?: 1 | 2 | 3 | 4 | 5
    isLoading?: boolean
}

export default function UserStatCard({ title, value, icon, chartColorNumber, isLoading }: UserStatCardProps) {
    const getColorClasses = (colorNumber: number | undefined) => {
        switch (colorNumber) {
            case 1:
                return {
                    card: 'bg-gradient-to-br from-chart-1/20 to-chart-1/5 border-chart-1/30',
                    text: 'text-chart-1',
                    bg: 'bg-chart-1/20'
                };
            case 2:
                return {
                    card: 'bg-gradient-to-br from-chart-2/20 to-chart-2/5 border-chart-2/30',
                    text: 'text-chart-2',
                    bg: 'bg-chart-2/20'
                };
            case 3:
                return {
                    card: 'bg-gradient-to-br from-chart-3/20 to-chart-3/5 border-chart-3/30',
                    text: 'text-chart-3',
                    bg: 'bg-chart-3/20'
                };
            case 4:
                return {
                    card: 'bg-gradient-to-br from-chart-4/20 to-chart-4/5 border-chart-4/30',
                    text: 'text-chart-4',
                    bg: 'bg-chart-4/20'
                };
            case 5:
                return {
                    card: 'bg-gradient-to-br from-chart-5/20 to-chart-5/5 border-chart-5/30',
                    text: 'text-chart-5',
                    bg: 'bg-chart-5/20'
                };
            default:
                return {
                    card: '',
                    text: '',
                    bg: ''
                };
        }
    };

    const colors = getColorClasses(chartColorNumber);

    return <Card className={colors.card}>
        <CardContent className="flex items-center justify-between p-4 md:p-6">
            <div className="space-y-0.5">
                <p className="text-xs md:text-sm font-medium text-muted-foreground">{title}</p>
                {isLoading ? (
                    <div className="h-7 w-24 bg-muted/50 rounded-md animate-pulse mt-1"></div>
                ) : (
                    <p className={`text-2xl md:text-3xl font-bold ${colors.text}`}>{value}</p>
                )}
            </div>
            <div className={`flex h-9 w-9 md:h-12 md:w-12 items-center justify-center rounded-full ${colors.bg}`}>
                { icon && <span className={`h-4 w-4 md:h-6 md:w-6 ${colors.text}`}>{icon}</span>}
            </div>
        </CardContent>
    </Card>
}
