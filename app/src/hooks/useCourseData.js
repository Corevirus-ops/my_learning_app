import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearCourses, fetchCourses } from '../components/courseSlice';

export function useCourseData() {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user.user);
    const { courses, status, error } = useSelector((state) => state.courses);

    useEffect(() => {
        if (!user) {
            dispatch(clearCourses());
            return undefined;
        }

        const request = dispatch(fetchCourses());
        return () => request.abort();
    }, [dispatch, user]);

    return { user, courses, status, error };
}