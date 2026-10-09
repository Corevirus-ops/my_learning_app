import CourseProgressPanel from '../components/dashboard/CourseProgressPanel';
import CourseQueue from '../components/dashboard/CourseQueue';
import DashboardWelcome from '../components/dashboard/DashboardWelcome';
import LearningMetrics from '../components/dashboard/LearningMetrics';
import { useDashboardData } from '../hooks/useDashboardData';
import './Home.css';

export default function Home() {
    const dashboard = useDashboardData();

    return (
        <div className="dashboard">
            <DashboardWelcome firstName={dashboard.firstName} today={dashboard.today} activeCount={dashboard.activeCount} />
            <LearningMetrics metrics={dashboard.metrics} />
            <div className="dashboard-grid">
                <CourseQueue courses={dashboard.courses} status={dashboard.status} error={dashboard.error} />
                <CourseProgressPanel
                    completionPercent={dashboard.completionPercent}
                    completedCount={dashboard.completedCount}
                    courseCount={dashboard.courses.length}
                    plannedHours={dashboard.plannedHours}
                    labels={dashboard.labels}
                />
            </div>
        </div>
    )
}