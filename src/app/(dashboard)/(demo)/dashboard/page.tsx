import AppDashboard from "@/features/dashboard/components/app-dashboard";
import AppHeader from "@/components/app-header";

export default function DashboardPage() {

    const breadcrumbs = [
        { title: 'Dashboard', url: '/dashboard' }
    ]

    return <>
        <AppHeader breadcrumbs={breadcrumbs} />
        <main className="flex-1">
            <AppDashboard />
        </main>
    </>
}