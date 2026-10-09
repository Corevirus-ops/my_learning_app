import CourseCollection from '../components/learning-list/CourseCollection';
import CourseEntryForm from '../components/learning-list/CourseEntryForm';
import { useCourseCollection } from '../hooks/useCourseCollection';
import './LearningList.css';

export default function LearningListPage() {
    const collection = useCourseCollection();

    return (
        <div className="learning-page">
            <header className="learning-page-heading">
                <p className="eyebrow">YOUR QUEUE</p>
                <h1>Learning list</h1>
                <p>Save anything you want to learn and check it off when you’re done.</p>
            </header>

            <CourseEntryForm user={collection.user} onCreate={collection.addCourse} />
            <CourseCollection
                user={collection.user}
                courses={collection.courses}
                status={collection.status}
                error={collection.error}
                saveStatuses={collection.saveStatuses}
                onFieldChange={collection.updateCourseField}
                onSave={collection.saveCourseDetails}
                onDelete={collection.deleteCourse}
            />
        </div>
    );
}