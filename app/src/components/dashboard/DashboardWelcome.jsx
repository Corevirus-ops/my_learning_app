export default function DashboardWelcome({ firstName, today, activeCount }) {
    return (
        <section className="welcome-row">
            <div>
                <p className="eyebrow">{today}</p>
                <h1>Welcome back, {firstName}</h1>
                <p className="welcome-copy">Everything you want to learn, organized in one place.</p>
            </div>
            <p className="in-progress"><span />{activeCount} {activeCount === 1 ? 'course' : 'courses'} in progress</p>
        </section>
    );
}