import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addCourse, clearCourses, fetchCourses, removeCourse, updateCourse } from '../components/courseSlice';
import { createCourse, deleteCourseFromServer, updateCourseOnServer } from '../services/courseService';

const SAVE_DELAY_MS = 2000;

export function useCourseCollection() {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user.user);
    const { courses, status, error } = useSelector((state) => state.courses);
    const [saveStatuses, setSaveStatuses] = useState({});
    const pendingCourses = useRef(new Map());
    const syncTimer = useRef(null);
    const inFlightSaves = useRef(new Map());

    useEffect(() => {
        if (!user) {
            dispatch(clearCourses());
            return undefined;
        }

        const request = dispatch(fetchCourses());
        return () => request.abort();
    }, [dispatch, user]);

    useEffect(() => () => {
        if (syncTimer.current !== null) window.clearTimeout(syncTimer.current);
        for (const course of pendingCourses.current.values()) {
            const activeSave = inFlightSaves.current.get(course.id);
            void Promise.resolve(activeSave)
                .catch(() => {})
                .then(() => updateCourseOnServer(course))
                .then((savedCourse) => dispatch(updateCourse(savedCourse)))
                .catch(() => {});
        }
        pendingCourses.current.clear();
    }, [dispatch]);

    const flushPendingCourses = async () => {
        const batch = [...pendingCourses.current.entries()];
        pendingCourses.current.clear();

        await Promise.all(batch.map(async ([courseId, course]) => {
            const activeSave = inFlightSaves.current.get(courseId);
            if (activeSave) await activeSave.catch(() => {});
            if (pendingCourses.current.has(courseId)) return;

            const hours = Number(course.hours_to_complete);
            const progress = Number(course.progress);
            if (!Number.isInteger(hours) || hours < 1 || !Number.isInteger(progress) || progress < 0 || progress > 100) {
                setSaveStatuses((current) => ({ ...current, [courseId]: { type: 'error', message: 'Enter valid hours and progress.' } }));
                return;
            }

            setSaveStatuses((current) => ({ ...current, [courseId]: { type: 'saving', message: 'Saving…' } }));
            const saveRequest = updateCourseOnServer(course);
            inFlightSaves.current.set(courseId, saveRequest);
            try {
                const savedCourse = await saveRequest;
                if (!pendingCourses.current.has(courseId)) {
                    dispatch(updateCourse(savedCourse));
                    setSaveStatuses((current) => ({ ...current, [courseId]: { type: 'saved', message: 'Saved' } }));
                }
            } catch (saveError) {
                if (!pendingCourses.current.has(courseId)) {
                    setSaveStatuses((current) => ({ ...current, [courseId]: { type: 'error', message: saveError.message } }));
                }
            } finally {
                if (inFlightSaves.current.get(courseId) === saveRequest) inFlightSaves.current.delete(courseId);
            }
        }));
    };

    const scheduleCourseSave = (course) => {
        pendingCourses.current.set(course.id, course);
        if (syncTimer.current !== null) window.clearTimeout(syncTimer.current);
        syncTimer.current = window.setTimeout(() => {
            syncTimer.current = null;
            void flushPendingCourses();
        }, SAVE_DELAY_MS);
        setSaveStatuses((current) => ({ ...current, [course.id]: { type: 'pending', message: 'Changes pending' } }));
    };

    const updateCourseField = (course, field, rawValue) => {
        const value = rawValue === '' ? '' : Number(rawValue);
        const updatedCourse = { ...course, [field]: value };
        dispatch(updateCourse(updatedCourse));
        scheduleCourseSave(updatedCourse);
    };

    const addCourseToCollection = async (course) => {
        const createdCourse = await createCourse(course);
        dispatch(addCourse(createdCourse));
        return createdCourse;
    };

    const saveCourseDetails = async (course) => {
        if (syncTimer.current !== null) {
            window.clearTimeout(syncTimer.current);
            syncTimer.current = null;
        }
        await flushPendingCourses();
        const activeSave = inFlightSaves.current.get(course.id);
        if (activeSave) await activeSave.catch(() => {});

        const savedCourse = await updateCourseOnServer(course);
        dispatch(updateCourse(savedCourse));
        setSaveStatuses((current) => ({ ...current, [course.id]: { type: 'saved', message: 'Saved' } }));
        return savedCourse;
    };

    const deleteCourse = async (courseId) => {
        if (syncTimer.current !== null) {
            window.clearTimeout(syncTimer.current);
            syncTimer.current = null;
        }
        await flushPendingCourses();
        const activeSave = inFlightSaves.current.get(courseId);
        if (activeSave) await activeSave.catch(() => {});

        await deleteCourseFromServer(courseId);
        dispatch(removeCourse(courseId));
        setSaveStatuses((current) => {
            const nextStatuses = { ...current };
            delete nextStatuses[courseId];
            return nextStatuses;
        });
    };

    return {
        user,
        courses,
        status,
        error,
        saveStatuses,
        addCourse: addCourseToCollection,
        updateCourseField,
        saveCourseDetails,
        deleteCourse,
    };
}